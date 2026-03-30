// Підключаємо i18n для роботи з перекладами
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ua from "./locales/ua.json";
import en from "./locales/en.json";

// Беремо мову з localStorage, або ставимо українську за замовчуванням
const savedLanguage = localStorage.getItem("language") || "ua";

i18n.use(initReactI18next).init({
  resources: {
    ua: {
      translation: ua,
    },
    en: {
      translation: en,
    },
  },
  lng: savedLanguage,
  fallbackLng: "ua",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;