import { Link } from "react-router-dom";

function Hero({ onOpenAuth }) {
  return (
    <section className="hero">
      <div className="container hero__content">
        <div className="hero__text">
          <span className="hero__label">Інтелектуальна система реабілітації</span>

          <h2>
            Допомога у відновленні з контролем правильності виконання вправ
          </h2>

          <p>
            RehabAI — це вебзастосунок для людей, які проходять реабілітацію
            після травм або операцій. Система допомагає користувачу виконувати
            вправи вдома та в майбутньому буде надавати підказки в реальному
            часі за допомогою аналізу рухів через камеру.
          </p>

          <div className="hero__buttons">
            <button className="btn btn--primary" onClick={onOpenAuth}>
              Почати зараз
            </button>

            <button className="btn btn--secondary" onClick={onOpenAuth}>
              Увійти
            </button>
          </div>
        </div>

        <div className="hero__info-card">
          <h3>Що вирішує застосунок?</h3>
          <p>
            Багато пацієнтів виконують вправи вдома без постійного контролю
            спеціаліста. Це може призводити до неправильних рухів, зайвого
            навантаження та сповільнення відновлення.
          </p>

          <p>
            Наш застосунок створюється для того, щоб зробити домашню
            реабілітацію більш зрозумілою, контрольованою та безпечнішою.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;