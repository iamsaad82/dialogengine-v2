/**
 * Gemeinsame Typ-Definitionen für Chat-Komponenten
 * Diese Datei enthält die grundlegenden Typen, die von sowohl der
 * regulären Chat-Komponente als auch der StreamingChat-Komponente verwendet werden.
 */

import { BotSuggestion } from '@/types/bot';

// Gemeinsame Modi für beide Chat-Implementierungen
export type ChatMode = 'bubble' | 'inline' | 'fullscreen' | 'fullscreenSearch';

// Gemeinsame Nachrichtenstruktur
export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string; // Enthält HTML-formatierten Inhalt für assistant
  timestamp?: number;
  streaming?: boolean;
}

// Gemeinsame Bot-Einstellungstypen
export interface CommonBotSettings {
  primaryColor?: string | null;
  botBgColor?: string | null;
  botTextColor?: string | null;
  botAccentColor?: string | null;
  userBgColor?: string | null;
  userTextColor?: string | null;
  showCopyButton?: boolean;
  enableFeedback?: boolean;
  showSuggestions?: boolean;
  showNameInHeader?: boolean;
  messageTemplate?: string | null;
  avatarUrl?: string | null;
}

// Grundlegende Eigenschaften für alle Chat-Komponenten
export interface CommonChatProps {
  initialMode?: ChatMode;
  embedded?: boolean;
  botId?: string;
  className?: string;
  initialSettings?: CommonBotSettings;
  suggestions?: BotSuggestion[];
}

// Gemeinsame Eigenschaften für den DialogWebToggle
export interface DialogWebToggleProps {
  botPrimaryColor: string | null | undefined;
  botAccentColor?: string | null | undefined;
  botTextColor?: string | null | undefined;
  isDialogMode: boolean;
  toggleDialogMode: () => void;
  embedded?: boolean;
  fixed?: boolean;
}

// Eigenschaften für die SuggestionsBar
export interface SuggestionsBarProps {
  suggestions: BotSuggestion[];
  onSuggestionClick: (text: string) => void;
  botPrimaryColor?: string;
  botAccentColor?: string;
  botTextColor?: string;
}

// Eigenschaften für den ChatInput
export interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  botPrimaryColor?: string;
  botAccentColor?: string;
  botTextColor?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}