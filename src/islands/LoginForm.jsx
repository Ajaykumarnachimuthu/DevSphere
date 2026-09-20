import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useAuth } from "../hooks/useAuth";
import { DevSphereProvider } from "../context/DevSphereContext";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const emailInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailVal = email.trim();

    if (!emailVal) {
      setMessage("Email is required.");
      setIsSuccess(false);
      emailInputRef.current?.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setMessage("Enter a valid email address.");
      setIsSuccess(false);
      emailInputRef.current?.focus();
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsSuccess(false);
      return;
    }

    // Dual-compatible write: raw string for legacy vanilla JS and state sync for React
    login(emailVal);
    localStorage.setItem("loggedInUser", emailVal);

    setMessage("Login successful. Redirecting…");
    setIsSuccess(true);

    setTimeout(() => {
      window.location.href = "./index.html";
    }, 600);
  };

  return (
    <form className="loginForm" onSubmit={handleSubmit}>
      {message && (
        <p
          style={{
            color: isSuccess ? "green" : "crimson",
            fontWeight: 500,
            fontSize: "14px",
            marginBottom: "12px",
          }}
        >
          {message}
        </p>
      )}

      <div className="input-container">
        <label htmlFor="email">Email Address</label>
        <input
          ref={emailInputRef}
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="input-container">
        <label htmlFor="PASSWORD">Password</label>
        <div style={{ display: "flex", width: "300px" }}>
          <input
            type={showPassword ? "text" : "password"}
            id="PASSWORD"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "240px" }}
          />
          <button
            type="button"
            id="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            style={{ width: "60px", cursor: "pointer" }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button type="submit" className="btn-submit">
        Sign In
      </button>
    </form>
  );
}

// Auto-mount
const container = document.getElementById("login-island-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <DevSphereProvider>
        <LoginForm />
      </DevSphereProvider>
    </React.StrictMode>
  );
}
