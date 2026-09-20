import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { DevSphereProvider } from "./context/DevSphereContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DevSphereProvider>
      <App />
    </DevSphereProvider>
  </React.StrictMode>
);
