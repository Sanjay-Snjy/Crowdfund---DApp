import React from "react";
import { FiRefreshCw, FiAlertTriangle } from "react-icons/fi";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isReloading: false,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: Date.now(), // Unique ID for this error instance
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global Error Boundary caught an error:", error, errorInfo);
    
    // Log error for debugging (you can send to analytics service here)
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: error.message,
        fatal: true,
      });
    }
  }

  handleManualReload = () => {
    this.setState({ isReloading: true });
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="hydration-safe"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0f0f0f",
            color: "#ffffff",
            fontSize: "16px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              maxWidth: "500px",
              padding: "40px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiAlertTriangle
                style={{
                  fontSize: "32px",
                  color: "#EF4444",
                  width: "32px",
                  height: "32px",
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Something went wrong
              </div>
              <div
                style={{ fontSize: "14px", color: "#888", lineHeight: "1.6" }}
              >
                An unexpected error occurred. Please try refreshing the page to
                continue.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                onClick={this.handleManualReload}
                disabled={this.state.isReloading}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#007bff",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: this.state.isReloading ? "not-allowed" : "pointer",
                  opacity: this.state.isReloading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (!this.state.isReloading) {
                    e.target.style.backgroundColor = "#0056b3";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!this.state.isReloading) {
                    e.target.style.backgroundColor = "#007bff";
                  }
                }}
              >
                <FiRefreshCw
                  style={{
                    width: "16px",
                    height: "16px",
                    animation: this.state.isReloading
                      ? "spin 1s linear infinite"
                      : "none",
                  }}
                />
                {this.state.isReloading ? "Refreshing..." : "Refresh Page"}
              </button>

              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "transparent",
                  color: "#888",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ffffff";
                  e.target.style.borderColor = "#555";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#888";
                  e.target.style.borderColor = "#333";
                }}
              >
                Dismiss
              </button>
            </div>

            {/* Error details for development */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details
                style={{
                  width: "100%",
                  marginTop: "16px",
                  textAlign: "left",
                  color: "#888",
                  fontSize: "12px",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "4px",
                  }}
                >
                  Error details
                </summary>
                <pre
                  style={{
                    marginTop: "8px",
                    padding: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "4px",
                    overflow: "auto",
                    maxHeight: "200px",
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>

          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
