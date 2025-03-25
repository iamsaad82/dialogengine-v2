export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export type ChatMode = 'bubble' | 'inline' | 'fullscreen' 