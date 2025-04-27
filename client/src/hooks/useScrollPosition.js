// src/hooks/useScrollPosition.js
// Custom hook to save and restore scroll position for specific keys using sessionStorage.

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDebounce } from './useDebounce'; // Assuming you have this hook

const useScrollPosition = (storageKey, delay = 200) => {
  const scrollY = useRef(0);
  const debouncedScrollY = useDebounce(scrollY.current, delay);
  const location = useLocation(); // Use location to potentially reset on navigation

  // Restore scroll position on mount
  useEffect(() => {
    const savedPosition = sessionStorage.getItem(storageKey);
    if (savedPosition) {
      const parsedPosition = parseInt(savedPosition, 10);
      if (!isNaN(parsedPosition)) {
        // Use timeout to allow layout rendering
        const timer = setTimeout(() => window.scrollTo(0, parsedPosition), 100);
        return () => clearTimeout(timer);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, location.key]); // Rerun on location *key* change (full navigation) or key change

  // Save scroll position on scroll (debounced)
  useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
      // The debounced effect below will handle saving
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to save the debounced scroll position
  useEffect(() => {
    if (debouncedScrollY !== undefined) {
      // console.log(`Saving scroll position for ${storageKey}: ${debouncedScrollY}`);
      sessionStorage.setItem(storageKey, debouncedScrollY.toString());
    }
  }, [debouncedScrollY, storageKey]);
};

export default useScrollPosition;
