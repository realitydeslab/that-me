import type { Plugin } from '@elizaos/core';
import { SDK } from 'agent0-sdk';
import {
  type Action,
  type ActionResult,
  AgentStatus,
  type Content,
  type GenerateTextParams,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  ModelType,
  type Provider,
  type ProviderResult,
  Service,
  type State,
  logger,
} from '@elizaos/core';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

/**
 * Define the configuration schema for the plugin with the following properties:
 *
 * @param {string} EXAMPLE_PLUGIN_VARIABLE - The name of the plugin (min length of 1, optional)
 * @returns {object} - The configured schema object
 */
const configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z
    .string()
    .min(1, 'Example plugin variable is not provided')
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn('Warning: Example plugin variable is not provided');
      }
      return val;
    }),
});

const createAgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  prompt: z.string().min(1, 'System prompt is required'),
  telegramToken: z.string().min(1, 'Telegram bot token is required'),
  autoStart: z.boolean().optional(),
  agentWallet: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Agent wallet must be a valid EVM address')
    .optional(),
  ensName: z
    .string()
    .min(3, 'ENS name must be at least 3 characters')
    .optional(),
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(32, 'Username must be at most 32 characters')
    .optional(),
  bio: z.union([z.string(), z.array(z.string().min(1))]).optional(),
  topics: z.array(z.string().min(1)).optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  plugins: z.array(z.string().min(1)).optional(),
});

const DEFAULT_PLUGINS = [
  '@elizaos/plugin-sql',
  '@elizaos/plugin-openai',
  '@elizaos/plugin-bootstrap',
  '@elizaos/plugin-telegram',
  'starter',
];

const formatBio = (bio?: string | string[]) => {
  if (!bio) {
    return ['Created via API bootstrap'];
  }
  return Array.isArray(bio) ? bio : [bio];
};

const resolveServerBaseUrl = (req: any) => {
  if (req?.protocol && typeof req?.get === 'function') {
    const host = req.get('host');
    if (host) {
      return `${req.protocol}://${host}`;
    }
  }
  if (process.env.ELIZA_SERVER_URL) {
    return process.env.ELIZA_SERVER_URL;
  }
  const port = process.env.PORT ?? '3000';
  return `http://127.0.0.1:${port}`;
};

const parseEnvBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
};

const buildA2AEndpoint = (baseUrl: string, agentId: string) =>
  `${baseUrl}/api/agents/${agentId}/plugins/starter/a2a-card?agentId=${agentId}`;

type Agent0RegistrationSummary = {
  attempted: boolean;
  success: boolean;
  agentId?: string;
  agentURI?: string;
  a2aEndpoint?: string;
  error?: string;
};

type Agent0RegistrationInput = {
  name: string;
  description: string;
  image: string;
  a2aEndpoint: string;
  mcpEndpoint?: string;
  ensName?: string;
  walletAddress?: string;
  topics?: string[];
};

let cachedAgent0Sdk: SDK | null | undefined;

const getAgent0Sdk = () => {
  if (cachedAgent0Sdk !== undefined) {
    return cachedAgent0Sdk;
  }

  const rpcUrl = process.env.AGENT0_RPC_URL;
  const signer = process.env.AGENT0_SIGNER_KEY;
  const chainId = Number(process.env.AGENT0_CHAIN_ID ?? '11155111');
  const ipfs = process.env.AGENT0_IPFS ?? 'pinata';
  const pinataJwt = process.env.AGENT0_PINATA_JWT;

  if (!rpcUrl || !signer) {
    cachedAgent0Sdk = null;
    logger.warn('Agent0 SDK is not fully configured; skipping on-chain registration');
    return cachedAgent0Sdk;
  }

  if (ipfs === 'pinata' && !pinataJwt) {
    cachedAgent0Sdk = null;
    logger.warn('Pinata JWT missing; Agent0 registration disabled');
    return cachedAgent0Sdk;
  }

  try {
    cachedAgent0Sdk = new SDK({
      chainId,
      rpcUrl,
      signer,
      ipfs,
      pinataJwt,
    });
    return cachedAgent0Sdk;
  } catch (error) {
    cachedAgent0Sdk = null;
    logger.error({ error }, 'Failed to instantiate Agent0 SDK');
    return cachedAgent0Sdk;
  }
};

