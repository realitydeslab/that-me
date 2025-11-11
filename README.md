# That Me

## Mission

That Me creates AI agents that represent you and scale your social care. Each agent learns your tone, priorities, and boundaries so it can nurture relationships, triage requests, and surface what matters—without asking you to chat with a generic bot.

## Core Features

- **ERC‑8004 identity + reputation**: every agent registers on-chain so peers can verify ownership and vote on behavior. A falling score signals that the agent needs new guardrails or prompts.
- **Configurable persona distillation**: import notes, messages, or docs; the system condenses them into prompts + context blobs you can edit later to keep sensitive details private.
- **Telegram companion**: add the agent as a contact and talk through Telegram. It can reply, draft, or escalate conversations while honoring the rules you set.
- **Agent-to-Agent (A2A) mesh**: agents coordinate via A2A channels, sharing tasks and updates without exposing raw personal data.
- **Conversation intelligence**: after every thread the agent writes a summary with key facts, follow-ups, and sentiment so you stay in the loop.

## Architecture Snapshot

1. **Persona Vault** – encrypted store for personal snippets that feed prompt templates.
2. **Agent Runtime** – policy engine + LLM orchestrator that enforces configurable behaviors.
3. **A2A Bus** – protocol where your agent talks with other agents or services for coordination.
4. **Messaging Bridge** – Telegram bot wrapper that pipes chats to the runtime.
5. **ERC‑8004 Registry** – records identity + reputation votes for transparency.

## Typical Flow

1. Provision a wallet, deploy the ERC‑8004 record, and mint the agent identity.
2. Upload or author personal context, then mark what the agent may share or must keep private.
3. Link Telegram and set policies (auto-reply, hours, escalation keywords).
4. Let A2A handle outreach, reminders, and collaboration with other agents.
5. Review the digest the summarizer produces—key info and actions in one view.

## Agent Introspection API

Starting the project with `elizaos start` now loads a lightweight plugin that exposes runtime details for the active agent. Query it with your agent ID (either from the start-up logs or via the dashboard URL) using a standard HTTP GET (plugin routes are namespaced, so include the plugin name — e.g. `starter`):

```bash
curl "http://localhost:3000/api/agents/<agent-id>/plugins/starter/agent-info?agentId=<agent-id>"
```

Typical response:

```json
{
  "success": true,
  "data": {
    "agentId": "a9f1b7b6-4a9d-4a61-9f3f-08c7d9d752af",
    "name": "Eliza",
    "character": {
      "bio": ["Engages with all types of questions and conversations"],
      "system": "Respond to all messages in a helpful, conversational manner."
    },
    "plugins": ["starter", "@elizaos/plugin-sql"],
    "actions": ["HELLO_WORLD"],
    "services": ["starter"],
    "routes": [
      {
        "name": "agent-info",
        "path": "/starter/agent-info",
        "type": "GET",
        "public": false
      }
    ],
    "registry": {
      "totalAgents": 1,
      "storedAgent": {
        "id": "a9f1b7b6-4a9d-4a61-9f3f-08c7d9d752af",
        "name": "Eliza"
      }
    },
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

This endpoint is useful for dashboards or plugins that need a snapshot of the currently running agent without poking directly at the database. Notes:

- `agentId` must be provided both in the path and as a query parameter — the router uses it to scope the runtime (`...?agentId=<agent-id>`).
- The runtime will fall back to the next free port if `3000` is occupied. Watch the `elizaos start` logs for lines like `Port 3000 is in use, using port 3001 instead`, then replace the port in your curl command accordingly.

## Agent Provisioning API

Need to add an agent without using the UI? Use the POST helper exposed by the starter plugin:

```bash
curl -X POST "http://localhost:3001/api/agents/<agent-id>/plugins/starter/agents?agentId=<agent-id>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TG Helper",
    "prompt": "You are a Telegram assistant that answers concisely.",
    "telegramToken": "<bot-token>",
    "bio": ["Friendly Telegram assistant"],
    "topics": ["telegram", "support"]
  }'
```

- `name`, `prompt`, and `telegramToken` are required.
- Optional fields: `username`, `bio` (string or array), `topics`, `avatar`, `plugins` (extra plugin names), and `autoStart` (defaults to `true`).
- The endpoint automatically prevents duplicate names, preloads baseline plugins (`@elizaos/plugin-sql`, `@elizaos/plugin-openai`, `@elizaos/plugin-bootstrap`, `@elizaos/plugin-telegram`, `starter`), stores the Telegram token as `settings.secrets.TELEGRAM_BOT_TOKEN`, and returns the new agent ID.
- When `autoStart` is enabled we immediately call the server’s `/api/agents/<new-id>/start` route using the same host/port as the incoming request, so the agent comes online right after creation. Set `"autoStart": false` if you want to provision without starting yet.

## Repository Status

Today the repo hosts project docs (`README.md`, `AGENTS.md`) and the `CNAME` used for GitHub Pages. Coming directories:

- `src/` – agent runtime, connectors, and A2A adapters.
- `assets/` – prompt templates, diagrams, and marketing collateral.
- `tests/` – mirrors `src/` with `pytest`.
  Refer to `AGENTS.md` for contributor guidelines, coding standards, and security expectations.

## Roadmap

- Ship the provisioning CLI (ERC‑8004 + wallet bootstrap + Telegram auth).
- Release reference A2A modules so external agents can interoperate safely.
- Add configurable summarization pipelines (daily digest, inbox triage, CRM sync).
- Publish a governance spec for ERC‑8004 reputation voters and appeals.
