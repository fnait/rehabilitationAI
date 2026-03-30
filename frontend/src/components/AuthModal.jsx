import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { auth } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

function AuthModal({ isOpen, onClose, mode: initialMode }) {
  const { t } = useTranslation();
  // Поточний режим модалки
  const [mode, setMode] = useState("login");

  // Поля форми
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Повідомлення
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Завантаження
  const [loading, setLoading] = useState(false);

  // Коли модалка відкривається, підставляємо потрібний режим
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || "login");
      setError("");
      setSuccess("");
    }
  }, [isOpen, initialMode]);

  // Якщо модалка закрита — нічого не показуємо
  if (!isOpen) return null;

  // Очищення форми
  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
  };

  // Закриття модалки
  const handleClose = () => {
    clearForm();
    setMode("login");
    onClose();
  };

  // Перемикання між входом і реєстрацією
  const handleSwitchMode = () => {
    setError("");
    setSuccess("");
    setName("");
    setEmail("");
    setPassword("");
    setMode((prevMode) => (prevMode === "login" ? "register" : "login"));
  };

  // Відправка форми
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Скидаємо попередні повідомлення
    setError("");
    setSuccess("");

    // Прості перевірки
    if (!email || !password) {
      setError("Будь ласка, заповніть email і пароль.");
      return;
    }

    if (mode === "register" && !name) {
      setError("Будь ласка, введіть ім'я.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "register") {
        // Реєстрація нового користувача
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        // Додаємо ім'я в профіль користувача
        await updateProfile(userCredential.user, {
          displayName: name,
        });

        setSuccess("Реєстрація пройшла успішно.");

        // Очищаємо форму
        clearForm();

        // Закриваємо модалку через невелику паузу
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        // Вхід існуючого користувача
        await signInWithEmailAndPassword(auth, email, password);

        setSuccess("Вхід виконано успішно.");

        // Очищаємо форму
        clearForm();

        // Закриваємо модалку через невелику паузу
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      // Обробка типових помилок Firebase
      if (err.code === "auth/email-already-in-use") {
        setError("Цей email вже використовується.");
      } else if (err.code === "auth/invalid-email") {
        setError("Некоректний email.");
      } else if (err.code === "auth/weak-password") {
        setError("Пароль має містити щонайменше 6 символів.");
      } else if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Неправильний email або пароль.");
      } else if (err.code === "auth/user-not-found") {
        setError("Користувача не знайдено.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("У Firebase не увімкнений Email/Password.");
      } else {
        setError("Сталася помилка. Спробуй ще раз.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={handleClose}>
          ×
        </button>

        <h2>
          {mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
        </h2>

        <p className="auth-subtitle">
          {mode === "login"
            ? t("auth.loginSubtitle")
            : t("auth.registerSubtitle")}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              type="text"
              placeholder={t("auth.name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          )}

          <input
            type="email"
            placeholder={t("auth.email")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            type="password"
            placeholder={t("auth.password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <p className="auth-message auth-message--error">{error}</p>}

          {success && (
            <p className="auth-message auth-message--success">{success}</p>
          )}

          <button type="submit" className="btn btn--primary auth-btn">
            {loading
              ? "..."
              : mode === "login"
                ? t("auth.loginButton")
                : t("auth.registerButton")}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
          <span onClick={handleSwitchMode}>
            {mode === "login"
              ? t("auth.switchToRegister")
              : t("auth.switchToLogin")}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
