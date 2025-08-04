# GenAI Conversation Viewer

A TypeScript-based monorepo for visualizing JSON conversation history from GenAI tools like Q CLI. Built with React, Vite, Tailwind CSS v4, and deployed via AWS CDK.

## 🏗️ Monorepo Structure

```
packages/
├── website/           # React frontend application
│   ├── src/          # React components and logic
│   ├── public/       # Static assets
│   └── package.json  # Website dependencies
└── infrastructure/   # AWS CDK deployment
    ├── lib/         # CDK stack definitions
    ├── bin/         # CDK app entry point
    ├── scripts/     # Deployment scripts
    └── package.json # Infrastructure dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **pnpm 8+** (install with `npm install -g pnpm`)
- **AWS CLI** configured (for deployment)

### Development

```bash
# Install all dependencies
pnpm install

# Start development server
pnpm dev

# Build all packages
pnpm build

# Type check all packages
pnpm typecheck
```

### Deployment

```bash
# Deploy infrastructure (first time)
pnpm deploy:infra

# Deploy website updates
pnpm deploy:website

# Deploy both
pnpm deploy
```

## 📦 Packages

### [@q-convo-viewer/website](./packages/website)

React frontend for visualizing GenAI conversation JSON files.

**Features:**
- 📁 File upload with drag & drop
- 🔍 JSON schema validation
- 💬 Conversation flow visualization
- 📊 Analytics dashboard
- 🔧 Tools panel with clickable navigation
- 🎨 Tailwind CSS v4 styling

**Tech Stack:**
- TypeScript + React 18
- Vite for fast development
- Tailwind CSS v4
- JSON schema validation

### [@q-convo-viewer/infrastructure](./packages/infrastructure)

AWS CDK infrastructure for deploying to `qview.chat`.

**Features:**
- 🪣 S3 static hosting (private bucket)
- 🌐 CloudFront CDN with Origin Access Control
- 🔒 SSL certificate via ACM
- 🌍 Route 53 DNS management
- 📜 Automated deployment scripts

**Tech Stack:**
- AWS CDK v2
- TypeScript
- CloudFormation

## 🎯 Usage

1. **Upload a conversation JSON file** via drag & drop or file picker
2. **View the conversation** across three tabs:
   - **Conversation**: Message flow with visual distinction
   - **Summary**: Statistics and most-used tools (clickable!)
   - **Tools**: Detailed tool specifications
3. **Navigate seamlessly** between summary and tool details

## 📋 JSON Schema

Expected conversation format:

```json
{
  "conversation_id": "uuid-string",
  "history": [
    [/* array of messages per turn */]
  ],
  "transcript": ["string array"],
  "tools": { /* optional tools object */ },
  "model": "model-name"
}
```

## 🎨 Message Types

- **🔵 User Messages**: User input and prompts
- **⚫ Tool Results**: Results from tool execution  
- **🟣 Tool Use**: AI tool invocations with arguments
- **🟢 AI Responses**: AI-generated text responses

## 🛠️ Development Commands

```bash
# Package-specific commands
pnpm --filter @q-convo-viewer/website dev
pnpm --filter @q-convo-viewer/infrastructure deploy

# Global commands
pnpm build          # Build all packages
pnpm typecheck      # Type check all packages
pnpm clean          # Clean all packages
```

## 🌐 Deployment

The application is deployed to **https://qview.chat** using:

- **S3** for static file hosting
- **CloudFront** for global CDN
- **Route 53** for DNS
- **ACM** for SSL certificates

Deployment is automated via the infrastructure package scripts.

## 🔧 Architecture

```
User → Route 53 → CloudFront → S3 Bucket
                      ↓
                 SSL Certificate
                    (ACM)
```

## 📄 License

This project is provided as-is for educational and development purposes.

---

**🔗 Live Demo**: https://qview.chat
