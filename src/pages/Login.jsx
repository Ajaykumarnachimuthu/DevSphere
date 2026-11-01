import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthCard } from "../components/ui/AuthCard";
import { FormInput } from "../components/ui/FormInput";
import { Button } from "../components/ui/Button";
import { useDevSphere } from "../context/DevSphereContext";
import { authApi } from "../services/api";

export function Login() {
  const navigate = useNavigate();
  const { loginWithApi } = useDevSphere();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailValue = form.email.trim();

    if (!emailValue) {
      setMessage("Email address is required.");
      setIsSuccess(false);
      emailRef.current?.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setMessage("Please enter a valid email address.");
      setIsSuccess(false);
      emailRef.current?.focus();
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    try {
      if (loginWithApi) {
        await loginWithApi(emailValue, form.password);
      } else {
        await authApi.login(emailValue, form.password);
      }
      setMessage("Authenticated successfully! Redirecting…");
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (err) {
      setMessage(err.message || "Invalid email or password. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Login to DevSphere"
      subtitle="Welcome back! Please enter your credentials."
      eyebrow="WELCOME BACK"
      isSignup={false}
    >
      <form onSubmit={handleSubmit} noValidate>
        {message && (
          <div className={isSuccess ? "alert-banner success" : "alert-banner error"} role="alert">
            <span className="alert-icon">{isSuccess ? "✓" : "!"}</span>
            <span>{message}</span>
          </div>
        )}

        <FormInput
          label="Email Address"
          ref={emailRef}
          type="email"
          placeholder="name@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

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
        </label>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          style={{ marginTop: "8px" }}
        >
          Sign In →
        </Button>
      </form>

      <p className="auth-footer-text">
        Don't have an account? <NavLink to="/signup">Create one now</NavLink>
      </p>
    </AuthCard>
  );
}
