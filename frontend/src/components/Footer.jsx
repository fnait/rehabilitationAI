import { useTranslation } from "react-i18next";

function Footer() {
  // Беремо функцію перекладу
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <p>{t("footer.text")}</p>
      </div>
    </footer>
  );
}

export default Footer;