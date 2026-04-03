import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FilesetResolver,
  PoseLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

import Header from "../components/Header";
import rehabExercises from "../exercises/index.js";
import workouts from "../data/workouts/index.js";

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

function WorkoutSessionPageContent({ slug }) {
  const { t } = useTranslation();

  const workout = workouts.find((item) => item.id === slug);

  const [editableSteps, setEditableSteps] = useState(
    () => workout?.exercises?.map((step) => ({ ...step })) || [],
  );

  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

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

  const currentStep = editableSteps[currentExerciseIndex] || null;

  const currentExercise = useMemo(() => {
    if (!currentStep) return null;

    return rehabExercises.find((item) => item.id === currentStep.exerciseId);
  }, [currentStep]);

  const totalExercises = editableSteps.length;
  const totalTargetReps = editableSteps.reduce(
    (sum, item) => sum + (Number(item.reps) || 0),
    0,
  );
  const completedTargetReps = editableSteps
    .slice(0, currentExerciseIndex)
    .reduce((sum, item) => sum + (Number(item.reps) || 0), 0);

  const resetCurrentExerciseState = useCallback(() => {
    stageRef.current = "start";
    setMainAngle(0);
    setReps(0);
    setExerciseStage("start");
    setTip("Стань перед камерою і почни рух");
    setFeedback("Поки немає оцінки");
    setWarning("");
  }, []);

  const finishWorkout = useCallback(() => {
    setIsWorkoutCompleted(true);
    setIsWorkoutStarted(false);
    setTip("Заняття завершено");
    setFeedback("Усі вправи виконано");
    setWarning("");
  }, []);

  const goToNextExercise = useCallback(() => {
    const isLastExercise = currentExerciseIndex >= editableSteps.length - 1;

    if (isLastExercise) {
      finishWorkout();
      return;
    }

    setCurrentExerciseIndex((prev) => prev + 1);

    stageRef.current = "start";
    setMainAngle(0);
    setReps(0);
    setExerciseStage("start");
    setTip("Стань перед камерою і почни рух");
    setFeedback("Поки немає оцінки");
    setWarning("");
  }, [currentExerciseIndex, editableSteps.length, finishWorkout]);

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

  const updateStepReps = (index, value) => {
    setEditableSteps((prev) =>
      prev.map((step, stepIndex) =>
        stepIndex === index
          ? { ...step, reps: Math.max(1, Number(value) || 1) }
          : step,
      ),
    );
  };

  const decreaseStepReps = (index) => {
    setEditableSteps((prev) =>
      prev.map((step, stepIndex) =>
        stepIndex === index
          ? { ...step, reps: Math.max(1, Number(step.reps) - 1) }
          : step,
      ),
    );
  };

  const increaseStepReps = (index) => {
    setEditableSteps((prev) =>
      prev.map((step, stepIndex) =>
        stepIndex === index
          ? { ...step, reps: Math.max(1, Number(step.reps) + 1) }
          : step,
      ),
    );
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

    if (!currentExercise || typeof currentExercise.analyze !== "function") {
      return {
        message: "Для цієї вправи аналіз недоступний",
        feedback: "",
        warning: "",
      };
    }

    const rawResult = currentExercise.analyze({
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

  const handleStartWorkout = () => {
    setSeconds(0);
    setCurrentExerciseIndex(0);
    setIsWorkoutStarted(true);
    setIsWorkoutCompleted(false);
    resetCurrentExerciseState();
  };

  const handleStopWorkout = () => {
    setIsWorkoutStarted(false);
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
    resetCurrentExerciseState();
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

    if (isWorkoutStarted && !isWorkoutCompleted) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isWorkoutStarted, isWorkoutCompleted]);

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

  useEffect(() => {
    if (!isWorkoutStarted || isWorkoutCompleted || !currentStep) return;
    if (reps < currentStep.reps) return;

    const timeout = setTimeout(() => {
      goToNextExercise();
    }, 1200);

    return () => clearTimeout(timeout);
  }, [
    reps,
    currentStep,
    isWorkoutStarted,
    isWorkoutCompleted,
    goToNextExercise,
  ]);

  if (!workout) {
    return (
      <>
        <Header />
        <main className="exercise-page">
          <div className="container">
            <div className="exercise-not-found">
              <h1>Заняття не знайдено</h1>
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
            <Link
              to="/dashboard"
              className="exercise-back-link exercise-back-link--ui"
            >
              ← {t("exercise.back")}
            </Link>
          </div>

          <section className="exercise-main-card">
            <p className="exercise-label">Готове заняття</p>

            <h1>{workout.name}</h1>

            <p className="exercise-description">{workout.description}</p>

            <p className="exercise-reps">Час заняття: {formatTime(seconds)}</p>

            <div className="exercise-status-box">
              <p>
                <strong>Поточна вправа:</strong> {currentExercise?.name || "—"}
              </p>

              <p>
                <strong>Крок:</strong> {currentExerciseIndex + 1} /{" "}
                {totalExercises}
              </p>

              <p>
                <strong>Ціль повторень:</strong> {currentStep?.reps || 0}
              </p>

              <p>
                <strong>Виконано повторень:</strong> {reps}
              </p>

              <p>
                <strong>Загальний обсяг:</strong> {completedTargetReps + reps} /{" "}
                {totalTargetReps}
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
                <strong>Етап вправи:</strong> {exerciseStage}
              </p>

              <p>
                <strong>Стан заняття:</strong>{" "}
                {isWorkoutCompleted
                  ? "завершено"
                  : isWorkoutStarted
                    ? "активне"
                    : "готове до старту"}
              </p>
            </div>

            <div className="exercise-actions">
              {!isWorkoutStarted && !isWorkoutCompleted ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleStartWorkout}
                >
                  Розпочати заняття
                </button>
              ) : null}

              {isWorkoutStarted ? (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleStopWorkout}
                >
                  Зупинити заняття
                </button>
              ) : null}
            </div>
          </section>

          <section className="exercise-main-card">
            <p className="exercise-label">Плейлист вправ</p>

            <div className="dashboard-grid">
              {editableSteps.map((step, index) => {
                const stepExercise = rehabExercises.find(
                  (item) => item.id === step.exerciseId,
                );

                const isActive = index === currentExerciseIndex;
                const isDone = index < currentExerciseIndex;

                return (
                  <div
                    key={`${step.exerciseId}-${index}`}
                    className={`dashboard-card ${
                      isActive ? "dashboard-card--active" : ""
                    }`}
                  >
                    <h3>{stepExercise?.name || step.exerciseId}</h3>

                    <p>ID: {step.exerciseId}</p>

                    <p>
                      Статус:{" "}
                      {isDone ? "виконано" : isActive ? "поточна" : "очікує"}
                    </p>

                    <div className="workout-reps-control">
                      <button
                        type="button"
                        className="btn btn--secondary workout-reps-btn"
                        onClick={() => decreaseStepReps(index)}
                        disabled={isWorkoutStarted}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={step.reps}
                        onChange={(e) => updateStepReps(index, e.target.value)}
                        disabled={isWorkoutStarted}
                        className="workout-reps-input"
                      />

                      <button
                        type="button"
                        className="btn btn--secondary workout-reps-btn"
                        onClick={() => increaseStepReps(index)}
                        disabled={isWorkoutStarted}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
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
                  {isWorkoutCompleted
                    ? "Заняття завершено"
                    : isWorkoutStarted
                      ? `Зараз виконується: ${currentExercise?.name || "—"}`
                      : "Готово до старту"}
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

            <div className="exercise-actions exercise-actions--camera">
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
                <strong>Заняття:</strong> {workout.name}
              </p>

              <p>
                <strong>Поточна вправа:</strong> {currentExercise?.name || "—"}
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

function WorkoutSessionPage() {
  const { slug } = useParams();

  return <WorkoutSessionPageContent key={slug} slug={slug} />;
}

export default WorkoutSessionPage;
