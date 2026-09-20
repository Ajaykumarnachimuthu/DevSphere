import React, { useState } from "react";
import { createRoot } from "react-dom/client";

export function SignupForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.username.trim();
    const address = form.email.trim().toLowerCase();

    if (name.length < 3) {
      setMessage("Username must contain at least 3 characters.");
      setIsSuccess(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setMessage("Enter a valid email address.");
      setIsSuccess(false);
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsSuccess(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      setIsSuccess(false);
      return;
    }

    // Check duplicate email in localStorage users array
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem("users") || "[]");
      if (!Array.isArray(users)) users = [];
    } catch {
      users = [];
    }

    if (users.some((user) => user.email === address)) {
      setMessage("This email is already registered.");
      setIsSuccess(false);
      return;
    }

    users.push({
      username: name,
      email: address,
      password: form.password,
    });

    localStorage.setItem("users", JSON.stringify(users));

    setMessage("Account created. You can now log in.");
    setIsSuccess(true);
    setForm({ username: "", email: "", password: "", confirmPassword: "" });
  };

  const passwordLength = form.password.length;
  const strength =
    passwordLength === 0
      ? ""
      : passwordLength < 6
      ? "Weak"
      : passwordLength < 10
      ? "Medium"
      : "Strong";

  return (
    <form className="signup" onSubmit={handleSubmit}>
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
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Enter your Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
      </div>

      <div className="input-container">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div className="input-container">
        <label htmlFor="password">Password</label>
        <div style={{ display: "flex", width: "300px" }}>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
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
        {strength && (
          <small
            id="password-strength"
            style={{
              display: "block",
              marginTop: "4px",
              fontWeight: 600,
              color:
                strength === "Weak"
                  ? "crimson"
                  : strength === "Medium"
                  ? "orange"
                  : "green",
            }}
          >
            Strength: {strength}
          </small>
        )}
      </div>

      <div className="input-container">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Re-Enter your password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />
      </div>

      <button type="submit">Register</button>
    </form>
  );
}

// Auto-mount
const container = document.getElementById("signup-island-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <SignupForm />
    </React.StrictMode>
  );
}
