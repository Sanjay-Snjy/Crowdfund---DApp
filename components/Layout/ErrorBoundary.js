import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    if (typeof console !== "undefined") {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-2xl border border-red-700 bg-white/5 p-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-600/20 text-red-500">
              <FiAlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">Something went wrong</h2>
            <p className="mb-4 text-sm text-slate-300">An unexpected error occurred.</p>
            <div className="mt-4 flex justify-center gap-3">
              <button onClick={() => window.location.reload()} className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white">
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
