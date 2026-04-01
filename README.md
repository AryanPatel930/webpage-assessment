# Spotnana Technical Assessment - Chatbot

A lightweight AI-powered chat interface built with React + Vite. Users can input prompts and receive responses from the Mistral-7B model via the HuggingFace Inference API — completely free, no credit card required.

## Features

- **Prompt input with keyboard shortcut** — press `Enter` to send, `Shift+Enter` for a new line
- **AI response generation** — powered by Mistral-7B-Instruct via HuggingFace
- **Loading states** — spinner and skeleton loader while the AI is generating a response; input is locked to prevent duplicate requests
- **Error handling** — clear error messages for API failures, model cold-starts, and invalid tokens
- **Chat history** — full conversation context is maintained and sent with each request
- **Clear button** — wipe the conversation and start fresh
- **Suggestion chips** — empty state includes example prompts to help users get started

## Tech Stack

- **React 18** with Vite
- **HuggingFace Inference API** (free tier)
- **Model:** `mistralai/Mistral-7B-Instruct-v0.3`
- Plain CSS (no UI library dependencies)

## Prerequisites

- Node.js 18+
- A free HuggingFace account

## Architecture

```
Browser (React) ──→ Express Proxy Server ──→ HuggingFace API
                        (holds token)
```

The HuggingFace API token lives only on the Express server. The React frontend never touches it — it just calls `/api/chat` on your own server. This means the token is never visible in browser DevTools, network requests, or the compiled frontend bundle.

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ai-chat-app.git
cd ai-chat-app
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4. Get a HuggingFace API token

1. Go to [https://huggingface.co/join](https://huggingface.co/join) and create a free account
2. Navigate to **Settings → Access Tokens**: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Click **New token**, give it a name, select **Read** role
4. Copy the generated token (you won't see it again)

### 5. Create the server `.env` file

```bash
cd server
cp .env.example .env
```

Open `server/.env` and paste your token:

```
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxx
PORT=3001
```

> ⚠️ Never commit `.env` files. Both are already in `.gitignore`.

### 6. Run the app (two terminals)

**Terminal 1 — backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — frontend:**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
server/
├── index.js               # Express proxy — forwards requests to HuggingFace
├── package.json
├── .env.example           # Token config (copy to .env, never commit)
└── .env                   # Your actual token (gitignored)

src/
├── api/
│   └── huggingface.js     # Calls /api/chat on the Express server
├── components/
│   ├── Header.jsx          # App header + Clear button
│   ├── Header.css
│   ├── ChatWindow.jsx      # Scrollable message container
│   ├── ChatWindow.css
│   ├── Message.jsx         # Individual user/AI message bubble
│   ├── Message.css
│   ├── SkeletonLoader.jsx  # Animated skeleton shown while generating
│   ├── SkeletonLoader.css
│   ├── ChatInput.jsx       # Auto-resizing textarea + send logic
│   ├── ChatInput.css
│   ├── EmptyState.jsx      # Landing state with suggestion chips
│   └── EmptyState.css
├── App.jsx                 # Root component + state management
├── App.css                 # Global styles + design tokens
└── main.jsx                # React entry point
```

## Notes

- The HuggingFace free tier may have a **20–30 second cold start** delay on first use if the model is not already loaded. The app handles this with a specific error message prompting the user to retry.
- Conversation history is kept in React state (in-memory). It resets on page refresh or when the Clear button is clicked.
- The last 6 messages are included as context in each API request to stay within token limits.
