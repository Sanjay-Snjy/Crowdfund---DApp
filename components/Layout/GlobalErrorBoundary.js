import React from "react";

export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isReloading: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("GlobalErrorBoundary:", error, info);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "#f8fafc", color: "#0f172a", fontFamily: "system-ui, sans-serif", zIndex: 10000, padding: 24,
        }}>
          <div style={{ maxWidth: 400, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>
              An unexpected error occurred. Please try refreshing.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: "10px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
              >
                Refresh
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{ padding: "10px 20px", background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, cursor: "pointer" }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
