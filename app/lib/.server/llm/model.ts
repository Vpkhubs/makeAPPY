import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Free LLM Providers Configuration
export type LLMProvider = 'anthropic' | 'groq' | 'ollama' | 'huggingface' | 'google' | 'together' | 'fireworks' | 'deepseek' | 'openrouter' | 'perplexity' | 'openai';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  baseURL?: string;
}

// Default free LLM configurations
export const FREE_LLM_CONFIGS: Record<string, LLMConfig> = {
  // 🔥 GAME CHANGER: DeepSeek R1 (o1-level performance at 1/20th cost!)
  'deepseek-r1': {
    provider: 'deepseek',
    model: 'deepseek-reasoner',
    baseURL: 'https://api.deepseek.com/v1',
  },
  'deepseek-r1-distill-qwen-32b': {
    provider: 'deepseek',
    model: 'deepseek-r1-distill-qwen-32b',
    baseURL: 'https://api.deepseek.com/v1',
  },
  'deepseek-r1-distill-llama-70b': {
    provider: 'deepseek',
    model: 'deepseek-r1-distill-llama-70b',
    baseURL: 'https://api.deepseek.com/v1',
  },

  // 🚀 Groq (Free API with Llama models) - UPDATED 2025
  'groq-llama-3.3-70b': {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    baseURL: 'https://api.groq.com/openai/v1',
  },
  'groq-llama-3.1-70b': {
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
    baseURL: 'https://api.groq.com/openai/v1',
  },
  'groq-llama-3.1-8b': {
    provider: 'groq',
    model: 'llama-3.1-8b-instant',
    baseURL: 'https://api.groq.com/openai/v1',
  },
  'groq-gemma2-9b': {
    provider: 'groq',
    model: 'gemma2-9b-it',
    baseURL: 'https://api.groq.com/openai/v1',
  },
  'groq-deepseek-r1-distill': {
    provider: 'groq',
    model: 'deepseek-r1-distill-llama-70b',
    baseURL: 'https://api.groq.com/openai/v1',
  },
  // 🏠 Ollama (Local models) - UPDATED 2025
  'ollama-llama3.3': {
    provider: 'ollama',
    model: 'llama3.3:70b',
    baseURL: 'http://localhost:11434',
  },
  'ollama-llama3.1': {
    provider: 'ollama',
    model: 'llama3.1:8b',
    baseURL: 'http://localhost:11434',
  },
  'ollama-qwen2.5': {
    provider: 'ollama',
    model: 'qwen2.5:7b',
    baseURL: 'http://localhost:11434',
  },
  'ollama-deepseek-r1': {
    provider: 'ollama',
    model: 'deepseek-r1:7b',
    baseURL: 'http://localhost:11434',
  },
  // 🤗 Hugging Face (Free API) - UPDATED 2025
  'hf-qwen3-32b': {
    provider: 'huggingface',
    model: 'Qwen/Qwen3-32B-Instruct',
    baseURL: 'https://api-inference.huggingface.co/models',
  },
  'hf-qwen2.5': {
    provider: 'huggingface',
    model: 'Qwen/Qwen2.5-72B-Instruct',
    baseURL: 'https://api-inference.huggingface.co/models',
  },
  'hf-llama3.3-70b': {
    provider: 'huggingface',
    model: 'meta-llama/Llama-3.3-70B-Instruct',
    baseURL: 'https://api-inference.huggingface.co/models',
  },
  'hf-llama3.1': {
    provider: 'huggingface',
    model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    baseURL: 'https://api-inference.huggingface.co/models',
  },
  'hf-deepseek-r1-distill': {
    provider: 'huggingface',
    model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    baseURL: 'https://api-inference.huggingface.co/models',
  },
  'hf-codellama': {
    provider: 'huggingface',
    model: 'codellama/CodeLlama-34b-Instruct-hf',
    baseURL: 'https://api-inference.huggingface.co/models',
  },

  // 🤝 Together AI (Free tier) - UPDATED 2025
  'together-deepseek-r1-free': {
    provider: 'together',
    model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    baseURL: 'https://api.together.xyz/v1',
  },
  'together-llama3.3-70b': {
    provider: 'together',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    baseURL: 'https://api.together.xyz/v1',
  },
  'together-llama3.1-70b': {
    provider: 'together',
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    baseURL: 'https://api.together.xyz/v1',
  },
  'together-qwen3-32b': {
    provider: 'together',
    model: 'Qwen/Qwen3-32B-Instruct-Turbo',
    baseURL: 'https://api.together.xyz/v1',
  },
  'together-qwen2.5': {
    provider: 'together',
    model: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
    baseURL: 'https://api.together.xyz/v1',
  },

  // Fireworks AI (Free tier)
  'fireworks-llama3.1-8b': {
    provider: 'fireworks',
    model: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
    baseURL: 'https://api.fireworks.ai/inference/v1',
  },
  'fireworks-llama3.1-70b': {
    provider: 'fireworks',
    model: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
    baseURL: 'https://api.fireworks.ai/inference/v1',
  },
  'fireworks-qwen2.5': {
    provider: 'fireworks',
    model: 'accounts/fireworks/models/qwen2p5-7b-instruct',
    baseURL: 'https://api.fireworks.ai/inference/v1',
  },

  // DeepSeek (Very cheap/free tier)
  'deepseek-coder': {
    provider: 'deepseek',
    model: 'deepseek-coder',
    baseURL: 'https://api.deepseek.com/v1',
  },
  'deepseek-chat': {
    provider: 'deepseek',
    model: 'deepseek-chat',
    baseURL: 'https://api.deepseek.com/v1',
  },

  // OpenRouter (Free tier)
  'openrouter-llama3.1-8b': {
    provider: 'openrouter',
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    baseURL: 'https://openrouter.ai/api/v1',
  },
  'openrouter-qwen2.5': {
    provider: 'openrouter',
    model: 'qwen/qwen-2.5-7b-instruct:free',
    baseURL: 'https://openrouter.ai/api/v1',
  },
  'openrouter-mistral': {
    provider: 'openrouter',
    model: 'mistralai/mistral-7b-instruct:free',
    baseURL: 'https://openrouter.ai/api/v1',
  },

  // 🔍 Google Gemini (Free tier) - UPDATED 2025
  'google-gemini-2.0-flash': {
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  },
  'google-gemini-1.5-flash': {
    provider: 'google',
    model: 'gemini-1.5-flash',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  },
  'google-gemini-1.5-pro': {
    provider: 'google',
    model: 'gemini-1.5-pro',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  },

  // 🧠 OpenAI (Latest 2025)
  'openai-o3': {
    provider: 'openai',
    model: 'o3',
    baseURL: 'https://api.openai.com/v1',
  },
  'openai-o4-mini': {
    provider: 'openai',
    model: 'o4-mini',
    baseURL: 'https://api.openai.com/v1',
  },
  'openai-gpt-4.1': {
    provider: 'openai',
    model: 'gpt-4.1',
    baseURL: 'https://api.openai.com/v1',
  },
  'openai-gpt-4.1-mini': {
    provider: 'openai',
    model: 'gpt-4.1-mini',
    baseURL: 'https://api.openai.com/v1',
  },
  'openai-gpt-4.1-nano': {
    provider: 'openai',
    model: 'gpt-4.1-nano',
    baseURL: 'https://api.openai.com/v1',
  },

  // 🤖 Anthropic Claude (Latest 2025)
  'anthropic-claude-4-sonnet': {
    provider: 'anthropic',
    model: 'claude-4-sonnet-20250514',
    baseURL: 'https://api.anthropic.com',
  },
  'anthropic-claude-4-opus': {
    provider: 'anthropic',
    model: 'claude-4-opus-20250514',
    baseURL: 'https://api.anthropic.com',
  },
  'anthropic-claude-3.7-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-7-sonnet-20250219',
    baseURL: 'https://api.anthropic.com',
  },
  'anthropic-claude-3.5-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    baseURL: 'https://api.anthropic.com',
  },

  // Perplexity (Free tier)
  'perplexity-llama3.1-8b': {
    provider: 'perplexity',
    model: 'llama-3.1-8b-instruct',
    baseURL: 'https://api.perplexity.ai',
  },
  'perplexity-mixtral': {
    provider: 'perplexity',
    model: 'mixtral-8x7b-instruct',
    baseURL: 'https://api.perplexity.ai',
  },
};

