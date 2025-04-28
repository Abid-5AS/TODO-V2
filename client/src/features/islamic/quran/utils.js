// client/src/features/islamic/quran/utils.js
// Utility functions specific to the Quran feature

import { getTodayDateString } from "@/common/utils/dateUtils";

/**
 * Extracts Surah and Ayah numbers from a string formatted as "S:A".
 * @param {string} reference - The verse reference string in format "S:A"
 * @returns {{surah: number, ayah: number}} Object containing surah and ayah numbers
 */
export const parseVerseReference = (reference) => {
  try {
    const [surah, ayah] = reference.split(":").map(Number);
    if (isNaN(surah) || isNaN(ayah)) {
      throw new Error("Invalid verse reference format");
    }
    return { surah, ayah };
  } catch (error) {
    console.error("Error parsing verse reference:", error);
    // Default to Al-Fatiha:1 if parsing fails
    return { surah: 1, ayah: 1 };
  }
};

export { getTodayDateString }; 