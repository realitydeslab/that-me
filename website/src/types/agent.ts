import { z } from 'zod';

/**
 * Agent form schema with validation rules
 */
export const agentFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(2, 'Username must be at least 2 characters').optional(),
  bio: z.union([z.string(), z.array(z.string())]).optional(),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  telegramToken: z.string().min(1, 'Telegram Bot Token is required'),
  topics: z.array(z.string()).optional(),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  plugins: z.array(z.string()).optional(),
});

export type AgentFormData = z.infer<typeof agentFormSchema>;

/**
 * Plugin configuration type
 */
export interface PluginConfig {
  id: string;
  name: string;
  description: string;
  required?: boolean;
}

/**
 * Available plugins for agent configuration
 */
export const AVAILABLE_PLUGINS: PluginConfig[] = [
  { id: '@elizaos/plugin-bootstrap', name: 'Bootstrap', description: 'Core actions & handlers', required: true },
  { id: '@elizaos/plugin-sql', name: 'SQL', description: 'Memory & database', required: true },
  { id: '@elizaos/plugin-openai', name: 'OpenAI', description: 'GPT models' },
  { id: '@elizaos/plugin-anthropic', name: 'Anthropic', description: 'Claude models' },
  { id: '@elizaos/plugin-ollama', name: 'Ollama', description: 'Local models' },
  { id: '@elizaos/plugin-discord', name: 'Discord', description: 'Discord integration' },
  { id: '@elizaos/plugin-twitter', name: 'Twitter', description: 'Twitter/X integration' },
  { id: '@elizaos/plugin-solana', name: 'Solana', description: 'Solana blockchain' },
  { id: '@elizaos/plugin-evm', name: 'EVM', description: 'Ethereum & EVM chains' },
];

/**
 * Default form values
 */
export const DEFAULT_FORM_VALUES: Partial<AgentFormData> = {
  plugins: ['@elizaos/plugin-bootstrap', '@elizaos/plugin-sql', '@elizaos/plugin-openai'],
  topics: [],
};
