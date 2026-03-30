import { useContext } from "react";
import { AuthContext } from "./auth-context";

// Хук для зручного доступу до контексту
export function useAuth() {
  return useContext(AuthContext);
}