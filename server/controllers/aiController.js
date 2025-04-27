const axios = require("axios");
const { groqClient, lmStudioSettings } = require("../config/aiProviders");
const { BadRequestError, AppError } = require("../utils/errorHandler");
const asyncHandler = require("../utils/asyncHandler");
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
        }
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
    // Check type explicitly
    throw new BadRequestError("Invalid request: useLocal must be a boolean.");
  }

  useLocalAI = useLocal;
  console.log(
    `AI Provider Toggled: ${useLocalAI ? "LM Studio (local)" : "Groq (cloud)"}`
  );
  res.status(200).json({
    success: true,
    message: `AI provider set to ${
      useLocalAI ? "LM Studio (local)" : "Groq (cloud)"
    }`,
    useLocalAI: useLocalAI,
  });
});

// @desc    Get current AI provider status
// @route   GET /api/ai/provider-status
// @access  Private
exports.getProviderStatus = asyncHandler(async (req, res, next) => {
  let status = "disconnected";
  let message = null;

  if (useLocalAI) {
    try {
      // Ping LM Studio server
      await axios.get(`${lmStudioSettings.baseURL}/models`, {
        timeout: 2000, // Short timeout for status check
      });
      status = "connected";
    } catch (error) {
      status = "disconnected";
      message = "LM Studio server appears to be offline or unreachable.";
      console.warn("LM Studio status check failed:", error.message);
    }
    res.status(200).json({
      success: true,
      useLocalAI,
      provider: "LM Studio (local)",
      localUrl: lmStudioSettings.baseURL,
      status,
      message, // Include message if disconnected
    });
  } else {
    // For Groq, assume configured if selected
    res.status(200).json({
      success: true,
      useLocalAI,
      provider: "Groq (cloud)",
      status: "configured",
    });
  }
});

// @desc    Suggest subtasks for a given task title
// @route   POST /api/ai/suggest-subtasks
// @access  Private
exports.suggestSubtasks = asyncHandler(async (req, res, next) => {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new BadRequestError(
      "Task title is required and must be a non-empty string."
    );
  }

  const systemPrompt =
    "You are a helpful assistant. Given a main task, generate ONLY a bulleted list of 3 to 5 concise subtasks. Each subtask must be a single short sentence (no more than 15 words). Do NOT include any introduction, summary, or extra lines like Here are 3-5 potential subtasks for the task—just the subtask points as a bulleted list.";
  const userPrompt = `Main task: ${title.trim()}`;

  // AI call is wrapped in asyncHandler, so errors from callAIProvider are caught
  const result = await callAIProvider(systemPrompt, userPrompt, {
    max_tokens: 120,
  });

  if (!result.content) {
    console.warn("AI Suggest Subtasks: Received empty content from provider.");
    // Decide how to handle empty content - throw error or return empty suggestion?
    // Throwing error might be better as it indicates an issue.
    throw new AppError("AI provider returned empty content.", 500);
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
    throw new BadRequestError(
      "Task title is required and must be a non-empty string."
    );
  }

  const systemPrompt =
    "You are a helpful assistant. Expand the given task title into a concise, clear, actionable task description (2-3 sentences). Output ONLY the description text—do not include any introductions, summaries, bullet points, asterisks, or extra formatting like 'here are the results:'. Respond with just the description.";
  const userPrompt = `Task title: ${title.trim()}`;

  // AI call is wrapped in asyncHandler
  const result = await callAIProvider(systemPrompt, userPrompt, {
    max_tokens: 100,
    temperature: 0.6,
  });

  if (!result.content) {
    console.warn(
      "AI Expand Description: Received empty content from provider."
    );
    throw new AppError("AI provider returned empty content.", 500);
  }

  res.status(200).json({
    success: true,
    description: result.content.trim(),
    provider: result.provider,
  });
});
