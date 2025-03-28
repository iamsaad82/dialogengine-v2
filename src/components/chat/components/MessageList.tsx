'use client'

import { RefObject, useEffect, useState } from 'react'
import { Message } from './Message'
import { ChevronDownIcon } from './ui/icons'
import { Message as MessageType } from '../types'
import { motion, AnimatePresence } from 'framer-motion'

// VERSION-MARKER: MessageList-Debug-Code - Version 002
console.log("MessageList.tsx geladen - Debug-Version 002");

interface MessageListProps {
  messages: MessageType[]
  isLoading?: boolean
  messagesEndRef: RefObject<HTMLDivElement | null>
  botName?: string
  showCopyButton?: boolean
  enableFeedback?: boolean
  botId?: string
  botPrimaryColor?: string
  welcomeMessage?: string | null
}

// Ladeindikator-Komponente
function LoadingMessage({ botName = 'SMG Dialog Engine', botPrimaryColor }: { botName?: string, botPrimaryColor?: string }) {
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
        className="flex max-w-[85%] items-start gap-3 rounded-lg p-3 shadow-lg glassmorphism-light"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}
      >
        <motion.div 
          className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background/80 backdrop-blur-sm shadow-inner"
          animate={{ 
            rotate: [0, 5, 0, -5, 0],
            scale: [1, 1.05, 1, 1.05, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2.5,
            ease: "easeInOut"
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-5 w-5">
            <rect width="18" height="10" x="3" y="11" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v4" stroke="currentColor" strokeWidth="2" />
            <motion.line 
              x1="8" x2="8" y1="16" y2="16" 
              stroke="currentColor" strokeWidth="2"
              animate={{ y1: [16, 14, 16], y2: [16, 18, 16] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            />
            <motion.line 
              x1="16" x2="16" y1="16" y2="16" 
              stroke="currentColor" strokeWidth="2"
              animate={{ y1: [16, 14, 16], y2: [16, 18, 16] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.3 }}
            />
          </svg>
        </motion.div>
        
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="text-sm font-medium">
            {botName}
          </div>
          <div className="flex flex-col space-y-2">
            {/* Elegantere Typing-Animation */}
            <div className="flex h-6 items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-typing" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            
            {/* Hinweis zum Vorbereiten der Antwort */}
            <div className="text-xs text-muted-foreground/90 italic">
              Ich bereite eine Antwort vor...
            </div>
          </div>
          
          <div className="mt-1 flex items-center justify-end gap-2 text-xs text-muted-foreground/70">
            <span>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MessageList({ 
  messages, 
  isLoading = false, 
  messagesEndRef,
  botName = 'SMG Dialog Engine',
  showCopyButton = true,
  enableFeedback = false,
  botId,
  botPrimaryColor,
  welcomeMessage
}: MessageListProps) {
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Debug-Ausgabe für die Nachrichtenliste
  useEffect(() => {
    console.log("MESSAGELIST-DEBUG-002: Nachrichten in der Liste:", messages);
    console.log("MESSAGELIST-DEBUG-002: isLoading:", isLoading);
    console.log("MESSAGELIST-DEBUG-002: Anzahl der Nachrichten:", messages.length);
    console.log("MESSAGELIST-DEBUG-002: botName:", botName);
    console.log("MESSAGELIST-DEBUG-002: showCopyButton:", showCopyButton);
    console.log("MESSAGELIST-DEBUG-002: enableFeedback:", enableFeedback);
    console.log("MESSAGELIST-DEBUG-002: botId:", botId);
    
    // Log jede Nachricht einzeln
    messages.forEach((message, index) => {
      console.log(`MESSAGELIST-DEBUG-002: Nachricht ${index}:`, message);
    });
  }, [messages, isLoading, botName, showCopyButton, enableFeedback, botId]);

  // Überwache das Scrollen, um den "Scroll-to-Bottom"-Button anzuzeigen
  useEffect(() => {
    const handleScroll = () => {
      const container = messagesEndRef.current?.parentElement
      if (!container) return

      const isScrolledUp = 
        container.scrollHeight - container.scrollTop - container.clientHeight > 100
      
      setShowScrollButton(isScrolledUp)
      
      // Wenn nach unten gescrollt, setze ungelesene Nachrichten zurück
      if (!isScrolledUp) {
        setUnreadCount(0)
      }
    }

    const container = messagesEndRef.current?.parentElement
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [messagesEndRef])

  // Beim Einfügen neuer Nachrichten, erhöhe den Zähler für ungelesene Nachrichten
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement
    if (!container) return
    
    const isScrolledUp = 
      container.scrollHeight - container.scrollTop - container.clientHeight > 100
      
    // Nur erhöhen, wenn der Nutzer hochgescrollt hat und neue Nachrichten kommen
    if (isScrolledUp && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setUnreadCount(prev => prev + 1)
    } else if (!isScrolledUp) {
      setUnreadCount(0)
    }
  }, [messages, messagesEndRef])

  // Scroll zum Ende der Nachrichtenliste
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setUnreadCount(0)
  }

  return (
    <div className="h-full w-full overflow-y-auto scroll-smooth pt-2 pb-4 px-3 relative">
      {/* Willkommensnachricht nur anzeigen, wenn keine Nachrichten vorhanden sind */}
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="max-w-[80%] p-6 text-center">
            <h3 className="text-lg font-medium mb-2 text-primary">{botName}</h3>
            <div className="p-4 rounded-lg bg-card border shadow-sm">
              {welcomeMessage ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: welcomeMessage.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="text-muted-foreground">Wie kann ich Ihnen helfen?</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nachrichten-Liste */}
      <div className="space-y-3 min-h-0 flex flex-col justify-start">
        {messages.map((message) => (
          <Message 
            key={typeof message.id === 'string' ? message.id : `msg-${message.timestamp || Date.now()}`}
            message={message} 
            botName={botName}
            showCopyButton={showCopyButton}
            enableFeedback={enableFeedback}
            botId={botId}
            botPrimaryColor={botPrimaryColor}
          />
        ))}
        
        {/* Ladeindikator */}
        {isLoading && (
          <LoadingMessage botName={botName} botPrimaryColor={botPrimaryColor} />
        )}
        
        {/* Verstecktes Element für Auto-Scroll zum Ende der Nachrichtenliste */}
        <div ref={messagesEndRef} className="h-2" />
      </div>
      
      {/* Scroll-Down-Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 right-4 sm:right-6 flex items-center gap-1 text-primary-foreground rounded-full px-3 py-2 shadow-lg z-10"
            onClick={scrollToBottom}
            aria-label="Zum Ende der Nachrichten scrollen"
            title="Zum Ende scrollen"
            style={{ 
              backgroundColor: botPrimaryColor || 'hsl(var(--primary))'
            }}
          >
            <span className="text-xs font-medium">
              {unreadCount > 0 ? `${unreadCount} neue ${unreadCount === 1 ? 'Nachricht' : 'Nachrichten'}` : 'Nach unten'}
            </span>
            <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <motion.span
                className="absolute top-0 right-0 h-full w-full rounded-full"
                style={{ 
                  backgroundColor: `${botPrimaryColor ? botPrimaryColor + '20' : 'hsl(var(--primary)/0.2)'}`
                }}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                aria-hidden="true"
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
} 