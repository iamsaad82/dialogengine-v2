'use client'

import { KeyboardEvent, useRef, useState, ChangeEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LunaryClient } from '@/lib/lunary-client'

// VERSION-MARKER: ChatInput-Debug-Code - Version 004
console.log("ChatInput.tsx geladen - Debug-Version 004 (Streaming)");

export interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
  botId?: string
  placeholder?: string
  className?: string
}

// Einfache SVG Icons für die Komponente
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const CancelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const LoadingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export function ChatInput({
  input = '',
  setInput,
  isLoading,
  onSubmit,
  onCancel,
  botId = 'default',
  placeholder = 'Schreibe deine Nachricht...',
  className = ''
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [ctrlEnterUsed, setCtrlEnterUsed] = useState(false)

  // Event-Handler für Tastatureingaben (Enter zum Absenden, Shift+Enter für neue Zeile)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Sende Nachricht mit Enter (aber nicht mit Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }

    // Neue Zeile mit Shift+Enter
    if (e.key === 'Enter' && e.shiftKey) {
      // Standard-Verhalten beibehalten (Zeilenumbruch)
    }
    
    // Erfassen, ob Benutzer Strg+Enter verwenden
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      setCtrlEnterUsed(true)
      // Tracking für Ctrl+Enter Nutzung
      LunaryClient.track({
        eventName: 'ctrl_enter_used',
        properties: { botId }
      })
    }
  }

  // Nachrichtenlänge automatisch anpassen
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    
    // Automatisch die Höhe anpassen
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }

  // Nachricht senden
  const sendMessage = async () => {
    if (input.trim() === '' || isLoading) return
    
    // Input temporär speichern und zurücksetzen
    const message = input.trim()
    setInput('')
    
    // Textarea zurücksetzen
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    
    // An die Parent-Komponente senden
    await onSubmit(message)
    
    // Tracking für Nachrichten-Länge
    LunaryClient.track({
      eventName: 'message_length',
      properties: { 
        length: message.length,
        botId
      }
    })
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-end border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 px-3 py-2 outline-none resize-none max-h-32 bg-transparent"
          style={{ paddingRight: '3rem' }}
          disabled={isLoading}
        />
        <div className="absolute bottom-2 right-2 flex">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.button
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onCancel}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Abbrechen"
                type="button"
              >
                {onCancel ? <CancelIcon /> : <LoadingIcon />}
              </motion.button>
            ) : (
              <motion.button
                key="send"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={sendMessage}
                disabled={input.trim() === ''}
                className={`p-1 rounded-md ${
                  input.trim() === ''
                    ? 'text-gray-300 dark:text-gray-600'
                    : 'text-primary hover:bg-primary/10'
                }`}
                aria-label="Senden"
                style={{
                  color: input.trim() === '' ? undefined : 'var(--bot-accent-color, currentColor)'
                }}
                type="button"
              >
                <SendIcon />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 