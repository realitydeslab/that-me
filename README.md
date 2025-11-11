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
