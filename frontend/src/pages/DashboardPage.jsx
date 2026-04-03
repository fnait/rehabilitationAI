import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Header from "../components/Header";
import bodyParts from "../data/bodyParts";
import rehabExercises from "../exercises/index.js";
import workouts from "../data/workouts/index.js";

function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [selectedBodyPart, setSelectedBodyPart] = useState(null);

  const userName = user?.displayName || user?.email || "User";

  const selectedExercises = useMemo(() => {
    if (!selectedBodyPart) return [];

    return rehabExercises.filter((exercise) =>
      selectedBodyPart.exercises.includes(exercise.id),
    );
  }, [selectedBodyPart]);

  return (
    <>
      <Header />

      <main className="dashboard-page">
        <div className="container">
          <div className="dashboard-welcome">
            <p className="dashboard-label">{t("dashboard.label")}</p>

            <h1>{t("dashboard.welcome", { name: userName })}</h1>

            <p className="dashboard-text">{t("dashboard.description")}</p>
          </div>

          <section className="dashboard-exercises">
            <h2 className="dashboard-section-title">Готові заняття</h2>

            <div className="dashboard-grid">
              {workouts.map((workout) => (
                <Link
                  key={workout.id}
                  to={`/workout/${workout.id}`}
                  className="dashboard-card dashboard-card-link"
                >
                  <h3>{workout.name}</h3>
                  <p>{workout.description}</p>
                  <p>Вправ у занятті: {workout.exercises.length}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">
              {t("dashboard.sectionTitle")}
            </h2>

            <div className="dashboard-grid">
              {bodyParts.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  className={`dashboard-card ${
                    selectedBodyPart?.id === part.id
                      ? "dashboard-card--active"
                      : ""
                  }`}
                  onClick={() => setSelectedBodyPart(part)}
                >
                  <h3>{part.name}</h3>
                  <p>
                    {t("dashboard.selectedNote")} {part.exercises.length}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {selectedBodyPart && (
            <section className="selected-area-block">
              <h2>
                {t("dashboard.selectedTitle", {
                  title: selectedBodyPart.name,
                })}
              </h2>

              <p>
                {selectedBodyPart.name} — {selectedBodyPart.exercises.length}{" "}
                вправ
              </p>

              <div className="selected-area-note">
                <p>{t("dashboard.selectedNote")}</p>
              </div>
            </section>
          )}

          {selectedBodyPart && selectedExercises.length > 0 && (
            <section className="dashboard-exercises">
              <h2 className="dashboard-section-title">
                {t("dashboard.exerciseTitle")}
              </h2>

              <div className="dashboard-grid">
                {selectedExercises.map((exercise) => (
                  <Link
                    key={exercise.id}
                    to={`/exercise/${exercise.id}`}
                    className="dashboard-card dashboard-card-link"
                  >
                    <h3>{exercise.name}</h3>
                    <p>ID: {exercise.id}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default DashboardPage;
