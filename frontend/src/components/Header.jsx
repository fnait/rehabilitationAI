import { useTranslation } from "react-i18next";

function Header({ onOpenLogin, onOpenRegister }) {
  const { t, i18n } = useTranslation();

  // Функція зміни мови
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <header className="header">
      <div className="container header__content">
        <div className="logo">RehabAI</div>

        <nav className="nav">
          <div className="language-switcher">
            <button type="button" onClick={() => changeLanguage("ua")}>
              UA
            </button>
            <button type="button" onClick={() => changeLanguage("en")}>
              EN
            </button>
          </div>

          <button type="button" className="nav-btn" onClick={onOpenLogin}>
            {t("header.login")}
          </button>

          <button
            type="button"
            className="nav-register"
            onClick={onOpenRegister}
          >
            {t("header.register")}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;