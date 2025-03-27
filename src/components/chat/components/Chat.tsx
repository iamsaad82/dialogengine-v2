'use client'

import { useEffect, useRef } from 'react'
import { Message as MessageComponent } from './Message'
import { ChatInput } from './ChatInput'
import { useChat } from '../hooks/useChat'
import { CHAT_VERSION } from '../../../config/version'
import cn from 'classnames'

// VERSION-MARKER: Chat-Debug-Code - Version 006
console.log("Chat.tsx geladen - Debug-Version 006 (Streaming)");

interface ChatProps {
  initialMessages?: any[]
  botId?: string
  className?: string
  welcomeMessage?: string
  apiEndpoint?: string
}

export function Chat({
  initialMessages = [],
  botId,
  className,
  welcomeMessage,
  apiEndpoint
}: ChatProps) {
  const {
    messages,
    input,
    setInput,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    messagesEndRef,
    cancelMessage
  } = useChat({
    initialMessages: welcomeMessage
      ? [{ role: 'assistant', content: welcomeMessage }]
      : initialMessages,
    botId
  })

  // Scroll zum Ende, wenn neue Nachrichten hinzugefügt werden
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Auto-scroll zum Ende, wenn neue Nachrichten hinzukommen
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isStreaming]) // Auch auf Streaming-Status reagieren

  console.log(`Chat-Debug-006: Chat mit ${messages.length} Nachrichten wird gerendert.`);

  return (
    <div className={cn('flex flex-col w-full h-full max-h-[600px]', className)}>
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto py-4 px-3 space-y-4"
      >
        {messages.map((message, index) => (
          <MessageComponent
            key={`${message.role}-${index}`}
            message={message}
            isLastMessage={index === messages.length - 1}
            isStreaming={isLastMessageAssistant(messages) && isStreaming && index === messages.length - 1}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading || isStreaming}
          onSubmit={sendMessage}
          onCancel={cancelMessage}
        />
        {error && (
          <div className="mt-2 text-sm text-red-500">{error}</div>
        )}
        <div className="mt-2 text-xs text-gray-400 text-right">
          {CHAT_VERSION ? `v${CHAT_VERSION}` : 'Entwicklungsversion'}
        </div>
      </div>
    </div>
  )
}

// Hilfsfunktion, um zu prüfen, ob die letzte Nachricht vom Assistenten ist
function isLastMessageAssistant(messages: any[]) {
  if (messages.length === 0) return false;
  const lastMessage = messages[messages.length - 1];
  return lastMessage.role === 'assistant';
} 