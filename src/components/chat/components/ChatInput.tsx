'use client'

import React, { useRef, useEffect, KeyboardEvent, useState } from 'react'
import { SendIcon, MicrophoneIcon, XCircleIcon } from './ui/icons'
import { motion } from 'framer-motion'

interface ChatInputProps {
  isLoading: boolean
  onSend: (value: string) => void
  onCancel: () => void
  botPrimaryColor?: string
}

export function ChatInput({ isLoading, onSend, onCancel, botPrimaryColor }: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')
  const isMobileRef = useRef<boolean>(false)

  // Prüfen, ob es sich um ein mobiles Gerät handelt
  useEffect(() => {
    isMobileRef.current = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  }, [])

  // Autofokus beim Mounten der Komponente, aber nicht auf Mobilgeräten
  useEffect(() => {
    if (inputRef.current && !isMobileRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Auto-resize Funktion für Textarea - begrenzt auf max 64px Höhe um Layout-Konsistenz zu gewährleisten
  useEffect(() => {
    const textarea = inputRef.current
    if (!textarea) return

    const adjustHeight = () => {
      textarea.style.height = 'auto'
      // Begrenzt die maximale Höhe für konsistentes Layout
      const newHeight = Math.min(textarea.scrollHeight, 64)
      textarea.style.height = `${newHeight}px`
    }

    textarea.addEventListener('input', adjustHeight)
    adjustHeight() // Initial anpassen

    return () => {
      textarea.removeEventListener('input', adjustHeight)
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input)
      setInput('')
      
      // Nach dem Senden die Höhe zurücksetzen
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter ohne Shift drücken sendet die Nachricht
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        onSend(input)
        setInput('')
        
        // Nach dem Senden die Höhe zurücksetzen
        if (inputRef.current) {
          inputRef.current.style.height = 'auto'
        }
      }
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-white border-t border-gray-100/30 shadow-sm" style={{ 
      borderRadius: '0 0 12px 12px',
      maxHeight: '90px',
      minHeight: '70px',
      flexShrink: 0
    }}>
      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center px-4 py-3 md:px-5"
      >
        <div className="relative flex w-full items-center">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Schreiben Sie eine Nachricht..."
            className="flex h-12 w-full resize-none rounded-full border border-input/30 bg-white/70 backdrop-blur-md px-5 py-3 pr-24 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all flex items-center justify-center chat-input-field"
            style={{ 
              paddingTop: "13px", 
              lineHeight: "normal",
              fontSize: "16px", // Mindestgröße 16px, um Auto-Zoom auf Mobilgeräten zu verhindern
              paddingRight: isMobileRef.current ? "70px" : "96px", // Weniger Abstand rechts auf Mobilgeräten
              paddingLeft: isMobileRef.current ? "12px" : "20px"  // Weniger Abstand links auf Mobilgeräten
            }}
            aria-label="Chat Nachricht eingeben"
            aria-multiline="true"
            aria-required="true"
            aria-invalid={false}
            aria-disabled={isLoading}
            disabled={isLoading}
          />
          <div className="absolute right-3 flex items-center space-x-1.5 pr-1">
            {isLoading && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => {
                  e.preventDefault()
                  onCancel()
                }}
                className="mr-1 flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                aria-label="Nachricht abbrechen"
                title="Nachricht abbrechen"
              >
                <XCircleIcon className="h-5 w-5" />
              </motion.button>
            )}
            <button
              type="button"
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-muted-foreground hover:bg-gray-100 disabled:hover:bg-white/80 disabled:hover:text-muted-foreground shadow-sm ${isMobileRef.current ? 'hidden' : ''}`}
              disabled
              aria-label="Sprachnachricht aufnehmen (nicht verfügbar)"
              title="Sprachnachricht aufnehmen (nicht verfügbar)"
            >
              <MicrophoneIcon className="h-5 w-5" />
            </button>
            <motion.button
              type="submit"
              className={`flex h-10 w-10 items-center justify-center rounded-full text-white hover:opacity-90 shadow-md ${
                (!input.trim() || isLoading) ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{ 
                backgroundColor: botPrimaryColor || 'hsl(var(--primary))'
              }}
              disabled={!input.trim() || isLoading}
              aria-label="Nachricht senden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SendIcon className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  )
} 