import axios from "axios";

// Function to fetch data from the backend API
const fetchDailyQuranVerseAPI = async () => {
  try {
    // Correct the API endpoint path
    const response = await axios.get("/api/ai/quran/daily-verse");
    return response.data; // Expecting { success: boolean, data: VerseData }
  } catch (error) {
    console.error("Error fetching daily quran verse:", error);
    return null;
  }
};

export default fetchDailyQuranVerseAPI; 