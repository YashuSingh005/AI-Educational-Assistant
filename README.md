# AI Educational Assistant

A modern, dark-themed AI chatbot built for educational purposes with React + Vite (frontend) and Node.js/Express (backend), featuring OpenRouter API integration, streaming responses, interactive quizzes, and multiple learning modes.

**Built by Deepanshu**

## Features

### Core Capabilities
- **💬 Chat Mode** - General conversation with AI assistant
- **📚 Learn Mode** - Structured explanations at Beginner/Intermediate/Advanced levels
- **🧠 Quiz Mode** - Interactive MCQ quizzes with instant feedback (green/red), explanations, and score tracking
- **🌊 Streaming Responses** - Real-time token-by-token display via Server-Sent Events
- **🎨 Dark Theme UI** - Slate backgrounds, indigo/cyan accents, responsive design

### Technical Features
- **🔒 Privacy-First Architecture** - Backend proxies OpenRouter API; your API key **never leaves the server** — no exposure in browser, network tab, or frontend code
- **Secure Architecture** - Backend proxies OpenRouter API, keeping keys off frontend
- **Multi-Model Support** - Switch between 7+ models (Claude, GPT-4, Gemini, Llama, Mistral)
- **Markdown & Code Rendering** - Syntax highlighting with copy-to-clipboard
- **Docker Ready** - Single-container production deployment
- **Keyboard Shortcuts** - Enter to send, Shift+Enter for new line

---

## Project Structure

```
├── backend/
│   ├── package.json
│   └── server.js              # Express + OpenRouter streaming proxy + static frontend serving
├── src/
│   ├── components/
│   │   ├── ChatHeader.jsx     # Mode/Difficulty/Model/Topic selectors
│   │   ├── MessageList.jsx    # Message list with auto-scroll
│   │   ├── MessageBubble.jsx  # Message rendering + Quiz interaction
│   │   ├── MessageInput.jsx   # Textarea with auto-resize
│   │   └── QuizOption.jsx     # Interactive quiz option buttons
│   ├── hooks/
│   │   └── useChat.js         # Streaming chat logic + quiz state management
│   ├── utils/
│   │   └── constants.js       # Models, modes, difficulties, system prompts
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx
│   └── index.css              # Tailwind + custom styles
├── index.html
├── package.json
├── vite.config.js
├── Dockerfile                 # Multi-stage production build
├── .dockerignore
├── .env.example
└── README.md
```
---

## 🔐 API Key Security (How It Works)

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Browser       │────▶│  Your Backend   │────▶│  OpenRouter API  │
│   (Frontend)    │     │  (Express)      │     │                  │
└─────────────────┘     └─────────────────┘     └──────────────────┘
         │                        │                        │
         │  No API key here!      │  ✅ Holds OPENROUTER_  │
         │  Only sends:           │     API_KEY securely   │
         │  {messages, model}     │  ✅ Adds Authorization │
         │                        │     Bearer header      │
         │                        │  ✅ Streams SSE back   │
```

**Key Points:**
- ✅ **Frontend never sees the API key** — not in JS, not in localStorage, not in network requests
- ✅ **Backend injects key server-side** — only your Express server knows it
- ✅ **Safe for public repos** — commit frontend code freely; only `.env` stays private
- ✅ **Production-ready** — same pattern works in Docker, VPS, serverless, Kubernetes

---

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys)

### 1. Backend Setup
```bash
cd backend
cp ../.env.example .env
# Edit .env and add your OPENROUTER_API_KEY
npm install
npm run dev
```
Server runs on `http://localhost:3001`

### 2. Frontend Setup (new terminal)
```bash
# From project root
cp .env.example .env
# Edit .env and add your VITE_OPENROUTER_API_KEY
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` (proxies `/api` to backend via Vite config)

---

## Environment Variables

### Backend (Required)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | **Yes** | - | Your OpenRouter API key (starts with `sk-or-v1-`) |
| `OPENROUTER_MODEL` | No | `meta-llama/llama-3.3-70b-instruct` | Default model when none specified |
| `SITE_URL` | No | `http://localhost:5173` | Your site URL for OpenRouter `HTTP-Referer` header |
| `SITE_NAME` | No | `AI Chatbot` | Your site name for OpenRouter `X-Title` header |
| `PORT` | No | `3001` | Backend server port |

**📋 Copy-Paste Ready `backend/.env` (replace YOUR_KEY_HERE):**
```bash
# backend/.env - COPY THIS ENTIRE BLOCK
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct
SITE_URL=http://localhost:5173
SITE_NAME=AI Educational Assistant
PORT=3001
```

### Frontend (Required)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_OPENROUTER_API_KEY` | **Yes** | - | Same OpenRouter API key (Vite exposes `VITE_` prefixed vars) |

