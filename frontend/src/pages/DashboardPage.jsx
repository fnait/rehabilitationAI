import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";
import Header from "../components/Header";
import { rehabAreas } from "../data/rehabAreas";
import { exercises } from "../data/exercises";
import { Link } from "react-router-dom";

function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [selectedArea, setSelectedArea] = useState(null);

  const userName = user?.displayName || user?.email || "User";
  const selectedExercises = selectedArea
    ? exercises[selectedArea.key] || []
    : [];
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

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">
              {t("dashboard.sectionTitle")}
            </h2>

            <div className="dashboard-grid">
              {rehabAreas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  className={`dashboard-card ${
                    selectedArea?.id === area.id ? "dashboard-card--active" : ""
                  }`}
                  onClick={() => setSelectedArea(area)}
                >
                  <h3>{t(`dashboard.areas.${area.key}.title`)}</h3>
                  <p>{t(`dashboard.areas.${area.key}.description`)}</p>
                </button>
              ))}
            </div>
          </section>

          {selectedArea && (
            <section className="selected-area-block">
              <h2>
                {t("dashboard.selectedTitle", {
                  title: t(`dashboard.areas.${selectedArea.key}.title`),
                })}
              </h2>

              <p>{t(`dashboard.areas.${selectedArea.key}.description`)}</p>

              <div className="selected-area-note">
                <p>{t("dashboard.selectedNote")}</p>
              </div>
            </section>
          )}
          {selectedArea && selectedExercises.length > 0 && (
            <section className="dashboard-exercises">
              <h2 className="dashboard-section-title">
                {t("dashboard.exerciseTitle")}
              </h2>

              <div className="dashboard-grid">
                {selectedExercises.map((exercise) => (
                  <Link
                    key={exercise.id}
                    to={`/exercise/${exercise.slug}`}
                    className="dashboard-card dashboard-card-link"
                  >
                    <h3>{t(`exercises.${exercise.key}.title`)}</h3>
                    <p>{t(`exercises.${exercise.key}.reps`)}</p>
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
