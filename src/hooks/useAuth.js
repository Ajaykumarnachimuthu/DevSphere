import { useDebugValue } from "react";
import { useDevSphere } from "../context/DevSphereContext";

/**
 * Custom hook encapsulating authentication state and operations.
 * Connects directly to DevSphereContext and provides debug visibility for React DevTools.
 */
export function useAuth() {
  const { currentUser, isAuthenticated, login, logout, setCurrentUser } = useDevSphere();

  // Expose authentication status in React DevTools without exposing sensitive credentials
  useDebugValue(
    isAuthenticated
      ? `User: ${currentUser}`
      : "Guest (Not logged in)"
  );

  return {
    currentUser,
    isAuthenticated,
    login,
    logout,
    setCurrentUser,
  };
}
