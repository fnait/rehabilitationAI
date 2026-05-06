import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import rehabExercises from "../exercises/index.js";
import usePoseDetection from "../hooks/usePoseDetection";

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

  const cameraSectionRef = useRef(null);

  // Функція аналізу конкретної вправи. Передаємо її в hook.
  const analyzePose = ({ landmarks, stageRef, setMainAngle, setExerciseStage, setReps }) => {
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

  const {
    videoRef,
    canvasRef,
    isCameraOn,
    cameraError,
    status,
    tip,
    feedback,
    warning,
    isModelReady,
    mainAngle,
    reps,
    exerciseStage,
    startCamera,
    stopCamera,
    resetPoseState,
  } = usePoseDetection({
    analyzePose,
    cameraErrorText: t("exercise.cameraError"),
  });

  const handleStartExercise = () => {
    setSeconds(0);
    setIsStarted(true);
    resetPoseState();
  };

  const handleStopExercise = () => {
    setIsStarted(false);
  };

  const handleStartCamera = async () => {
    await startCamera();
  };

  const handleStopCamera = () => {
    stopCamera();
    resetPoseState();
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
            <Link
              to="/dashboard"
              className="exercise-back-link exercise-back-link--ui"
            >
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