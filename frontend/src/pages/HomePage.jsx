import { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";

function HomePage() {
  // Стан відкриття модального вікна
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Поточний режим модалки: login або register
  const [authMode, setAuthMode] = useState("login");

  // Відкрити модалку у режимі входу
  const handleOpenLogin = () => {
    setAuthMode("login");
    setIsAuthOpen(true);
  };

  // Відкрити модалку у режимі реєстрації
  const handleOpenRegister = () => {
    setAuthMode("register");
    setIsAuthOpen(true);
  };

  // Закрити модалку
  const handleCloseAuth = () => {
    setIsAuthOpen(false);
  };

  return (
    <>
      <Header
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
      />

      <Hero
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
      />

      <Features />
      <HowItWorks />
      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        mode={authMode}
        onClose={handleCloseAuth}
      />
    </>
  );
}

export default HomePage;