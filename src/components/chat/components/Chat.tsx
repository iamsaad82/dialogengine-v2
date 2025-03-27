'use client'

import { useEffect, useRef, useState } from 'react'
import { Message as MessageComponent } from './Message'
import { ChatInput } from './ChatInput'
import { useChat } from '../hooks/useChat'
import { Message } from '../types'
import classNames from 'classnames'

// VERSION-MARKER: Chat-Debug-Code - Version 007
console.log("Chat.tsx geladen - Debug-Version 007 (Streaming)");

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
  // Fallback-Werte für fehlende Props im useChat-Hook
  const [fallbackMessages, setFallbackMessages] = useState<Message[]>(
    welcomeMessage
      ? [{ role: 'assistant', content: welcomeMessage }]
      : initialMessages as Message[]
  )
  const [fallbackInput, setFallbackInput] = useState('')
  const [fallbackIsLoading, setFallbackIsLoading] = useState(false)
  const [fallbackError, setFallbackError] = useState<string | null>(null)
  
  // Verwende einen Try-Catch-Block, um Fehler beim useChat-Hook abzufangen
  let chatData: any = {}
  try {
    chatData = useChat({
      initialMessages: welcomeMessage
        ? [{ role: 'assistant', content: welcomeMessage }]
        : initialMessages as Message[],
      botId
    })
    
    console.log("Chat-Debug-007: useChat-Daten:", {
      messagesCount: chatData.messages?.length || 0,
      isLoading: chatData.isLoading,
      isStreaming: chatData.isStreaming,
      hasSetInput: typeof chatData.setInput === 'function',
      hasSendMessage: typeof chatData.sendMessage === 'function'
    })
  } catch (error) {
    console.error("Chat-Debug-007: Fehler beim useChat-Hook:", error)
    // Bei Fehler im useChat-Hook verwenden wir die Fallback-Werte
    chatData = {
      messages: fallbackMessages,
      input: fallbackInput,
      setInput: setFallbackInput,
      isLoading: fallbackIsLoading,
      isStreaming: false,
      error: fallbackError,
      sendMessage: async (message: string) => {
        console.warn("Chat-Debug-007: Fallback sendMessage verwendet")
        setFallbackIsLoading(true)
        
        // Simuliere Nachrichtenverarbeitung
        setTimeout(() => {
          setFallbackMessages([
            ...fallbackMessages,
            { role: 'user', content: message },
            { role: 'assistant', content: 'Entschuldigung, der Chat ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.' }
          ])
          setFallbackIsLoading(false)
        }, 1000)
      },
      messagesEndRef: null,
      cancelMessage: () => { 
        setFallbackIsLoading(false)
      }
    }
  }
  
  // Extrahiere alle benötigten Props mit sicheren Fallbacks
  const {
    messages = fallbackMessages,
    input = fallbackInput,
    setInput = setFallbackInput,
    isLoading = fallbackIsLoading,
    isStreaming = false,
    error = fallbackError,
    sendMessage = async () => { console.warn("Chat-Debug-007: Leere sendMessage-Funktion") },
    messagesEndRef = null,
    cancelMessage = () => { setFallbackIsLoading(false) }
  } = chatData

  // Scroll zum Ende, wenn neue Nachrichten hinzugefügt werden
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Auto-scroll zum Ende, wenn neue Nachrichten hinzukommen
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isStreaming]) // Auch auf Streaming-Status reagieren

  return (
    <div className={classNames('flex flex-col w-full h-full max-h-[600px]', className)}>
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto py-4 px-3 space-y-4"
      >
        {Array.isArray(messages) && messages.map((message, index) => (
          <MessageComponent
            key={`${message.role}-${index}`}
            message={message}
            isLastMessage={index === messages.length - 1}
            isStreaming={isLastMessageAssistant(messages) && isStreaming && index === messages.length - 1}
          />
        ))}
        {messagesEndRef && <div ref={messagesEndRef} />}
      </div>

      <div className="p-4 border-t">
        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading || isStreaming}
          onSubmit={sendMessage}
          onCancel={cancelMessage}
          botId={botId}
        />
        {error && (
          <div className="mt-2 text-sm text-red-500">{error}</div>
        )}
        <div className="mt-2 text-xs text-gray-400 text-right">
          v1.5.0 (Streaming)
        </div>
      </div>
    </div>
  )
}

// Hilfsfunktion, um zu prüfen, ob die letzte Nachricht vom Assistenten ist
function isLastMessageAssistant(messages: any[]) {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  const lastMessage = messages[messages.length - 1];
  return lastMessage.role === 'assistant';
} 