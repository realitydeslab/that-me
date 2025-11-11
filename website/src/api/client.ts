import type { CreateAgentRequest, CreateAgentResponse, ApiResponse } from '@/types';

/**
 * API base URL from environment variables
 */
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  'https://3d2353fa9b82e7de87a7b3711961ebefdf3aa2f8-3000.dstack-pha-prod9.phala.network';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || `API error: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or parsing errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to connect to API',
      0,
      error
    );
  }
}

/**
 * Create a new agent
 * @param data Agent configuration data
 * @returns Created agent information
 */
export async function createAgent(data: CreateAgentRequest): Promise<CreateAgentResponse> {
  // TODO: Replace with actual agentId when available
  // For now, generate a temporary UUID or get from context
  const agentId = 'temp-agent-id';

  const response = await apiFetch<CreateAgentResponse>(
    `/api/agents/${agentId}/plugins/starter/agents?agentId=${agentId}`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  if (!response.success || !response.data) {
    throw new ApiError('Failed to create agent');
  }

  return response.data;
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ status: string }> {
  const response = await apiFetch<{ status: string }>('/health');
  return response.data || { status: 'unknown' };
}
