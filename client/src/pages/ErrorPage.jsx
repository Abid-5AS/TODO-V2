import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";

const ErrorPage = ({
  statusCode = 500,
  title = "Something went wrong",
  message = "We apologize for the inconvenience. The application encountered an error.",
  error,
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-600 dark:text-red-400"
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
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {statusCode === 404 ? "Page Not Found" : title}
        </h1>

        <div className="text-gray-500 dark:text-gray-400 mb-6">
          {statusCode === 404
            ? "The page you're looking for doesn't exist or has been moved."
            : message}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm text-left text-red-800 dark:text-red-300 overflow-auto max-h-40">
              <code>{error.toString()}</code>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {statusCode !== 404 && (
            <button
              onClick={handleRefresh}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}

          <button
            onClick={handleGoBack}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
