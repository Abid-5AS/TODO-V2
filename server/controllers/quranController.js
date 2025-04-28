// server/controllers/quranController.js
const axios = require('axios');

// Fetch a random daily Quran verse using Quran Foundation API (api.quran.com)
exports.getDailyVerse = async (req, res, next) => {
  try {
    // Quran Foundation API endpoint for a random verse
    // Requesting specific fields: uthmani text and translation ID 131 (Sahih International)
    const apiUrl = `https://api.quran.com/api/v4/verses/random?language=en&words=false&translations=131&fields=text_uthmani`;

    console.log(`[quranController] Fetching random verse from ${apiUrl}`);

    const response = await axios.get(apiUrl);
    
    // Check if the response structure is as expected
    if (response.data && response.data.verse) {
      const verse = response.data.verse;
      
      // Ensure we have the translation text
      const translationText = verse.translations?.[0]?.text || 'Translation not available';
      // Clean up potential HTML tags from translation (simple regex replace)
      const cleanedTranslation = translationText.replace(/<[^>]*>/g, ''); 

      const formattedVerse = {
        reference: verse.verse_key, // Format: "Surah:Ayah" e.g., "2:255"
        text: verse.text_uthmani, // Uthmani script Arabic text
        translation: cleanedTranslation // Sahih International translation
      };

      res.status(200).json({
        success: true,
        data: formattedVerse
      });
    } else {
      console.error("Unexpected API response structure:", response.data);
      throw new Error('Failed to fetch or parse verse data from Quran Foundation API');
    }

  } catch (error) {
    console.error("Error in getDailyVerse:", error.message);
    if (error.response) {
      console.error('API Response Error:', error.response.status, error.response.data);
      next(new Error(`Failed to fetch verse from external API: Status ${error.response.status}`));
    } else if (error.request) {
      console.error('API No Response:', error.request);
      next(new Error('Failed to fetch verse: No response from external API'));
    } else {
      next(error);
    }
  }
}; 