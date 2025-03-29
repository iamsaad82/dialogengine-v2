export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  streaming?: boolean;
}

export type ChatMode = 'bubble' | 'inline' | 'fullscreen' 