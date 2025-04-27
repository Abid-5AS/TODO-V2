// src/hooks/use-mobile.js
// Custom hook to detect if the current viewport width is considered 'mobile'.

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Example breakpoint (Tailwind's md)

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false; // Default to false during SSR or initial server render
    }
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]); // Re-run effect if breakpoint changes

  return isMobile;
}
