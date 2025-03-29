'use client'

import { RefObject, useEffect, useState } from 'react'
import Message from './Message'
import { ChevronDownIcon } from './ui/icons'
import { Message as MessageType } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

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
  botAvatarUrl?: string
}

// Ladeindikator-Komponente
function LoadingMessage({ botName = 'SMG Dialog Engine', botPrimaryColor, botAvatarUrl }: { botName?: string, botPrimaryColor?: string, botAvatarUrl?: string }) {
  // Den Anzeigenamen verbessern, wenn es sich um einen technischen Namen handelt
  const displayName = botName === 'creditreform' ? 'Creditreform Assistent' : 
                     botName === 'brandenburg' ? 'Brandenburg Dialog' : 
                     botName.includes('-') || botName.length < 4 ? `${botName} Assistent` : botName;
  
  // Verschiedene Texte für die Lade-Animation
  const loadingTexts = [
    "Ich bereite eine Antwort vor...",
    "Ich suche nach passenden Informationen...",
    "Ich analysiere Ihre Anfrage...",
    "Einen Moment bitte..."
  ];
  
  // State für den aktuellen Text
  const [textIndex, setTextIndex] = useState(0);
  
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
          backgroundColor: 'var(--bot-bg-color)', 
          color: 'var(--bot-text-color)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="pb-1 flex flex-col items-center gap-1 text-xs text-gray-500 border-b border-gray-200 mb-2">
          <div className="inline-flex items-center justify-center overflow-hidden" style={{ width: '200px', height: '40px' }}>
            {botAvatarUrl ? (
              <img 
                src={botAvatarUrl} 
                alt={`${botName} Logo`} 
                className="h-auto max-h-full w-full object-contain"
                width="200"
                height="40"
              />
            ) : (
              <svg 
                viewBox="0 0 24 24" 
                width="40" 
                height="40"
                fill="none" 
                stroke="currentColor" 
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
          <span className="text-sm font-semibold text-center leading-none">{botName}</span>
        </div>
        
        <div className="py-1">
          <div className="flex items-center mb-1">
            <div className="flex items-center gap-1.5">
              <motion.div 
                className="w-2 h-2 bg-primary/60 rounded-full"
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
                className="w-2 h-2 bg-primary/60 rounded-full"
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
                className="w-2 h-2 bg-primary/60 rounded-full"
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
            className="text-sm text-muted-foreground/90"
          >
            {loadingTexts[textIndex]}
          </motion.div>
        </div>
        
        <div className="mt-1 flex items-center justify-end gap-2 text-xs text-muted-foreground/70">
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
  botName = 'SMG Dialog Engine',
  showCopyButton = true,
  enableFeedback = false,
  botId,
  botPrimaryColor,
  welcomeMessage,
  botAvatarUrl
}: MessageListProps) {
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Debug-Ausgabe für die Nachrichtenliste
  useEffect(() => {
    console.log("MESSAGELIST-DEBUG-003: Nachrichten in der Liste:", messages);
    console.log("MESSAGELIST-DEBUG-003: isLoading:", isLoading);
    console.log("MESSAGELIST-DEBUG-003: Anzahl der Nachrichten:", messages.length);
    console.log("MESSAGELIST-DEBUG-003: welcomeMessage:", welcomeMessage ? 
      `"${welcomeMessage.substring(0, 50)}${welcomeMessage.length > 50 ? '...' : ''}"` : 
      "NICHT VORHANDEN");
    
    // Log jede Nachricht einzeln
    messages.forEach((message, index) => {
      console.log(`MESSAGELIST-DEBUG-003: Nachricht ${index}:`, 
        message.role, 
        message.content?.substring(0, 30), 
        message.streaming ? "(streaming)" : "");
    });
  }, [messages, isLoading, welcomeMessage]);

  // Filter doppelte Nachrichten
  const filteredMessages = (() => {
    // Wichtig: Prüfe zuerst, ob es eine Streaming-Nachricht gibt
    const streamingMessage = messages.find(m => m.streaming === true);
    const hasStreaming = !!streamingMessage;
    
    console.log("MESSAGELIST-DEBUG-006: Filtere Nachrichten, Streaming-Nachricht gefunden:", hasStreaming);
    
    // Wenn die Nachrichtenliste leer ist, aber isLoading aktiv und eine Streaming-Nachricht vorhanden,
    // stelle sicher, dass wir eine leere Liste + die Streaming-Nachricht zurückgeben
    if (messages.length === 0 && isLoading && streamingMessage) {
      console.log("MESSAGELIST-DEBUG-006: Leere Liste mit Streaming-Nachricht");
      return [streamingMessage];
    }
    
    // Einzigartige Nachrichten sammeln
    const uniqueMessages: MessageType[] = [];
    const messageKeys = new Set<string>();
    
    // Nachrichten durchlaufen und Duplikate entfernen
    for (const message of messages) {
      // 1. Streaming-Nachricht immer durchlassen (höchste Priorität)
      if (message.streaming === true) {
        console.log("MESSAGELIST-DEBUG-006: Streaming-Nachricht durchgelassen:", 
          message.content.substring(0, 50));
        uniqueMessages.push(message);
        continue;
      }
      
      // 2. Generiere einen eindeutigen Schlüssel für diese Nachricht
      const messageKey = `${message.role}:${message.content.substring(0, 100)}`;
      
      // 3. Wenn wir diese Nachricht bereits haben, überspringen
      if (messageKeys.has(messageKey)) {
        console.log("MESSAGELIST-DEBUG-006: Doppelte Nachricht gefiltert:", message.role);
        continue;
      }
      
      // 4. Ansonsten zur Liste hinzufügen
      messageKeys.add(messageKey);
      uniqueMessages.push(message);
    }
    
    // Wenn keine Streaming-Nachricht in den originalen Nachrichten gefunden wurde,
    // aber wir haben eine isLoading-Anzeige, dann sollten wir sicherstellen, dass
    // die Benutzeranfrage angezeigt wird, während auf eine Antwort gewartet wird
    if (!hasStreaming && isLoading && uniqueMessages.length > 0) {
      console.log("MESSAGELIST-DEBUG-006: isLoading aktiv ohne Streaming-Nachricht");
      
      // Stelle sicher, dass wir die letzte Benutzer-Nachricht behalten
      const lastUserMessage = [...uniqueMessages].reverse().find(m => m.role === 'user');
      
      if (lastUserMessage) {
        console.log("MESSAGELIST-DEBUG-006: Letzte Benutzer-Nachricht beibehalten:", 
          lastUserMessage.content.substring(0, 30));
      }
    }
    
    // Sortiere die Nachrichten nach Timestamp, falls vorhanden
    uniqueMessages.sort((a, b) => {
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return timeA - timeB;
    });
    
    console.log("MESSAGELIST-DEBUG-006: Originale Nachrichten:", messages.length, "Gefilterte Nachrichten:", uniqueMessages.length);
    console.log("MESSAGELIST-DEBUG-006: Gefilterte Nachrichten:", uniqueMessages.map(m => 
      `${m.role}${m.streaming ? " (streaming)" : ""} - ${m.content.substring(0, 20)}...`
    ));
    
    return uniqueMessages;
  })();

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
    if (isScrolledUp && filteredMessages.length > 0 && filteredMessages[filteredMessages.length - 1].role === 'assistant') {
      setUnreadCount(prev => prev + 1)
    } else if (!isScrolledUp) {
      setUnreadCount(0)
    }
  }, [filteredMessages, messagesEndRef])

  // Scroll zum Ende der Nachrichtenliste
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setUnreadCount(0)
  }

  return (
    <div className="h-full w-full overflow-y-auto scroll-smooth pt-2 pb-4 px-3 relative message-list-container">
      {/* Willkommensnachricht nur anzeigen, wenn keine Nachrichten vorhanden sind */}
      {filteredMessages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full">
          <motion.div 
            className="max-w-[85%] p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >

            <motion.h3 
              className="text-xl font-medium mb-4 text-primary relative inline-flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 200, opacity: 1 }}
                transition={{ 
                  delay: 0.8, 
                  duration: 1.5, 
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                style={{ height: '100%', width: '100%' }}
              />
              
              {/* Status-Indikator (Punkt) links neben dem Bot-Namen */}
              <motion.div 
                className="w-3 h-3 rounded-full mr-2"
                style={{
                  background: `var(--primary, rgba(var(--primary-rgb), 1))`,
                  boxShadow: `0 0 0 rgba(var(--primary-rgb), 0.4)`
                }}
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.8, 1, 0.8],
                  boxShadow: [
                    `0 0 0 rgba(var(--primary-rgb), 0)`,
                    `0 0 12px rgba(var(--primary-rgb), 0.6)`,
                    `0 0 0 rgba(var(--primary-rgb), 0)`
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {botName}
            </motion.h3>

            {/* Chatwolke für die Willkommensnachricht */}
            <motion.div 
              className="relative mx-auto overflow-hidden p-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ 
                boxShadow: `0 12px 35px -5px rgba(var(--primary-rgb), 0.4)`,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              style={{
                maxWidth: "450px",
                background: `linear-gradient(135deg, 
                  var(--bot-bg-color, rgba(248, 250, 252, 0.92)), 
                  var(--bot-bg-color, rgba(248, 250, 252, 0.85)) 40%, 
                  rgba(var(--primary-rgb), 0.15) 120%)`,
                color: "var(--bot-text-color, #000000)",
                border: "1px solid rgba(var(--primary-rgb), 0.2)",
                borderRadius: "1.5rem 1.5rem 1.5rem 0",
                boxShadow: "0 10px 32px rgba(0, 0, 0, 0.1), 0 2px 12px rgba(var(--primary-rgb), 0.1)"
              }}
            >
              {/* Chatwolken-Spitze und -Blase */}
              <div 
                className="absolute left-0 bottom-0 w-6 h-6"
                style={{ 
                  transform: "translate(-30%, 30%)",
                  background: "var(--bot-bg-color, rgba(248, 250, 252, 0.9))",
                  border: "1px solid rgba(var(--primary-rgb), 0.15)",
                  borderTop: "none",
                  borderRight: "none",
                  borderRadius: "0 0 0 100%"
                }}
              />
              <div 
                className="absolute left-0 bottom-0 w-3 h-3 rounded-full" 
                style={{ 
                  transform: "translate(-150%, 80%)",
                  background: "var(--bot-bg-color, rgba(248, 250, 252, 0.9))",
                  border: "1px solid rgba(var(--primary-rgb), 0.15)",
                  borderTop: "none",
                  borderRight: "none"
                }}
              />
              
              {/* Verbesserter Hintergrund-Effekt */}
              <motion.div 
                className="absolute top-0 left-0 w-full h-full opacity-30"
                style={{
                  background: `radial-gradient(circle at 30% 40%, rgba(var(--primary-rgb), 0.25) 0%, transparent 60%)`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              
              {/* Schimmer-Effekt 1 */}
              <motion.div 
                className="absolute top-0 left-0 w-[120%] h-[120%] opacity-40 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, transparent 20%, rgba(var(--primary-rgb), 0.15) 45%, rgba(255, 255, 255, 0.8) 50%, rgba(var(--primary-rgb), 0.15) 55%, transparent 80%)`,
                }}
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 5,
                }}
              />
              
              {/* Schimmer-Effekt 2 (umgekehrte Richtung) */}
              <motion.div 
                className="absolute top-0 left-0 w-[120%] h-[120%] opacity-20 pointer-events-none"
                style={{
                  background: `linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.6) 50%, transparent 60%)`,
                }}
                animate={{
                  x: ['100%', '-100%'],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 4,
                  delay: 2
                }}
              />
              
              {/* Pulsierender Rand-Effekt */}
              <motion.div 
                className="absolute inset-0 rounded-[1.5rem_1.5rem_1.5rem_0] pointer-events-none"
                style={{
                  border: `1px solid rgba(var(--primary-rgb), 0.3)`,
                }}
                animate={{
                  opacity: [0.2, 0.7, 0.2]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {(() => {
                if (welcomeMessage) {
                  console.log("WILLKOMMEN-RENDER-DEBUG: Rendere Willkommensnachricht mit Länge:", 
                    welcomeMessage.length, "Paragraphen:", welcomeMessage.split('\n\n').length);
                  
                  return (
                    <div className="relative z-10">
                      {/* Split by paragraphs and animate each separately */}
                      {welcomeMessage.split('\n\n').map((paragraph, i) => (
                        <motion.div 
                          key={i}
                          className="prose prose-sm max-w-none mb-3 last:mb-0"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + (i * 0.15), duration: 0.5 }}
                          dangerouslySetInnerHTML={{ __html: paragraph.replace(/\n/g, '<br/>') }}
                        />
                      ))}
                    </div>
                  );
                } else {
                  console.log("WILLKOMMEN-RENDER-DEBUG: Keine Willkommensnachricht vorhanden, zeige Standardtext");
                  
                  return (
                    <motion.p 
                      className="text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      Wie kann ich Ihnen helfen?
                    </motion.p>
                  );
                }
              })()}
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Nachrichten-Liste */}
      <div className="space-y-3 min-h-0 flex flex-col justify-start">
        {/* Nachrichten anzeigen */}
        {filteredMessages.map((message) => (
          <Message 
            key={typeof message.id === 'string' ? message.id : `msg-${message.timestamp || Date.now()}`}
            content={message.content}
            role={message.role}
            botId={botId}
            isLastMessage={message === filteredMessages[filteredMessages.length - 1]}
            showCopyButton={showCopyButton && !message.streaming}
            enableFeedback={enableFeedback && !message.streaming}
            botName={botName}
            botAvatarUrl={botAvatarUrl}
            streaming={message.streaming}
          />
        ))}
        
        {/* Lade-Indikator nur anzeigen, wenn: 
            1. Wir im Lade-Zustand sind 
            2. Keine gefilterten Nachrichten vorhanden ODER die letzte Nachricht ist vom User
            3. Es gibt keine aktive Streaming-Nachricht */}
        {isLoading && 
         (filteredMessages.length === 0 || 
          (filteredMessages.length > 0 && 
           filteredMessages[filteredMessages.length-1].role === 'user')) && 
         !filteredMessages.some(msg => msg.streaming) && (
          <LoadingMessage 
            botName={botName} 
            botPrimaryColor={botPrimaryColor} 
            botAvatarUrl={botAvatarUrl} 
          />
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