# AI Team Orchestrator

A multi-AI collaboration platform where multiple AI models (OpenAI GPT, Google Gemini, Anthropic Claude) work together on projects through an orchestrated workflow. The system provides a web-based interface for delegating tasks across AI providers, with session management and real-time markdown rendering of responses.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [License](#license)

---

## Overview

AI Team Orchestrator provides:

- **Multi-provider AI integration** -- OpenAI, Google Gemini, and Anthropic Claude working in concert
- **Task delegation engine** -- Routes tasks to the most appropriate AI model
- **Session management** -- Persistent conversation context via express-session
- **Real-time markdown rendering** -- AI responses rendered as formatted markdown
- **Web dashboard** -- EJS-templated interface for team management and task assignment
- **Extensible architecture** -- Add new AI providers through modular SDK integration

---

## Architecture

```
+---------------------------------------+
|         Express.js Web Server         |
|  EJS Templates | Session Middleware   |
+---------------------------------------+
              |
              v
+---------------------------------------+
|       Task Orchestration Engine       |
|  Route tasks to AI providers          |
|  Aggregate and format responses       |
+---------------------------------------+
    |              |              |
    v              v              v
+----------+ +----------+ +----------+
| OpenAI   | | Google   | | Anthropic|
| GPT SDK  | | Gemini   | | Claude   |
| v4.52    | | v0.21    | | v0.30    |
+----------+ +----------+ +----------+
              |
              v
+---------------------------------------+
|         Response Renderer             |
|  marked (Markdown to HTML)            |
+---------------------------------------+
```

---

## Technology Stack

| Component        | Technology                          |
|------------------|-------------------------------------|
| Runtime          | Node.js                             |
| Framework        | Express.js 4.18                     |
| Templating       | EJS 3.1                             |
| AI Providers     | OpenAI SDK 4.52, Google Generative AI 0.21, Anthropic SDK 0.30 |
| Markdown         | marked 12.0                         |
| Sessions         | express-session 1.18                |
| Environment      | dotenv 16.4                         |
| Dev Server       | nodemon 3.1                         |

---

## Project Structure

```
team/
|
|-- package.json                  # Dependencies and scripts
|-- .env                          # API keys (OpenAI, Gemini, Claude)
|
|-- src/
|   +-- server.js                 # Express server entry point
|
|-- public/                       # Static assets (CSS, JS, images)
+-- views/                        # EJS templates
```

---

## Installation

```bash
git clone https://github.com/karthik-idikuda/AI-Team-Orchestrator.git
cd AI-Team-Orchestrator

npm install
```

### Configure API Keys

Create `.env` file:

```env
OPENAI_API_KEY=your_key
GOOGLE_AI_KEY=your_key
ANTHROPIC_API_KEY=your_key
```

---

## Usage

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The server starts at `http://localhost:3000`.

---

## Configuration

| Variable            | Description                 |
|---------------------|-----------------------------|
| OPENAI_API_KEY      | OpenAI GPT API key          |
| GOOGLE_AI_KEY       | Google Gemini API key       |
| ANTHROPIC_API_KEY   | Anthropic Claude API key    |

---

## License

This project is released for educational and research purposes.
