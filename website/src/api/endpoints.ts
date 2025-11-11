/**
 * API endpoint definitions
 */

export const API_ENDPOINTS = {
  // Agent management
  createAgent: (agentId: string) =>
    `/api/agents/${agentId}/plugins/starter/agents?agentId=${agentId}`,
  getAgent: (agentId: string) =>
    `/api/agents/${agentId}/plugins/starter/agent-info?agentId=${agentId}`,

  // Health checks
  health: '/health',
  healthDetailed: '/health/detailed',
  apiStatus: '/api/status',
} as const;
