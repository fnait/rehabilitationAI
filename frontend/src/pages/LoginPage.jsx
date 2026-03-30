import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Вхід до системи</h2>
        <p className="auth-subtitle">
          Увійдіть у свій акаунт, щоб отримати доступ до функцій реабілітації.
        </p>

        <form className="auth-form">
          <input type="email" placeholder="Введіть email" />
          <input type="password" placeholder="Введіть пароль" />

          <button type="submit" className="btn btn--primary auth-btn">
            Увійти
          </button>
        </form>

        <p className="auth-link-text">
          Ще немає акаунта? <Link to="/register">Зареєструватися</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;