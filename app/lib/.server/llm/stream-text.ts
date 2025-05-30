import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { getModel, FREE_LLM_CONFIGS, type LLMConfig } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import { env } from 'node:process';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

function getLLMConfig(cloudflareEnv: Env, preferredModel?: string): LLMConfig {
  // Get provider and model from environment or use preferred model
  const modelKey = preferredModel || env.DEFAULT_LLM_MODEL || cloudflareEnv.DEFAULT_LLM_MODEL || 'groq-llama-3.1-8b';

  // Get the base config
  const baseConfig = FREE_LLM_CONFIGS[modelKey];
  if (!baseConfig) {
    throw new Error(`Unknown model configuration: ${modelKey}`);
  }

  // Get the appropriate API key
  let apiKey: string | undefined;
  switch (baseConfig.provider) {
    case 'anthropic':
      apiKey = env.ANTHROPIC_API_KEY || cloudflareEnv.ANTHROPIC_API_KEY;
      break;
    case 'groq':
      apiKey = env.GROQ_API_KEY || cloudflareEnv.GROQ_API_KEY;
      break;
    case 'huggingface':
      apiKey = env.HUGGINGFACE_API_KEY || cloudflareEnv.HUGGINGFACE_API_KEY;
      break;
    case 'google':
      apiKey = env.GOOGLE_API_KEY || cloudflareEnv.GOOGLE_API_KEY;
      break;
    case 'ollama':
      // Ollama doesn't need an API key
      apiKey = 'ollama';
      break;
    case 'together':
      apiKey = env.TOGETHER_API_KEY || cloudflareEnv.TOGETHER_API_KEY;
      break;
    case 'fireworks':
      apiKey = env.FIREWORKS_API_KEY || cloudflareEnv.FIREWORKS_API_KEY;
      break;
    case 'deepseek':
      apiKey = env.DEEPSEEK_API_KEY || cloudflareEnv.DEEPSEEK_API_KEY;
      break;
    case 'openrouter':
      apiKey = env.OPENROUTER_API_KEY || cloudflareEnv.OPENROUTER_API_KEY;
      break;
    case 'perplexity':
      apiKey = env.PERPLEXITY_API_KEY || cloudflareEnv.PERPLEXITY_API_KEY;
      break;
    case 'openai':
      apiKey = env.OPENAI_API_KEY || cloudflareEnv.OPENAI_API_KEY;
      break;
  }

  return {
    ...baseConfig,
    apiKey,
  };
}

export function streamText(messages: Messages, cloudflareEnv: Env, options?: StreamingOptions, preferredModel?: string) {
  const config = getLLMConfig(cloudflareEnv, preferredModel);
  const model = getModel(config);

  // Different headers for different providers
  const headers: Record<string, string> = {};
  if (config.provider === 'anthropic') {
    headers['anthropic-beta'] = 'max-tokens-3-5-sonnet-2024-07-15';
  }

  return _streamText({
    model,
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    headers,
    messages: convertToCoreMessages(messages),
    ...options,
  });
}
