import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";

function Hero({ onOpenLogin, onOpenRegister }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <section className="hero">
      <div className="container hero__content">
        <div className="hero__text">
          <span className="hero__label">{t("hero.label")}</span>

          <h2>{t("hero.title")}</h2>

          <p>{t("hero.description")}</p>

          {!user ? (
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
          ) : (
            <div className="hero__buttons">
              <Link to="/dashboard" className="btn btn--primary">
                Перейти в кабінет
              </Link>
            </div>
          )}
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
