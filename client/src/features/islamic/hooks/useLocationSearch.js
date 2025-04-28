import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const DEBOUNCE_DELAY = 500;

// Helper to normalize search results from Nominatim
const normalizeSearchResults = (data) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    display_name: item.display_name,
    address: item.address || {},
    name:
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      item.address?.county ||
      item.display_name.split(',')[0],
    country:
      item.address?.country ||
      item.display_name.split(',').slice(-1)[0].trim() ||
      '',
  }));
};

export const useLocationSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const debounceTimerRef = useRef(null);

  const searchLocations = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setIsSearching(false);
      setSearchResults([]);
      setError('');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            limit: 5, // Keep suggestion limit reasonable
          },
          headers: {
            'User-Agent': 'Islamic Dashboard App', // Replace with your app name if needed
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const normalized = normalizeSearchResults(response.data);
        setSearchResults(normalized);
      } else {
        setSearchResults([]);
        setError('No locations found.'); // Simple error message
      }
    } catch (err) {
      console.error('Error searching locations:', err);
      setError('Failed to search locations. Please try again.');
      setSearchResults([]);
      toast.error('Location search failed. Check connection or try again.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = useCallback(
    (e) => {
      const query = e.target.value;
      setSearchQuery(query);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setError(''); // Clear previous errors on new input

      if (query.length > 2) {
        setIsSearching(true); // Show loading indicator immediately
        setSearchResults([]); // Clear old results
        debounceTimerRef.current = setTimeout(() => {
          searchLocations(query);
        }, DEBOUNCE_DELAY);
      } else {
        setIsSearching(false);
        setSearchResults([]);
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      }
    },
    [searchLocations]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setError('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    error,
    handleSearchChange,
    searchLocations, // Expose direct search if needed elsewhere
    clearSearch,
  };
}; 