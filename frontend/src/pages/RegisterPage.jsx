import { Link } from "react-router-dom";

function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Створення акаунта</h2>
        <p className="auth-subtitle">
          Зареєструйтеся, щоб користуватися системою та зберігати власний
          прогрес.
        </p>

        <form className="auth-form">
          <input type="text" placeholder="Введіть ім'я" />
          <input type="email" placeholder="Введіть email" />
          <input type="password" placeholder="Створіть пароль" />

          <button type="submit" className="btn btn--primary auth-btn">
            Зареєструватися
          </button>
        </form>

        <p className="auth-link-text">
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;