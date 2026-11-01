import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { DevSphereProvider } from "./context/DevSphereContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <DevSphereProvider>
        <App />
      </DevSphereProvider>
    </ThemeProvider>
  </React.StrictMode>
);
