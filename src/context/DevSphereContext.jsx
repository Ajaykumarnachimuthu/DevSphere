import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { authApi } from "../services/api";

export const DevSphereContext = createContext(null);

export function DevSphereProvider({ children }) {
  const [currentUser, setCurrentUser] = useLocalStorage("loggedInUser", null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      authApi.getCurrentUser()
        .then((res) => {
          if (res) {
            setUserProfile(res);
            setCurrentUser(res.email);
          }
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem("jwt_token");
          setCurrentUser(null);
          setUserProfile(null);
        });
    } else {
      setCurrentUser(null);
      setUserProfile(null);
    }
  }, [setCurrentUser]);

  const loginWithApi = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res?.user) {
      setUserProfile(res.user);
      setCurrentUser(res.user.email);
    }
    return res;
  };

  const registerWithApi = async (username, email, password) => {
    const res = await authApi.register(username, email, password);
    if (res?.user) {
      setUserProfile(res.user);
      setCurrentUser(res.user.email);
    }
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('jwt_token'));

  const value = useMemo(
    () => ({
      currentUser,
      userProfile,
      isAuthenticated: Boolean(currentUser && hasToken),
      loginWithApi,
      registerWithApi,
      logout,
      setCurrentUser,
      setUserProfile,
    }),
    [currentUser, userProfile, hasToken]
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
