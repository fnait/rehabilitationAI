function Header({ onOpenLogin, onOpenRegister }) {
  return (
    <header className="header">
      <div className="container header__content">
        <div className="logo">RehabAI</div>

        <nav className="nav">
          <button type="button" className="nav-btn" onClick={onOpenLogin}>
            Увійти
          </button>

          <button
            type="button"
            className="nav-register"
            onClick={onOpenRegister}
          >
            Реєстрація
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;