# Task Tree

Task Tree is a full-stack productivity application for organizing tasks, projects, routines, and daily priorities. It combines practical task management with optional AI assistance, Google Calendar integration, productivity analytics, and Islamic daily-planning tools.

## Features

- Create, edit, delete, and complete tasks
- Organize work with projects, labels, priorities, due dates, subtasks, and status columns
- Move tasks through a drag-and-drop Kanban workflow
- Review Today, Upcoming, Overdue, Completed, and All Tasks views
- Track productivity with charts and task statistics
- Sign in with email and password or Google OAuth
- Connect tasks with Google Calendar
- View prayer times, Hijri dates, a daily Quran verse, and prayer-tracking streaks
- Customize the interface through appearance and settings controls
- Use optional cloud or local AI providers for task assistance

## AI-assisted task creation

Task Tree includes three AI-powered features:

1. **Subtask suggestions** — turns a task title into a short list of actionable steps.
2. **Description expansion** — converts a brief task title into a clearer task description.
3. **Image-to-task suggestions** — analyzes an uploaded image and proposes relevant tasks using an Ollama vision model.

The first two features are applied natural-language generation: they interpret short task text and generate useful structured language. The image feature is multimodal vision-language processing. The project does not train or fine-tune its own language model; it connects to existing models through Groq, LM Studio, or Ollama.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, Radix UI, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JWT, Passport, Google OAuth 2.0 |
| AI providers | Groq, LM Studio, Ollama |
| Charts and interaction | Recharts, dnd-kit |
| External integrations | Google Calendar, prayer-time and Quran services |

## Project structure

```text
TODO-V2/
├── client/                 # React and Vite frontend
│   └── src/
│       ├── api/            # Shared API configuration
│       ├── components/     # Reusable interface components
│       └── features/       # Tasks, projects, auth, settings, stats, and Islamic tools
└── server/                 # Express API
    ├── ai/                 # AI routes, prompts, controllers, and provider service
    ├── auth/               # Authentication and user management
    ├── calendar/           # Google Calendar integration
    ├── location/           # Location lookup
    ├── prayerLog/          # Prayer tracking
    ├── projects/           # Project management
    └── tasks/              # Task management
```

## Getting started

### Prerequisites

- Node.js and npm
- MongoDB, either locally or through MongoDB Atlas
- One AI provider if you want to use the AI features:
  - a Groq API key,
  - LM Studio running a compatible local model, or
  - Ollama running the required text and vision models
- Google OAuth credentials only if you want Google sign-in or Calendar integration

### 1. Clone the repository

```bash
git clone https://github.com/Abid-5AS/TODO-V2.git
cd TODO-V2
```

### 2. Configure the server

```bash
cd server
npm install
```

Create `server/.env`:

```dotenv
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/task-tree
JWT_SECRET=replace-with-a-long-random-secret
SESSION_SECRET=replace-with-another-long-random-secret

# Browser and API addresses
CLIENT_URL=http://localhost:5173
API_BASE_URL=http://localhost:5001

# Choose the initial AI provider state
# Groq: both values false
# LM Studio: USE_LOCAL_AI=true
# Ollama: USE_OLLAMA=true
USE_LOCAL_AI=false
USE_OLLAMA=false

# Groq cloud provider
GROQ_API_KEY=

# LM Studio local provider
LMSTUDIO_BASE_URL=http://localhost:1234/v1
LMSTUDIO_MODEL_ID=openhermes

# Ollama local provider
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL_ID=llava-phi3

# Optional Google sign-in and Calendar integration
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Identify this application when using the Nominatim location service
NOMINATIM_USER_AGENT=TaskTree/1.0 (contact@example.com)
```

Use unique secrets in deployed environments and never commit the `.env` file.

Start the API:

```bash
npm run dev
```

The server runs at `http://localhost:5001` by default.

### 3. Configure the client

Open a second terminal:

```bash
cd client
npm install
```

For the default local server, no client environment file is required. To use a different API address, create `client/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

Open the local address printed by Vite, normally `http://localhost:5173`.

## Selecting an AI provider

The provider can be changed from the application settings after signing in:

- **Groq** runs the text-generation features through the cloud and requires `GROQ_API_KEY`.
- **LM Studio** runs the text-generation features locally through its OpenAI-compatible API.
- **Ollama** supports local text generation and is required for image-to-task suggestions.

For Ollama, ensure the configured model is installed and the Ollama service is running. The application uses `OLLAMA_MODEL_ID` for Ollama requests and defaults to `llava-phi3`.

Provider selection is stored in server memory, so restarting the server restores the provider selected by the environment settings.

## Available scripts

Run these commands from the corresponding directory.

| Directory | Command | Purpose |
| --- | --- | --- |
| `client` | `npm run dev` | Start the Vite development server |
| `client` | `npm run build` | Create a production frontend build |
| `client` | `npm run preview` | Preview the production build |
| `server` | `npm run dev` | Start the API with automatic restart |
| `server` | `npm start` | Start the API normally |

## Notes

- AI output depends on the selected model and should be reviewed before adding it to a task.
- Image uploads for AI suggestions are limited to image files up to 10 MB.
- Google OAuth and Calendar callback URLs must match the addresses configured in the Google Cloud Console.
- This repository does not currently include an automated test script.

## License

No license file is currently included in this repository.
