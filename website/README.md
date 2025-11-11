# That Me Website

Static frontend for creating That Me agents. Built with Vite, React, and TailwindCSS 4.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Preview production build
bun preview
```

## 📦 Project Structure

```
website/
├── src/
│   ├── api/           # API client and endpoints
│   ├── components/    # Reusable UI components
│   ├── sections/      # Page sections (Introduction, Concepts, AgentForm)
│   ├── types/         # TypeScript type definitions
│   └── lib/           # Utility functions
├── public/            # Static assets
└── dist/              # Production build output
```

## 🌐 Deployment

This project is configured to auto-deploy to GitHub Pages via GitHub Actions:

- **Domain**: https://that0.me
- **Workflow**: `.github/workflows/deploy-website.yml`
- **Trigger**: Push to `main` branch with changes in `website/`

## 🔧 Environment Variables

Create a `.env.local` file for local development:

```bash
VITE_API_BASE=http://localhost:3000
```

Production values are set in `.env.production`.

## 📝 Features

- **Introduction**: Project overview and mission
- **Concepts**: Detailed explanation of ERC-8004, A2A Mesh, Telegram Integration
- **Create Agent**: Form to configure and deploy new agents
  - Name, bio, system prompt
  - Telegram bot token integration
  - Plugin selection
  - Form validation with Zod

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS 4
- **Validation**: Zod
- **Package Manager**: Bun

## 📄 License

Part of the That Me project.
