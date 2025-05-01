const axios = require("axios");
const { groqClient, lmStudioSettings, ollamaSettings } = require("../../config/aiProviders");
const { BadRequestError, AppError } = require("../../utils/errorHandler");
const asyncHandler = require("../../utils/asyncHandler");
const aiService = require("../services/aiService");
const { PROVIDERS, SYSTEM_PROMPTS, ERROR_MESSAGES, LMSTUDIO_DEFAULTS, GROQ_DEFAULTS } = require("../constants");
require("dotenv").config();

// In-memory state for AI provider selection
// NOTE: In a real-world scenario, this state might be better managed
// through configuration, database, or a dedicated service, especially
// if the application needs to scale or persist this setting.
let useLocalAI = process.env.USE_LOCAL_AI === "true" || false;

// Helper function for calling the correct AI provider
const callAIProvider = async (systemPrompt, userPrompt, options = {}) => {
  try {
    if (useLocalAI) {
      // LM Studio Call
      const response = await axios.post(
        `${lmStudioSettings.baseURL}/chat/completions`,
        {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: lmStudioSettings.model || "local-model",
          temperature: options.temperature || 0.5,
          max_tokens: options.max_tokens || 150,
          top_p: options.top_p || 1,
          stream: false,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: lmStudioSettings.timeout || 15000, // Increased timeout
        },
      );
      return {
        content: response.data.choices[0]?.message?.content || "",
        provider: "LM Studio (local)",
      };
    } else {
      // Groq API Call
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "llama3-8b-8192",
        temperature: options.temperature || 0.5,
        max_tokens: options.max_tokens || 150,
        top_p: options.top_p || 1,
        stop: null,
        stream: false,
      });
      return {
        content: chatCompletion.choices[0]?.message?.content || "",
        provider: "Groq (cloud)",
      };
    }
  } catch (error) {
    console.error("AI Provider Error:", error.message);
    let friendlyMessage = "Failed to get response from AI provider.";
    if (useLocalAI) {
      if (error.code === "ECONNREFUSED") {
        friendlyMessage =
          "Could not connect to LM Studio. Ensure it is running.";
      } else if (
        error.code === "ECONNABORTED" ||
        error.message.includes("timeout")
      ) {
        friendlyMessage = "Request to LM Studio timed out.";
      }
    } else {
      if (error.status === 401) {
        friendlyMessage = "Groq API authentication failed. Check your API key.";
      } else if (error.status === 429) {
        friendlyMessage =
          "Groq API rate limit exceeded. Please try again later.";
      }
    }
    // Use AppError for operational errors (like connection failed, auth failed, timeout)
    // These are expected potential issues, not necessarily code bugs.
    throw new AppError(friendlyMessage, 500); // Use 500 or maybe 503 Service Unavailable
  }
};

// @desc    Toggle between AI providers (LM Studio vs Groq)
// @route   POST /api/ai/toggle-provider
// @access  Private
exports.toggleProvider = asyncHandler(async (req, res, next) => {
  const { provider } = req.body;
  
  if (!provider || typeof provider !== "string" || !Object.values(PROVIDERS).includes(provider)) {
    throw new BadRequestError("Invalid provider type. Expected 'local', 'cloud', or 'ollama'.");
  }

  const currentProvider = aiService.setProvider(provider);
  console.log(`AI Provider Toggled: ${currentProvider}`);
  
  // If we switched to a local provider (LM Studio or Ollama), get connection status
  let status = "unknown";
  let message = null;
  if (currentProvider !== PROVIDERS.CLOUD) {
    const connectionResult = await aiService.checkLocalAIConnection();
    status = connectionResult.status ? "connected" : "disconnected";
    message = connectionResult.message || null;
  }
  
  res.status(200).json({
    success: true,
    message: `AI provider set to ${currentProvider}`,
    provider: currentProvider,
    status,
  });
});

