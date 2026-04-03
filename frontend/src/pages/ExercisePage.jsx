import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FilesetResolver,
  PoseLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

import Header from "../components/Header";
import rehabExercises from "../exercises/index.js";

const POSE_CONNECTIONS = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

function formatTime(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function normalizeAnalyzeResult(result) {
  if (typeof result === "string") {
    return {
      message: result,
      feedback: "",
      warning: "",
    };
  }

  if (result && typeof result === "object") {
    return {
      message: result.message || "",
      feedback: result.feedback || "",
      warning: result.warning || "",
    };
  }

  return {
    message: "Немає результату аналізу",
    feedback: "",
    warning: "",
  };
}

function ExercisePageContent({ slug }) {
  const { t } = useTranslation();

  const exercise = rehabExercises.find((item) => item.id === slug);

  const [isStarted, setIsStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [status, setStatus] = useState("Натисни кнопку, щоб увімкнути камеру");
  const [tip, setTip] = useState("Поки немає аналізу");
  const [feedback, setFeedback] = useState("Поки немає оцінки");
  const [warning, setWarning] = useState("");
  const [isModelReady, setIsModelReady] = useState(false);

  const [mainAngle, setMainAngle] = useState(0);
  const [reps, setReps] = useState(0);
  const [exerciseStage, setExerciseStage] = useState("start");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraSectionRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const streamRef = useRef(null);
  const stageRef = useRef("start");

  const resetExerciseState = () => {
    stageRef.current = "start";
    setMainAngle(0);
    setReps(0);
    setExerciseStage("start");
    setTip("Обери вправу та почни рух");
    setFeedback("Поки немає оцінки");
    setWarning("");
  };

  const stopAnimationLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const analyzeExercise = (landmarks) => {
    if (!landmarks || landmarks.length === 0) {
      setMainAngle(0);
      setExerciseStage("start");
      stageRef.current = "start";

      return {
        message: "Людину не знайдено",
        feedback: "Стань перед камерою повністю",
        warning: "",
      };
    }

    const pose = landmarks[0];

    if (!exercise || typeof exercise.analyze !== "function") {
      return {
        message: "Для цієї вправи аналіз недоступний",
        feedback: "",
        warning: "",
      };
    }

    const rawResult = exercise.analyze({
      pose,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
    });

    return normalizeAnalyzeResult(rawResult);
  };

  const predictWebcam = (timestamp) => {
    if (
      !poseLandmarkerRef.current ||
      !videoRef.current ||
      !canvasRef.current ||
      videoRef.current.readyState < 2
    ) {
      animationFrameRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    if (lastVideoTimeRef.current !== video.currentTime) {
      lastVideoTimeRef.current = video.currentTime;

      const results = poseLandmarkerRef.current.detectForVideo(
        video,
        timestamp,
      );

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
        const drawingUtils = new DrawingUtils(ctx);

        for (const landmarks of results.landmarks) {
          drawingUtils.drawLandmarks(landmarks, { radius: 4 });
          drawingUtils.drawConnectors(landmarks, POSE_CONNECTIONS, {
            lineWidth: 3,
          });
        }

        const result = analyzeExercise(results.landmarks);
        setTip(result.message || "");
        setFeedback(result.feedback || "");
        setWarning(result.warning || "");
      } else {
        setTip("Стань так, щоб тебе було видно повністю");
        setFeedback("Очікую правильне положення перед камерою");
        setWarning("");
        setMainAngle(0);
        stageRef.current = "start";
        setExerciseStage("start");
      }
    }

    animationFrameRef.current = requestAnimationFrame(predictWebcam);
  };

  const startDetection = () => {
    stopAnimationLoop();
    animationFrameRef.current = requestAnimationFrame(predictWebcam);
  };

  const handleStartExercise = () => {
    setSeconds(0);
    setIsStarted(true);
    resetExerciseState();
  };

  const handleStopExercise = () => {
    setIsStarted(false);
  };

  const handleStartCamera = async () => {
    try {
      setCameraError("");
      setStatus("Запит доступу до камери...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 960,
          height: 540,
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = async () => {
        try {
          if (!videoRef.current) return;

          await videoRef.current.play();

          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }

          lastVideoTimeRef.current = -1;
          stageRef.current = "start";

          setIsCameraOn(true);
          setExerciseStage("start");
          setStatus("Камера працює");
          startDetection();
        } catch (error) {
          console.error("Помилка запуску відео:", error);
          setStatus("Не вдалося запустити відео");
          setCameraError(t("exercise.cameraError"));
        }
      };
    } catch (error) {
      console.error("Помилка доступу до камери:", error);
      setStatus("Немає доступу до камери");
      setCameraError(t("exercise.cameraError"));
    }
  };

  const handleStopCamera = () => {
    stopAnimationLoop();
    stopCameraStream();
    clearCanvas();
    lastVideoTimeRef.current = -1;
    setIsCameraOn(false);
    setStatus("Камеру вимкнено");
    resetExerciseState();
  };

  const handleFullscreen = async () => {
    if (!cameraSectionRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await cameraSectionRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error("Помилка fullscreen:", error);
    }
  };

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

  useEffect(() => {
    const initPoseLandmarker = async () => {
      try {
        setStatus("Завантаження моделі...");

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        poseLandmarkerRef.current = poseLandmarker;
        setIsModelReady(true);
        setStatus("Модель готова");
      } catch (error) {
        console.error("Помилка завантаження моделі:", error);
        setStatus("Не вдалося завантажити модель");
        setCameraError("Не вдалося завантажити модель AI");
      }
    };

    initPoseLandmarker();

    return () => {
      stopAnimationLoop();
      stopCameraStream();
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

            <h1>{exercise.name}</h1>

            <p className="exercise-reps">
              {t("exercise.timerLabel")}: {formatTime(seconds)}
            </p>

            <p className="exercise-description">
              {t("exercise.tipText")}
            </p>

            <div className="exercise-status-box">
              <p>
                {isStarted
                  ? t("exercise.statusActive")
                  : t("exercise.statusReady")}
              </p>

              <p>
                <strong>Статус AI:</strong> {status}
              </p>

              <p>
                <strong>Модель:</strong>{" "}
                {isModelReady ? "готова до роботи" : "ще завантажується"}
              </p>

              <p>
                <strong>Основний кут:</strong> {mainAngle}°
              </p>

              <p>
                <strong>Повторення:</strong> {reps}
              </p>

              <p>
                <strong>Етап вправи:</strong> {exerciseStage}
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
                  <p>{tip || "Поки немає аналізу"}</p>

                  <small className="exercise-ai-status">
                    {feedback ||
                      (isModelReady ? "AI готовий" : "AI завантажується")}
                  </small>

                  {!!warning && (
                    <small className="exercise-ai-status">{warning}</small>
                  )}
                </div>
              </div>
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
                  disabled={!isModelReady}
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
              <p>
                <strong>Вправа:</strong> {exercise.name}
              </p>
              <p>
                <strong>Оцінка руху:</strong> {feedback || "ще немає"}
              </p>
              <p>
                <strong>Попередження:</strong> {warning || "немає"}
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function ExercisePage() {
  const { slug } = useParams();

  return <ExercisePageContent key={slug} slug={slug} />;
}

export default ExercisePage;