// src/components/ui/toaster.jsx
// UI Component: Renders toasts using the useToast hook (Radix implementation).
// Note: This is for Radix Toast. If using Sonner, see sonner-toaster.jsx.

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast" // Assuming this imports the Radix Toast components
import { useToast } from "../../hooks/use-toast" // Assuming this is the Radix useToast hook

export function Toaster() {
  const { toasts } = useToast() // This needs to be the hook managing Radix toasts

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
