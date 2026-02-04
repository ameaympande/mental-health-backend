import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../integrations/llm/llm.service';
import { LlmTimeoutError, LlmProviderError } from '../integrations/llm/llm.types';
import {
  JournalReflectionContext,
  buildJournalReflectionPrompt,
} from './prompts/journal-reflection.prompt';
import {
  DailyInsightContext,
  buildDailyInsightsPrompt,
} from './prompts/daily-insights.prompt';
import {
  WeeklySummaryContext,
  buildWeeklySummaryPrompt,
} from './prompts/weekly-summary.prompt';
import {
  SentimentContext,
  buildSentimentPrompt,
} from './prompts/sentiment.prompt';
import { SafetyPolicy } from './policies/safety.policy';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly llm: LlmService) {}

  async generateJournalReflection(ctx: JournalReflectionContext): Promise<string> {
    const prompt = buildJournalReflectionPrompt(ctx);
    try {
      const res = await this.llm.generate({
        prompt,
        maxTokens: 400,
        temperature: 0.5,
      });
      return SafetyPolicy.sanitizeFreeText(res.text);
    } catch (err) {
      this.logger.warn(
        `Journal reflection failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return SafetyPolicy.fallbackReflection();
    }
  }

  async generateDailyInsights(ctx: DailyInsightContext): Promise<string> {
    const prompt = buildDailyInsightsPrompt(ctx);
    try {
      const res = await this.llm.generate({
        prompt,
        maxTokens: 320,
        temperature: 0.5,
      });
      return SafetyPolicy.sanitizeFreeText(res.text);
    } catch (err) {
      this.logger.warn(
        `Daily insights failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return SafetyPolicy.fallbackReflection();
    }
  }

  async generateWeeklySummary(ctx: WeeklySummaryContext): Promise<string> {
    const prompt = buildWeeklySummaryPrompt(ctx);
    try {
      const res = await this.llm.generate({
        prompt,
        maxTokens: 500,
        temperature: 0.5,
      });
      return SafetyPolicy.sanitizeFreeText(res.text);
    } catch (err) {
      this.logger.warn(
        `Weekly summary failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return SafetyPolicy.fallbackSummary();
    }
  }

  async analyzeSentiment(ctx: SentimentContext): Promise<{
    overall: string;
    emotions: Record<string, number>;
  }> {
    const prompt = buildSentimentPrompt(ctx);
    try {
      const res = await this.llm.generate({
        prompt,
        maxTokens: 200,
        temperature: 0,
      });

      try {
        const parsed = JSON.parse(res.text);
        return parsed;
      } catch {
        this.logger.warn(
          'Failed to parse sentiment JSON, returning neutral default',
        );
        return {
          overall: 'neutral',
          emotions: {
            joy: 0.0,
            sadness: 0.0,
            anxiety: 0.0,
            anger: 0.0,
            calm: 0.0,
          },
        };
      }
    } catch (err) {
      if (err instanceof LlmTimeoutError) {
        this.logger.warn('Sentiment analysis timed out, defaulting to neutral');
      } else if (err instanceof LlmProviderError) {
        this.logger.error('Sentiment provider error');
      }
      return {
        overall: 'neutral',
        emotions: {
          joy: 0.0,
          sadness: 0.0,
          anxiety: 0.0,
          anger: 0.0,
          calm: 0.0,
        },
      };
    }
  }
}

