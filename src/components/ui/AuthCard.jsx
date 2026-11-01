import React from "react";
import { Link, NavLink } from "react-router-dom";
import authIllustration from "/images/Pair programming-amico.svg";
import devsphereLogo from "/images/devsphere-logo.png";

export function AuthCard({
  title,
  subtitle,
  isSignup = false,
  children,
}) {
  return (
    <div className="auth-clean-page">
      {/* Clean Top Navigation Bar directly on white canvas */}
      <header className="auth-clean-topbar">
        <div className="auth-clean-topbar-inner">
          <NavLink className="logo-brand-link" to="/" aria-label="DevSphere Home">
            <img
              src={devsphereLogo}
              alt="DevSphere Logo"
              className="navbar-brand-logo auth-logo"
            />
          </NavLink>

          <Link to="/" className="auth-clean-back-link">
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Main Content: Directly on page without heavy boxed containers */}
      <main className="auth-clean-main">
        <div className="auth-clean-grid">
          {/* Left Side: Illustration & Info directly on white page */}
          <section className="auth-clean-showcase">
            <div className="auth-clean-illustration-wrap">
              <img
                src={authIllustration}
                alt="DevSphere Pair Programming"
                className="auth-clean-illustration"
              />
            </div>

            <div className="auth-clean-info">
              <h2 className="auth-clean-headline">
                {isSignup
                  ? "Join the DevSphere Developer Community"
                  : "Welcome back to DevSphere"}
              </h2>
              <p className="auth-clean-subhead">
                A platform for software developers to publish technical articles, showcase engineering projects, and build verified developer portfolios.
              </p>

              <ul className="auth-clean-checklist">
                <li>
                  <span className="auth-check-icon">✓</span>
                  <span>Publish rich technical articles & tutorials</span>
                </li>
                <li>
                  <span className="auth-check-icon">✓</span>
                  <span>Showcase production software architectures</span>
                </li>
                <li>
                  <span className="auth-check-icon">✓</span>
                  <span>Track verified GitHub metrics & community feedback</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Right Side: Clean Unboxed Form directly on white page */}
          <section className="auth-clean-form-column">
            <div className="auth-clean-form-box">
              <header className="auth-clean-form-header">
                <span className="auth-clean-eyebrow">
                  {isSignup ? "GET STARTED" : "SIGN IN"}
                </span>
                <h1 className="auth-clean-title">{title}</h1>
                {subtitle && <p className="auth-clean-subtitle">{subtitle}</p>}
              </header>

              <div className="auth-clean-form-body">
                {children}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