const registerAgentWithAgent0 = async (
  params: Agent0RegistrationInput
): Promise<Agent0RegistrationSummary> => {
  const a2aEndpoint = params.a2aEndpoint;
  const sdk = getAgent0Sdk();
  if (!sdk) {
    return {
      attempted: false,
      success: false,
      a2aEndpoint,
      error: 'Agent0 SDK is not configured',
    };
  }

  try {
    const agent = sdk.createAgent(params.name, params.description, params.image);

    if (params.mcpEndpoint) {
      await agent.setMCP(
        params.mcpEndpoint,
        process.env.AGENT0_MCP_VERSION ?? '2025-06-18'
      );
    }

    await agent.setA2A(
      a2aEndpoint,
      process.env.AGENT0_A2A_VERSION ?? '0.30'
    );

    if (params.ensName) {
      agent.setENS(params.ensName, process.env.AGENT0_ENS_VERSION ?? '1.0');
    }

    if (params.walletAddress) {
      const walletChain = Number(process.env.AGENT0_CHAIN_ID ?? '11155111');
      agent.setAgentWallet(params.walletAddress, walletChain);
    }

    agent.setTrust(
      parseEnvBoolean(process.env.AGENT0_TRUST_REPUTATION, true),
      parseEnvBoolean(process.env.AGENT0_TRUST_CRYPTO, true)
    );

    agent.setMetadata({
      version: process.env.AGENT0_AGENT_VERSION ?? '1.0.0',
      topics: params.topics ?? [],
      source: 'starter-plugin',
    });

    agent.setActive(true);
    agent.setX402Support(false);

    const registrationFile = await agent.registerIPFS();

    if (registrationFile.agentId) {
      await sdk.getAgent(registrationFile.agentId).catch(() => null);
    }

    return {
      attempted: true,
      success: true,
      agentId: registrationFile.agentId,
      agentURI: registrationFile.agentURI,
      a2aEndpoint,
    };
  } catch (error) {
    logger.error({ error }, 'Agent0 registration failed');
    return {
      attempted: true,
      success: false,
      a2aEndpoint,
      error: error instanceof Error ? error.message : 'Unknown Agent0 error',
    };
  }
};

