'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { BotIcon, UserIcon, CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon } from './ui/icons'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import classNames from 'classnames'
import { LunaryClient } from '@/lib/lunary-client'
import { Message as MessageType } from '../types'
import cn from '@/lib/utils/cn'
import { Bot, User, Loader2, Check, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Markdown } from './Markdown'

// VERSION-MARKER: Message-Debug-Code - Version 010
console.log("Message.tsx geladen - Debug-Version 010 (Streaming)");

export interface MessageProps {
  message: MessageType
  isLastMessage?: boolean
  isStreaming?: boolean
  botName?: string
  showCopyButton?: boolean
  botId?: string
}

// Komponenten für UserAvatar
const UserAvatar = () => (
  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-gradient-to-br from-primary/90 to-primary shadow">
    <User className="h-4 w-4 text-primary-foreground" />
  </div>
)

export function Message({ 
  message, 
  isLastMessage = false,
  isStreaming = false,
  botName = 'SMG Dialog Engine',
  showCopyButton = true,
  botId = 'default' 
}: MessageProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null)
  const [displayRole, setDisplayRole] = useState<string>(message.role)
  
  // Zeit nur client-seitig festlegen, um Hydration-Fehler zu vermeiden
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [])
  
  // Kopieren-Funktion
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      
      LunaryClient.track({
        eventName: 'message_copied',
        properties: { botId }
      })
      
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }
  
  // Feedback senden
  const sendFeedback = (isPositive: boolean) => {
    setFeedbackGiven(isPositive ? 'positive' : 'negative')
    
    // Tracking-Event für Feedback
    LunaryClient.track({
      eventName: 'message_feedback',
      properties: { 
        feedback: isPositive ? 'positive' : 'negative',
        botId
      }
    })
    
    console.log(`Feedback gesendet: ${isPositive ? 'positiv' : 'negativ'} für Bot ${botId}`)
  }

  // Bei Rollen-Änderungen aktualisieren (z.B. von 'system' zu 'assistant')
  useEffect(() => {
    // Setze 'system' auf 'assistant' für die Anzeige
    if (message.role === 'system') {
      setDisplayRole('assistant')
    } else {
      setDisplayRole(message.role)
    }
  }, [message.role])

  // Festlegen von Klassen und Stilen basierend auf der Rolle
  const isUser = displayRole === 'user'
  const containerClasses = classNames(
    "px-4 py-3 rounded-lg transition-all",
    isUser ? "bg-blue-600 text-white ml-auto" : "bg-gray-100 text-gray-800 mr-auto",
    "mb-3",
    "message-container"
  )
  
  // Animation für das Einblenden von Nachrichten
  const variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      x: displayRole === 'assistant' ? -20 : 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        duration: 0.4
      } 
    }
  }
  
  // Vereinfachtes Rendering des Markdown-Inhalts
  const renderContent = () => {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>
          {message.content}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <motion.div
      className={`group relative mb-4 flex items-start ${
        displayRole === 'assistant' ? 'justify-start' : 'justify-end'
      } max-w-full`}
      initial="hidden"
      animate="visible"
      variants={variants}
      role={displayRole === 'assistant' ? 'region' : 'none'}
      aria-label={displayRole === 'assistant' ? 'Antwort des Assistenten' : 'Deine Nachricht'}
    >
      <div 
        className={`flex max-w-[85%] items-start gap-3 rounded-lg p-3 shadow-lg ${
          displayRole === 'assistant' ? 'glassmorphism-bot text-foreground' : 'glassmorphism-user text-white'
        }`}
        style={{
          backgroundColor: displayRole === 'assistant' 
            ? 'var(--bot-bg-color, rgba(248, 250, 252, 0.8))' 
            : 'var(--user-bg-color, linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.85)))',
          color: displayRole === 'assistant'
            ? 'var(--bot-text-color, currentColor)'
            : 'var(--user-text-color, #ffffff)',
          boxShadow: displayRole === 'assistant' 
            ? '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(255, 255, 255, 0.1) inset' 
            : '0 8px 32px rgba(var(--primary-rgb), 0.25)'
        }}
      >
        {displayRole === 'assistant' && (
          <div 
            className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background/90 backdrop-blur-sm shadow-inner"
            style={{ 
              borderColor: 'var(--bot-accent-color, rgba(0, 0, 0, 0.1))', 
              color: 'var(--bot-accent-color, currentColor)' 
            }}
          >
            <Bot className="h-4 w-4" />
          </div>
        )}
        
        <div className="w-full">
          <div className="mb-0.5 flex items-center justify-between">
            <div 
              className="text-sm font-medium"
              style={{ color: displayRole === 'assistant' ? 'var(--bot-text-color, currentColor)' : 'var(--user-text-color, #ffffff)' }}
            >
              {displayRole === 'assistant' ? botName : 'Du'}
            </div>
            <div className="text-xs opacity-70">{currentTime}</div>
          </div>
          
          {renderContent()}
          
          <div className="mt-1 flex items-center justify-end gap-2 text-xs text-muted-foreground/70">
            {displayRole === 'assistant' && (
              <div className="flex items-center gap-2">
                {showCopyButton && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 rounded p-1 text-xs opacity-70 transition-opacity hover:opacity-100"
                    aria-label="Kopieren"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {isCopied ? 'Kopiert' : 'Kopieren'}
                  </button>
                )}
                
                {!feedbackGiven && (
                  <div className="flex items-center gap-1 opacity-70">
                    <button
                      onClick={() => sendFeedback(true)}
                      className="rounded p-1 hover:text-green-500 transition-colors"
                      aria-label="Gut"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => sendFeedback(false)}
                      className="rounded p-1 hover:text-red-500 transition-colors"
                      aria-label="Schlecht"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                
                {feedbackGiven === 'positive' && (
                  <span className="text-green-500 flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    Danke für dein Feedback!
                  </span>
                )}
                
                {feedbackGiven === 'negative' && (
                  <span className="text-red-500 flex items-center gap-1">
                    <ThumbsDown className="h-3.5 w-3.5" />
                    Danke für dein Feedback!
                  </span>
                )}
              </div>
            )}
            
            {displayRole === 'user' && isLastMessage && (
              <div className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                Gesendet
              </div>
            )}
          </div>
        </div>
        
        {displayRole === 'user' && (
          <UserAvatar />
        )}
      </div>
      {isLastMessage && isStreaming && (
        <div className="streaming-indicator mt-1 inline-flex items-center absolute bottom-0 left-12">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          <span className="text-xs opacity-70">Schreiben...</span>
        </div>
      )}
    </motion.div>
  )
} 