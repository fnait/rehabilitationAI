import { useTranslation } from "react-i18next";

function Hero({ onOpenLogin, onOpenRegister }) {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <div className="container hero__content">
        <div className="hero__text">
          <span className="hero__label">{t("hero.label")}</span>

          <h2>{t("hero.title")}</h2>

          <p>{t("hero.description")}</p>

          <div className="hero__buttons">
            <button
              type="button"
              className="btn btn--primary"
              onClick={onOpenRegister}
            >
              {t("hero.start")}
            </button>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={onOpenLogin}
            >
              {t("hero.login")}
            </button>
          </div>
        </div>

        <div className="hero__info-card">
          <h3>{t("hero.infoTitle")}</h3>
          <p>{t("hero.infoText1")}</p>
          <p>{t("hero.infoText2")}</p>
        </div>
      </div>
    </section>
  );
}

export default Hero;