// @desc    Get current AI provider status
// @route   GET /api/ai/provider-status
// @access  Private
exports.getProviderStatus = asyncHandler(async (req, res, next) => {
    const currentProvider = aiService.getCurrentProvider();
    let status = "unknown"; // Default status
    let message = null;
    let localUrl = null;

    // If using a local provider (LM Studio or Ollama), check connection
    if (currentProvider !== PROVIDERS.CLOUD) {
        const connectionResult = await aiService.checkLocalAIConnection();
        status = connectionResult.status ? "connected" : "disconnected";
        message = connectionResult.status ? null : connectionResult.message;
        
        // Set the appropriate URL based on provider
        if (currentProvider === PROVIDERS.LOCAL) {
            localUrl = lmStudioSettings.baseURL;
        } else if (currentProvider === PROVIDERS.OLLAMA) {
            localUrl = ollamaSettings.baseURL;
        }
    }

    res.status(200).json({
        success: true,
        provider: currentProvider,
        status: status,
        message: message,
        localUrl: localUrl,
    });
});

// @desc    Suggest subtasks for a given task title
// @route   POST /api/ai/suggest-subtasks
// @access  Private
exports.suggestSubtasks = asyncHandler(async (req, res, next) => {
  const { title } = req.body;
  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new BadRequestError(ERROR_MESSAGES.TITLE_REQUIRED);
  }

  const userPrompt = `Main task: ${title.trim()}`;
  const result = await aiService.callAI(SYSTEM_PROMPTS.SUGGEST_SUBTASKS, userPrompt, {
    max_tokens: GROQ_DEFAULTS.MAX_TOKENS, // Or adjust based on provider
  });

  if (!result.content) {
    throw new AppError(ERROR_MESSAGES.EMPTY_AI_RESPONSE, 500);
  }

  res.status(200).json({
    success: true,
    suggestion: result.content.trim(),
    provider: result.provider,
  });
});

// @desc    Expand a task title into a description
// @route   POST /api/ai/expand-description
// @access  Private
exports.expandDescription = asyncHandler(async (req, res, next) => {
  const { title } = req.body;
  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new BadRequestError(ERROR_MESSAGES.TITLE_REQUIRED);
  }

  const userPrompt = `Task title: ${title.trim()}`;
  const result = await aiService.callAI(SYSTEM_PROMPTS.EXPAND_DESCRIPTION, userPrompt, {
    max_tokens: 100,
    temperature: 0.6,
  });

  if (!result.content) {
    throw new AppError(ERROR_MESSAGES.EMPTY_AI_RESPONSE, 500);
  }

  res.status(200).json({
    success: true,
    description: result.content.trim(),
    provider: result.provider,
  });
});

// @desc    Check connection to Local AI (LM Studio)
// @route   GET /api/ai/check-local-connection
// @access  Private
exports.checkLocalConnection = asyncHandler(async (req, res, next) => {
    const connectionResult = await aiService.checkLocalAIConnection();

  res.status(200).json({
        success: true, // API call succeeded
        status: connectionResult.status, // Actual connection status
        message: connectionResult.message,
        details: connectionResult.details,
        provider: PROVIDERS.LOCAL,
    checkedAt: new Date().toISOString(),
  });
});

// @desc    Get a daily Quran verse
// @route   GET /api/ai/quran/daily-verse
// @access  Private
exports.getDailyVerse = asyncHandler(async (req, res, next) => {
    // Call the service function to fetch the verse
    const verseData = await aiService.fetchDailyVerse();

    // Check if data was successfully fetched
    if (!verseData) {
        // Use AppError for expected issues like external API failure
        throw new AppError(ERROR_MESSAGES.QURAN_FETCH_FAILED, 503); // 503 Service Unavailable
    }

    res.status(200).json({ 
        success: true, 
        data: verseData 
  });
});

// @desc    Suggest tasks based on an uploaded image
// @route   POST /api/ai/suggest-task-from-image
// @access  Private
exports.suggestTaskFromImage = asyncHandler(async (req, res, next) => {
  // 1. Check if file exists (from multer middleware)
  if (!req.file) {
    throw new BadRequestError(ERROR_MESSAGES.IMAGE_FILE_REQUIRED || 'Image file is required.'); // Use constant or fallback
  }

  // 2. Extract optional prompt/context from body if needed
  const { prompt } = req.body; // Example: User might provide context

  try {
    // 3. Call the AI service function
    const result = await aiService.generateTaskSuggestionsFromImage(req.file, prompt);

    // 4. Handle response
    res.status(200).json({
      success: true,
      suggestions: result.suggestions, // Or structure defined by the service
      provider: result.provider,
    });
  } catch (error) {
    console.error("Error in suggestTaskFromImage controller:", error);
    
    // Handle specific error cases
    if (error.response && error.response.data && error.response.data.error === 'model is required') {
      return res.status(400).json({
        success: false, 
        message: "The vision model name is required but was not specified. Please check your Ollama configuration.",
        error: error.response.data
      });
    }
    
    // For other errors, let the general error handler manage it
    throw error;
  }
});

