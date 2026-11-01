import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

export function HomeIsland() {
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem("loggedInUser") || null;
  });

  useEffect(() => {
    const handleStorage = () => {
      setCurrentUser(localStorage.getItem("loggedInUser") || null);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!currentUser) return null;

  return (
    <div
      className="react-welcome-banner"
      style={{
        marginTop: "16px",
        padding: "10px 16px",
        backgroundColor: "#eef2ff",
        color: "#4f46e5",
        borderRadius: "8px",
        fontWeight: 600,
        fontSize: "14px",
        display: "inline-block",
      }}
    >
      👋 Welcome back to DevSphere, {currentUser}!
    </div>
  );
}

// Auto-mount
const container = document.getElementById("home-island-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <HomeIsland />
    </React.StrictMode>
  );
}
