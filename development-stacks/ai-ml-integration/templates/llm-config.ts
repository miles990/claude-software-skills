/**
 * LLM Configuration Template
 * Usage: Configure multiple LLM providers with fallback
 */

// ===========================================
// Types
// ===========================================

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'local';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// ===========================================
// Provider Configurations
// ===========================================

export const PROVIDER_CONFIGS: Record<string, Partial<LLMConfig>> = {
  // OpenAI
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 4096,
  },
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxTokens: 4096,
  },

  // Anthropic
  'claude-sonnet': {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 8192,
  },
  'claude-haiku': {
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    maxTokens: 8192,
  },

  // Google
  'gemini-pro': {
    provider: 'google',
    model: 'gemini-2.0-flash',
    maxTokens: 8192,
  },

  // Local (Ollama)
  'llama3': {
    provider: 'local',
    model: 'llama3',
    baseUrl: 'http://localhost:11434/v1',
    maxTokens: 4096,
  },
};

// ===========================================
// Default Configuration
// ===========================================

export const DEFAULT_CONFIG: LLMConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  maxTokens: 4096,
  temperature: 0.7,
  timeout: 30000,
};

// ===========================================
// Environment-based Configuration
// ===========================================

export function getConfigFromEnv(): LLMConfig {
  const provider = process.env.LLM_PROVIDER as LLMConfig['provider'] || 'openai';

  const apiKeys: Record<string, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    azure: process.env.AZURE_OPENAI_API_KEY,
    local: undefined,
  };

  return {
    provider,
    model: process.env.LLM_MODEL || DEFAULT_CONFIG.model,
    apiKey: apiKeys[provider],
    baseUrl: process.env.LLM_BASE_URL,
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '') || DEFAULT_CONFIG.maxTokens,
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '') || DEFAULT_CONFIG.temperature,
    timeout: parseInt(process.env.LLM_TIMEOUT || '') || DEFAULT_CONFIG.timeout,
  };
}

// ===========================================
// LLM Client Factory
// ===========================================

export function createLLMClient(config: Partial<LLMConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return {
    config: finalConfig,

    async chat(messages: LLMMessage[]): Promise<LLMResponse> {
      // Implementation depends on provider
      // This is a template - implement based on your SDK choice
      throw new Error(`Implement chat() for provider: ${finalConfig.provider}`);
    },

    async complete(prompt: string): Promise<string> {
      const response = await this.chat([{ role: 'user', content: prompt }]);
      return response.content;
    },

    async stream(messages: LLMMessage[]): AsyncGenerator<string> {
      // Streaming implementation
      throw new Error(`Implement stream() for provider: ${finalConfig.provider}`);
    },
  };
}

// ===========================================
// Retry & Fallback Utilities
// ===========================================

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, initialDelay, maxDelay, backoffMultiplier } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) break;

      // Check if error is retryable
      const isRetryable = isRetryableError(error);
      if (!isRetryable) throw error;

      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Rate limit errors
    if (error.message.includes('rate limit')) return true;
    if (error.message.includes('429')) return true;

    // Temporary server errors
    if (error.message.includes('500')) return true;
    if (error.message.includes('502')) return true;
    if (error.message.includes('503')) return true;

    // Network errors
    if (error.message.includes('ECONNRESET')) return true;
    if (error.message.includes('ETIMEDOUT')) return true;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===========================================
// Fallback Chain
// ===========================================

export async function withFallback<T>(
  primary: () => Promise<T>,
  fallbacks: Array<() => Promise<T>>
): Promise<T> {
  try {
    return await primary();
  } catch (primaryError) {
    console.warn('Primary LLM failed, trying fallbacks...', primaryError);

    for (let i = 0; i < fallbacks.length; i++) {
      try {
        console.log(`Trying fallback ${i + 1}...`);
        return await fallbacks[i]();
      } catch (fallbackError) {
        console.warn(`Fallback ${i + 1} failed`, fallbackError);
      }
    }

    throw new Error('All LLM providers failed');
  }
}

// ===========================================
// Usage Example
// ===========================================

/*
import { createLLMClient, getConfigFromEnv, withRetry, withFallback } from './llm-config';

// Simple usage
const client = createLLMClient(getConfigFromEnv());
const response = await client.complete('Hello, world!');

// With retry
const response = await withRetry(
  () => client.complete('Hello!'),
  { maxRetries: 3 }
);

// With fallback
const response = await withFallback(
  () => createLLMClient({ model: 'gpt-4o' }).complete('Hello!'),
  [
    () => createLLMClient({ model: 'claude-sonnet' }).complete('Hello!'),
    () => createLLMClient({ model: 'gemini-pro' }).complete('Hello!'),
  ]
);
*/
