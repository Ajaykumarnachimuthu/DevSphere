import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthCard } from "../components/ui/AuthCard";
import { FormInput } from "../components/ui/FormInput";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const emailRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailValue = form.email.trim();

    if (!emailValue) {
      setMessage("Email is required.");
      setIsSuccess(false);
      emailRef.current?.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setMessage("Enter a valid email address.");
      setIsSuccess(false);
      emailRef.current?.focus();
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsSuccess(false);
      return;
    }

    login(emailValue);
    setMessage("Login successful. Redirecting…");
    setIsSuccess(true);
    setTimeout(() => {
      navigate("/");
    }, 600);
  };

  return (
    <AuthCard title="Login to DevSphere" subtitle="Welcome onboard">
      <form onSubmit={handleSubmit}>
        {message && (
          <p className={isSuccess ? "message success" : "message"}>{message}</p>
        )}

        <FormInput
          label="Email address"
          ref={emailRef}
          type="email"
          placeholder="name@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label>
          Password
          <div className="password">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button type="submit">Sign in</button>
      </form>

      <p>
        Don't have an account? <NavLink to="/signup">Sign up</NavLink>
      </p>
    </AuthCard>
  );
}
