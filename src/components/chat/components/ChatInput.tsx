'use client'

import React, { useRef, useEffect, KeyboardEvent, useState } from 'react'
import { SendIcon, XIcon, MicrophoneIcon } from './ui/icons'
import { motion } from 'framer-motion'
import { ChatInputProps } from '../types/common'

export function ChatInput({ 
  onSend, 
  onCancel, 
  isLoading,
  botPrimaryColor,
  botAccentColor,
  botTextColor
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Automatische Höhenanpassung der Textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight + 'px'
    }
  }, [message])

  // Nachricht senden
  const handleSubmit = () => {
    if (message.trim()) {
      onSend(message.trim())
      setMessage('')
    }
  }

  // Tastatur-Events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form className="w-full flex items-center px-4 py-5 md:px-5">
      <div className="relative flex w-full items-center">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Schreiben Sie eine Nachricht..."
          className="flex h-16 w-full resize-none rounded-full border border-input/30 bg-white/70 backdrop-blur-md px-5 py-3 pr-28 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all flex items-center justify-center chat-input-field"
          aria-label="Chat Nachricht eingeben"
          aria-multiline="true"
          aria-required="true"
          aria-invalid="false"
          aria-disabled="false"
          style={{
            paddingTop: '18px',
            lineHeight: 'normal',
            fontSize: '16px',
            paddingRight: '110px',
            paddingLeft: '22px',
            height: '80px',
            minHeight: '80px',
            borderColor: isFocused ? `${botPrimaryColor}80` : 'rgba(0,0,0,0.1)'
          }}
        />
        <div className="absolute right-4 flex items-center space-x-3 pr-1">
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-muted-foreground hover:bg-gray-100 disabled:hover:bg-white/80 disabled:hover:text-muted-foreground shadow-sm"
            disabled={true}
            aria-label="Sprachnachricht aufnehmen (nicht verfügbar)"
            title="Sprachnachricht aufnehmen (nicht verfügbar)"
          >
            <MicrophoneIcon className="h-6 w-6" />
          </button>
          
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            disabled={!message.trim() || isLoading}
            className="flex h-13 w-13 items-center justify-center rounded-full text-white hover:opacity-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isLoading ? "Anfrage wird bearbeitet" : "Nachricht senden"}
            tabIndex={0}
            style={{ 
              backgroundColor: botPrimaryColor || botAccentColor || 'rgb(0, 94, 63)',
              width: '52px',
              height: '52px'
            }}
          >
            {isLoading ? (
              <XIcon className="h-7 w-7" />
            ) : (
              <SendIcon className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>
    </form>
  )
} 