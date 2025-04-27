import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400">
              Something went wrong
            </h2>
          </div>

          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
            The application encountered an error. Please try refreshing the
            page.
          </p>

          {this.props.showDetails && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
              <p className="text-red-500">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
