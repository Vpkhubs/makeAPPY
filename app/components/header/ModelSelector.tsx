import { useState, useEffect } from 'react';

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: string;
  isFree: boolean;
}

const MODEL_OPTIONS: ModelOption[] = [
  // 🔥 GAME CHANGER: DeepSeek R1 (o1-level performance at 1/20th cost!)
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', description: '🔥 o1-level reasoning!', category: 'deepseek', isFree: false },
  { id: 'deepseek-r1-distill-qwen-32b', name: 'R1 Distill Qwen 32B', provider: 'DeepSeek', description: 'Distilled reasoning', category: 'deepseek', isFree: false },
  { id: 'deepseek-r1-distill-llama-70b', name: 'R1 Distill Llama 70B', provider: 'DeepSeek', description: 'Powerful distilled', category: 'deepseek', isFree: false },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek', description: 'Code Expert', category: 'deepseek', isFree: false },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', description: 'General Purpose', category: 'deepseek', isFree: false },

  // 🚀 Groq Models (FREE - Super Fast) - UPDATED 2025
  { id: 'groq-llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Groq', description: '🆕 Latest & Powerful', category: 'groq', isFree: true },
  { id: 'groq-deepseek-r1-distill', name: 'DeepSeek R1 Distill', provider: 'Groq', description: '🔥 FREE reasoning!', category: 'groq', isFree: true },
  { id: 'groq-llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Groq', description: 'Powerful & Free', category: 'groq', isFree: true },
  { id: 'groq-llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Groq', description: 'Fast & Free', category: 'groq', isFree: true },
  { id: 'groq-gemma2-9b', name: 'Gemma 2 9B', provider: 'Groq', description: 'Google model', category: 'groq', isFree: true },

  // 🤗 Hugging Face Models (FREE) - UPDATED 2025
  { id: 'hf-qwen3-32b', name: 'Qwen 3 32B', provider: 'Hugging Face', description: '🆕 Latest Qwen!', category: 'huggingface', isFree: true },
  { id: 'hf-llama3.3-70b', name: 'Llama 3.3 70B', provider: 'Hugging Face', description: '🆕 Latest Llama!', category: 'huggingface', isFree: true },
  { id: 'hf-deepseek-r1-distill', name: 'DeepSeek R1 Distill', provider: 'Hugging Face', description: '🔥 FREE reasoning!', category: 'huggingface', isFree: true },
  { id: 'hf-qwen2.5', name: 'Qwen 2.5 72B', provider: 'Hugging Face', description: 'Very Powerful', category: 'huggingface', isFree: true },
  { id: 'hf-llama3.1', name: 'Llama 3.1 8B', provider: 'Hugging Face', description: 'Reliable', category: 'huggingface', isFree: true },
  { id: 'hf-codellama', name: 'CodeLlama 34B', provider: 'Hugging Face', description: 'Code Specialist', category: 'huggingface', isFree: true },

  // 🤝 Together AI Models (FREE) - UPDATED 2025
  { id: 'together-deepseek-r1-free', name: 'DeepSeek R1 FREE', provider: 'Together AI', description: '🔥 FREE reasoning!', category: 'together', isFree: true },
  { id: 'together-llama3.3-70b', name: 'Llama 3.3 70B Turbo', provider: 'Together AI', description: '🆕 Latest & Fast', category: 'together', isFree: true },
  { id: 'together-llama3.1-70b', name: 'Llama 3.1 70B Turbo', provider: 'Together AI', description: 'High Performance', category: 'together', isFree: true },
  { id: 'together-qwen3-32b', name: 'Qwen 3 32B Turbo', provider: 'Together AI', description: '🆕 Latest Qwen', category: 'together', isFree: true },
  { id: 'together-qwen2.5', name: 'Qwen 2.5 7B Turbo', provider: 'Together AI', description: 'Balanced', category: 'together', isFree: true },

  // 🔍 Google Gemini Models (FREE) - UPDATED 2025
  { id: 'google-gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', description: '🆕 Latest Gemini!', category: 'google', isFree: true },
  { id: 'google-gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', description: 'Fast & Capable', category: 'google', isFree: true },
  { id: 'google-gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', description: 'Most Capable', category: 'google', isFree: true },

  // 🧠 OpenAI Models (PAID) - UPDATED 2025
  { id: 'openai-o3', name: 'o3', provider: 'OpenAI', description: '🔥 Most advanced!', category: 'openai', isFree: false },
  { id: 'openai-o4-mini', name: 'o4-mini', provider: 'OpenAI', description: 'Fast reasoning', category: 'openai', isFree: false },
  { id: 'openai-gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', description: 'Latest GPT', category: 'openai', isFree: false },
  { id: 'openai-gpt-4.1-mini', name: 'GPT-4.1 mini', provider: 'OpenAI', description: 'Balanced', category: 'openai', isFree: false },
  { id: 'openai-gpt-4.1-nano', name: 'GPT-4.1 nano', provider: 'OpenAI', description: 'Fastest', category: 'openai', isFree: false },

  // 🤖 Anthropic Claude Models (PAID) - UPDATED 2025
  { id: 'anthropic-claude-4-opus', name: 'Claude 4 Opus', provider: 'Anthropic', description: '🔥 Most capable!', category: 'anthropic', isFree: false },
  { id: 'anthropic-claude-4-sonnet', name: 'Claude 4 Sonnet', provider: 'Anthropic', description: 'High performance', category: 'anthropic', isFree: false },
  { id: 'anthropic-claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', description: 'Extended thinking', category: 'anthropic', isFree: false },
  { id: 'anthropic-claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Reliable', category: 'anthropic', isFree: false },

  // 🔥 Fireworks AI Models (FREE)
  { id: 'fireworks-llama3.1-8b', name: 'Llama 3.1 8B', provider: 'Fireworks AI', description: 'Ultra Fast', category: 'fireworks', isFree: true },
  { id: 'fireworks-llama3.1-70b', name: 'Llama 3.1 70B', provider: 'Fireworks AI', description: 'Premium Speed', category: 'fireworks', isFree: true },
  { id: 'fireworks-qwen2.5', name: 'Qwen 2.5 7B', provider: 'Fireworks AI', description: 'Efficient', category: 'fireworks', isFree: true },

  // 🛣️ OpenRouter Models (FREE)
  { id: 'openrouter-llama3.1-8b', name: 'Llama 3.1 8B', provider: 'OpenRouter', description: 'Free Tier', category: 'openrouter', isFree: true },
  { id: 'openrouter-qwen2.5', name: 'Qwen 2.5 7B', provider: 'OpenRouter', description: 'Free Tier', category: 'openrouter', isFree: true },
  { id: 'openrouter-mistral', name: 'Mistral 7B', provider: 'OpenRouter', description: 'Free Tier', category: 'openrouter', isFree: true },

  // 🏠 Ollama Models (100% Local & Free) - UPDATED 2025
  { id: 'ollama-llama3.3', name: 'Llama 3.3 70B', provider: 'Ollama', description: '🆕 Latest local!', category: 'ollama', isFree: true },
  { id: 'ollama-deepseek-r1', name: 'DeepSeek R1 7B', provider: 'Ollama', description: '🔥 Local reasoning!', category: 'ollama', isFree: true },
  { id: 'ollama-llama3.1', name: 'Llama 3.1 8B', provider: 'Ollama', description: 'Local & Private', category: 'ollama', isFree: true },
  { id: 'ollama-qwen2.5', name: 'Qwen 2.5 7B', provider: 'Ollama', description: 'Local & Private', category: 'ollama', isFree: true },
];

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(currentModel);

  useEffect(() => {
    setSelectedModel(currentModel);
  }, [currentModel]);

  const currentModelInfo = MODEL_OPTIONS.find(m => m.id === selectedModel) || MODEL_OPTIONS[0];

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    onModelChange(modelId);
    setIsOpen(false);
  };

  const groupedModels = MODEL_OPTIONS.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, ModelOption[]>);

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg vaporwave-button text-sm"
        style={{
          background: 'rgba(255, 0, 255, 0.1)',
          border: '1px solid rgba(255, 0, 255, 0.3)',
          color: '#00ffff'
        }}
      >
        <div className="flex flex-col items-start">
          <span className="text-xs opacity-75">{currentModelInfo.provider}</span>
          <span className="font-semibold">{currentModelInfo.name}</span>
        </div>
        <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L2 4h8L6 8z"/>
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-80 rounded-lg vaporwave-border scanlines z-50"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 0, 51, 0.95) 50%, rgba(0, 0, 51, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #ff00ff',
            boxShadow: '0 8px 32px rgba(255, 0, 255, 0.3)'
          }}
        >
          <div className="p-2 max-h-96 overflow-y-auto">
            {Object.entries(groupedModels).map(([category, models]) => (
              <div key={category} className="mb-3">
                <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider" style={{color: '#ff00ff'}}>
                  {models[0].provider}
                </div>
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-all hover:bg-opacity-20 ${
                      selectedModel === model.id ? 'bg-purple-600 bg-opacity-30' : 'hover:bg-cyan-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium" style={{color: '#00ffff'}}>
                          {model.name}
                        </div>
                        <div className="text-xs opacity-75" style={{color: '#8a2be2'}}>
                          {model.description}
                        </div>
                      </div>
                      {model.isFree && (
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            background: 'rgba(57, 255, 20, 0.2)',
                            color: '#39ff14',
                            border: '1px solid rgba(57, 255, 20, 0.3)'
                          }}
                        >
                          FREE
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
