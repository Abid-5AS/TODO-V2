// src/components/ui/skeleton.jsx
// UI Component: Skeleton loader.

import { cn } from "../../lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props} />
  );
}

export { Skeleton }
