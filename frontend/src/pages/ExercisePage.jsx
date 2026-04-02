import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import { exercises } from "../data/exercises";

// Збираємо всі вправи в один масив
const allExercises = Object.values(exercises).flat();

function ExercisePage() {
  const { slug } = useParams();
  const { t } = useTranslation();

  // Шукаємо вправу по slug
  const exercise = allExercises.find((item) => item.slug === slug);

  // Стан активності вправи
  const [isStarted, setIsStarted] = useState(false);

  // Лічильник секунд
  const [seconds, setSeconds] = useState(0);

  // Стан камери
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // Посилання на video та контейнер камери
  const videoRef = useRef(null);
  const cameraSectionRef = useRef(null);

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

  // Форматування часу
  const formatTime = (totalSeconds) => {
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Запуск вправи
  const handleStartExercise = () => {
    setSeconds(0);
    setIsStarted(true);
  };

  // Завершення вправи
  const handleStopExercise = () => {
    setIsStarted(false);
  };

  // Функція зупинки потоку камери
  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();

      // Зупиняємо всі доріжки відео/аудіо
      tracks.forEach((track) => track.stop());

      videoRef.current.srcObject = null;
    }
  };

  // При виході зі сторінки вимикаємо камеру
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Увімкнення камери
const handleStartCamera = async () => {
  try {
    setCameraError("");

const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    aspectRatio: { ideal: 16 / 9 },
    facingMode: "user",
  },
  audio: false,
});

    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      // Чекаємо, поки браузер підготує відео
      videoRef.current.onloadedmetadata = async () => {
        try {
          await videoRef.current.play();
        } catch (error) {
          console.log("Помилка запуску відео:", error);
        }
      };
    }

    setIsCameraOn(true);
  } catch (error) {
    console.log("Помилка доступу до камери:", error);
    setCameraError(t("exercise.cameraError"));
    setIsCameraOn(false);
  }
};

  // Вимкнення камери
  const handleStopCamera = () => {
    stopCameraStream();
    setIsCameraOn(false);
  };

  // Повноекранний режим для блоку камери
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

  // Якщо вправу не знайдено
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

  const title = t(`exercises.${exercise.key}.title`);
  const reps = t(`exercises.${exercise.key}.reps`);
  const description = t(`exercises.${exercise.key}.description`);

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
    className={`exercise-video ${!isCameraOn ? "exercise-video--hidden" : ""}`}
  />

  {!isCameraOn && (
    <div className="exercise-camera-placeholder">
      <p>{t("exercise.cameraOff")}</p>
    </div>
  )}
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
