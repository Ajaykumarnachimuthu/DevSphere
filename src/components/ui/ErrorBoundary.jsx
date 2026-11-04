import React from "react";
import { Link } from "react-router-dom";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("DevSphere Caught Unhandled UI Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            background: "var(--bg-canvas, #f8fafc)",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "100%",
              background: "var(--bg-surface, #ffffff)",
              border: "1px solid var(--border-color, #e2e8f0)",
              borderRadius: "16px",
              padding: "36px 32px",
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                marginBottom: "16px",
              }}
            >
              ⚠️
            </div>

            <h2
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "var(--text-primary, #0f172a)",
                margin: "0 0 10px 0",
              }}
            >
              Something went wrong loading this section
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary, #64748b)",
                lineHeight: "1.6",
                margin: "0 0 24px 0",
              }}
            >
              An unexpected render error occurred. Your work is safe, and you can reload the view or return to the projects dashboard.
            </p>

            {this.state.error && (
              <div
                style={{
                  textAlign: "left",
                  background: "var(--bg-surface-subtle, #f1f5f9)",
                  border: "1px solid var(--border-subtle, #e2e8f0)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono, monospace)",
                  color: "#ef4444",
                  marginBottom: "24px",
                  maxHeight: "140px",
                  overflowY: "auto",
                  wordBreak: "break-all",
                }}
              >
                <strong>Error:</strong> {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: "var(--primary, #6366f1)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 22px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🔄 Reload Page
              </button>

              <Link
                to="/projects"
                onClick={this.handleReset}
                style={{
                  background: "var(--bg-surface, #ffffff)",
                  color: "var(--text-primary, #0f172a)",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  borderRadius: "8px",
                  padding: "10px 22px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                ← Back to Projects
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

