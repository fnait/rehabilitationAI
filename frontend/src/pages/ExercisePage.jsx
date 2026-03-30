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

          <div className="exercise-layout">
            <section className="exercise-main-card">
              <p className="exercise-label">{t("exercise.label")}</p>
              <h1>{title}</h1>
              <p className="exercise-reps">{reps}</p>
              <p className="exercise-description">{description}</p>

              <div className="exercise-actions">
                <button type="button" className="btn btn--primary">
                  {t("exercise.start")}
                </button>
              </div>
            </section>

            <aside className="exercise-side-card">
              <h2>{t("exercise.cameraTitle")}</h2>

              <div className="exercise-camera-placeholder">
                <p>{t("exercise.cameraPlaceholder")}</p>
              </div>

              <div className="exercise-tip-box">
                <h3>{t("exercise.tipTitle")}</h3>
                <p>{t("exercise.tipText")}</p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default ExercisePage;
