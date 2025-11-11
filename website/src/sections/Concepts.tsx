import Card from '@/components/ui/Card';

export default function Concepts() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white">Key Concepts</h2>
        <p className="text-xl text-gray-300">
          Understanding the technology behind That Me agents
        </p>
      </div>

      {/* Architecture Snapshot */}
      <Card variant="elevated">
        <h3 className="text-2xl font-bold text-white mb-6">Architecture Overview</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center">
              1
            </span>
            <div>
              <h4 className="font-semibold text-white">Persona Vault</h4>
              <p className="text-sm text-gray-400">
                Encrypted store for personal snippets that feed prompt templates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <h4 className="font-semibold text-white">Agent Runtime</h4>
              <p className="text-sm text-gray-400">
                Policy engine + LLM orchestrator that enforces configurable behaviors.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center">
              3
            </span>
            <div>
              <h4 className="font-semibold text-white">A2A Bus</h4>
              <p className="text-sm text-gray-400">
                Protocol where your agent talks with other agents or services for coordination.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center">
              4
            </span>
            <div>
              <h4 className="font-semibold text-white">Messaging Bridge</h4>
              <p className="text-sm text-gray-400">
                Telegram bot wrapper that pipes chats to the runtime.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center">
              5
            </span>
            <div>
              <h4 className="font-semibold text-white">ERC-8004 Registry</h4>
              <p className="text-sm text-gray-400">
                Records identity + reputation votes for transparency.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Core Concepts */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white">Core Technologies</h3>

        <Card>
          <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <span>🔐</span>
            ERC-8004: Identity & Reputation
          </h4>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong className="text-white">What it is:</strong> An on-chain registry that
              records agent ownership and behavior reputation.
            </p>
            <p>
              <strong className="text-white">Why it matters:</strong> Users can verify who controls
              an agent and see its reputation score. If the agent behaves poorly, the community can
              vote to lower its score, signaling that new safeguards are needed.
            </p>
            <p>
              <strong className="text-white">Key features:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>On-chain identity verification</li>
              <li>Community-driven reputation scoring</li>
              <li>Transparent governance and appeals process</li>
              <li>Tamper-proof agent lineage tracking</li>
            </ul>
          </div>
        </Card>

        <Card>
          <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <span>🌐</span>
            A2A (Agent-to-Agent) Mesh
          </h4>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong className="text-white">What it is:</strong> A communication protocol that
              allows agents to coordinate tasks and share information without exposing sensitive
              personal data.
            </p>
            <p>
              <strong className="text-white">Why it matters:</strong> Your agent can collaborate
              with other agents (scheduling meetings, coordinating projects) while maintaining
              privacy and security boundaries you define.
            </p>
            <p>
              <strong className="text-white">Use cases:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>Cross-agent scheduling and calendar coordination</li>
              <li>Task delegation and project management</li>
              <li>Information routing and request triage</li>
              <li>Multi-agent workflows and automations</li>
            </ul>
          </div>
        </Card>

        <Card>
          <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <span>💬</span>
            Telegram Integration
          </h4>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong className="text-white">What it is:</strong> Your agent becomes a Telegram bot
              that you can chat with directly, configured with your Telegram Bot Token.
            </p>
            <p>
              <strong className="text-white">Why it matters:</strong> Interact with your agent
              through a familiar messaging interface. Set policies for when it should auto-reply,
              escalate to you, or stay silent.
            </p>
            <p>
              <strong className="text-white">Capabilities:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>Auto-respond to common queries</li>
              <li>Draft messages for your review</li>
              <li>Escalate urgent or complex conversations</li>
              <li>Configurable hours and response policies</li>
            </ul>
          </div>
        </Card>

        <Card>
          <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <span>🧠</span>
            ElizaOS Plugin System
          </h4>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong className="text-white">What it is:</strong> A modular plugin architecture
              that extends your agent's capabilities through composable functionality blocks.
            </p>
            <p>
              <strong className="text-white">Why it matters:</strong> Add features like blockchain
              interactions, additional messaging platforms, or custom integrations without
              rewriting core agent logic.
            </p>
            <p>
              <strong className="text-white">Available plugins:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>OpenAI, Anthropic, Ollama (LLM providers)</li>
              <li>Discord, Twitter, Telegram (messaging platforms)</li>
              <li>Solana, EVM (blockchain integrations)</li>
              <li>SQL, Memory (data persistence)</li>
            </ul>
          </div>
        </Card>

        <Card>
          <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <span>🔒</span>
            Privacy & Security
          </h4>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong className="text-white">Persona Distillation:</strong> Control what your agent
              knows and shares. Import your context (notes, messages, docs) and mark sensitive
              information as private.
            </p>
            <p>
              <strong className="text-white">Configurable Boundaries:</strong> Set explicit rules
              for what your agent can and cannot do, including escalation triggers for human review.
            </p>
            <p>
              <strong className="text-white">Data Ownership:</strong> You own your agent's data and
              configuration. Deploy on your infrastructure or use trusted hosting.
            </p>
          </div>
        </Card>
      </div>

      {/* Getting Started CTA */}
      <Card variant="bordered" className="bg-gradient-to-r from-primary-900/20 to-primary-800/20">
        <div className="text-center py-6">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Build Your Agent?</h3>
          <p className="text-gray-300 mb-6">
            Now that you understand the concepts, create your first That Me agent.
          </p>
          <p className="text-sm text-gray-400">
            Head to the <strong className="text-primary-400">"Create Agent"</strong> tab to
            configure your agent with these powerful features.
          </p>
        </div>
      </Card>
    </div>
  );
}
