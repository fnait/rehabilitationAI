import { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";

function HomePage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <Header onOpenAuth={() => setIsAuthOpen(true)} />

      <Hero onOpenAuth={() => setIsAuthOpen(true)} />

      <Features />
      <HowItWorks />
      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}

export default HomePage;