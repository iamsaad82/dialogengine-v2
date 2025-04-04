'use client'

import { useEffect, useRef, useState } from 'react'
import { useStreamChat } from './hooks/useStreamChat'
import { BaseChatLayout } from './components/BaseChatLayout'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { v4 as uuidv4 } from 'uuid'
import { ChatMode, CommonChatProps, Message } from './types/common'
import { BotSuggestion } from '@/types/bot'
import { useBotInfo } from './hooks/useBotInfo'
import { BotSettings } from '@/types/bot'
import { cn } from '@/lib/utils'

// VERSION-MARKER: StreamingChat-Debug-Code - Version 006
console.log("StreamingChat.tsx geladen - Debug-Version 006");

interface StreamingChatProps {
  botId?: string
  initialMode?: 'bubble' | 'inline' | 'fullscreen'
  className?: string
  initialSettings?: Partial<BotSettings>
  embedded?: boolean
  suggestions?: BotSuggestion[]
}

export function StreamingChat({
  botId,
  initialMode = 'bubble',
  className = '',
  initialSettings,
  embedded = false,
  suggestions: initialSuggestions = []
}: StreamingChatProps) {
  const [isDialogMode, setIsDialogMode] = useState<boolean>(false)

  // Bot-Einstellungen abrufen
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
    messageTemplate,
  } = useBotInfo({ botId, initialSettings: initialSettings as BotSettings | undefined })

  // Debug-Ausgabe für Einstellungen
  useEffect(() => {
    console.log("STREAMING-CHAT-DEBUG-001: Einstellungen:", {
      botName,
      botPrimaryColor,
      botTextColor,
      userBgColor,
      userTextColor,
      showSuggestions,
      welcomeMessage: welcomeMessage ? 'vorhanden' : 'nicht vorhanden',
      messageTemplate,
      botAvatarUrl: botAvatarUrl ? 'vorhanden' : 'nicht vorhanden'
    });
  }, [botName, botPrimaryColor, botTextColor, userBgColor, userTextColor, showSuggestions, welcomeMessage, messageTemplate, botAvatarUrl]);

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
    currentStreamedMessage
  } = useStreamChat({
    initialMessages: [],
    initialMode,
    initialOpen: embedded,
    botId,
    initialSettings: initialSettings as BotSettings | undefined
  })

  const toggleDialogMode = () => {
    setIsDialogMode(!isDialogMode)
  }

  // Effekt für das Laden der Bot-Informationen
  useEffect(() => {
    if (!botId) return

    // Bot-Informationen werden nun vom useBotInfo-Hook geladen
    console.log("STREAMING-CHAT-DEBUG-006: Bot-ID für API-Aufruf:", botId);
    console.log("STREAMING-CHAT-DEBUG-006: Vorhandene Vorschläge:", initialSuggestions ? initialSuggestions.length : 0);
    console.log("STREAMING-CHAT-DEBUG-006: showSuggestions aktiviert:", showSuggestions);
    console.log("STREAMING-CHAT-DEBUG-006: welcomeMessage:", welcomeMessage ? `vorhanden (${welcomeMessage.substring(0, 20)}...)` : "nicht vorhanden");
    console.log("STREAMING-CHAT-DEBUG-006: botAvatarUrl:", botAvatarUrl ? "vorhanden" : "nicht vorhanden");
  }, [botId, initialSuggestions, showSuggestions, welcomeMessage, botAvatarUrl])

  // Kombinierte Nachrichtenliste mit der aktuell gestreamten Nachricht
  const allMessages = () => {
    console.log("STREAMINGCHAT-DEBUG-006: allMessages aufgerufen, isLoading:", isLoading,
      "currentStreamedMessage:", currentStreamedMessage ? "vorhanden" : "nicht vorhanden",
      "Nachrichten:", messages.length);

    // Wenn keine gestreamte Nachricht vorhanden ist, zeige nur die normalen Nachrichten
    if (!currentStreamedMessage) {
      console.log("STREAMINGCHAT-DEBUG-006: Nur normale Nachrichten anzeigen:", messages.length);
      return messages;
    }

    // Streamed-Message nur anzeigen, wenn sie Inhalt hat
    if (!currentStreamedMessage.content || currentStreamedMessage.content.trim() === '') {
      console.log("STREAMINGCHAT-DEBUG-006: Leerer Streaming-Inhalt, zeige nur normale Nachrichten");
      return messages;
    }

    // Suche nach einer bereits vorhandenen gestreamten Nachricht
    const existingStreamingMessage = messages.find(message => message.streaming === true);

    // Suche nach einer Assistenten-Nachricht mit genau dem gleichen Inhalt
    const exactMatchMessage = messages.find(
      message => message.role === 'assistant' &&
                 message.content.trim() === currentStreamedMessage.content.trim()
    );

    // Wenn es eine exakte Übereinstimmung gibt, gib die Originalnachrichten zurück
    if (exactMatchMessage) {
      console.log("STREAMINGCHAT-DEBUG-006: Exakte Übereinstimmung in der Liste gefunden");
      return messages;
    }

    // Array für die finalen Nachrichten
    let finalMessages = [...messages];

    // Wenn es bereits eine Streaming-Nachricht gibt, ersetze sie
    if (existingStreamingMessage) {
      console.log("STREAMINGCHAT-DEBUG-006: Aktualisiere bestehende Streaming-Nachricht");
      finalMessages = messages.map(message => {
        if (message.streaming) {
          return {
            ...message,
            content: currentStreamedMessage.content,
            timestamp: Date.now()
          };
        }
        return message;
      });
    } else {
      // Ansonsten füge eine neue Streaming-Nachricht hinzu
      console.log("STREAMINGCHAT-DEBUG-006: Füge neue Streaming-Nachricht hinzu, Länge:", currentStreamedMessage.content.length);

      // Erzeuge eine eindeutige ID für die gestreamte Nachricht
      const streamedMessage: Message = {
        id: `streaming-msg-${Date.now()}`,
        role: 'assistant',
        content: currentStreamedMessage.content,
        streaming: true,
        timestamp: Date.now()
      };

      finalMessages = [...messages, streamedMessage];
    }

    return finalMessages;
  };

  return (
    <div className={cn("relative overflow-hidden h-full", className)}>
      <BaseChatLayout
        isOpen={isOpen}
        mode={mode}
        isLoading={isLoading}
        isDialogMode={isDialogMode}
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
        messageTemplate={messageTemplate}
        botAvatarUrl={botAvatarUrl}
        welcomeMessage={welcomeMessage}
        messages={allMessages()}
        suggestions={initialSuggestions}
        messagesEndRef={messagesEndRef}
        toggleChat={toggleChat}
        cycleMode={cycleMode}
        setMode={setMode}
        toggleDialogMode={toggleDialogMode}
        sendMessage={sendMessage}
        cancelMessage={cancelMessage}
        className={className}
        embedded={embedded}
      />
    </div>
  )
}