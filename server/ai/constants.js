const PROVIDERS = {
  LOCAL: "local",
  CLOUD: "cloud",
  OLLAMA: "ollama"
};

const SYSTEM_PROMPTS = {
  SUGGEST_SUBTASKS: `You are an AI assistant helping break down tasks. Given a main task title, suggest 3-5 concise, actionable subtasks needed to complete it. Each subtask title MUST be under 200 characters. Output only a numbered list of subtask titles, each on a new line. Example output:\n1. Subtask one\n2. Subtask two\n3. Subtask three`,
  EXPAND_DESCRIPTION: `You are an AI assistant helping clarify tasks. Given a task title, write a brief, informative description (2-3 sentences, maximum 800 characters) explaining the task's goal or purpose. Focus on clarity and actionability. Output only the description text.`,
  SUGGEST_TASKS_FROM_IMAGE: `You are a helpful assistant that analyzes images and suggests actionable tasks based on what you see. 
Look at the image carefully and identify 1-3 specific, actionable tasks that would be relevant for the user based on the image content.
Respond with just a numbered list of task suggestions. Be specific and actionable.
If the image is unclear, suggest general productivity tasks instead.`,
  SUGGEST_TASKS: `You are a helpful, task-focused AI assistant that helps users organize their tasks.
Given the user's input, suggest 1-3 specific, actionable tasks they might want to add to their todo list.
Keep each suggestion brief and focused on one clear action.
Format your response as a bulleted list with one task per line. Each task should be 3-10 words, actionable, and specific.
Start each task with a verb when possible.`,
  SUGGEST_NEXT_ACTION: `You are a helpful, focused AI assistant that helps users decide what task to work on next.
Based on the list of tasks provided and the user's context, recommend ONE specific task they should focus on next.
Consider factors like deadlines, priority, dependencies, and current context.
Keep your recommendation brief and provide a 1-2 sentence rationale explaining why this task should be prioritized.`,
  MOTIVATE_USER: `You are a supportive, motivational AI assistant that helps users stay productive.
When the user asks for motivation or feels stuck, provide a brief, encouraging message.
Your message should be positive but not overly enthusiastic, personalized to their situation, and include a small actionable step they can take right now.
Keep your response to 2-3 short sentences maximum, focused on practical encouragement.`
};

const LMSTUDIO_DEFAULTS = {
  MODEL: "openhermes",
  TEMPERATURE: 0.7,
  MAX_TOKENS: 400,
  TEMPERATURE_VISION: 0.3, // Potentially different temp for vision models
  MAX_TOKENS_VISION: 800, // Potentially higher token limit for image analysis
  TOP_P: 0.95,
  TIMEOUT: 60000, // 1min timeout for image processing
  STATUS_CHECK_TIMEOUT: 5000,
};

const OLLAMA_DEFAULTS = {
  MODEL: "llava-phi3",
  TEMPERATURE: 0.7,
  TEMPERATURE_VISION: 0.5, // Lower temperature for more precise vision responses
  MAX_TOKENS: 400,
  MAX_TOKENS_VISION: 800, // More tokens for image descriptions
  TOP_P: 0.95,
  TIMEOUT: 90000, // 1.5min timeout for image processing (vision models may be slower)
  STATUS_CHECK_TIMEOUT: 5000,
};

const GROQ_DEFAULTS = {
  MODEL: "llama3-8b-8192",
  TEMPERATURE: 0.7,
  MAX_TOKENS: 400,
  TOP_P: 0.95,
};

const ERROR_MESSAGES = {
  TITLE_REQUIRED: "Task title is required.",
  INVALID_USE_LOCAL: "'useLocal' must be a boolean value (true or false).",
  EMPTY_AI_RESPONSE: "AI provider returned an empty response.",
  GENERAL_FAILURE: "An error occurred while processing your request with AI.",
  IMAGE_FILE_REQUIRED: "Image file is required for this operation.",
  LOCAL_AI_REQUIRED_FOR_IMAGES: "Image processing requires a local AI provider. Please enable a local AI provider in settings.",
  LMSTUDIO_CONNECTION_FAILED: "Failed to connect to LM Studio server.",
  LMSTUDIO_CONNECTION_FAILED_DETAIL: (url) => `Failed to connect to LM Studio at ${url}. Is it running?`,
  LMSTUDIO_TIMEOUT: "Connection to LM Studio timed out.",
  LMSTUDIO_TIMEOUT_DETAIL: (url) => `Connection to LM Studio at ${url} timed out.`,
  LMSTUDIO_UNREACHABLE: "LM Studio server is unreachable. Is it running?",
  LMSTUDIO_CONNECTION_SUCCESS: "Successfully connected to LM Studio server.",
  OLLAMA_CONNECTION_FAILED: "Failed to connect to Ollama server.",
  OLLAMA_CONNECTION_FAILED_DETAIL: (url) => `Failed to connect to Ollama at ${url}. Is it running?`,
  OLLAMA_TIMEOUT: "Connection to Ollama timed out.",
  OLLAMA_TIMEOUT_DETAIL: (url) => `Connection to Ollama at ${url} timed out.`,
  OLLAMA_UNREACHABLE: "Ollama server is unreachable. Is it running?",
  OLLAMA_CONNECTION_SUCCESS: "Successfully connected to Ollama server.",
  UNKNOWN_CONNECTION_ERROR: "Unknown connection error occurred.",
  GROQ_AUTH_FAILED: "Failed to authenticate with Groq. Please check your API key.",
  GROQ_RATE_LIMIT: "Groq rate limit exceeded. Please try again later.",
  QURAN_FETCH_FAILED: "Failed to fetch daily verse from the external API.",
};

module.exports = {
  PROVIDERS,
  SYSTEM_PROMPTS,
  LMSTUDIO_DEFAULTS,
  OLLAMA_DEFAULTS,
  GROQ_DEFAULTS,
  ERROR_MESSAGES,
};