export function getModel(config: LLMConfig) {
  switch (config.provider) {
    case 'anthropic':
      if (!config.apiKey) throw new Error('Anthropic API key required');
      const anthropic = createAnthropic({ apiKey: config.apiKey });
      return anthropic(config.model);

    case 'groq':
      if (!config.apiKey) throw new Error('Groq API key required');
      const groq = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });
      return groq(config.model);

    case 'ollama':
      const ollama = createOpenAI({
        apiKey: 'ollama', // Ollama doesn't need real API key
        baseURL: config.baseURL,
      });
      return ollama(config.model);

    case 'huggingface':
      if (!config.apiKey) throw new Error('Hugging Face API key required');
      const hf = createOpenAI({
        apiKey: config.apiKey,
        baseURL: `${config.baseURL}/${config.model}/v1`,
      });
      return hf(config.model);

    case 'google':
      if (!config.apiKey) throw new Error('Google API key required');
      const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
      return google(config.model);

    case 'together':
      if (!config.apiKey) throw new Error('Together AI API key required');
      const together = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });
      return together(config.model);

    case 'fireworks':
      if (!config.apiKey) throw new Error('Fireworks AI API key required');
      const fireworks = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });
      return fireworks(config.model);

    case 'deepseek':
      if (!config.apiKey) throw new Error('DeepSeek API key required');
      const deepseek = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });
      return deepseek(config.model);

    case 'openrouter':
      if (!config.apiKey) throw new Error('OpenRouter API key required');
      const openrouter = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        defaultHeaders: {
          'HTTP-Referer': 'https://appyness.dev',
          'X-Title': 'APPYness AI Developer',
        },
      });
      return openrouter(config.model);

    case 'perplexity':
      if (!config.apiKey) throw new Error('Perplexity API key required');
      const perplexity = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });
      return perplexity(config.model);

    case 'openai':
      if (!config.apiKey) throw new Error('OpenAI API key required');
      const openai = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });
      return openai(config.model);

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

// Legacy function for backward compatibility
export function getAnthropicModel(apiKey: string) {
  return getModel({ provider: 'anthropic', model: 'claude-3-5-sonnet-20240620', apiKey });
}
