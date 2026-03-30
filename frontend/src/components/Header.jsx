import { Link } from "react-router-dom";

function Header({ onOpenAuth }) {
  return (
    <header className="header">
      <div className="container header__content">
        <div className="logo">RehabAI</div>

        <nav className="nav">
          <button className="nav-btn" onClick={onOpenAuth}>
            Увійти
          </button>

          <button className="nav-register" onClick={onOpenAuth}>
            Реєстрація
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;