const axios = require("axios");
const { LMStudioClient } = require("@lmstudio/sdk");
const { groqClient, lmStudioSettings, ollamaSettings } = require("../../config/aiProviders");
const { AppError } = require("../../utils/errorHandler");
const { PROVIDERS, LMSTUDIO_DEFAULTS, OLLAMA_DEFAULTS, GROQ_DEFAULTS, ERROR_MESSAGES, SYSTEM_PROMPTS } = require("../constants");

// In-memory state - Needs proper management for scaling
let useLocalAI = process.env.USE_LOCAL_AI === "true" || false;
let useOllama = process.env.USE_OLLAMA === "true" || false;

// Instantiate LMStudio Client
const lmStudioClient = new LMStudioClient({
  baseUrl: lmStudioSettings.wsURL,
});

exports.getCurrentProvider = () => {
    if (useOllama) return PROVIDERS.OLLAMA;
    if (useLocalAI) return PROVIDERS.LOCAL;
    return PROVIDERS.CLOUD;
}

exports.toggleProvider = (providerType) => {
    useLocalAI = providerType === PROVIDERS.LOCAL;
    useOllama = providerType === PROVIDERS.OLLAMA;
    
    return exports.getCurrentProvider();
};

exports.setProvider = (providerType) => {
    if (providerType === PROVIDERS.LOCAL) {
        useLocalAI = true;
        useOllama = false;
    } else if (providerType === PROVIDERS.OLLAMA) {
        useLocalAI = false;
        useOllama = true;
    } else {
        // Default to cloud
        useLocalAI = false;
        useOllama = false;
    }
    
    return exports.getCurrentProvider();
};

