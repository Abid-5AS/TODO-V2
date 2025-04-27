// src/components/ui/sonner-toaster.jsx
// UI Component: Wrapper for the Sonner toast library's Toaster component.

import { Toaster as Sonner } from "sonner";

const SonnerToaster = (props) => {

  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          // Add styling for success, error, warning, info if needed
           success: 'group-[.toast]:bg-green-50 group-[.toaster]:text-green-700 dark:group-[.toast]:bg-green-900/20 dark:group-[.toaster]:text-green-300 group-[.toaster]:border-green-200 dark:group-[.toaster]:border-green-800',
           error: 'group-[.toast]:bg-red-50 group-[.toaster]:text-red-700 dark:group-[.toast]:bg-red-900/20 dark:group-[.toaster]:text-red-300 group-[.toaster]:border-red-200 dark:group-[.toaster]:border-red-800',
           warning: 'group-[.toast]:bg-yellow-50 group-[.toaster]:text-yellow-700 dark:group-[.toast]:bg-yellow-900/20 dark:group-[.toaster]:text-yellow-300 group-[.toaster]:border-yellow-200 dark:group-[.toaster]:border-yellow-800',
           info: 'group-[.toast]:bg-blue-50 group-[.toaster]:text-blue-700 dark:group-[.toast]:bg-blue-900/20 dark:group-[.toaster]:text-blue-300 group-[.toaster]:border-blue-200 dark:group-[.toaster]:border-blue-800',
        },
      }}
      position="top-right" 
      richColors 
      closeButton
      {...props}
    />
  )
}

export default SonnerToaster;
