// Helper functions for interacting with localStorage

/**
 * Get an item from localStorage and parse it as JSON.
 * @param {string} key - The key of the item to retrieve.
 * @returns {any | null} The parsed item, or null if not found or error occurs.
 */
export const getLocalStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting localStorage item "${key}":`, error);
    return null;
  }
};

/**
 * Set an item in localStorage after stringifying it.
 * @param {string} key - The key under which to store the item.
 * @param {any} value - The value to store.
 */
export const setLocalStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage item "${key}":`, error);
  }
};

/**
 * Remove an item from localStorage.
 * @param {string} key - The key of the item to remove.
 */
export const removeLocalStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item "${key}":`, error);
  }
}; 