exports.callAI = async (systemPrompt, userPrompt, options = {}) => {
  try {
    if (useOllama) {
      // Use Ollama API
      const modelId = options.model || ollamaSettings.getModelId() || OLLAMA_DEFAULTS.MODEL;
      const baseUrl = ollamaSettings.getBaseUrl();
      
      if (!baseUrl) {
        throw new Error("Ollama baseURL is not defined. Please check your configuration.");
      }
      
      // Construct proper API endpoints
      // If baseUrl includes "/api", use it directly; otherwise append "/api"
      const apiBase = baseUrl.endsWith('/api') ? baseUrl : 
                       baseUrl.includes('/api/') ? baseUrl.substring(0, baseUrl.indexOf('/api/') + 4) : 
                       `${baseUrl}/api`;
      
      console.log(`Using Ollama at ${apiBase} with model ${modelId}`);
      
      const response = await axios.post(
        `${apiBase}/chat`,
        {
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: options.temperature ?? OLLAMA_DEFAULTS.TEMPERATURE,
          max_tokens: options.max_tokens ?? OLLAMA_DEFAULTS.MAX_TOKENS,
          top_p: options.top_p ?? OLLAMA_DEFAULTS.TOP_P,
          stream: false,
        }
      );
      
      return {
        content: response.data.message?.content || "",
        provider: PROVIDERS.OLLAMA,
      };
    } else if (useLocalAI) {
      // Use LM Studio API
      const modelId = lmStudioSettings.getModelId() || LMSTUDIO_DEFAULTS.MODEL;
      const baseUrl = lmStudioSettings.getBaseUrl();
      
      if (!baseUrl) {
        throw new Error("LM Studio baseURL is not defined. Please check your configuration.");
      }
      
      console.log(`Using LM Studio at ${baseUrl} with model ${modelId}`);
      
      // Use the chat.completions.create method which is compatible with OpenAI format
      const response = await axios.post(
        `${baseUrl}/chat/completions`, 
        {
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: options.temperature ?? LMSTUDIO_DEFAULTS.TEMPERATURE,
          max_tokens: options.max_tokens ?? LMSTUDIO_DEFAULTS.MAX_TOKENS,
          top_p: options.top_p ?? LMSTUDIO_DEFAULTS.TOP_P,
          stream: false,
        }
      );
      
      return {
        content: response.data?.choices?.[0]?.message?.content || "",
        provider: PROVIDERS.LOCAL,
      };
    } else {
      // Use Groq cloud API
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        model: GROQ_DEFAULTS.MODEL,
        temperature: options.temperature ?? GROQ_DEFAULTS.TEMPERATURE,
        max_tokens: options.max_tokens ?? GROQ_DEFAULTS.MAX_TOKENS,
        top_p: options.top_p ?? GROQ_DEFAULTS.TOP_P,
        stop: null,
        stream: false,
      });
      return { 
        content: chatCompletion.choices[0]?.message?.content || "", 
        provider: PROVIDERS.CLOUD 
      };
    }
  } catch (error) {
    console.error("AI Provider Error:", error);
    let friendlyMessage = ERROR_MESSAGES.GENERAL_FAILURE;
    
    if (useOllama) {
      if (error.message?.includes("ERR_INVALID_URL") || error.message?.includes("undefined")) {
        friendlyMessage = "Ollama URL configuration is invalid. Please check the server settings.";
      } else if (error.message?.includes("ECONNREFUSED") || error.message?.includes("fetch failed")) {
        friendlyMessage = ERROR_MESSAGES.OLLAMA_CONNECTION_FAILED;
      } else if (error.message?.includes("timeout")) {
        friendlyMessage = ERROR_MESSAGES.OLLAMA_TIMEOUT;
      } else if (error.message?.includes("404") || error.message?.includes("model not found")) {
        friendlyMessage = `Model '${ollamaSettings.getModelId() || OLLAMA_DEFAULTS.MODEL}' not found or not loaded in Ollama.`;
      } else {
        friendlyMessage = `Ollama error: ${error.message}`;
      }
    } else if (useLocalAI) {
      if (error.message?.includes("ERR_INVALID_URL") || error.message?.includes("undefined")) {
        friendlyMessage = "LM Studio URL configuration is invalid. Please check the server settings.";
      } else if (error.message?.includes("ECONNREFUSED") || error.message?.includes("fetch failed")) {
        friendlyMessage = ERROR_MESSAGES.LMSTUDIO_CONNECTION_FAILED;
      } else if (error.message?.includes("timeout")) {
        friendlyMessage = ERROR_MESSAGES.LMSTUDIO_TIMEOUT;
      } else if (error.message?.includes("404") || error.message?.includes("model not found")) {
        friendlyMessage = `Model '${lmStudioSettings.getModelId() || LMSTUDIO_DEFAULTS.MODEL}' not found or loaded in LM Studio.`;
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
  // First determine what needs to be checked based on the current provider
  const currentProvider = exports.getCurrentProvider();
  
  if (currentProvider === PROVIDERS.OLLAMA) {
    try {
      // Check Ollama connection
      const baseUrl = ollamaSettings.getBaseUrl();
      
      // For Ollama, we need to use direct `/tags` endpoint (not `/api/tags`)
      // The base URL is just the server address without any path
      const tagsUrl = `${baseUrl}/api/tags`;
      
      console.log(`Checking Ollama connection at ${tagsUrl}`);
      const response = await axios.get(tagsUrl, { 
        timeout: OLLAMA_DEFAULTS.STATUS_CHECK_TIMEOUT 
      });
      
      console.log(`Ollama connection check successful. Found ${response.data?.models?.length || 0} models.`);
      return { 
        status: true, 
        message: ERROR_MESSAGES.OLLAMA_CONNECTION_SUCCESS,
        details: { 
          models: response.data?.models || [],
          url: baseUrl
        }
      };
    } catch (error) {
      let message = ERROR_MESSAGES.OLLAMA_UNREACHABLE;
      let details = {};
      
      if (error.response) {
        message = `Failed request to ${ollamaSettings.getBaseUrl()}: ${error.response.status} ${error.response.statusText}`;
        details.status = error.response.status;
        details.statusText = error.response.statusText;
      } else if (error.request) {
        if (error.code === "ECONNREFUSED") message = ERROR_MESSAGES.OLLAMA_CONNECTION_FAILED_DETAIL(ollamaSettings.getBaseUrl());
        else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) message = ERROR_MESSAGES.OLLAMA_TIMEOUT_DETAIL(ollamaSettings.getBaseUrl());
        else message = `Ollama is unreachable at ${ollamaSettings.getBaseUrl()}. Is it running?`;
        details.code = error.code;
      } else {
        message = error.message || ERROR_MESSAGES.UNKNOWN_CONNECTION_ERROR;
        details.rawError = error.toString();
      }
      
      details.baseURL = ollamaSettings.getBaseUrl();
      console.log("Ollama connection failed:", message);
      return { status: false, message, details };
    }
  } else if (currentProvider === PROVIDERS.LOCAL) {
    try {
      // Check LM Studio connection
      const response = await axios.get(`${lmStudioSettings.getBaseUrl()}/models`, { 
        timeout: LMSTUDIO_DEFAULTS.STATUS_CHECK_TIMEOUT 
      });
      
      console.log(`LM Studio connection check successful. Found ${response.data?.data?.length || 0} models.`);
      return { 
        status: true, 
        message: ERROR_MESSAGES.LMSTUDIO_CONNECTION_SUCCESS,
        details: {
          models: response.data?.data || [],
          url: lmStudioSettings.getBaseUrl()
        }
      };
    } catch (error) {
      let message = ERROR_MESSAGES.LMSTUDIO_UNREACHABLE;
      let details = {};
      
      if (error.response) {
        message = `Failed request to ${lmStudioSettings.getBaseUrl()}: ${error.response.status} ${error.response.statusText}`;
        details.status = error.response.status;
        details.statusText = error.response.statusText;
      } else if (error.request) {
        if (error.code === "ECONNREFUSED") message = ERROR_MESSAGES.LMSTUDIO_CONNECTION_FAILED_DETAIL(lmStudioSettings.getBaseUrl());
        else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) message = ERROR_MESSAGES.LMSTUDIO_TIMEOUT_DETAIL(lmStudioSettings.getBaseUrl());
        else message = `LM Studio is unreachable at ${lmStudioSettings.getBaseUrl()}. Is it running?`;
        details.code = error.code;
      } else {
        message = error.message || ERROR_MESSAGES.UNKNOWN_CONNECTION_ERROR;
        details.rawError = error.toString();
      }
      
      details.baseURL = lmStudioSettings.getBaseUrl();
      details.wsURL = lmStudioSettings.wsURL;
      console.log("LM Studio connection failed:", message);
      return { status: false, message, details };
    }
  } else {
    // Cloud provider doesn't need connection checking
    return { 
      status: true, 
      message: "Cloud provider connection doesn't require checking", 
      details: { provider: PROVIDERS.CLOUD } 
    };
  }
};

