const axios = require("axios");
const { LMStudioClient } = require("@lmstudio/sdk");
const { groqClient, lmStudioSettings } = require("../../config/aiProviders");
const { AppError } = require("../../utils/errorHandler");
const { PROVIDERS, LMSTUDIO_DEFAULTS, GROQ_DEFAULTS, ERROR_MESSAGES, SYSTEM_PROMPTS } = require("../constants");

// In-memory state - Needs proper management for scaling
let useLocalAI = process.env.USE_LOCAL_AI === "true" || false;

// Instantiate LMStudio Client
const lmStudioClient = new LMStudioClient({
  baseUrl: lmStudioSettings.wsURL,
});

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
      const modelId = lmStudioSettings.model || LMSTUDIO_DEFAULTS.MODEL;
      const prediction = await lmStudioClient.llm.createChatCompletion({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: options.temperature ?? LMSTUDIO_DEFAULTS.TEMPERATURE,
        max_tokens: options.max_tokens ?? LMSTUDIO_DEFAULTS.MAX_TOKENS,
        top_p: options.top_p ?? LMSTUDIO_DEFAULTS.TOP_P,
        stream: false,
      });

      return {
        content: prediction.choices[0]?.message?.content || "",
        provider: PROVIDERS.LOCAL,
      };
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
    console.error("AI Provider Error:", error);
    let friendlyMessage = ERROR_MESSAGES.GENERAL_FAILURE;
    if (useLocalAI) {
      if (error.message?.includes("ECONNREFUSED") || error.message?.includes("fetch failed")) {
        friendlyMessage = ERROR_MESSAGES.LMSTUDIO_CONNECTION_FAILED;
      } else if (error.message?.includes("timeout")) {
        friendlyMessage = ERROR_MESSAGES.LMSTUDIO_TIMEOUT;
      } else if (error.message?.includes("404") || error.message?.includes("model not found")) {
          friendlyMessage = `Model '${lmStudioSettings.model || LMSTUDIO_DEFAULTS.MODEL}' not found or loaded in LM Studio.`;
      } else {
        friendlyMessage = `LM Studio error: ${error.message}`;
      }
    } else {
      if (error.status === 401) friendlyMessage = ERROR_MESSAGES.GROQ_AUTH_FAILED;
      else if (error.status === 429) friendlyMessage = ERROR_MESSAGES.GROQ_RATE_LIMIT;
    }
    throw new AppError(friendlyMessage, 500);
  }
};

exports.checkLocalAIConnection = async () => {
  // TODO: Check if lmStudioClient has a dedicated ping/status method
  // For now, keep using axios or try loading models as a check
  try {
    // Option 1: Keep axios check - using HTTP URL for REST API calls
    await axios.get(`${lmStudioSettings.baseURL}/models`, { timeout: LMSTUDIO_DEFAULTS.STATUS_CHECK_TIMEOUT });
    // Option 2: Try listing loaded models via SDK (might be more robust)
    // await lmStudioClient.llm.listLoaded(); 
    return { status: true, message: ERROR_MESSAGES.LMSTUDIO_CONNECTION_SUCCESS };
  } catch (error) {
    let message = ERROR_MESSAGES.LMSTUDIO_UNREACHABLE;
    let details = {};
    if (error.response) { // Axios error
      message = `Failed request to ${lmStudioSettings.baseURL}: ${error.response.status} ${error.response.statusText}`;
      details.status = error.response.status;
      details.statusText = error.response.statusText;
    } else if (error.request) { // No response received
      if (error.code === "ECONNREFUSED") message = ERROR_MESSAGES.LMSTUDIO_CONNECTION_FAILED_DETAIL(lmStudioSettings.baseURL);
      else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) message = ERROR_MESSAGES.LMSTUDIO_TIMEOUT_DETAIL(lmStudioSettings.baseURL);
      else message = `LM Studio is unreachable at ${lmStudioSettings.baseURL}. Is it running?`;
      details.code = error.code;
    } else { // Other errors (like SDK errors if Option 2 is used, or setup issues)
      message = error.message || ERROR_MESSAGES.UNKNOWN_CONNECTION_ERROR;
      details.rawError = error.toString();
    }
    details.baseURL = lmStudioSettings.baseURL;
    details.wsURL = lmStudioSettings.wsURL;
    return { status: false, message, details };
  }
};

// New service function for image-based task suggestion
exports.generateTaskSuggestionsFromImage = async (file, userContextPrompt = "") => {
  if (!useLocalAI) {
    throw new AppError(ERROR_MESSAGES.LOCAL_AI_REQUIRED_FOR_IMAGES, 400);
  }

  if (!file || !file.buffer) {
    throw new AppError("Invalid image file provided.", 400);
  }

  try {
    const modelId = lmStudioSettings.model || LMSTUDIO_DEFAULTS.MODEL;
    const imageBase64 = file.buffer.toString("base64");
    const preparedImage = await lmStudioClient.files.prepareImageBase64(imageBase64);

    const userPromptContent = [
        { type: "image", image: preparedImage },
        { type: "text", text: userContextPrompt || "Analyze the image and suggest 1-3 actionable tasks based on its content. Focus on clear, concise task titles. If the image contains text (like a list or note), extract tasks directly from it. If it's a general scene, infer potential tasks. Format the output as a numbered list." },
    ];

    const prediction = await lmStudioClient.llm.createChatCompletion({
      model: modelId,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.SUGGEST_TASKS_FROM_IMAGE },
        { role: "user", content: userPromptContent },
      ],
      temperature: LMSTUDIO_DEFAULTS.TEMPERATURE_VISION, // Use different temp for vision?
      max_tokens: LMSTUDIO_DEFAULTS.MAX_TOKENS_VISION, // Use different max_tokens?
      top_p: LMSTUDIO_DEFAULTS.TOP_P,
      stream: false,
    });

    return {
      suggestions: prediction.choices[0]?.message?.content || "",
      provider: PROVIDERS.LOCAL,
    };

  } catch (error) {
    console.error("LM Studio Image Suggestion Error:", error);
    let friendlyMessage = ERROR_MESSAGES.GENERAL_FAILURE;
    // Reuse existing error handling logic, potentially refining for image-specific issues
     if (error.message?.includes("ECONNREFUSED") || error.message?.includes("fetch failed")) {
        friendlyMessage = ERROR_MESSAGES.LMSTUDIO_CONNECTION_FAILED;
      } else if (error.message?.includes("timeout")) {
        friendlyMessage = ERROR_MESSAGES.LMSTUDIO_TIMEOUT;
      } else if (error.message?.includes("404") || error.message?.includes("model not found")) {
          friendlyMessage = `Model '${lmStudioSettings.model || LMSTUDIO_DEFAULTS.MODEL}' not found, not loaded, or does not support image input in LM Studio.`;
      } else if (error.message?.includes("invalid image data")) {
           friendlyMessage = "The provided image format might not be supported by LM Studio (try JPEG, PNG, WebP)."
      } else {
        friendlyMessage = `LM Studio error during image processing: ${error.message}`;
      }
    throw new AppError(friendlyMessage, 500);
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