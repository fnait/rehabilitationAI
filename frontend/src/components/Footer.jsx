import { useTranslation } from "react-i18next";
import { APP_VERSION } from "../config/appVersion";

function Footer() {
  // Беремо функцію перекладу
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <p>{t("footer.text")}</p>
        <p className="footer-version">Версія: v{APP_VERSION}</p>
      </div>
    </footer>
  );
}

export default Footer;