// New service function for image-based task suggestion using Ollama
exports.generateTaskSuggestionsFromImage = async (file, userContextPrompt = "") => {
  if (!useOllama) {
    throw new AppError(ERROR_MESSAGES.LOCAL_AI_REQUIRED_FOR_IMAGES, 400);
  }

  if (!file || !file.buffer) {
    throw new AppError("Invalid image file provided.", 400);
  }

  try {
    console.log("Starting image analysis task with Ollama...");
    const modelId = ollamaSettings.getModelId() || OLLAMA_DEFAULTS.MODEL;
    const baseUrl = ollamaSettings.getBaseUrl();
    
    if (!baseUrl) {
      throw new Error("Ollama baseURL is not defined. Please check your configuration.");
    }
    
    // Format API URL - using generate endpoint instead of chat for image processing
    const apiUrl = `${baseUrl}/api/generate`;
    
    console.log(`Using model: ${modelId}`);
    console.log(`Image mime type: ${file.mimetype}, size: ${file.size} bytes`);
    console.log(`Ollama API URL: ${apiUrl}`);
    
    // Ensure the image is in a supported format
    const supportedFormats = ['image/jpeg', 'image/png'];
    if (!supportedFormats.includes(file.mimetype)) {
      console.log(`Warning: Image format ${file.mimetype} might not be supported. Converting to supported format.`);
    }
    
    // Convert image to base64
    const imageBase64 = file.buffer.toString("base64");
    
    // Create the request matching the example format
    const requestData = {
      model: modelId,
      prompt: userContextPrompt || "Analyze this image and suggest 1-3 actionable tasks based on its content. Format as a numbered list.",
      images: [imageBase64],
      stream: false
    };
    
    console.log(`Making API request to ${apiUrl}`);
    console.log("Request model:", modelId);
    
    const response = await axios.post(
      apiUrl,
      requestData,
      {
        timeout: OLLAMA_DEFAULTS.TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("Ollama response status:", response.status);
    
    // Extract the content from the response
    let content = '';
    if (response.data && response.data.response) {
      content = response.data.response;
    } else if (typeof response.data === 'string') {
      content = response.data;
    } else {
      console.log("Unexpected response format:", JSON.stringify(response.data, null, 2));
      throw new Error("Unexpected response format from Ollama");
    }
    
    return {
      suggestions: content,
      provider: PROVIDERS.OLLAMA,
    };
  } catch (error) {
    console.error("Ollama Image Suggestion Error:", error);
    console.error("Error details:", error.response?.data || error.stack);
    let friendlyMessage = ERROR_MESSAGES.GENERAL_FAILURE;
    
    if (error.response && error.response.data) {
      console.log("Full error response:", JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.message?.includes("ERR_INVALID_URL") || error.message?.includes("undefined")) {
      friendlyMessage = "Ollama URL configuration is invalid. Please check your server settings.";
    } else if (error.message?.includes("ECONNREFUSED") || error.message?.includes("fetch failed")) {
      friendlyMessage = ERROR_MESSAGES.OLLAMA_CONNECTION_FAILED;
    } else if (error.message?.includes("timeout")) {
      friendlyMessage = ERROR_MESSAGES.OLLAMA_TIMEOUT;
    } else if (error.message?.includes("404") || error.message?.includes("model not found")) {
      friendlyMessage = `Model '${ollamaSettings.getModelId() || OLLAMA_DEFAULTS.MODEL}' not found or not loaded in Ollama.`;
    } else if (error.message?.includes("invalid image type") || error.message?.includes("invalid image data")) {
      friendlyMessage = `The image format (${file.mimetype}) is not supported by Ollama. Only JPEG and PNG formats are officially supported.`;
    } else if (error.response && error.response.status === 400) {
      friendlyMessage = `Ollama API error (400): ${error.response.data?.error || "Bad request format"}. Make sure you have a vision-capable model loaded.`;
    } else {
      friendlyMessage = `Ollama error during image processing: ${error.message}`;
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