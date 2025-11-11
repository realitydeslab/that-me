import Card from '@/components/ui/Card';

export default function Introduction() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Create AI Agents That Represent You
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Scale your social care with AI agents that learn your tone, priorities, and boundaries to
          nurture relationships and surface what matters.
        </p>
      </div>

      {/* Mission */}
      <Card variant="elevated">
        <h3 className="text-2xl font-bold text-white mb-4">Mission</h3>
        <p className="text-gray-300 leading-relaxed">
          That Me creates AI agents that represent you and scale your social care. Each agent
          learns your tone, priorities, and boundaries so it can nurture relationships, triage
          requests, and surface what matters—without asking you to chat with a generic bot.
        </p>
      </Card>

      {/* Core Features */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">Core Features</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔐</span>
              <div>
                <h4 className="font-semibold text-white mb-2">ERC-8004 Identity & Reputation</h4>
                <p className="text-sm text-gray-400">
                  Every agent registers on-chain so peers can verify ownership and vote on
                  behavior. A falling score signals that the agent needs new guardrails or prompts.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h4 className="font-semibold text-white mb-2">Configurable Persona Distillation</h4>
                <p className="text-sm text-gray-400">
                  Import notes, messages, or docs; the system condenses them into prompts + context
                  blobs you can edit later to keep sensitive details private.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h4 className="font-semibold text-white mb-2">Telegram Companion</h4>
                <p className="text-sm text-gray-400">
                  Add the agent as a contact and talk through Telegram. It can reply, draft, or
                  escalate conversations while honoring the rules you set.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌐</span>
              <div>
                <h4 className="font-semibold text-white mb-2">Agent-to-Agent (A2A) Mesh</h4>
                <p className="text-sm text-gray-400">
                  Agents coordinate via A2A channels, sharing tasks and updates without exposing
                  raw personal data.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold text-white mb-2">Conversation Intelligence</h4>
                <p className="text-sm text-gray-400">
                  After every thread the agent writes a summary with key facts, follow-ups, and
                  sentiment so you stay in the loop.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-semibold text-white mb-2">Powered by ElizaOS</h4>
                <p className="text-sm text-gray-400">
                  Built on top of ElizaOS, a powerful agent framework with plugin ecosystem for
                  extensible functionality.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Typical Flow */}
      <Card variant="bordered">
        <h3 className="text-2xl font-bold text-white mb-4">How It Works</h3>
        <ol className="space-y-4">
          {[
            'Provision a wallet, deploy the ERC-8004 record, and mint the agent identity.',
            'Upload or author personal context, then mark what the agent may share or must keep private.',
            'Link Telegram and set policies (auto-reply, hours, escalation keywords).',
            'Let A2A handle outreach, reminders, and collaboration with other agents.',
            'Review the digest the summarizer produces—key info and actions in one view.',
          ].map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-gray-300">{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* CTA */}
      <div className="text-center py-8">
        <p className="text-gray-300 mb-4">Ready to create your first agent?</p>
        <p className="text-sm text-gray-400">
          Click on the <strong className="text-primary-400">"Create Agent"</strong> tab above to
          get started.
        </p>
      </div>
    </div>
  );
}
