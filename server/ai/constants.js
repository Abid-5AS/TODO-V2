const PROVIDERS = {
  LOCAL: "LM Studio (local)",
  CLOUD: "Groq (cloud)",
};

const LMSTUDIO_DEFAULTS = {
  MODEL: "local-model",
  TEMPERATURE: 0.5,
  MAX_TOKENS: 150,
  TOP_P: 1,
  TIMEOUT: 15000,
  STATUS_CHECK_TIMEOUT: 2000,
  CONNECTION_CHECK_TIMEOUT: 3000,
};

const GROQ_DEFAULTS = {
  MODEL: "llama3-8b-8192",
  TEMPERATURE: 0.5,
  MAX_TOKENS: 150,
  TOP_P: 1,
};

const SYSTEM_PROMPTS = {
  SUGGEST_SUBTASKS:
    "You are a helpful assistant. Given a main task, generate ONLY a bulleted list of 3 to 5 concise subtasks. Each subtask must be a single short sentence (no more than 15 words). Do NOT include any introduction, summary, or extra lines like Here are 3-5 potential subtasks for the task—just the subtask points as a bulleted list.",
  EXPAND_DESCRIPTION:
    "You are a helpful assistant. Expand the given task title into a concise, clear, actionable task description (2-3 sentences). Output ONLY the description text—do not include any introductions, summaries, bullet points, asterisks, or extra formatting like 'here are the results:'. Respond with just the description.",
};

const ERROR_MESSAGES = {
  INVALID_USE_LOCAL: "Invalid request: useLocal must be a boolean.",
  TITLE_REQUIRED: "Task title is required and must be a non-empty string.",
  EMPTY_AI_RESPONSE: "AI provider returned an empty response.",
  GENERAL_FAILURE: "Failed to get response from AI provider.",
  LMSTUDIO_CONNECTION_FAILED:
    "Could not connect to LM Studio. Ensure it is running.",
  LMSTUDIO_CONNECTION_FAILED_DETAIL: (url) =>
    `Could not connect to LM Studio at ${url}. Ensure it is running and the API server is enabled.`,
  LMSTUDIO_TIMEOUT: "Request to LM Studio timed out.",
  LMSTUDIO_TIMEOUT_DETAIL: (url) => `Request to LM Studio at ${url} timed out.`,
  LMSTUDIO_UNREACHABLE:
    "LM Studio server appears to be offline or unreachable.",
  LMSTUDIO_CONNECTION_SUCCESS: "Successfully connected to LM Studio.",
  UNKNOWN_CONNECTION_ERROR:
    "An unknown error occurred during connection check.",
  GROQ_AUTH_FAILED: "Groq API authentication failed. Check your API key.",
  GROQ_RATE_LIMIT: "Groq API rate limit exceeded. Please try again later.",
  QURAN_FETCH_FAILED: "Failed to fetch daily Quran verse.",
};

module.exports = {
  PROVIDERS,
  LMSTUDIO_DEFAULTS,
  GROQ_DEFAULTS,
  SYSTEM_PROMPTS,
  ERROR_MESSAGES,
};
