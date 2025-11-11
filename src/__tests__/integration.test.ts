import { IAgentRuntime, logger, Plugin } from '@elizaos/core';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterAll, beforeAll, describe, expect, it, mock, spyOn } from 'bun:test';
import { character } from '../index';
import plugin from '../plugin';

const createMockResponse = () => {
  return {
    statusCode: 200,
    payload: null as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.payload = data;
      return this;
    },
  };
};

// Set up spies on logger
beforeAll(() => {
  spyOn(logger, 'info').mockImplementation(() => {});
  spyOn(logger, 'error').mockImplementation(() => {});
  spyOn(logger, 'warn').mockImplementation(() => {});
  spyOn(logger, 'debug').mockImplementation(() => {});
});

afterAll(() => {
  // No global restore needed in bun:test;
});

// Skip in CI environments or when running automated tests without interaction
const isCI = Boolean(process.env.CI);

/**
 * Integration tests demonstrate how multiple components of the project work together.
 * Unlike unit tests that test individual functions in isolation, integration tests
 * examine how components interact with each other.
 */
describe('Integration: Project Structure and Components', () => {
  it('should have a valid package structure', () => {
    const srcDir = path.join(process.cwd(), 'src');
    expect(fs.existsSync(srcDir)).toBe(true);

    // Check for required source files - only checking core files
    const srcFiles = [path.join(srcDir, 'index.ts'), path.join(srcDir, 'plugin.ts')];

    srcFiles.forEach((file) => {
      expect(fs.existsSync(file)).toBe(true);
    });
  });

  it('should have dist directory for build outputs', () => {
    const distDir = path.join(process.cwd(), 'dist');

    // Skip directory content validation if dist doesn't exist yet
    if (!fs.existsSync(distDir)) {
      logger.warn('Dist directory does not exist yet. Build the project first.');
      return;
    }

    expect(fs.existsSync(distDir)).toBe(true);
  });
});

describe('Integration: Character and Plugin', () => {
  it('should have character with required properties', () => {
    // Verify character has required properties
    expect(character).toHaveProperty('name');
    expect(character).toHaveProperty('plugins');
    expect(character).toHaveProperty('bio');
    expect(character).toHaveProperty('system');
    expect(character).toHaveProperty('messageExamples');

    // Verify plugins is an array
    expect(Array.isArray(character.plugins)).toBe(true);
  });

  it('should configure plugin correctly', () => {
    // Verify plugin has necessary components that character will use
    expect(plugin).toHaveProperty('name');
    expect(plugin).toHaveProperty('description');
    expect(plugin).toHaveProperty('init');

    // Check if plugin has actions, models, providers, etc. that character might use
    const components = ['models', 'actions', 'providers', 'services', 'routes', 'events'];
    components.forEach((component) => {
      if ((plugin as any)[component]) {
        // Just verify if these exist, we don't need to test their functionality here
        // Those tests belong in plugin.test.ts, actions.test.ts, etc.
        expect(
          Array.isArray((plugin as any)[component]) ||
            typeof (plugin as any)[component] === 'object'
        ).toBeTruthy();
      }
    });
  });
});

describe('Integration: Plugin Agent Info API', () => {
  it('should expose an agent-info route that returns runtime data', async () => {
    const agentInfoRoute = plugin.routes?.find((route) => route.path === '/agent-info');
    expect(agentInfoRoute).toBeDefined();

    const runtimeMock = {
      agentId: '00000000-0000-0000-0000-000000000000',
      character: { ...character },
      plugins: [plugin],
      actions: [{ name: 'HELLO_WORLD' }],
      providers: [{ name: 'HELLO_WORLD_PROVIDER' }],
      routes: plugin.routes ?? [],
      getRegisteredServiceTypes: () => ['starter'],
      getAgent: async () => ({ id: '00000000-0000-0000-0000-000000000000', name: 'Eliza' }),
      getAgents: async () => [{ id: '00000000-0000-0000-0000-000000000000' }],
    } as unknown as IAgentRuntime;

    const mockResponse = createMockResponse();

    await agentInfoRoute?.handler?.({} as any, mockResponse, runtimeMock);

    expect(mockResponse.statusCode).toBe(200);
    expect(mockResponse.payload?.success).toBe(true);
    expect(mockResponse.payload?.data.agentId).toBe(runtimeMock.agentId);
    expect(mockResponse.payload?.data.routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/agent-info',
          type: 'GET',
        }),
      ])
    );
  });
});

