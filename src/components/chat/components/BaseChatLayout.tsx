'use client'

import React, { ReactNode } from 'react'
import { ChatBubble } from './ChatBubble'
import { ChatHeader } from './ChatHeader'
import { DialogWebToggle } from './DialogWebToggle'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { SuggestionsBar } from '../SuggestionsBar'
import { Message } from '../types/common'
import type { BotSuggestion } from '@/types/bot'
import '../../../styles/chat/base.css';
import '../../../styles/chat/bubble-mode.css';
import '../../../styles/chat/fullscreen-mode.css';
import '../../../styles/chat/inline-mode.css';
import '../styles/message-content.css';

export interface BaseChatLayoutProps {
  // UI-Zustände
  isOpen: boolean
  mode: 'bubble' | 'inline' | 'fullscreen'
  isLoading: boolean
  isDialogMode: boolean
  
  // Bot/Chat-Info
  botName: string
  botPrimaryColor: string
  botBgColor: string
  botTextColor: string
  botAccentColor: string
  userBgColor?: string
  userTextColor: string
  showCopyButton?: boolean
  enableFeedback?: boolean
  showSuggestions?: boolean
  messageTemplate?: string
  botAvatarUrl?: string
  welcomeMessage?: string
  className?: string
  embedded?: boolean
  
  // Nachrichten und Suggestions
  messages: Message[]
  suggestions?: BotSuggestion[]
  messagesEndRef: React.RefObject<HTMLDivElement>
  
  // Handler
  toggleChat: () => void
  cycleMode: () => void
  setMode: (mode: 'bubble' | 'inline' | 'fullscreen') => void
  toggleDialogMode: () => void
  sendMessage: (message: string) => void
  cancelMessage: () => void
}

/**
 * BaseChatLayout - Gemeinsames Layout für alle Chat-Komponenten
 * 
 * Diese Komponente stellt ein einheitliches Layout für sowohl die Streaming- als auch
 * die nicht-streaming Chat-Implementierung bereit. Sie enthält die komplette UI-Struktur
 * für alle drei Modi (bubble, inline, fullscreen).
 */
