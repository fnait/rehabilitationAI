import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";

function Header({ onOpenLogin, onOpenRegister }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  // Зміна мови
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // Ім'я користувача: спочатку displayName, якщо його нема — email
  const userName = user?.displayName || user?.email || "User";

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

          {user ? (
            <div className="header-user-block">
              <span className="header-user-name">{userName}</span>

              <button type="button" className="nav-register" onClick={logout}>
                {t("header.logout")}
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
