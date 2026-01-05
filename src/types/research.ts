export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export interface CanvasContent {
  id: string;
  type: 'code' | 'report' | 'markdown';
  title: string;
  content: string;
  language?: string;
}

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  autoSave: boolean;
  streamResponse: boolean;
  maxTokens: number;
  temperature: number;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  fontSize: 14,
  autoSave: true,
  streamResponse: true,
  maxTokens: 4096,
  temperature: 0.7,
};

export const LLM_MODELS: LLMModel[] = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', description: 'Most capable model' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', description: 'Faster, cheaper GPT-4' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Best for complex tasks' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', description: 'Balanced performance' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'Multimodal capabilities' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', description: 'Advanced reasoning' },
];
