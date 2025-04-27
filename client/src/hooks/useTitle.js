// src/hooks/useTitle.js
// Custom hook to dynamically set the document title.

import { useEffect } from 'react';

const DEFAULT_TITLE = "Task Tree AI"; // Define your default app title

export function useTitle(title) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;

    // Cleanup function to restore the previous title on unmount
    return () => {
      document.title = previousTitle;
    };
  }, [title]); // Re-run the effect only when the title prop changes
}
