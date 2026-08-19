import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Save error info for debugging (could send to telemetry)
    this.setState({ error, info });
    if (typeof console !== "undefined") {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-2xl border border-red-700 bg-white/5 p-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-600/20 text-red-500">
              <FiAlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">Something went wrong</h2>
            <p className="mb-4 text-sm text-slate-300">An unexpected error occurred while rendering the page.</p>
            <details className="mx-auto max-w-full whitespace-pre-wrap text-left text-xs text-slate-300 bg-black/10 p-3 rounded-lg">
              <summary className="cursor-pointer font-medium">Show error details</summary>
              <div className="mt-2">
                <strong>Error:</strong>
                <pre className="mt-1 overflow-auto text-xs">{String(this.state.error && this.state.error.toString())}</pre>
                {this.state.info && (
                  <>
                    <strong className="mt-2 block">Stack:</strong>
                    <pre className="mt-1 overflow-auto text-xs">{this.state.info.componentStack}</pre>
                  </>
                )}
              </div>
            </details>
            <div className="mt-4 flex justify-center gap-3">
              <button onClick={() => window.location.reload()} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">Refresh Page</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
