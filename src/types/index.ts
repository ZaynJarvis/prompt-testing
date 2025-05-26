export interface File {
  id: string;
  name: string;
  content: string;
  active: boolean;
  versions?: PromptVersion[];
  chatHistory: Message[];
}

export interface PromptVersion {
  id: string;
  content: string;
  timestamp: number;
  description?: string | null;
}

export interface ModelConfig {
  modelId: string;
  modelName: string;
  apiToken: string;
}

export interface ModelConfigs {
  models: ModelConfig[];
  selectedModelId: string | null;
  apiToken: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatHistory {
  messages: Message[];
  isLoading: boolean;
}