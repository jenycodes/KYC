"use client";

import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("SecureKYC crashed:", error, info.componentStack);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
            fontFamily: "Segoe UI, sans-serif",
            background: "#f7f8fa",
            color: "#16202a",
          }}
        >
          <h1 style={{ fontSize: 20, margin: 0 }}>Something went wrong</h1>
          <p style={{ maxWidth: 420, color: "#6b7686", fontSize: 14 }}>
            SecureKYC hit an unexpected error and couldn&apos;t render this page. This is
            usually caused by stale local data from an earlier session.
          </p>
          <pre
            style={{
              maxWidth: 520,
              overflow: "auto",
              background: "#eef1f4",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 12,
              color: "#3d4a58",
              textAlign: "left",
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              padding: "10px 20px",
              borderRadius: 6,
              border: "none",
              background: "#1f2a36",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reset local session &amp; return to login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