describe('Integration: Plugin Agent Bootstrap API', () => {
  it('should create a telegram-ready agent via POST route', async () => {
    const createRoute = plugin.routes?.find(
      (route) => route.path === '/agents' && route.type === 'POST'
    );
    expect(createRoute).toBeDefined();

    const fetchMock = mock(async () => ({
      ok: true,
      json: async () => ({ success: true }),
      text: async () => '',
    }));
    globalThis.fetch = fetchMock as any;

    const runtimeMock = {
      character: { ...character },
      getAgents: mock().mockResolvedValue([]),
      createAgent: mock().mockResolvedValue(true),
    } as unknown as IAgentRuntime;

    const req = {
      body: {
        name: 'TG Helper',
        prompt: 'You are a helpful assistant.',
        telegramToken: 'fake-token',
      },
    };
    const res = createMockResponse();

    await createRoute?.handler?.(req as any, res, runtimeMock);

    expect(runtimeMock.createAgent).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/start');
    expect(res.statusCode).toBe(201);
    expect(res.payload?.success).toBe(true);
    expect(res.payload?.data?.telegramConfigured).toBe(true);
    expect(res.payload?.data?.a2aEndpoint).toContain('/plugins/starter/a2a-card');
    expect(res.payload?.data?.agent0).toEqual(
      expect.objectContaining({
        attempted: false,
        success: false,
        a2aEndpoint: res.payload?.data?.a2aEndpoint,
      })
    );
    expect(res.payload?.data?.autoStart).toEqual(
      expect.objectContaining({
        enabled: true,
        status: 'started',
      })
    );

    globalThis.fetch = originalFetch;
  });

  it('should reject duplicates by name', async () => {
    const createRoute = plugin.routes?.find(
      (route) => route.path === '/agents' && route.type === 'POST'
    );
    expect(createRoute).toBeDefined();

    const fetchMock = mock();
    globalThis.fetch = fetchMock as any;

    const runtimeMock = {
      character: { ...character },
      getAgents: mock().mockResolvedValue([{ name: 'TG Helper' }]),
      createAgent: mock().mockResolvedValue(true),
    } as unknown as IAgentRuntime;

    const req = {
      body: {
        name: 'TG Helper',
        prompt: 'Prompt',
        telegramToken: 'token',
      },
    };
    const res = createMockResponse();

    await createRoute?.handler?.(req as any, res, runtimeMock);

    expect(runtimeMock.createAgent).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(409);
    expect(res.payload?.success).toBe(false);
    expect(res.payload?.error?.code).toBe('AGENT_EXISTS');

    globalThis.fetch = originalFetch;
  });

  it('should allow disabling auto start', async () => {
    const createRoute = plugin.routes?.find(
      (route) => route.path === '/agents' && route.type === 'POST'
    );
    expect(createRoute).toBeDefined();

    const fetchMock = mock();
    globalThis.fetch = fetchMock as any;

    const runtimeMock = {
      character: { ...character },
      getAgents: mock().mockResolvedValue([]),
      createAgent: mock().mockResolvedValue(true),
    } as unknown as IAgentRuntime;

    const req = {
      body: {
        name: 'No Auto',
        prompt: 'Prompt',
        telegramToken: 'token',
        autoStart: false,
      },
    };
    const res = createMockResponse();

    await createRoute?.handler?.(req as any, res, runtimeMock);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.payload?.data?.autoStart).toEqual(
      expect.objectContaining({
        enabled: false,
        status: 'skipped',
      })
    );

    globalThis.fetch = originalFetch;
  });
});

