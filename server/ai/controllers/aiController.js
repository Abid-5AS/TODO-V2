const axios = require("axios");
const { groqClient, lmStudioSettings } = require("../../config/aiProviders");
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
  const { useLocal } = req.body;
  if (typeof useLocal !== "boolean") {
    throw new BadRequestError(ERROR_MESSAGES.INVALID_USE_LOCAL);
  }

  const currentProvider = aiService.toggleProvider(useLocal);
  console.log(`AI Provider Toggled: ${currentProvider}`);
  res.status(200).json({
    success: true,
    message: `AI provider set to ${currentProvider}`,
    useLocalAI: useLocal,
  });
});

// @desc    Get current AI provider status
// @route   GET /api/ai/provider-status
// @access  Private
exports.getProviderStatus = asyncHandler(async (req, res, next) => {
    const currentProvider = aiService.getCurrentProvider();
    let status = "configured"; // Default for cloud
  let message = null;
    let localUrl = null;

    if (currentProvider === PROVIDERS.LOCAL) {
        const connectionResult = await aiService.checkLocalAIConnection();
        status = connectionResult.status ? "connected" : "disconnected";
        message = connectionResult.status ? null : connectionResult.message;
        localUrl = lmStudioSettings.baseURL;
    }

    res.status(200).json({
      success: true,
        useLocalAI: currentProvider === PROVIDERS.LOCAL,
        provider: currentProvider,
        localUrl: localUrl,
      status,
        message, 
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
