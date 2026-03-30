import { useTranslation } from "react-i18next";

function Features() {
  // Беремо функцію перекладу
  const { t } = useTranslation();

  return (
    <section className="features">
      <div className="container">
        <h2 className="section-title">{t("features.title")}</h2>

        <div className="features__grid">
          <div className="card">
            <h3>{t("features.card1Title")}</h3>
            <p>{t("features.card1Text")}</p>
          </div>

          <div className="card">
            <h3>{t("features.card2Title")}</h3>
            <p>{t("features.card2Text")}</p>
          </div>

          <div className="card">
            <h3>{t("features.card3Title")}</h3>
            <p>{t("features.card3Text")}</p>
          </div>

          <div className="card">
            <h3>{t("features.card4Title")}</h3>
            <p>{t("features.card4Text")}</p>
          </div>

          <div className="card">
            <h3>{t("features.card5Title")}</h3>
            <p>{t("features.card5Text")}</p>
          </div>

          <div className="card">
            <h3>{t("features.card6Title")}</h3>
            <p>{t("features.card6Text")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;