const buildA2ACardPayload = (agent: any) => {
  return {
    agentId: agent.id,
    name: agent.name,
    username: agent.username,
    version: process.env.AGENT0_A2A_VERSION ?? '0.30',
    description: agent.system,
    topics: agent.topics ?? [],
    plugins: agent.plugins ?? [],
    avatar: agent.settings?.avatar,
    status: agent.status ?? AgentStatus.ACTIVE,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Example HelloWorld action
 * This demonstrates the simplest possible action structure
 */
/**
 * Represents an action that responds with a simple hello world message.
 *
 * @typedef {Object} Action
 * @property {string} name - The name of the action
 * @property {string[]} similes - The related similes of the action
 * @property {string} description - Description of the action
 * @property {Function} validate - Validation function for the action
 * @property {Function} handler - The function that handles the action
 * @property {Object[]} examples - Array of examples for the action
 */
const helloWorldAction: Action = {
  name: 'HELLO_WORLD',
  similes: ['GREET', 'SAY_HELLO'],
  description: 'Responds with a simple hello world message',

  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<boolean> => {
    // Always valid
    return true;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ): Promise<ActionResult> => {
    try {
      logger.info('Handling HELLO_WORLD action');

      // Simple response content
      const responseContent: Content = {
        text: 'hello world!',
        actions: ['HELLO_WORLD'],
        source: message.content.source,
      };

      // Call back with the hello world message
      await callback(responseContent);

      return {
        text: 'Sent hello world greeting',
        values: {
          success: true,
          greeted: true,
        },
        data: {
          actionName: 'HELLO_WORLD',
          messageId: message.id,
          timestamp: Date.now(),
        },
        success: true,
      };
    } catch (error) {
      logger.error({ error }, 'Error in HELLO_WORLD action:');

      return {
        text: 'Failed to send hello world greeting',
        values: {
          success: false,
          error: 'GREETING_FAILED',
        },
        data: {
          actionName: 'HELLO_WORLD',
          error: error instanceof Error ? error.message : String(error),
        },
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Can you say hello?',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'hello world!',
          actions: ['HELLO_WORLD'],
        },
      },
    ],
  ],
};

/**
 * Example Hello World Provider
 * This demonstrates the simplest possible provider implementation
 */
const helloWorldProvider: Provider = {
  name: 'HELLO_WORLD_PROVIDER',
  description: 'A simple example provider',

  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<ProviderResult> => {
    return {
      text: 'I am a provider',
      values: {},
      data: {},
    };
  },
};

export class StarterService extends Service {
  static serviceType = 'starter';
  capabilityDescription =
    'This is a starter service which is attached to the agent through the starter plugin.';

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  static async start(runtime: IAgentRuntime) {
    logger.info('*** Starting starter service ***');
    const service = new StarterService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info('*** Stopping starter service ***');
    // get the service from the runtime
    const service = runtime.getService(StarterService.serviceType);
    if (!service) {
      throw new Error('Starter service not found');
    }
    service.stop();
  }

  async stop() {
    logger.info('*** Stopping starter service instance ***');
  }
}

const plugin: Plugin = {
  name: 'starter',
  description: 'A starter plugin for Eliza',
  // Set lowest priority so real models take precedence
  priority: -1000,
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE,
  },
  async init(config: Record<string, string>) {
    logger.info('*** Initializing starter plugin ***');
    try {
      const validatedConfig = await configSchema.parseAsync(config);

      // Set all environment variables at once
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages =
          error.issues?.map((e) => e.message)?.join(', ') ||
          'Unknown validation error';
        throw new Error(`Invalid plugin configuration: ${errorMessages}`);
      }
      throw new Error(
        `Invalid plugin configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
  models: {
    [ModelType.TEXT_SMALL]: async (
      _runtime,
      { prompt, stopSequences = [] }: GenerateTextParams
    ) => {
      return 'Never gonna give you up, never gonna let you down, never gonna run around and desert you...';
    },
    [ModelType.TEXT_LARGE]: async (
      _runtime,
      {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7,
      }: GenerateTextParams
    ) => {
      return 'Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...';
    },
  },
  routes: [
    {
      name: 'helloworld',
      path: '/helloworld',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        // send a response
        res.json({
          message: 'Hello World!',
        });
      },
    },
    {
      name: 'agent-info',
      path: '/agent-info',
      type: 'GET',
      handler: async (_req: any, res: any, runtime: IAgentRuntime) => {
        try {
          const [storedAgent, registeredAgents] = await Promise.all([
            runtime.getAgent(runtime.agentId).catch(() => null),
            runtime.getAgents().catch(() => []),
          ]);

          const responsePayload = {
            success: true,
            data: {
              agentId: runtime.agentId,
              name: runtime.character.name,
              character: {
                name: runtime.character.name,
                bio: runtime.character.bio ?? [],
                system: runtime.character.system,
                topics: runtime.character.topics ?? [],
                style: runtime.character.style ?? {},
                settings: runtime.character.settings ?? {},
              },
              plugins: (runtime.plugins ?? []).map(
                (registeredPlugin) => registeredPlugin.name
              ),
              actions: (runtime.actions ?? []).map((action) => action.name),
              providers: (runtime.providers ?? []).map(
                (provider) => provider.name
              ),
              services: runtime.getRegisteredServiceTypes(),
              routes: (runtime.routes ?? []).map((route) => ({
                name: route.name ?? null,
                path: route.path,
                type: route.type,
                public: Boolean(route.public),
              })),
              registry: {
                totalAgents: registeredAgents.length,
                storedAgent: storedAgent
                  ? {
                      id: storedAgent.id ?? runtime.agentId,
                      name: storedAgent.name ?? runtime.character.name,
                      source: storedAgent.source,
                      createdAt: storedAgent.createdAt,
                    }
                  : null,
              },
              timestamp: new Date().toISOString(),
            },
          };

          res.json(responsePayload);
        } catch (error) {
          logger.error({ error }, 'Failed to handle agent info route');

          if (typeof res.status === 'function') {
            res.status(500);
          }

          res.json({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Unable to read agent information',
          });
        }
      },
    },
    {
      name: 'agent-a2a-card',
      path: '/a2a-card',
      type: 'GET',
      public: true,
      handler: async (req: any, res: any, runtime: IAgentRuntime) => {
        const requestAgentId =
          (req?.query?.agentId as string | undefined) ??
          (req?.params?.agentId as string | undefined) ??
          runtime.agentId;

        if (!requestAgentId) {
          if (typeof res.status === 'function') {
            res.status(400);
          }
          res.json({
            success: false,
            error: 'agentId is required to build an A2A card',
          });
          return;
        }

        try {
          const agentRecord = await runtime.getAgent(requestAgentId);

          if (!agentRecord) {
            if (typeof res.status === 'function') {
              res.status(404);
            }
            res.json({
              success: false,
              error: `Agent ${requestAgentId} was not found`,
            });
            return;
          }

          res.json({
            success: true,
            data: buildA2ACardPayload({ ...agentRecord, id: requestAgentId }),
          });
        } catch (error) {
          logger.error({ error }, 'Failed to build A2A endpoint response');
          if (typeof res.status === 'function') {
            res.status(500);
          }
          res.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown A2A error',
          });
        }
      },
    },
    {
      name: 'create-telegram-agent',
      path: '/agents',
      type: 'POST',
      handler: async (req: any, res: any, runtime: IAgentRuntime) => {
        const body = req.body ?? {};

        try {
          const parsedBody = await createAgentSchema.parseAsync(body);
          const existingAgents = (await runtime.getAgents()) ?? [];
          const loweredName = parsedBody.name.trim().toLowerCase();
          const duplicate = existingAgents.some(
            (agent) => agent.name?.trim().toLowerCase() === loweredName
          );

          if (duplicate) {
            if (typeof res.status === 'function') {
              res.status(409);
            }
            res.json({
              success: false,
              error: {
                code: 'AGENT_EXISTS',
                message: `Agent with name "${parsedBody.name}" already exists`,
              },
            });
            return;
          }

          const agentId = randomUUID();
          const now = Date.now();
          const desiredPlugins = new Set([...DEFAULT_PLUGINS, ...(parsedBody.plugins ?? [])]);

          // Telegram support must always be present for this API
          desiredPlugins.add('@elizaos/plugin-telegram');

          const agentRecord = {
            id: agentId,
            name: parsedBody.name,
            username: parsedBody.username,
            system: parsedBody.prompt,
            bio: formatBio(parsedBody.bio),
            topics: parsedBody.topics ?? [],
            plugins: Array.from(desiredPlugins),
            settings: {
              avatar:
                parsedBody.avatar ??
                runtime.character.settings?.avatar ??
                'https://elizaos.github.io/eliza-avatars/Eliza/portrait.png',
              secrets: {
                TELEGRAM_BOT_TOKEN: parsedBody.telegramToken,
              },
            },
            enabled: true,
            status: AgentStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
          };

          const baseUrl = resolveServerBaseUrl(req);
          const a2aEndpoint = buildA2AEndpoint(baseUrl, agentId);

          const created = await runtime.createAgent(agentRecord);

          if (!created) {
            throw new Error('Failed to persist agent');
          }

          const agent0Registration = await registerAgentWithAgent0({
            name: parsedBody.name,
            description: parsedBody.prompt,
            image: agentRecord.settings.avatar,
            a2aEndpoint,
            mcpEndpoint: process.env.AGENT0_MCP_ENDPOINT,
            ensName: parsedBody.ensName ?? process.env.AGENT0_ENS_NAME,
            walletAddress:
              parsedBody.agentWallet ?? process.env.AGENT0_AGENT_WALLET,
            topics: agentRecord.topics,
          });

          let startStatus: 'skipped' | 'started' | 'failed' = 'skipped';
          let startError: string | undefined;
          const shouldAutoStart = parsedBody.autoStart ?? true;

          if (shouldAutoStart) {
            try {
              const startResponse = await fetch(`${baseUrl}/api/agents/${agentId}/start`, {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                },
              });
              if (startResponse.ok) {
                startStatus = 'started';
              } else {
                startStatus = 'failed';
                const payload = await startResponse.text();
                startError = payload || 'Failed to start agent';
              }
            } catch (startErr) {
              startStatus = 'failed';
              startError =
                startErr instanceof Error ? startErr.message : 'Failed to reach agent start API';
              logger.error({ error: startErr }, 'Auto-start failed for created agent');
            }
          }

          if (typeof res.status === 'function') {
            res.status(201);
          }

          res.json({
            success: true,
            data: {
              agentId,
              name: parsedBody.name,
              plugins: agentRecord.plugins,
              telegramConfigured: true,
              a2aEndpoint,
              agent0: agent0Registration,
              autoStart: {
                enabled: shouldAutoStart,
                status: startStatus,
                error: startError,
              },
            },
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            if (typeof res.status === 'function') {
              res.status(400);
            }
            res.json({
              success: false,
              error: {
                code: 'INVALID_REQUEST',
                message: error.issues.map((issue) => issue.message).join(', '),
              },
            });
            return;
          }

          logger.error({ error }, 'Failed to create agent via API');
          if (typeof res.status === 'function') {
            res.status(500);
          }
          res.json({
            success: false,
            error: {
              code: 'AGENT_CREATE_FAILED',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }
      },
    },
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.info('MESSAGE_RECEIVED event received');
        // print the keys
        logger.info(
          { keys: Object.keys(params) },
          'MESSAGE_RECEIVED param keys'
        );
      },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info('VOICE_MESSAGE_RECEIVED event received');
        // print the keys
        logger.info(
          { keys: Object.keys(params) },
          'VOICE_MESSAGE_RECEIVED param keys'
        );
      },
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info('WORLD_CONNECTED event received');
        // print the keys
        logger.info(
          { keys: Object.keys(params) },
          'WORLD_CONNECTED param keys'
        );
      },
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info('WORLD_JOINED event received');
        // print the keys
        logger.info({ keys: Object.keys(params) }, 'WORLD_JOINED param keys');
      },
    ],
  },
  services: [StarterService],
  actions: [helloWorldAction],
  providers: [helloWorldProvider],
};

export default plugin;
