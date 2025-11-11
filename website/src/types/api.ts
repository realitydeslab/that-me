import type { AgentFormData } from './agent';

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Agent creation response
 */
export interface CreateAgentResponse {
  agentId: string;
  name: string;
  telegramBotUsername?: string;
  createdAt: string;
}

/**
 * API error structure
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Agent creation request payload
 */
export type CreateAgentRequest = AgentFormData;