export function BaseChatLayout({
  // UI-Zustände
  isOpen,
  mode,
  isLoading,
  isDialogMode,
  
  // Bot/Chat-Info
  botName,
  botPrimaryColor,
  botBgColor,
  botTextColor,
  botAccentColor,
  userBgColor = '',
  userTextColor,
  showCopyButton = true,
  enableFeedback = false,
  showSuggestions = true,
  messageTemplate,
  botAvatarUrl,
  welcomeMessage,
  className,
  embedded = false,
  
  // Nachrichten und Suggestions
  messages,
  suggestions = [],
  messagesEndRef,
  
  // Handler
  toggleChat,
  cycleMode,
  setMode,
  toggleDialogMode,
  sendMessage,
  cancelMessage
}: BaseChatLayoutProps) {
  
  // Render-Logik: Chat-Bubble im geschlossenen Zustand
  if (!isOpen && mode !== 'fullscreen') {
    return (
      <ChatBubble 
        onClick={toggleChat} 
        className={className}
      />
    )
  }

  // Hauptlayout für geöffneten Chat
  return (
    <div 
      className={`chat-container ${mode} ${className || ''}`}
      style={{
        '--bot-primary-color': botPrimaryColor,
        '--bot-bg-color': botBgColor,
        '--bot-text-color': botTextColor,
        '--bot-accent-color': botAccentColor,
        '--user-bg-color': userBgColor,
        '--user-text-color': userTextColor
      } as React.CSSProperties}
    >
      {/* Debug-Ausgabe als verstecktes Element */}
      <div className="debug-info" style={{ display: 'none' }}>
        {`messages.length: ${messages.length}, welcomeMessage: ${welcomeMessage ? 'vorhanden' : 'nicht vorhanden'}, botAvatarUrl: ${botAvatarUrl ? 'vorhanden' : 'nicht vorhanden'}`}
      </div>
      
      <ChatHeader 
        botName={botName}
        mode={mode}
        onClose={toggleChat}
        onModeChange={cycleMode}
        setMode={setMode}
        botPrimaryColor={botPrimaryColor}
        botAccentColor={botAccentColor}
        botTextColor={botTextColor}
        userTextColor={userTextColor}
      />
      
      {/* Dialog/Web-Toggle nur im Fullscreen anzeigen */}
      {mode === 'fullscreen' && (
        <DialogWebToggle
          botPrimaryColor={botPrimaryColor} 
          botAccentColor={botAccentColor}
          botTextColor={botTextColor}
          isDialogMode={isDialogMode}
          toggleDialogMode={toggleDialogMode}
          embedded={embedded}
        />
      )}
      
      {/* Zentrale Willkommensnachricht, nur anzeigen wenn keine Nachrichten vorhanden sind */}
      {messages.length === 0 && welcomeMessage && (
        <div className="welcome-message">
          {botAvatarUrl && (
            <div className="bot-avatar-container">
              <img 
                src={botAvatarUrl} 
                alt={`${botName} Logo`}
                className="bot-avatar"
                style={{ 
                  width: '130px', 
                  height: 'auto', 
                  borderRadius: '0',
                  objectFit: 'contain',
                  margin: '0 auto 1rem auto',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '3px solid white',
                  maxHeight: '130px'
                }}
              />
            </div>
          )}
          <h2>
            <span className="pulse-dot"></span>
            <span style={{ color: `var(--bot-primary-color)` }}>{botName}</span>
          </h2>
          <div className="message-bubble">
            {/* Gradient Overlays für visuelle Effekte */}
            <div className="gradient-overlay-1"></div>
            <div className="gradient-overlay-2"></div>
            <div className="gradient-overlay-3"></div>
            <div className="border-overlay"></div>
            
            {/* Eigentlicher Nachrichtentext */}
            <div className="relative z-10">
              <div className="prose">
                {welcomeMessage}
              </div>
            </div>
          </div>
          
          {/* Vorschläge unter der Nachricht, nur anzeigen wenn showSuggestions aktiviert ist */}
          {showSuggestions && suggestions && suggestions.length > 0 ? (
            <div className="welcome-suggestions" style={{ marginTop: '1.5rem' }}>
              <SuggestionsBar 
                suggestions={suggestions} 
                onSuggestionClick={(text) => sendMessage(text)}
                botPrimaryColor={botPrimaryColor || ''}
                botAccentColor={botAccentColor || ''}
                botTextColor={botTextColor || ''}
              />
            </div>
          ) : (
            <div className="welcome-suggestions-debug" style={{ display: 'none' }}>
              {/* Debug-Info für den Developer */}
              {`showSuggestions=${showSuggestions}, suggestions=${suggestions ? suggestions.length : 0}`}
            </div>
          )}
        </div>
      )}
      
      <MessageList 
        messages={messages}
        isLoading={isLoading}
        botPrimaryColor={botPrimaryColor}
        botBgColor={botBgColor}
        botTextColor={botTextColor}
        botAccentColor={botAccentColor}
        userBgColor={userBgColor}
        userTextColor={userTextColor}
        enableFeedback={enableFeedback}
        showCopyButton={showCopyButton}
        welcomeMessage={null}
        messagesEndRef={messagesEndRef}
        botAvatarUrl={botAvatarUrl}
        botName={botName}
        onSuggestionClick={(text) => sendMessage(text)}
        suggestions={showSuggestions && messages.length > 0 ? suggestions : []}
        settings={{
          primaryColor: botPrimaryColor,
          botBgColor: botBgColor,
          botTextColor: botTextColor,
          botAccentColor: botAccentColor,
          userBgColor: userBgColor,
          userTextColor: userTextColor,
          messageTemplate: messageTemplate
        }}
        isStreaming={isLoading}
      />
      
      <ChatInput 
        onSend={sendMessage} 
        onCancel={cancelMessage}
        isLoading={isLoading}
        botPrimaryColor={botPrimaryColor}
        botAccentColor={botAccentColor}
        botTextColor={botTextColor}
      />
    </div>
  )
} 