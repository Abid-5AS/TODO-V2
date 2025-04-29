const PROVIDERS = {
  LOCAL: "LM Studio (local)",
  CLOUD: "Groq (cloud)",
};

const SYSTEM_PROMPTS = {
  SUGGEST_SUBTASKS: `You are an AI assistant helping break down tasks. Given a main task title, suggest 3-5 concise, actionable subtasks needed to complete it. Output only a numbered list of subtask titles, each on a new line. Example output:\n1. Subtask one\n2. Subtask two\n3. Subtask three`,
  EXPAND_DESCRIPTION: `You are an AI assistant helping clarify tasks. Given a task title, write a brief, informative description (2-3 sentences) explaining the task's goal or purpose. Focus on clarity and actionability. Output only the description text.`,
  SUGGEST_TASKS_FROM_IMAGE: `You are an AI assistant specialized in analyzing images to identify potential tasks. Look at the provided image carefully. Identify any actionable items, to-dos, or relevant information. Suggest 1-3 clear and concise task titles based ONLY on the image content. If the image contains text (like a shopping list, notes, code), extract tasks directly. If it's a scene (like a messy room, a whiteboard), infer relevant tasks (e.g., 'Clean the kitchen', 'Schedule meeting based on whiteboard notes'). Format the output as a numbered list, each task on a new line. If no tasks are identifiable, respond with 'No specific tasks identified in the image.'.`,
};

const LMSTUDIO_DEFAULTS = {
  MODEL: process.env.LMSTUDIO_MODEL || "local-model", // Default model identifier
  TEMPERATURE: 0.5,
  MAX_TOKENS: 150,
  TEMPERATURE_VISION: 0.3, // Potentially different temp for vision models
  MAX_TOKENS_VISION: 300, // Potentially higher token limit for image analysis
  TOP_P: 1,
  TIMEOUT: 25000, // Increased default timeout (milliseconds)
  STATUS_CHECK_TIMEOUT: 3000, // Shorter timeout for status checks
};

const GROQ_DEFAULTS = {
  MODEL: "llama3-8b-8192",
  TEMPERATURE: 0.5,
  MAX_TOKENS: 150,
  TOP_P: 1,
};

const ERROR_MESSAGES = {
  TITLE_REQUIRED: "Task title is required.",
  INVALID_USE_LOCAL: "'useLocal' must be a boolean value (true or false).",
  EMPTY_AI_RESPONSE: "AI provider returned an empty response.",
  GENERAL_FAILURE: "Failed to get response from AI provider.",
  IMAGE_FILE_REQUIRED: "Image file is required for this operation.",
  LOCAL_AI_REQUIRED_FOR_IMAGES: "Image analysis requires the local AI provider (LM Studio) to be enabled and configured.",
  LMSTUDIO_CONNECTION_FAILED: "Could not connect to LM Studio. Ensure it's running and accessible.",
  LMSTUDIO_CONNECTION_FAILED_DETAIL: (url) => `Could not connect to LM Studio at ${url}. Is it running?`,
  LMSTUDIO_TIMEOUT: "Request to LM Studio timed out. The model might be taking too long or the server is unresponsive.",
  LMSTUDIO_TIMEOUT_DETAIL: (url) => `Request to LM Studio at ${url} timed out.`,
  LMSTUDIO_UNREACHABLE: "LM Studio server is unreachable.",
  LMSTUDIO_CONNECTION_SUCCESS: "Successfully connected to LM Studio.",
  UNKNOWN_CONNECTION_ERROR: "An unknown error occurred while checking LM Studio connection.",
  GROQ_AUTH_FAILED: "Groq API authentication failed. Check your API key.",
  GROQ_RATE_LIMIT: "Groq API rate limit exceeded. Please try again later.",
  QURAN_FETCH_FAILED: "Failed to fetch daily verse from the external API.",
};

module.exports = {
  PROVIDERS,
  SYSTEM_PROMPTS,
  LMSTUDIO_DEFAULTS,
  GROQ_DEFAULTS,
  ERROR_MESSAGES,
};
