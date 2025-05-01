/**
 * Configuration file for AI providers
 * This allows switching between different AI providers (Groq, LM Studio, Ollama, etc.)
 */

const Groq = require("groq-sdk");
const axios = require("axios"); // Make sure axios is imported
require("dotenv").config();
const { PROVIDERS } = require('../ai/constants');

// Initialize Groq client
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Default configurations for AI providers
const config = {
  provider: process.env.AI_PROVIDER || PROVIDERS.LOCAL, // Default to local provider
  
  // LM Studio configuration
  lmStudio: {
    baseUrl: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
    apiKey: process.env.LMSTUDIO_API_KEY || '',
    modelId: process.env.LMSTUDIO_MODEL_ID || 'openhermes',
  },
  
  // Ollama configuration
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    modelId: process.env.OLLAMA_MODEL_ID || 'llava-phi3',
    textModelId: process.env.OLLAMA_TEXT_MODEL_ID || 'mistral',
  },
  
  // Groq configuration
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    modelId: process.env.GROQ_MODEL_ID || 'llama3-8b-8192',
  }
};

// Getter and setter for the current provider
exports.getProvider = () => config.provider;
exports.setProvider = (provider) => {
  if (Object.values(PROVIDERS).includes(provider)) {
    config.provider = provider;
    return true;
  }
  return false;
};

// LM Studio settings
exports.lmStudioSettings = {
  getBaseUrl: () => config.lmStudio.baseUrl,
  setBaseUrl: (url) => {
    config.lmStudio.baseUrl = url;
  },
  getApiKey: () => config.lmStudio.apiKey,
  setApiKey: (key) => {
    config.lmStudio.apiKey = key;
  },
  getModelId: () => config.lmStudio.modelId,
  setModelId: (id) => {
    config.lmStudio.modelId = id;
  },
};

// Ollama settings
exports.ollamaSettings = {
  getBaseUrl: () => config.ollama.baseUrl,
  setBaseUrl: (url) => {
    config.ollama.baseUrl = url;
  },
  getModelId: () => config.ollama.modelId,
  setModelId: (id) => {
    config.ollama.modelId = id;
  },
  getTextModelId: () => config.ollama.textModelId,
  setTextModelId: (id) => {
    config.ollama.textModelId = id;
  }
};

// Groq settings
exports.groqSettings = {
  getApiKey: () => config.groq.apiKey,
  setApiKey: (key) => {
    config.groq.apiKey = key;
  },
  getModelId: () => config.groq.modelId,
  setModelId: (id) => {
    config.groq.modelId = id;
  },
};

module.exports = {
  groqClient,
  lmStudioSettings: exports.lmStudioSettings,
  ollamaSettings: exports.ollamaSettings,
  groqSettings: exports.groqSettings,
};
