function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="container">
        <h2 className="section-title">Як працює застосунок</h2>

        <div className="how-it-works__grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Реєстрація в системі</h3>
            <p>
              Користувач створює акаунт або входить у систему, щоб отримати
              доступ до персонального функціоналу застосунку.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Вибір проблемної зони</h3>
            <p>
              Після входу користувач зможе обрати частину тіла, яка потребує
              реабілітації: руку, ногу, спину, шию та інші зони.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Виконання вправ</h3>
            <p>
              Система буде пропонувати вправи та рекомендації щодо частоти
              занять, а в майбутньому — аналізувати рухи через камеру.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;