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
  botTextColor,
  onChange
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
    <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (onChange) onChange(e);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Schreiben Sie eine Nachricht..."
          className="chat-input-field"
          aria-label="Chat Nachricht eingeben"
          aria-multiline="true"
          aria-required="true"
          style={{
            borderColor: isFocused ? `${botPrimaryColor}80` : undefined,
          }}
        />

        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          disabled={!message.trim() || isLoading}
          className="send-button"
          aria-label={isLoading ? "Anfrage wird bearbeitet" : "Nachricht senden"}
          style={{
            backgroundColor: botPrimaryColor || botAccentColor || 'rgb(0, 94, 63)'
          }}
        >
          {isLoading ? (
            <XIcon className="h-5 w-5" />
          ) : (
            <SendIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  )
}