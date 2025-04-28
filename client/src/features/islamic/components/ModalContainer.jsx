import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";

/**
 * Reusable modal container with backdrop and close functionality
 * @param {Object} props
 * @param {React.ReactNode} props.children - Modal content
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {React.ReactNode} props.title - Modal title (can include icon)
 */
const ModalContainer = ({ children, onClose, title }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    // Handle escape key to close modal
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Handle click outside to close modal
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-auto"
      >
        <div className="sticky top-0 p-4 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg font-semibold flex items-center">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalContainer; 