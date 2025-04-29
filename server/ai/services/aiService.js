const axios = require("axios");
const { groqClient, lmStudioSettings } = require("../../config/aiProviders");
const { AppError } = require("../../utils/errorHandler");
const { PROVIDERS, LMSTUDIO_DEFAULTS, GROQ_DEFAULTS, ERROR_MESSAGES } = require("../constants");

// In-memory state - Needs proper management for scaling
let useLocalAI = process.env.USE_LOCAL_AI === "true" || false;

exports.getCurrentProvider = () => {
    return useLocalAI ? PROVIDERS.LOCAL : PROVIDERS.CLOUD;
}

exports.toggleProvider = (useLocal) => {
    useLocalAI = useLocal;
    return exports.getCurrentProvider();
};

exports.callAI = async (systemPrompt, userPrompt, options = {}) => {
  try {
    if (useLocalAI) {
      const response = await axios.post(
        `${lmStudioSettings.baseURL}/chat/completions`,
        {
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
          model: lmStudioSettings.model || LMSTUDIO_DEFAULTS.MODEL,
          temperature: options.temperature ?? LMSTUDIO_DEFAULTS.TEMPERATURE,
          max_tokens: options.max_tokens ?? LMSTUDIO_DEFAULTS.MAX_TOKENS,
          top_p: options.top_p ?? LMSTUDIO_DEFAULTS.TOP_P,
          stream: false,
        },
        { headers: { "Content-Type": "application/json" }, timeout: options.timeout ?? LMSTUDIO_DEFAULTS.TIMEOUT }
      );
      return { content: response.data.choices[0]?.message?.content || "", provider: PROVIDERS.LOCAL };
    } else {
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        model: GROQ_DEFAULTS.MODEL,
        temperature: options.temperature ?? GROQ_DEFAULTS.TEMPERATURE,
        max_tokens: options.max_tokens ?? GROQ_DEFAULTS.MAX_TOKENS,
        top_p: options.top_p ?? GROQ_DEFAULTS.TOP_P,
        stop: null,
        stream: false,
      });
      return { content: chatCompletion.choices[0]?.message?.content || "", provider: PROVIDERS.CLOUD };
    }
  } catch (error) {
    console.error("AI Provider Error:", error.message);
    let friendlyMessage = ERROR_MESSAGES.GENERAL_FAILURE;
    if (useLocalAI) {
      if (error.code === "ECONNREFUSED") friendlyMessage = ERROR_MESSAGES.LMSTUDIO_CONNECTION_FAILED;
      else if (error.code === "ECONNABORTED" || error.message.includes("timeout")) friendlyMessage = ERROR_MESSAGES.LMSTUDIO_TIMEOUT;
    } else {
      if (error.status === 401) friendlyMessage = ERROR_MESSAGES.GROQ_AUTH_FAILED;
      else if (error.status === 429) friendlyMessage = ERROR_MESSAGES.GROQ_RATE_LIMIT;
    }
    throw new AppError(friendlyMessage, 500);
  }
};

exports.checkLocalAIConnection = async () => {
  try {
    await axios.get(`${lmStudioSettings.baseURL}/models`, { timeout: LMSTUDIO_DEFAULTS.STATUS_CHECK_TIMEOUT });
    return { status: true, message: ERROR_MESSAGES.LMSTUDIO_CONNECTION_SUCCESS };
  } catch (error) {
    let message = ERROR_MESSAGES.LMSTUDIO_UNREACHABLE;
    if (error.code === "ECONNREFUSED") message = ERROR_MESSAGES.LMSTUDIO_CONNECTION_FAILED_DETAIL(lmStudioSettings.baseURL);
    else if (error.code === "ECONNABORTED" || error.message.includes("timeout")) message = ERROR_MESSAGES.LMSTUDIO_TIMEOUT_DETAIL(lmStudioSettings.baseURL);
    else message = error.message || ERROR_MESSAGES.UNKNOWN_CONNECTION_ERROR;
    
    const details = {
        code: error.code,
        address: error.address,
        port: error.port,
        baseURL: lmStudioSettings.baseURL,
        rawError: error.toString(),
      };
    return { status: false, message, details };
  }
};

// Service function to fetch the daily Quran verse
exports.fetchDailyVerse = async () => {
  try {
    // Fetch a random ayah from api.alquran.cloud including Arabic and English
    const randomAyahNumber = Math.floor(Math.random() * 6236) + 1; // Quran has 6236 verses
    // Fetch both Arabic (quran-uthmani) and English (en.sahih) editions
    const apiUrl = `http://api.alquran.cloud/v1/ayah/${randomAyahNumber}/editions/quran-uthmani,en.sahih`;
    
    console.log(`[aiService] Fetching daily Quran verse from: ${apiUrl}`);
    const response = await axios.get(apiUrl);

    if (response.status === 200 && response.data && response.data.code === 200) {
      const editions = response.data.data;
      const arabicEdition = editions.find(e => e.edition.identifier === 'quran-uthmani');
      const englishEdition = editions.find(e => e.edition.identifier === 'en.sahih');

      if (!arabicEdition || !englishEdition) {
        throw new Error('Required editions not found in API response.');
      }

      const verseInfo = arabicEdition; // Use arabic edition for common info like surah number

      const formattedData = {
        // Use the simple S:A format expected by the frontend parser
        reference: `${verseInfo.surah.number}:${verseInfo.numberInSurah}`,
        arabicText: arabicEdition.text, 
        englishText: englishEdition.text,
        surahName: verseInfo.surah.englishName, 
        surahEnglishNameTranslation: verseInfo.surah.englishNameTranslation || "",
        // Keep translation separate for clarity if needed by frontend
        translation: englishEdition.edition.englishName,
      };
      return formattedData;
    } else {
      throw new Error(
        `Failed to fetch verse from alquran.cloud API. Status: ${response.status}, Code: ${response.data?.code}`
      );
    }
  } catch (error) {
    console.error(
      "[aiService] Error fetching daily Quran verse from external API:",
      error.response?.data || error.message
    );
    return null; 
  }
}; 