import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import { exercises } from "../data/exercises";
import { createPoseLandmarker } from "../utils/poseLandmarker";

// Збираємо всі вправи в один масив
const allExercises = Object.values(exercises).flat();

// Простий список з'єднань для малювання скелета
const POSE_CONNECTIONS = [
  [11, 12], // плечі
  [11, 13],
  [13, 15], // ліва рука
  [12, 14],
  [14, 16], // права рука
  [11, 23],
  [12, 24], // корпус
  [23, 24], // таз
  [23, 25],
  [25, 27], // ліва нога
  [24, 26],
  [26, 28], // права нога
];

// Форматування часу
const formatTime = (totalSeconds) => {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

function ExercisePage() {
  const { slug } = useParams();
  const { t } = useTranslation();

  // Шукаємо вправу по slug
  const exercise = allExercises.find((item) => item.slug === slug);

  // Знаходимо область вправи
  let area = null;
  if (exercise) {
    for (const [key, exList] of Object.entries(exercises)) {
      if (exList.some((ex) => ex.slug === slug)) {
        area = key;
        break;
      }
    }
  }

  // Стан вправи
  const [isStarted, setIsStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Стан камери
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // Стан AI
  const [isAiReady, setIsAiReady] = useState(false);
  const [aiHint, setAiHint] = useState("");

  // Тестові підказки
  const [hintIndex, setHintIndex] = useState(0);
  const hintKeys = [
    "exercise.hintDefault",
    "exercise.hintBackStraight",
    "exercise.hintRaiseHigher",
    "exercise.hintSlowDown",
    "exercise.hintGood",
  ];

  // Ref для DOM та AI
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraSectionRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Додаткові refs для стабільної роботи
  const streamRef = useRef(null);
  const isAnalyzingRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);
  const lastAnalyzeCallRef = useRef(0);
  const lastTimestampMsRef = useRef(0);

  // Безпечні тексти
  const title = exercise ? t(`exercises.${exercise.key}.title`) : "";
  const reps = exercise ? t(`exercises.${exercise.key}.reps`) : "";
  const description = exercise
    ? t(`exercises.${exercise.key}.description`)
    : "";
  const currentHint = t(hintKeys[hintIndex]);

  // Таймер вправи
  useEffect(() => {
    let interval = null;

    if (isStarted) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isStarted]);

  // Очищення canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Повна зупинка animation frame
  const stopAnimationLoop = () => {
    isAnalyzingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Зупинка потоку камери
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Малювання точок
  const drawLandmarks = (ctx, landmarks, width, height) => {
    landmarks.forEach((point) => {
      if (point.visibility !== undefined && point.visibility < 0.4) return;

      const x = point.x * width;
      const y = point.y * height;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#22c55e";
      ctx.fill();
    });
  };

  // Малювання ліній скелета
  const drawSkeleton = (ctx, landmarks, width, height) => {
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;

    POSE_CONNECTIONS.forEach(([startIndex, endIndex]) => {
      const start = landmarks[startIndex];
      const end = landmarks[endIndex];

      if (!start || !end) return;
      if (start.visibility !== undefined && start.visibility < 0.4) return;
      if (end.visibility !== undefined && end.visibility < 0.4) return;

      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    });
  };

  // Малювання всього overlay на canvas
  const drawPose = (landmarks) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;
    if (!video.videoWidth || !video.videoHeight) return;

    const ctx = canvas.getContext("2d");

    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Малюємо скелет і точки
    drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
    drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
  };

  // Базова логіка для вправ руки
  const checkArmRaise = (landmarks) => {
    const rightShoulder = landmarks[12];
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const leftWrist = landmarks[15];

    console.log("Right shoulder:", rightShoulder, "Right wrist:", rightWrist);
    console.log("Left shoulder:", leftShoulder, "Left wrist:", leftWrist);

    if (!rightShoulder || !rightWrist || !leftShoulder || !leftWrist) {
      console.log("Missing landmarks for arm check");
      return "exercise.hintDefault";
    }

    const rightUp = rightWrist.y < rightShoulder.y;
    const leftUp = leftWrist.y < leftShoulder.y;

    console.log("Right arm up:", rightUp, "Left arm up:", leftUp);

    if (rightUp || leftUp) {
      return "exercise.hintGood";
    }

    return "exercise.hintRaiseHigher";
  };

  // Аналіз кадру
  const analyzePoseFrame = (rafTime) => {
    if (!isAnalyzingRef.current) return;

    const video = videoRef.current;
    const landmarker = poseLandmarkerRef.current;

    if (!video || !landmarker) {
      animationFrameRef.current = requestAnimationFrame(analyzePoseFrame);
      return;
    }

    // Чекаємо, поки відео реально готове
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      animationFrameRef.current = requestAnimationFrame(analyzePoseFrame);
      return;
    }

    // Обмежуємо частоту аналізу
    if (rafTime - lastAnalyzeCallRef.current < 80) {
      animationFrameRef.current = requestAnimationFrame(analyzePoseFrame);
      return;
    }
    lastAnalyzeCallRef.current = rafTime;

    // Якщо кадр не змінився — повторно не аналізуємо
    if (video.currentTime === lastVideoTimeRef.current) {
      animationFrameRef.current = requestAnimationFrame(analyzePoseFrame);
      return;
    }
    lastVideoTimeRef.current = video.currentTime;

    try {
      // Робимо власний timestamp у мілісекундах
      // і гарантуємо, що він завжди строго більший за попередній
      const currentVideoMs = Math.floor(video.currentTime * 1000);
      const timestampMs = Math.max(
        currentVideoMs,
        lastTimestampMsRef.current + 1,
      );

      lastTimestampMsRef.current = timestampMs;

      const result = landmarker.detectForVideo(video, timestampMs);

      if (result?.poseLandmarks?.length > 0) {
        const landmarks = result.poseLandmarks[0];

        drawPose(landmarks);

        if (area === "arm") {
          const hintKey = checkArmRaise(landmarks);
          setAiHint(t(hintKey));
        } else {
          setAiHint(t("exercise.hintDefault"));
        }
      } else {
        clearCanvas();
        setAiHint(t("exercise.hintDefault"));
      }
    } catch (error) {
      console.log("Помилка аналізу пози:", error);
    }

    animationFrameRef.current = requestAnimationFrame(analyzePoseFrame);
  };

  // Запуск вправи
  const handleStartExercise = () => {
    setSeconds(0);
    setIsStarted(true);
  };

  // Зупинка вправи
  const handleStopExercise = () => {
    setIsStarted(false);
  };

  // Перемикання тестових підказок
  const handleNextHint = () => {
    setHintIndex((prev) => (prev + 1) % hintKeys.length);
  };

  // Увімкнення камери
  const handleStartCamera = async () => {
    try {
      setCameraError("");
      setAiHint("");
      setIsAiReady(false);

      stopAnimationLoop();
      stopCameraStream();
      clearCanvas();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 16 / 9 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;

      await new Promise((resolve) => {
        if (!videoRef.current) {
          resolve();
          return;
        }

        videoRef.current.onloadedmetadata = () => resolve();
      });

      if (!videoRef.current) return;

      await videoRef.current.play();

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas && video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Тестовий квадрат
        ctx.fillStyle = "red";
        ctx.fillRect(40, 40, 220, 220);

        // Тестовий текст
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.fillText("TEST", 90, 170);
      }

      const landmarker = await createPoseLandmarker();
      poseLandmarkerRef.current = landmarker;

      lastVideoTimeRef.current = -1;
      lastAnalyzeCallRef.current = 0;
      lastTimestampMsRef.current = 0;

      setIsCameraOn(true);
      setIsAiReady(true);

      isAnalyzingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(analyzePoseFrame);
    } catch (error) {
      console.log("Помилка доступу до камери:", error);
      setCameraError(t("exercise.cameraError"));
      setIsCameraOn(false);
      setIsAiReady(false);

      stopAnimationLoop();
      stopCameraStream();
      clearCanvas();
    }
  };

  // Вимкнення камери
  const handleStopCamera = () => {
    stopAnimationLoop();
    stopCameraStream();
    clearCanvas();

    poseLandmarkerRef.current = null;
    lastVideoTimeRef.current = -1;
    lastAnalyzeCallRef.current = 0;
    lastTimestampMsRef.current = 0;

    setIsCameraOn(false);
    setIsAiReady(false);
    setAiHint("");
  };

  // Повноекранний режим
  const handleFullscreen = async () => {
    if (!cameraSectionRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await cameraSectionRef.current.requestFullscreen();
      }
    } catch (error) {
      console.log("Помилка fullscreen:", error);
    }
  };

  // При виході зі сторінки все зупиняємо
  useEffect(() => {
    return () => {
      stopAnimationLoop();
      stopCameraStream();
      poseLandmarkerRef.current = null;
    };
  }, []);

  if (!exercise) {
    return (
      <>
        <Header />
        <main className="exercise-page">
          <div className="container">
            <div className="exercise-not-found">
              <h1>Вправу не знайдено</h1>
              <Link to="/dashboard" className="btn btn--primary">
                Повернутися в кабінет
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="exercise-page">
        <div className="container">
          <div className="exercise-top">
            <Link to="/dashboard" className="exercise-back-link">
              ← {t("exercise.back")}
            </Link>
          </div>

          <section className="exercise-main-card">
            <p className="exercise-label">{t("exercise.label")}</p>

            <h1>{title}</h1>

            <p className="exercise-reps">{reps}</p>

            <p className="exercise-description">{description}</p>

            <div className="exercise-status-box">
              <p>
                {isStarted
                  ? t("exercise.statusActive")
                  : t("exercise.statusReady")}
              </p>

              <p>
                {t("exercise.timerLabel")}: {formatTime(seconds)}
              </p>
            </div>

            <div className="exercise-actions">
              {!isStarted ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleStartExercise}
                >
                  {t("exercise.start")}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleStopExercise}
                >
                  {t("exercise.stop")}
                </button>
              )}
            </div>
          </section>

          <section className="exercise-camera-section" ref={cameraSectionRef}>
            <div className="exercise-camera-header">
              <h2>{t("exercise.cameraTitle")}</h2>

              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleFullscreen}
              >
                {t("exercise.fullscreen")}
              </button>
            </div>

            <div className="exercise-camera-large">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`exercise-video ${
                  !isCameraOn ? "exercise-video--hidden" : ""
                }`}
              />

              <canvas
                ref={canvasRef}
                className={`exercise-canvas ${
                  !isCameraOn ? "exercise-video--hidden" : ""
                }`}
              />

              {!isCameraOn && (
                <div className="exercise-camera-placeholder">
                  <p>{t("exercise.cameraOff")}</p>
                </div>
              )}

              <div className="exercise-overlay exercise-overlay--top">
                <div className="exercise-overlay-status">
                  <span
                    className={`exercise-overlay-dot ${
                      isCameraOn ? "exercise-overlay-dot--active" : ""
                    }`}
                  ></span>

                  <span>
                    {isCameraOn
                      ? t("exercise.overlayCameraOn")
                      : t("exercise.overlayCameraOff")}
                  </span>
                </div>

                <div className="exercise-overlay-message">
                  {isStarted
                    ? t("exercise.overlayActive")
                    : t("exercise.overlayReady")}
                </div>
              </div>

              <div className="exercise-overlay exercise-overlay--bottom">
                <div className="exercise-hint-box">
                  <p>{aiHint || currentHint}</p>

                  {isCameraOn && (
                    <small className="exercise-ai-status">
                      {isAiReady
                        ? t("exercise.aiReady")
                        : t("exercise.aiLoading")}
                    </small>
                  )}
                </div>
              </div>
            </div>

            <div className="exercise-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleNextHint}
              >
                {t("exercise.nextHint")}
              </button>
            </div>

            {cameraError && (
              <div className="exercise-camera-error">
                <p>{cameraError}</p>
                <p>{t("exercise.cameraPermission")}</p>
              </div>
            )}

            <div className="exercise-actions">
              {!isCameraOn ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleStartCamera}
                >
                  {t("exercise.cameraStart")}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleStopCamera}
                >
                  {t("exercise.cameraStop")}
                </button>
              )}
            </div>

            <div className="exercise-tip-box">
              <h3>{t("exercise.tipTitle")}</h3>
              <p>{t("exercise.tipText")}</p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default ExercisePage;
