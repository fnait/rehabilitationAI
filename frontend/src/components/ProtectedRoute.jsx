import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// Компонент для захисту сторінок від неавторизованих користувачів
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // Якщо користувач не увійшов, перекидаємо на головну
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Якщо користувач увійшов, показуємо сторінку
  return children;
}

export default ProtectedRoute;