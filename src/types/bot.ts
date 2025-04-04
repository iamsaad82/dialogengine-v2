export interface BotSettings {
  primaryColor: string
  botBgColor: string
  botTextColor: string
  botAccentColor: string
  userBgColor?: string
  userTextColor: string
  enableFeedback: boolean
  enableAnalytics: boolean
  showSuggestions: boolean
  showCopyButton: boolean
  showNameInHeader: boolean
  messageTemplate: string
  avatarUrl?: string

  // Prompt-Konfiguration
  botPersonality: string
  botContext: string
  botScope: string
  offerTip: string
  closedDays: string
}

export interface Bot {
  id: string
  name: string
  description: string
  welcomeMessage: string
  flowiseId: string
  active: boolean
  avatarUrl?: string
  settings: BotSettings
  createdAt: string
  updatedAt: string
  suggestions?: BotSuggestion[]
}

export interface BotSuggestion {
  id: string
  text: string
  order: number
  isActive: boolean
  botId: string
  createdAt: string
  updatedAt: string
}