describe('Integration: Plugin Agent A2A API', () => {
  it('should expose an a2a-card route with agent metadata', async () => {
    const a2aRoute = plugin.routes?.find((route) => route.path === '/a2a-card');
    expect(a2aRoute).toBeDefined();

    const runtimeMock = {
      agentId: '1234',
      getAgent: mock().mockResolvedValue({
        id: '1234',
        name: 'Test Agent',
        system: 'Always help',
        topics: ['care'],
        plugins: ['starter'],
        settings: { avatar: 'https://example.com/avatar.png' },
      }),
    } as unknown as IAgentRuntime;

    const req = { query: { agentId: '1234' } };
    const res = createMockResponse();

    await a2aRoute?.handler?.(req as any, res, runtimeMock);

    expect(res.statusCode).toBe(200);
    expect(res.payload?.success).toBe(true);
    expect(res.payload?.data?.agentId).toBe('1234');
    expect(res.payload?.data?.version).toBe(process.env.AGENT0_A2A_VERSION ?? '0.30');
  });
});

describe('Integration: Runtime Initialization', () => {
  it('should create a mock runtime with character and plugin', async () => {
    // Create a custom mock runtime for this test
    const customMockRuntime = {
      character: { ...character },
      plugins: [],
      registerPlugin: mock().mockImplementation((plugin: Plugin) => {
        // In a real runtime, registering the plugin would call its init method,
        // but since we're testing init itself, we just need to record the call
        return Promise.resolve();
      }),
      initialize: mock(),
      getService: mock(),
      getSetting: mock().mockReturnValue(null),
      useModel: mock().mockResolvedValue('Test model response'),
      getProviderResults: mock().mockResolvedValue([]),
      evaluateProviders: mock().mockResolvedValue([]),
      evaluate: mock().mockResolvedValue([]),
    } as unknown as IAgentRuntime;

    // Ensure we're testing safely - to avoid parallel test race conditions
    const originalInit = plugin.init;
    let initCalled = false;

    // Mock the plugin.init method using mock instead of direct assignment
    if (plugin.init) {
      plugin.init = mock(async (config, runtime) => {
        // Set flag to indicate our wrapper was called
        initCalled = true;

        // Call original if it exists
        if (originalInit) {
          await originalInit(config, runtime);
        }

        // Register plugin
        await runtime.registerPlugin(plugin);
      });
    }

    try {
      // Initialize plugin in runtime
      if (plugin.init) {
        await plugin.init({ EXAMPLE_PLUGIN_VARIABLE: 'test-value' }, customMockRuntime);
      }

      // Verify our wrapper was called
      expect(initCalled).toBe(true);

      // Check if registerPlugin was called
      expect(customMockRuntime.registerPlugin).toHaveBeenCalled();
    } catch (error) {
      console.error('Error initializing plugin:', error);
      throw error;
    } finally {
      // Restore the original init method to avoid affecting other tests
      plugin.init = originalInit;
    }
  });
});

// Skip scaffolding tests in CI environments as they modify the filesystem
const describeScaffolding = isCI ? describe.skip : describe;
describeScaffolding('Integration: Project Scaffolding', () => {
  // Create a temp directory for testing the scaffolding
  const TEST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'eliza-test-'));

  beforeAll(() => {
    // Create test directory if it doesn't exist
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should scaffold a new project correctly', () => {
    try {
      // This is a simple simulation of the scaffolding process
      // In a real scenario, you'd use the CLI or API to scaffold

      // Copy essential files to test directory
      const srcFiles = ['index.ts', 'plugin.ts', 'character.ts'];

      for (const file of srcFiles) {
        const sourceFilePath = path.join(process.cwd(), 'src', file);
        const targetFilePath = path.join(TEST_DIR, file);

        if (fs.existsSync(sourceFilePath)) {
          fs.copyFileSync(sourceFilePath, targetFilePath);
        }
      }

      // Create package.json in test directory
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
        type: 'module',
        dependencies: {
          '@elizaos/core': 'workspace:*',
        },
      };

      fs.writeFileSync(path.join(TEST_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));

      // Verify files exist
      expect(fs.existsSync(path.join(TEST_DIR, 'index.ts'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'plugin.ts'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'character.ts'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'package.json'))).toBe(true);
    } catch (error) {
      logger.error({ error }, 'Error in scaffolding test:');
      throw error;
    }
  });
});
const originalFetch = globalThis.fetch;

afterAll(() => {
  globalThis.fetch = originalFetch;
});
