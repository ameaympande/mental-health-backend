import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmRequest, LlmResponse, LlmTimeoutError, LlmProviderError } from './llm.types';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly defaultTimeoutMs: number;

  constructor(private readonly config: ConfigService) {
    this.defaultTimeoutMs = this.config.get<number>('ai.timeoutMs') ?? 6000;
  }

  async generate(request: LlmRequest): Promise<LlmResponse> {
    const timeoutMs = request.timeoutMs ?? this.defaultTimeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const text = await this.callProvider(request, controller.signal);
      return { text };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        this.logger.warn('LLM request timed out');
        throw new LlmTimeoutError();
      }

      this.logger.error('LLM provider error', {
        message: err?.message,
      });
      throw new LlmProviderError();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async callProvider(req: LlmRequest, _signal: AbortSignal): Promise<string> {
    // Placeholder implementation. Wire this up to your LLM provider
    // (e.g. OpenAI) using req.prompt, req.maxTokens, req.temperature, and _signal.
    // For now, we signal that a provider is not configured.
    this.logger.warn('LLM provider not configured; returning empty response');
    return '';
  }
}