**📋 Copy-Paste Ready `.env` (project root):**
```bash
# .env (project root) - COPY THIS ENTIRE BLOCK
VITE_OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
```

> **Note:** In Docker production, the frontend is served by the backend, so only backend `.env` is needed.

---

## Production Deployment

### Option 1: Docker (Recommended)

#### Build Image
```bash
docker build -t ai-educational-assistant .
```

#### Run Container
```bash
docker run -d \
  --name ai-assistant \
  -p 3001:3001 \
  --env-file backend/.env \
  --restart unless-stopped \
  ai-educational-assistant
```

#### Verify
```bash
curl http://localhost:3001/api/health
# {"status":"ok","model":"meta-llama/llama-3.3-70b-instruct"}
```
Access at `http://localhost:3001`

#### Docker Compose (Production)
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    container_name: ai-educational-assistant
    ports:
      - "3001:3001"
    env_file:
      - backend/.env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run with: `docker-compose up -d`

---

### Option 2: Manual Deployment (VPS/Cloud)

#### 1. Prepare Server
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx
```

#### 2. Clone & Build
```bash
git clone <your-repo>
cd <project>
cp backend/.env.example backend/.env
# Edit backend/.env with production values
cp .env.example .env
# Edit .env with VITE_OPENROUTER_API_KEY

# Install & build frontend
npm ci && npm run build

# Install backend deps
cd backend && npm ci --omit=dev
```

#### 3. Configure Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/ai-assistant
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ai-assistant /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### 4. SSL with Let's Encrypt
```bash
sudo certbot --nginx -d yourdomain.com
```

#### 5. Process Manager (PM2)
```bash
cd /path/to/project/backend
pm2 start server.js --name ai-assistant
pm2 startup
pm2 save
```

---

## ☁️ AWS Deployment (Step-by-Step)

### Option A: AWS App Runner (Easiest - Fully Managed)

**Prerequisites:** AWS CLI configured, Docker installed locally

```bash
# 1. Build & push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t ai-educational-assistant .
docker tag ai-educational-assistant:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-educational-assistant:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-educational-assistant:latest

# 2. Create App Runner service (via console or CLI)
# Console: App Runner → Create service → Container registry → Select ECR image
# Port: 3001
# Environment variables: Add from backend/.env
# Health check path: /api/health
# Auto-deploy: On
```

**Result:** HTTPS URL like `https://xxxxx.us-east-1.awsapprunner.com`

---

### Option B: ECS Fargate (Production Grade)

```bash
# 1. Create ECR repo
aws ecr create-repository --repository-name ai-educational-assistant --region us-east-1

# 2. Push image (same as above)

# 3. Create task definition (task-def.json)
cat > task-def.json << 'EOF'
{
  "family": "ai-educational-assistant",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [{
    "name": "app",
    "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-educational-assistant:latest",
    "portMappings": [{"containerPort": 3001, "protocol": "tcp"}],
    "environment": [
      {"name": "OPENROUTER_API_KEY", "value": "sk-or-v1-..."},
      {"name": "OPENROUTER_MODEL", "value": "meta-llama/llama-3.3-70b-instruct"},
      {"name": "SITE_URL", "value": "https://yourdomain.com"},
      {"name": "SITE_NAME", "value": "AI Educational Assistant"},
      {"name": "PORT", "value": "3001"}
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/ai-educational-assistant",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    },
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:3001/api/health || exit 1"],
      "interval": 30,
      "timeout": 10,
      "retries": 3
    }
  }]
}
EOF

# 4. Register task definition
aws ecs register-task-definition --cli-input-json file://task-def.json --region us-east-1

# 5. Create cluster & service (via console recommended)
# Console: ECS → Clusters → Create → Networking only (Fargate)
# Services → Create → Launch type: FARGATE → Select task definition
# Load balancer: Application Load Balancer → HTTPS (ACM cert)
# Target group: HTTP 3001, health check /api/health
```

---

### Option C: EC2 + Docker (Full Control, Cheapest)

```bash
# 1. Launch EC2 (Ubuntu 22.04, t3.micro for dev, t3.small+ for prod)
# Security Group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS)

# 2. Connect & install Docker
ssh -i your-key.pem ubuntu@<ec2-public-ip>
sudo apt update && sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
sudo usermod -aG docker ubuntu && newgrp docker

# 3. Clone & configure
git clone <your-repo>
cd <project>

# Create backend/.env with your values
cat > backend/.env << 'EOF'
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct
SITE_URL=https://yourdomain.com
SITE_NAME=AI Educational Assistant
PORT=3001
EOF

# 4. Build & run
docker compose up -d --build

# 5. Nginx + SSL (same as manual deployment)
sudo certbot --nginx -d yourdomain.com
```

---

