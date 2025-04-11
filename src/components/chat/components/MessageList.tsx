'use client'

import React, { useRef, useEffect } from 'react'
import Message from './Message'
import { ChevronDownIcon } from './ui/icons'
import { Message as MessageType } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { SuggestionsBar } from '../SuggestionsBar'
import { CommonBotSettings } from '../types/common'
import { BotSuggestion } from '@/types/bot'

// VERSION-MARKER: MessageList-Debug-Code - Version 002
console.log("MessageList.tsx geladen - Debug-Version 002");

// Optimale Verzögerung für den automatischen Scroll zum letzten Element
const SCROLL_DELAY = 50;

interface MessageListProps {
  messages: MessageType[]
  isLoading?: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
  botName?: string
  showCopyButton?: boolean
  enableFeedback?: boolean
  showNameInHeader?: boolean
  botId?: string
  botPrimaryColor?: string
  botBgColor?: string
  botTextColor?: string
  botAccentColor?: string
  userBgColor?: string
  userTextColor?: string
  welcomeMessage?: string | null
  botAvatarUrl?: string
  settings?: CommonBotSettings
  isStreaming?: boolean
  onSuggestionClick: (text: string) => void
  suggestions?: BotSuggestion[]
}

// Ladeindikator-Komponente
function LoadingMessage({
  botName,
  botPrimaryColor,
  botBgColor,
  botTextColor,
  botAccentColor,
  botAvatarUrl,
  showNameInHeader = true
}: {
  botName?: string,
  botPrimaryColor?: string,
  botBgColor?: string,
  botTextColor?: string,
  botAccentColor?: string,
  botAvatarUrl?: string,
  showNameInHeader?: boolean
}) {
  // Den Anzeigenamen verbessern, wenn es sich um einen technischen Namen handelt
  const displayName = botName === 'creditreform' ? 'Creditreform Assistent' :
                     botName === 'brandenburg' ? 'Brandenburg Dialog' :
                     botName?.includes('-') || (botName?.length || 0) < 4 ? `${botName} Assistent` : botName || '';

  // Verschiedene Texte für die Lade-Animation
  const loadingTexts = [
    "Ich bereite eine Antwort vor...",
    "Ich suche nach passenden Informationen...",
    "Ich analysiere Ihre Anfrage...",
    "Einen Moment bitte..."
  ];

  // State für den aktuellen Text
  const [textIndex, setTextIndex] = React.useState(0);

  // Effekt zum Wechseln des Textes
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prevIndex => (prevIndex + 1) % loadingTexts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="group relative mb-4 flex items-start justify-start max-w-full"
      initial={{ opacity: 0, y: 10, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label="Nachricht wird geladen"
    >
      <div
        className="max-w-3xl rounded-lg p-3 mb-4 glassmorphism-bot"
        style={{
          backgroundColor: botBgColor || 'var(--bot-bg-color)',
          color: botTextColor || 'var(--bot-text-color)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="pb-1 flex flex-col items-center gap-1 text-xs text-gray-500 border-b border-gray-200 mb-2">
          <div className="inline-flex items-center justify-center overflow-hidden" style={{ width: '200px', height: '60px' }}>
            {botAvatarUrl ? (
              <img
                src={botAvatarUrl}
                alt={`${botName} Logo`}
                className="h-auto max-h-full w-full object-contain"
                width="200"
                height="60"
              />
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="none"
                stroke={botAccentColor || 'currentColor'}
                strokeWidth="2"
                className="text-primary"
                style={{ aspectRatio: '1' }}
              >
                <rect width="18" height="10" x="3" y="11" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" x2="8" y1="16" y2="16" />
                <line x1="16" x2="16" y1="16" y2="16" />
              </svg>
            )}
          </div>
          {showNameInHeader && <span className="text-sm font-semibold text-center leading-none" style={{ color: botTextColor }}>{botName}</span>}
        </div>

        <div className="py-1">
          <div className="flex items-center mb-1">
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: botAccentColor || 'hsl(var(--primary))' }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: botAccentColor || 'hsl(var(--primary))' }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: botAccentColor || 'hsl(var(--primary))' }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                  delay: 0.4
                }}
              />
            </div>
          </div>

          <motion.div
            key={textIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-sm"
            style={{ color: botTextColor }}
          >
            {loadingTexts[textIndex]}
          </motion.div>
        </div>

        <div className="mt-1 flex items-center justify-end gap-2 text-xs" style={{ color: `${botTextColor}80` }}>
          <span>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function MessageList({
  messages,
  isLoading = false,
  messagesEndRef,
  botName,
  showCopyButton = true,
  enableFeedback = false,
  showNameInHeader = true,
  botId,
  botPrimaryColor,
  botBgColor,
  botTextColor,
  botAccentColor,
  userBgColor,
  userTextColor,
  welcomeMessage,
  botAvatarUrl,
  settings,
  isStreaming = false,
  onSuggestionClick,
  suggestions
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef<number>(0);
  const shouldScrollToBottom = useRef<boolean>(true);

  // Erstelle ein colorStyle Objekt aus den Einstellungen
  const colorStyle = {
    primaryColor: settings?.primaryColor || botPrimaryColor || '#3b82f6',
    botBgColor: settings?.botBgColor || botBgColor || 'rgba(245, 247, 250, 0.8)',
    botTextColor: settings?.botTextColor || botTextColor || '#1a202c',
    botAccentColor: settings?.botAccentColor || botAccentColor || '#3b82f6',
    userBgColor: settings?.userBgColor || userBgColor || settings?.primaryColor || botPrimaryColor || '#3b82f6',
    userTextColor: settings?.userTextColor || userTextColor || '#ffffff',
  };

  // Zustand für den Scroll-Button
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  // Prüfe ob beim Scrollen der untere Rand erreicht wird
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrolledToBottom = scrollHeight - scrollTop - clientHeight < 50;

    shouldScrollToBottom.current = scrolledToBottom;
    setShowScrollButton(!scrolledToBottom && messages.length > 3);
  };

  // Scroll zur letzten Nachricht
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
      // Nach dem Scrollen sollte automatisch wieder gescrollt werden
      shouldScrollToBottom.current = true;
      setShowScrollButton(false);
    }
  };

  // Automatisches Scrollen, wenn neue Nachrichten hinzukommen
  useEffect(() => {
    const hasNewMessages = messages.length > previousMessageCount.current;
    previousMessageCount.current = messages.length;

    if (hasNewMessages && shouldScrollToBottom.current) {
      // Verzögertes Scrollen für flüssigeres Verhalten
      const timer = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
          });
        }
      }, SCROLL_DELAY);

      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="message-list-container"
      onScroll={handleScroll}
      style={{ WebkitOverflowScrolling: 'touch' }} /* Verbessert Scrolling auf iOS */
    >
      {/* Nachrichtenliste mit erzwungener Sichtbarkeit für alle Nachrichten */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {messages.map((msg, index) => (
          <div
            key={`${msg.id || index}-${msg.role}-container`}
            style={{
              opacity: 1,
              visibility: 'visible',
              display: 'block',
              width: '100%',
              marginBottom: '1rem',
              position: 'relative',
              zIndex: 10
            }}
          >
            <Message
              key={`${msg.id || index}-${msg.role}`}
              message={msg}
              isLast={index === messages.length - 1}
              botName={botName}
              botAvatarUrl={botAvatarUrl}
              isStreaming={isStreaming && index === messages.length - 1 && msg.role === 'assistant'}
              colorStyle={{
                primaryColor: settings?.primaryColor || botPrimaryColor || '#3b82f6',
                botBgColor: settings?.botBgColor || botBgColor || 'rgba(245, 247, 250, 0.8)',
                botTextColor: settings?.botTextColor || botTextColor || '#1a202c',
                botAccentColor: settings?.botAccentColor || botAccentColor || '#3b82f6',
                userBgColor: settings?.userBgColor || userBgColor || settings?.primaryColor || botPrimaryColor || '#3b82f6',
                userTextColor: settings?.userTextColor || userTextColor || '#ffffff',
              }}
              settings={{
                messageTemplate: settings?.messageTemplate || null,
                enableFeedback: enableFeedback,
                showCopyButton: showCopyButton,
                showNameInHeader: settings?.showNameInHeader !== undefined ? settings.showNameInHeader : showNameInHeader,
                botId: botId
              }}
            />
          </div>
        ))}
      </div>


      {/* Ladeindikator - wird angezeigt, wenn isLoading true ist und keine Nachricht gerade gestreamt wird */}
      {isLoading && !messages.some(msg => msg.streaming === true) && (
          <LoadingMessage
            botName={botName}
            botPrimaryColor={botPrimaryColor}
            botBgColor={botBgColor}
            botTextColor={botTextColor}
            botAccentColor={botAccentColor}
            botAvatarUrl={botAvatarUrl}
            showNameInHeader={settings?.showNameInHeader !== undefined ? settings.showNameInHeader : showNameInHeader}
          />
        )}

      {/* Scroll-Button - Optimiert für alle Geräte und Einbettungsmodi */}
        {showScrollButton && (
        <button
          className="scroll-button"
          onClick={scrollToBottom}
          aria-label="Zum Ende scrollen"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 15L3 8H17L10 15Z" fill="currentColor"/>
          </svg>
        </button>
      )}

      {suggestions && suggestions.length > 0 && (
        <SuggestionsBar
          suggestions={suggestions}
          onSuggestionClick={onSuggestionClick}
          botPrimaryColor={settings?.primaryColor || ''}
          botAccentColor={settings?.botAccentColor || ''}
          botTextColor={settings?.botTextColor || ''}
        />
      )}

      {/* Invisible element to scroll to - Optimiert für besseres Scrollverhalten */}
      <div ref={messagesEndRef} style={{ height: '1px', width: '100%', marginTop: '8px' }} />
    </div>
  );
}