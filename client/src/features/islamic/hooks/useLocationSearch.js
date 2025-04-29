import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import axiosInstance from '../../../api/axiosInstance';

const DEBOUNCE_DELAY = 500;

// Helper to normalize search results from Nominatim
const normalizeSearchResults = (data) => {
  if (!data || !Array.isArray(data)) {
    console.error('Invalid data structure:', data);
    return [];
  }
  
  console.log('Raw location data from API:', JSON.stringify(data).substring(0, 200));
  
  try {
    return data.map((item) => ({
      lat: parseFloat(item.lat || '0'),
      lon: parseFloat(item.lon || '0'),
      display_name: item.display_name || 'Unknown location',
      address: item.address || {},
      name:
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.address?.county ||
        (item.display_name ? item.display_name.split(',')[0] : 'Unknown'),
      country:
        item.address?.country ||
        (item.display_name ? item.display_name.split(',').slice(-1)[0].trim() : '') ||
        '',
    }));
  } catch (error) {
    console.error('Error normalizing location data:', error);
    return [];
  }
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
      console.log('Sending location search request for query:', query);
      
      const response = await axiosInstance.get(
        '/api/location/search',
        {
          params: { q: query },
          // Force JSON parsing
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Location search response status:', response.status);
      
      // Extra safeguard to ensure we have proper data
      let locationData = response.data;
      if (typeof locationData === 'string') {
        try {
          locationData = JSON.parse(locationData);
          console.log('Parsed string data to JSON');
        } catch (e) {
          console.error('Failed to parse string response:', e);
        }
      }
      
      if (locationData && Array.isArray(locationData) && locationData.length > 0) {
        console.log(`Found ${locationData.length} locations in response`);
        const normalized = normalizeSearchResults(locationData);
        console.log('Normalized search results:', normalized);
        setSearchResults(normalized);
      } else {
        console.log('No locations found in response:', locationData);
        setSearchResults([]);
        setError('No locations found.');
      }
    } catch (err) {
      console.error('Error searching locations:', err);
      const message = err.response?.data?.message || 'Failed to search locations. Please try again.';
      setError(message);
      setSearchResults([]);
      toast.error(message);
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