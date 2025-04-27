// Location utility functions for Islamic dashboard
import axios from "axios";

/**
 * Fetch timezone for a given location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<string>} Timezone string
 */
export const fetchTimezone = async (lat, lon) => {
  if (lat === 0 && lon === 0) {
    return "UTC"; // Default timezone when location is not available
  }

  try {
    const response = await axios.get(
      `https://worldtimeapi.org/api/timezone/Etc/GMT${
        new Date().getTimezoneOffset() >= 0 ? "-" : "+"
      }${Math.abs(Math.floor(new Date().getTimezoneOffset() / 60))}`
    );
    return response.data.timezone;
  } catch (error) {
    console.error("Error fetching timezone:", error);
    // Use browser timezone as fallback
    const offset = -new Date().getTimezoneOffset() / 60;
    return `Etc/GMT${offset >= 0 ? "+" : "-"}${Math.abs(Math.floor(offset))}`;
  }
};

/**
 * Search for locations using OpenStreetMap/Nominatim API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of location objects
 */
export const searchLocations = async (query) => {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 5,
        },
        headers: {
          "User-Agent": "Islamic Dashboard",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      return response.data.map((item) => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        display_name: item.display_name,
        address: item.address || {},
        name:
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          item.address?.county ||
          item.display_name.split(",")[0],
        country:
          item.address?.country ||
          item.display_name.split(",").slice(-1)[0].trim() ||
          "",
      }));
    }
    return [];
  } catch (error) {
    console.error("Error searching for locations:", error);
    throw error;
  }
};

/**
 * Get the user's current location using browser geolocation
 * @returns {Promise<Object>} Location object
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";

        if (error.code === 1) {
          errorMessage =
            "Location access denied. Please enable location services.";
        } else if (error.code === 2) {
          errorMessage =
            "Location unavailable. Please try again or search manually.";
        } else if (error.code === 3) {
          errorMessage = "Location request timed out. Please try again.";
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Get location name from coordinates using reverse geocoding
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<Object>} Location data
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "Islamic Dashboard",
        },
      }
    );

    if (response.data) {
      const address = response.data.address;
      return {
        lat: latitude,
        lon: longitude,
        name:
          address.city ||
          address.town ||
          address.village ||
          address.county ||
          "Current Location",
        country: address.country || "",
        display_name: response.data.display_name,
        address: address,
      };
    }
    throw new Error("Unable to determine location name");
  } catch (error) {
    console.error("Error getting location name:", error);
    // Return a fallback with just coordinates
    return {
      lat: latitude,
      lon: longitude,
      name: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      country: "",
      display_name: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(
        4
      )}`,
      address: {},
    };
  }
};

/**
 * Get user's current location with name details
 * @returns {Promise<Object>} Location object with name details
 */
export const getCurrentLocationWithDetails = async () => {
  try {
    const position = await getCurrentPosition();
    return await reverseGeocode(position.latitude, position.longitude);
  } catch (error) {
    throw error;
  }
};
