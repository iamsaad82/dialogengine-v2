'use client'

import { useEffect, useState, useRef } from 'react'
import { useChat } from './hooks/useChat'
import { BaseChatLayout } from './components/BaseChatLayout'
import { ChatMode, CommonChatProps } from './types/common'
import { useBotInfo } from './hooks/useBotInfo'
import { BotSettings } from '@/types/bot'

// VERSION-MARKER: Chat-Debug-Code - Version 005
console.log("Chat.tsx geladen - Debug-Version 005");

// Tracking-Mechanismus für Bot-Informationsabrufe und Willkommensnachrichten
const loadedBots = new Set<string>();
const loadedWelcomeMessages = new Set<string>();

export function Chat({ 
  initialMode = 'bubble', 
  embedded = false, 
  botId, 
  className, 
  initialSettings,
  suggestions = []
}: CommonChatProps) {
  const [isDialogMode, setIsDialogMode] = useState<boolean>(false)
  
  // Bot-Informationen über den gemeinsamen Hook laden
  const {
    botName,
    botPrimaryColor,
    botBgColor,
    botTextColor,
    botAccentColor,
    userBgColor,
    userTextColor,
    showCopyButton,
    enableFeedback,
    showSuggestions,
    botAvatarUrl,
    welcomeMessage,
  } = useBotInfo({ botId, initialSettings: initialSettings as BotSettings | undefined })
  
  const { 
    messages, 
    isLoading, 
    error, 
    isOpen, 
    mode, 
    sendMessage, 
    cancelMessage, 
    toggleChat, 
    cycleMode,
    setMode, 
    messagesEndRef,
    botSettings,
    welcomeMessage: useChatWelcomeMessage
  } = useChat({
    initialMessages: [],
    initialMode,
    initialOpen: embedded, // Wenn eingebettet, dann direkt öffnen
    botId, // Bot-ID an useChat übergeben
    initialSettings: initialSettings as BotSettings | undefined // Korrekte Typisierung
  })

  // Wenn der Modus von außen geändert wird, aktualisiere den internen Modus
  useEffect(() => {
    if (setMode) {
      setMode(initialMode);
    }
  }, [initialMode, setMode]);

  // Funktion zum Umschalten des Dialog-Modus
  const toggleDialogMode = () => {
    const newDialogMode = !isDialogMode;
    setIsDialogMode(newDialogMode);
    
    // Dialog-Modus CSS-Klasse zum body und html hinzufügen/entfernen
    if (newDialogMode) {
      document.body.classList.add('dialog-mode');
      document.documentElement.classList.add('dialog-mode');
      console.log("Dialog-Modus aktiviert. Body-Klassen:", document.body.className);
    } else {
      document.body.classList.remove('dialog-mode');
      document.documentElement.classList.remove('dialog-mode');
      console.log("Dialog-Modus deaktiviert. Body-Klassen:", document.body.className);
    }
  };
  
  // Effekt für das Laden der Bot-Informationen
  useEffect(() => {
    if (!botId) return
    
    // Bot-Informationen werden nun vom useBotInfo-Hook geladen
    console.log("CHAT-DEBUG-005: Bot-ID für API-Aufruf:", botId);
  }, [botId])

  // Debug-Ausgabe für die Chat-Komponente
  useEffect(() => {
    console.log("CHAT-DEBUG-005: Chat-Komponente gerendert");
    console.log("CHAT-DEBUG-005: messages:", messages);
    console.log("CHAT-DEBUG-005: isLoading:", isLoading);
    console.log("CHAT-DEBUG-005: botId:", botId || "Standard-Bot");
    console.log("CHAT-DEBUG-005: botName:", botName);
    console.log("CHAT-DEBUG-005: botPrimaryColor:", botPrimaryColor);
    console.log("CHAT-DEBUG-005: showCopyButton:", showCopyButton);
    console.log("CHAT-DEBUG-005: enableFeedback:", enableFeedback);
    console.log("CHAT-DEBUG-005: showSuggestions:", showSuggestions);
  }, [messages, isLoading, botId, botName, botPrimaryColor, showCopyButton, enableFeedback, showSuggestions]);

  // Debug-Ausgabe für Bot-Einstellungen
  useEffect(() => {
    console.log("CHAT-DEBUG-005: Bot-Einstellungen geladen:", {
      botName,
      botPrimaryColor,
      showCopyButton,
      enableFeedback,
      showSuggestions,
      botAvatarUrl: botAvatarUrl ? "vorhanden" : "nicht vorhanden",
      welcomeMessage: welcomeMessage ? `${welcomeMessage.substring(0, 30)}...` : "nicht vorhanden"
    });
  }, [botName, botPrimaryColor, showCopyButton, enableFeedback, showSuggestions, botAvatarUrl, welcomeMessage]);

  // Beim Unmount Dialog-Modus zurücksetzen
  useEffect(() => {
    return () => {
      document.body.classList.remove('dialog-mode');
    };
  }, []);

  return (
    <BaseChatLayout
      // UI-Zustände
      isOpen={isOpen}
      mode={mode}
      isLoading={isLoading}
      isDialogMode={isDialogMode}
      
      // Bot/Chat-Info
      botName={botName}
      botPrimaryColor={botPrimaryColor}
      botBgColor={botBgColor}
      botTextColor={botTextColor}
      botAccentColor={botAccentColor}
      userBgColor={userBgColor}
      userTextColor={userTextColor}
      showCopyButton={showCopyButton}
      enableFeedback={enableFeedback}
      showSuggestions={showSuggestions}
      botAvatarUrl={botAvatarUrl}
      welcomeMessage={(welcomeMessage || useChatWelcomeMessage) || undefined}
      className={className}
      embedded={embedded}
      
      // Nachrichten und Suggestions
      messages={messages}
      suggestions={suggestions}
      messagesEndRef={messagesEndRef}
      
      // Handler
      toggleChat={toggleChat}
      cycleMode={cycleMode}
      setMode={setMode}
      toggleDialogMode={toggleDialogMode}
      sendMessage={sendMessage}
      cancelMessage={cancelMessage}
    />
  )
} 