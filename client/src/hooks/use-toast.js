// src/hooks/use-toast.js
// Re-exporting toast functionality, likely from the 'sonner' library setup.
// If you were using Radix Toast, this file would contain the implementation.
// Since Sonner is used via SonnerToaster, direct usage might just be importing `toast` from `sonner`.

// If using Radix Toast (this is the original content, but likely replaced by Sonner)
/*
import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

// ... (Radix Toast implementation as provided in the original file) ...

export { useToast, toast } 
*/

// For Sonner usage: Components likely import `toast` directly from `sonner`
// This file might just be a placeholder or re-export if needed for consistency.

// Example re-export (optional):
// import { toast as sonnerToast } from 'sonner';

// export const toast = sonnerToast;

// --- OR --- 
// Provide a custom hook wrapper if needed (e.g., for default options)
import { toast as sonnerToast } from 'sonner';

// Example: Add default options or custom logic
const toast = (message, options) => {
  // You could add default options here
  const defaultOptions = {
    // duration: 4000,
  };
  sonnerToast(message, { ...defaultOptions, ...options });
};

// You might not even need a useToast hook if just using the function
const useToast = () => {
  return { toast };
};

// You also need a ToastProvider if using Radix, but Sonner uses <Toaster /> component
const ToastProvider = ({ children }) => <>{children}</>; // Placeholder if needed by old imports

export { useToast, toast, ToastProvider };