### Option D: AWS Elastic Beanstalk (Simple PaaS)

```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize
eb init -p docker ai-educational-assistant --region us-east-1

# 3. Create Dockerrun.aws.json
cat > Dockerrun.aws.json << 'EOF'
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-educational-assistant:latest",
    "Update": "true"
  },
  "Ports": [{"ContainerPort": 3001}],
  "Logging": "/var/log/nginx"
}
EOF

# 4. Create environment
eb create ai-educational-assistant-env --instance-type t3.small --single

# 5. Set environment variables
eb setenv OPENROUTER_API_KEY=sk-or-v1-... OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct SITE_URL=https://yourdomain.com SITE_NAME="AI Educational Assistant" PORT=3001

# 6. Deploy updates
eb deploy
```

---

## 🔐 AWS Secrets Manager (Secure Alternative to .env)

Instead of hardcoding in task definitions:

```bash
# 1. Store secret
aws secretsmanager create-secret \
  --name ai-assistant/openrouter \
  --secret-string '{"OPENROUTER_API_KEY":"sk-or-v1-..."}'

# 2. In task definition, use secrets:
"secrets": [
  {"name": "OPENROUTER_API_KEY", "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:ai-assistant/openrouter-xxxxx:OPENROUTER_API_KEY::"}
]

# 3. Grant task execution role permission:
aws iam put-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-name SecretsAccess \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["secretsmanager:GetSecretValue"],"Resource":"arn:aws:secretsmanager:us-east-1:<account-id>:secret:ai-assistant/openrouter*"}]}'
```

---

## Available Models

| Model | Provider | Best For |
|-------|----------|----------|
| `meta-llama/llama-3.3-70b-instruct` | Meta | General purpose, coding, reasoning |
| `meta-llama/llama-3.1-405b-instruct` | Meta | Complex tasks, large context |
| `openai/gpt-4o` | OpenAI | High-quality responses, coding |
| `openai/gpt-4o-mini` | OpenAI | Fast, cost-effective |
| `google/gemini-2.0-flash-exp` | Google | Speed, multimodal |
| `anthropic/claude-3.5-sonnet-20241022` | Anthropic | Analysis, writing, coding |
| `mistralai/mistral-large-2411` | Mistral | Multilingual, reasoning |

---

## Learning Modes

### 💬 Chat Mode
General conversation. No special formatting.

### 📚 Learn Mode
- **Beginner** - Simple language, analogies, basic examples
- **Intermediate** - Practical examples, code snippets, real-world applications
- **Advanced** - Deep concepts, edge cases, best practices, architectural patterns

### 🧠 Quiz Mode
- Generates one MCQ at a time
- Click **A/B/C/D** → Instant feedback (green ✓ / red ✗)
- Shows explanation for every answer
- **Next Question** button fetches new question
- Score tracked automatically

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check + current model |
| `/api/chat` | POST | Streaming chat completion |

**Chat Request:**
```json
{
  "messages": [{"role": "user", "content": "Hello"}],
  "model": "meta-llama/llama-3.3-70b-instruct",
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 4096
}
```

**Chat Response:** Server-Sent Events stream with `data: {"content": "token"}` format.

---

## Troubleshooting

### "Missing Authentication header"
- Ensure `OPENROUTER_API_KEY` is set in backend `.env`
- Restart backend after changes

### "No endpoints found for model"
- Model ID may be deprecated on OpenRouter
- Update `OPENROUTER_MODEL` or select different model in UI

### Quiz not working
- Ensure Quiz mode (🧠) is selected
- Enter a topic before starting
- Click option buttons (A/B/C/D), don't type

### Docker port conflict
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Frontend not loading in Docker
- Ensure `npm run build` completed successfully
- Check `dist/` folder exists with `index.html`

---

## Security Checklist

- [ ] Never commit `.env` files to git
- [ ] Use strong, unique OpenRouter API keys per environment
- [ ] Enable HTTPS in production (Let's Encrypt or cloud provider)
- [ ] Restrict CORS origins in production backend
- [ ] Use firewall to limit backend port exposure
- [ ] Monitor API usage on OpenRouter dashboard

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS v4 |
| **Backend** | Node.js 20, Express, node-fetch v3 |
| **Streaming** | Server-Sent Events (SSE) |
| **Markdown** | react-markdown, rehype-highlight, remark-gfm |
| **Container** | Docker multi-stage (Node 20 Alpine) |
| **Icons** | Inline SVG |

---

## License

Copyright © 2024 Deepanshu. All rights reserved.

---

## Support

- **OpenRouter Docs**: [openrouter.ai/docs](https://openrouter.ai/docs)
- **Issues**: Create GitHub issue in this repository
- **API Status**: [status.openrouter.ai](https://status.openrouter.ai)