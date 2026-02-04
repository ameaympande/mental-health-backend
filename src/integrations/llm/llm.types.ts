export interface LlmRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface LlmResponse {
  text: string;
}

export class LlmTimeoutError extends Error {
  constructor(message = 'LLM timed out') {
    super(message);
    this.name = 'LlmTimeoutError';
  }
}

export class LlmProviderError extends Error {
  constructor(message = 'LLM request failed') {
    super(message);
    this.name = 'LlmProviderError';
  }
}

