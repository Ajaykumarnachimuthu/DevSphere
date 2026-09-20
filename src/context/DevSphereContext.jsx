import { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const DevSphereContext = createContext(null);

export function DevSphereProvider({ children }) {
  const [currentUser, setCurrentUser] = useLocalStorage("loggedInUser", null);

  const login = (email) => {
    if (email) {
      setCurrentUser(email.trim());
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
      setCurrentUser,
    }),
    [currentUser]
  );

  return (
    <DevSphereContext.Provider value={value}>
      {children}
    </DevSphereContext.Provider>
  );
}

export function useDevSphere() {
  const context = useContext(DevSphereContext);
  if (!context) {
    throw new Error("useDevSphere must be used inside DevSphereProvider");
  }
  return context;
}
