import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import rehabExercises from "../exercises/index.js";
import workouts from "../data/workouts/index.js";
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

  const cameraSectionRef = useRef(null);
  const isChangingExerciseRef = useRef(false);
  const changeExerciseTimeoutRef = useRef(null);

  const currentStep = editableSteps[currentExerciseIndex] || null;

  const currentExercise = useMemo(() => {
    if (!currentStep) return null;

    return rehabExercises.find((item) => item.id === currentStep.exerciseId);
  }, [currentStep]);

  // Аналізуємо позу саме для поточної вправи в занятті
  const analyzePose = useCallback(
    ({ landmarks, stageRef, setMainAngle, setExerciseStage, setReps }) => {
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
    },
    [currentExercise],
  );

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
    setTip,
    setFeedback,
    setWarning,
    startCamera,
    stopCamera,
    resetPoseState,
  } = usePoseDetection({
    analyzePose,
    cameraErrorText: t("exercise.cameraError"),
  });

  const totalExercises = editableSteps.length;
  const totalTargetReps = editableSteps.reduce(
    (sum, item) => sum + (Number(item.reps) || 0),
    0,
  );
  const completedTargetReps = editableSteps
    .slice(0, currentExerciseIndex)
    .reduce((sum, item) => sum + (Number(item.reps) || 0), 0);

  // Скидаємо стан аналізу, коли стартуємо/перемикаємо вправу
  const resetCurrentExerciseState = useCallback(() => {
    resetPoseState();
    setTip("Стань перед камерою і почни рух");
  }, [resetPoseState, setTip]);

  const finishWorkout = useCallback(() => {
    setIsWorkoutCompleted(true);
    setIsWorkoutStarted(false);
    setTip("Заняття завершено");
    setFeedback("Усі вправи виконано");
    setWarning("");
  }, [setFeedback, setTip, setWarning]);

  const goToNextExercise = useCallback(() => {
    const isLastExercise = currentExerciseIndex >= editableSteps.length - 1;

    if (isLastExercise) {
      finishWorkout();
      return;
    }

    setCurrentExerciseIndex((prev) => prev + 1);
    resetCurrentExerciseState();
  }, [
    currentExerciseIndex,
    editableSteps.length,
    finishWorkout,
    resetCurrentExerciseState,
  ]);

  // Даємо змогу змінювати повторення до старту тренування
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


  const handleStartWorkout = () => {
    // Нове заняття: скидаємо блок переходу між вправами
    isChangingExerciseRef.current = false;
    if (changeExerciseTimeoutRef.current) {
      clearTimeout(changeExerciseTimeoutRef.current);
      changeExerciseTimeoutRef.current = null;
    }

    setSeconds(0);
    setCurrentExerciseIndex(0);
    setIsWorkoutStarted(true);
    setIsWorkoutCompleted(false);
    resetCurrentExerciseState();
  };

  const handleStopWorkout = () => {
    isChangingExerciseRef.current = false;
    if (changeExerciseTimeoutRef.current) {
      clearTimeout(changeExerciseTimeoutRef.current);
      changeExerciseTimeoutRef.current = null;
    }
    setIsWorkoutStarted(false);
  };

  const handleStartCamera = async () => {
    await startCamera();
  };

  const handleStopCamera = () => {
    stopCamera();
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
    if (!isWorkoutStarted) return;
    if (isWorkoutCompleted) return;
    if (!currentStep) return;
    if (reps < Number(currentStep.reps)) return;
    if (isChangingExerciseRef.current) return;

    // Фіксуємо, що перехід уже запущено, щоб не скидався через часті оновлення з камери
    isChangingExerciseRef.current = true;
    changeExerciseTimeoutRef.current = setTimeout(() => {
      goToNextExercise();
      isChangingExerciseRef.current = false;
      changeExerciseTimeoutRef.current = null;
    }, 1200);

    return undefined;
  }, [
    reps,
    currentStep,
    isWorkoutStarted,
    isWorkoutCompleted,
    goToNextExercise,
  ]);

  useEffect(() => {
    return () => {
      if (changeExerciseTimeoutRef.current) {
        clearTimeout(changeExerciseTimeoutRef.current);
      }
    };
  }, []);

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
