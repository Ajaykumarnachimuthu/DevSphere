import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthCard } from "../components/ui/AuthCard";
import { useLocalStorage } from "../hooks/useLocalStorage";

export function Signup() {
  const [users, setUsers] = useLocalStorage("users", []);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [show, setShow] = useState(false);
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

    if (form.password !== form.confirm) {
      setMessage("Passwords do not match.");
      setIsSuccess(false);
      return;
    }

    // Duplicate email verification against stored users array
    const userList = Array.isArray(users) ? users : [];
    if (userList.some((user) => user.email === address)) {
      setMessage("This email is already registered.");
      setIsSuccess(false);
      return;
    }

    const updatedUsers = [
      ...userList,
      { username: name, email: address, password: form.password },
    ];
    setUsers(updatedUsers);

    setMessage("Account created successfully. You can now log in.");
    setIsSuccess(true);
    setForm({ username: "", email: "", password: "", confirm: "" });
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
    <AuthCard title="Create your account" subtitle="Join DevSphere">
      <form onSubmit={handleSubmit}>
        {message && (
          <p className={isSuccess ? "message success" : "message"}>{message}</p>
        )}

        <label>
          Username
          <input
            type="text"
            placeholder="johndoe"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </label>

        <label>
          Email address
          <input
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>

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
          {strength && (
            <small
              className={`strength-indicator ${strength.toLowerCase()}`}
            >
              Strength: {strength}
            </small>
          )}
        </label>

        <label>
          Confirm password
          <input
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </label>

        <button type="submit">Register</button>
      </form>

      <p>
        Already have an account? <NavLink to="/login">Log in</NavLink>
      </p>
    </AuthCard>
  );
}
