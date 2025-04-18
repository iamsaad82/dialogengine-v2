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
  settings: BotSettings
  createdAt: string
  updatedAt: string
} 