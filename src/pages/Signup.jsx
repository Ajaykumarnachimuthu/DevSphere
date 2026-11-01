import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthCard } from "../components/ui/AuthCard";
import { Button } from "../components/ui/Button";
import { authApi } from "../services/api";

export function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.username.trim();
    const address = form.email.trim().toLowerCase();

    if (name.length < 3) {
      setMessage("Username must contain at least 3 characters.");
      setIsSuccess(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setMessage("Please enter a valid email address.");
      setIsSuccess(false);
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsSuccess(false);
      return;
    }

    if (form.password !== form.confirm) {
      setMessage("Passwords do not match.");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register(name, address, form.password);
      setMessage("Account created successfully! You can now log in.");
      setIsSuccess(true);
      setForm({ username: "", email: "", password: "", confirm: "" });
    } catch (err) {
      setMessage(err.message || "Failed to create account. Please check your details.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
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
    <AuthCard
      title="Create your account"
      subtitle="Join the DevSphere builder community."
      eyebrow="JOIN THE COMMUNITY"
      isSignup={true}
    >
      <form onSubmit={handleSubmit} noValidate>
        {message && (
          <div className={isSuccess ? "alert-banner success" : "alert-banner error"} role="alert">
            <span className="alert-icon">{isSuccess ? "✓" : "!"}</span>
            <span>{message}</span>
          </div>
        )}

        <label>
          Username
          <input
            type="text"
            placeholder="johndoe"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </label>

        <label>
          Email address
          <input
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>

        <label>
          Password
          <div className="password-input-wrapper">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShow(!show)}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          {strength && (
            <div className="strength-bar-container">
              <span className={`strength-indicator ${strength.toLowerCase()}`}>
                Strength: <strong>{strength}</strong>
              </span>
            </div>
          )}
        </label>

        <label>
          Confirm password
          <input
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
          />
        </label>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          style={{ marginTop: "8px" }}
        >
          Create Account →
        </Button>
      </form>

      <p className="auth-footer-text">
        Already have an account? <NavLink to="/login">Sign in here</NavLink>
      </p>
    </AuthCard>
  );
}
