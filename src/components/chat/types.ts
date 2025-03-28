export interface Message {
  role: 'user' | 'assistant'
  content: string
  id?: string  // Eindeutige ID für die Nachricht
  timestamp?: number  // Zeitstempel für die Nachricht
}

export type ChatMode = 'bubble' | 'inline' | 'fullscreen' 