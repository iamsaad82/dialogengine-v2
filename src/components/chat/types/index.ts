export type ChatMode = 'inline' | 'bubble' | 'fullscreen'

export interface ChatMessage {
  content: string
  isUser: boolean
  timestamp: Date
}

export interface ChatProps {
  initialMode?: ChatMode
  initialMessages?: ChatMessage[]
}

export interface MessageProps {
  content: string
  isUser: boolean
  timestamp: Date
} 