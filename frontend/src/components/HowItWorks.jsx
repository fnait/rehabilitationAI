import { useTranslation } from "react-i18next";

function HowItWorks() {
  // Беремо функцію перекладу
  const { t } = useTranslation();

  return (
    <section className="how-it-works">
      <div className="container">
        <h2 className="section-title">{t("howItWorks.title")}</h2>

        <div className="how-it-works__grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>{t("howItWorks.step1Title")}</h3>
            <p>{t("howItWorks.step1Text")}</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>{t("howItWorks.step2Title")}</h3>
            <p>{t("howItWorks.step2Text")}</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>{t("howItWorks.step3Title")}</h3>
            <p>{t("howItWorks.step3Text")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;