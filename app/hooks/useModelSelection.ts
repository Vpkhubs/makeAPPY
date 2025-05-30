import { useState, useEffect } from 'react';

const MODEL_STORAGE_KEY = 'appyness-selected-model';
const DEFAULT_MODEL = 'deepseek-r1'; // 🔥 GAME CHANGER: o1-level performance at 1/20th cost!

export function useModelSelection() {
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved model from localStorage on mount
  useEffect(() => {
    const savedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  // Save model to localStorage when it changes
  const handleModelChange = async (modelId: string) => {
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem(MODEL_STORAGE_KEY, modelId);
      setSelectedModel(modelId);

      // Send to server to update session/preferences
      await fetch('/api/model-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId }),
      }).catch(() => {
        // Ignore errors - localStorage is the fallback
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedModel,
    setSelectedModel: handleModelChange,
    isLoading,
  };
}
