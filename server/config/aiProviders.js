/**
 * Configuration file for AI providers
 * This allows switching between different AI providers (Groq, LM Studio, etc.)
 */

const Groq = require("groq-sdk");
require("dotenv").config();

// Initialize Groq client
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// LM Studio settings
const lmStudioSettings = {
  baseURL: process.env.LM_STUDIO_URL || "http://localhost:1234/v1", // HTTP URL for REST API calls
  wsURL: process.env.LM_STUDIO_WS_URL || "ws://localhost:1234/v1", // WebSocket URL for SDK
  apiKey: "not-needed-for-local", // LM Studio doesn't require an API key for local inference
  defaultModel: "local-model", // This is just a placeholder, actual model is configured in LM Studio
};

module.exports = {
  groqClient,
  lmStudioSettings,
};
