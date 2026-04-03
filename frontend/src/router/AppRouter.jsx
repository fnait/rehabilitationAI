import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import DashboardPage from "../pages/DashboardPage";
import ExercisePage from "../pages/ExercisePage";
import ProtectedRoute from "../components/ProtectedRoute";
import WorkoutSessionPage from "../pages/WorkoutSessionPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/exercise/:slug"
        element={
          <ProtectedRoute>
            <ExercisePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workout/:slug"
        element={
          <ProtectedRoute>
            <WorkoutSessionPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRouter;
