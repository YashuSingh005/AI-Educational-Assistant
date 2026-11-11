# AI Educational Assistant

An AI-powered learning companion built to make studying more interactive. It combines conversational AI, guided explanations, and topic-based multiple-choice quizzes in one responsive interface.

**Live demo:** https://deepanshu-xi.vercel.app  
**Repository:** https://github.com/YashuSingh005/Deepanshu

## What it does

- **Chat mode** — ask questions and explore topics with an AI assistant.
- **Learn mode** — get structured explanations at beginner, intermediate, or advanced difficulty.
- **Quiz mode** — practise a topic through multiple-choice questions, instant answer feedback, explanations, and score tracking.
- **Streaming responses** — display generated answers progressively instead of waiting for the full response.
- **Model selection** — switch between supported models configured through OpenRouter.
- **Readable responses** — render Markdown and formatted code snippets.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express |
| AI integration | OpenRouter API |
| Response delivery | Server-Sent Events (SSE) |
| Content rendering | react-markdown, remark-gfm, rehype-highlight |
| Deployment configuration | Vercel |
| Containerization | Dockerfile included |

## How it works

1. The React frontend collects the user's message and selected learning mode.
2. It sends the conversation and selected model to the Express API.
3. The backend forwards the request to OpenRouter using a server-side API key.
4. The backend streams generated text back to the frontend using Server-Sent Events.
5. The interface renders the response, including formatted Markdown and code.

Keep the OpenRouter API key on the backend. Do not expose it through a `VITE_` environment variable or commit it to the repository.

## Run locally

### 1. Clone the project

```bash
git clone https://github.com/YashuSingh005/Deepanshu.git
cd Deepanshu
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure and start the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct
SITE_URL=http://localhost:5173
SITE_NAME=AI Educational Assistant
PORT=3001
```

Start the backend:

```bash
npm run dev
```

### 4. Start the frontend

Open a second terminal in the project root:

```bash
npm run dev
```

Vite runs the frontend at `http://localhost:5173` and proxies `/api` requests to the local backend at `http://localhost:3001`.

## Environment variables

### Backend

| Variable | Purpose |
| --- | --- |
| `OPENROUTER_API_KEY` | Secret key used by the backend to call OpenRouter |
| `OPENROUTER_MODEL` | Default model when no model is selected |
| `SITE_URL` | Origin sent to OpenRouter and allowed by backend CORS |
| `SITE_NAME` | Application name sent to OpenRouter |
| `PORT` | Local backend port (defaults to `3001`) |

### Frontend

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base path; defaults to `/api` |

For deployment, configure the frontend rewrite to point to the actual backend deployment and set the backend environment variables in the hosting provider. The checked-in Vercel rewrite currently contains a placeholder backend URL, so replace it before relying on a fresh deployment.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Returns backend health and the default model |
| `POST` | `/api/chat` | Sends a chat request to OpenRouter; supports streamed and non-streamed responses |

## Project structure

```text
.
├── backend/
│   ├── package.json
│   └── server.js
├── src/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── Dockerfile
└── README.md
```

## Current focus

This project is a hands-on exploration of full-stack AI application development: connecting a React interface to an API, integrating hosted language models, handling streamed responses, and designing learning-focused interactions.

## Author

Yashu Singh

---

If you find a bug or have an idea for improving the learning experience, feel free to open an issue.