// @desc    Check if Ollama supports image processing
// @route   GET /api/ai/check-ollama-vision
// @access  Private
exports.checkOllamaVision = asyncHandler(async (req, res, next) => {
  const currentProvider = aiService.getCurrentProvider();
  
  if (currentProvider !== PROVIDERS.OLLAMA) {
    return res.status(200).json({
      success: false,
      message: "Current provider is not set to Ollama. Set provider to Ollama first.",
      provider: currentProvider,
    });
  }

  try {
    // Get the base model name from Ollama
    const ollamaBaseUrl = ollamaSettings.getBaseUrl();
    const modelId = ollamaSettings.getModelId() || "llava-phi3";
    
    // Build proper API URLs
    const generateUrl = `${ollamaBaseUrl}/api/generate`;
    const tagsUrl = `${ollamaBaseUrl}/api/tags`;
    
    // Get list of models to check if vision model exists
    console.log(`Checking Ollama models at ${tagsUrl}`);
    const modelsResponse = await axios.get(tagsUrl, {
      timeout: 5000,
    });
    
    const models = modelsResponse.data?.models || [];
    const hasVisionModel = models.some(model => 
      model.name === modelId || 
      model.name.includes('llava') || 
      model.name.includes('vision') || 
      model.name.includes('phi3-vision')
    );
    
    // Get Ollama version if possible
    let ollamaVersion = "unknown";
    try {
      // Some Ollama versions support this endpoint
      const versionResponse = await axios.get(`${ollamaBaseUrl}/api/version`, {
        timeout: 2000,
      });
      ollamaVersion = versionResponse.data?.version || "unknown";
    } catch (error) {
      console.log("Could not determine Ollama version:", error.message);
    }
    
    // Try a small test request to see if vision processing works
    let visionTestStatus = "untested";
    let visionTestError = null;
    
    if (hasVisionModel) {
      try {
        // Create a tiny 1x1 transparent pixel (small base64 image)
        const tinyPixelBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        
        // Test with a simple request using the generate endpoint
        const testRequest = {
          model: modelId,
          prompt: "What's in this image?",
          images: [tinyPixelBase64],
          stream: false
        };
        
        console.log(`Testing vision capability with model ${modelId} using /api/generate endpoint`);
        const visionTestResponse = await axios.post(generateUrl, testRequest, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });
        
        visionTestStatus = "working";
        console.log("Vision test succeeded with response:", visionTestResponse.data.response);
      } catch (error) {
        visionTestStatus = "failed";
        visionTestError = error.response?.data?.error || error.message;
        console.log("Vision test failed:", visionTestError);
      }
    }
    
    res.status(200).json({
      success: true,
      provider: PROVIDERS.OLLAMA,
      hasVisionCapability: hasVisionModel,
      visionTest: {
        status: visionTestStatus,
        error: visionTestError
      },
      recommendedModels: ["llava-phi3", "llava", "bakllava", "phi3-vision"],
      currentModel: modelId,
      availableModels: models.map(m => m.name),
      ollamaVersion,
      hostInfo: {
        url: ollamaBaseUrl,
        apiUrl: generateUrl,
      },
      message: hasVisionModel 
        ? `Ollama has vision capability with model ${modelId}. Vision test: ${visionTestStatus}`
        : "No vision-capable models detected. Please pull a vision model like 'llava-phi3' using 'ollama pull llava-phi3'."
    });
  } catch (error) {
    console.error("Error checking Ollama vision capability:", error);
    return res.status(500).json({
      success: false,
      message: `Error checking Ollama vision: ${error.message}`,
      error: error.response?.data || error.toString(),
    });
  }
});
