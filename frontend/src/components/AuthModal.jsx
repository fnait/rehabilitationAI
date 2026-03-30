import { useState } from "react";

function AuthModal({ isOpen, onClose }) {
  // стан: login або register
  const [mode, setMode] = useState("login");

  if (!isOpen) return null; // якщо закрито — нічого не показуємо

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* кнопка закриття */}
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {/* заголовок */}
        <h2>{mode === "login" ? "Вхід" : "Реєстрація"}</h2>

        {/* форма */}
        <form className="auth-form">
          {mode === "register" && (
            <input type="text" placeholder="Ім'я" />
          )}

          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Пароль" />

          <button className="btn btn--primary" type="submit">
            {mode === "login" ? "Увійти" : "Зареєструватися"}
          </button>
        </form>

        {/* перемикання */}
        <p className="auth-switch">
          {mode === "login" ? "Немає акаунта?" : "Вже є акаунт?"}
          <span onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? " Зареєструватися" : " Увійти"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;