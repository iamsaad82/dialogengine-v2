'use client'

import { useState, useEffect } from 'react'
import { Message as MessageType } from '../types'
import classNames from 'classnames'
import { LunaryClient } from '@/lib/lunary-client'

// VERSION-MARKER: Message-Debug-Code - Version 016
console.log("Message.tsx geladen - Debug-Version 016 (leere Nachricht-Fix)");

export interface MessageProps {
  message: MessageType
  isLastMessage?: boolean
  botName?: string
  showCopyButton?: boolean
  botId?: string
  enableFeedback?: boolean
  isStreaming?: boolean
}

export function Message({
  message,
  isLastMessage = false,
  botName = 'Assistent',
  showCopyButton = true,
  botId = 'default',
  enableFeedback = false,
  isStreaming = false
}: MessageProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)

  // Zurücksetzen des Kopierstatus nach 2 Sekunden
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  // Text in die Zwischenablage kopieren
  const copyToClipboard = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content)
      setCopied(true)

      // Kopier-Event tracken
      try {
        LunaryClient.track({
          eventName: 'message_copied',
          properties: { botId, messageLength: message.content.length }
        })
      } catch (error) {
        console.error('Tracking error:', error)
      }
    }
  }

  // Feedback senden
  const sendFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type)

    // Feedback-Event tracken
    try {
      LunaryClient.track({
        eventName: 'message_feedback',
        properties: { 
          botId, 
          feedback: type, 
          messageLength: message.content?.length || 0
        }
      })
    } catch (error) {
      console.error('Tracking error:', error)
    }
  }

  // Debug-Ausgabe bei leerem Inhalt
  if (!message.content) {
    console.warn("MESSAGE-RENDER-DEBUG: Leere Nachricht!", { isStreaming });
  } else {
    // Log eine Vorschau des Inhalts
    console.warn("MESSAGE-RENDER-DEBUG: Nachrichteninhalt:",
      message.content.substring(0, 100) + (message.content.length > 100 ? "..." : ""));
  }

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      {/* Absender-Label */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
        {isUser ? 'Sie' : botName}
      </div>

      {/* Nachrichtenbubble */}
      <div
        className={classNames(
          'p-3 rounded-lg max-w-[85%] break-words',
          isUser 
            ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground' 
            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
          isStreaming && 'animate-pulse'
        )}
        style={{
          backgroundColor: isUser
            ? 'var(--user-bg-color, var(--primary))' 
            : 'var(--bot-bg-color, #f3f4f6)',
          color: isUser
            ? 'var(--user-text-color, var(--primary-foreground))' 
            : 'var(--bot-text-color, #111827)'
        }}
      >
        {/* Nachrichten-Inhalt direkt anzeigen */}
        {message.content && message.content.trim() !== "" ? (
          <div 
            className="message-content prose dark:prose-invert"
            dangerouslySetInnerHTML={{ 
              __html: message.content 
            }}
          />
        ) : isStreaming ? (
          <div className="text-gray-500 italic">
            <div className="flex items-center">
              <span>Ich bereite eine Antwort vor</span>
              <span className="ml-1 flex space-x-1">
                <span className="animate-bounce delay-0">.</span>
                <span className="animate-bounce delay-150">.</span>
                <span className="animate-bounce delay-300">.</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Lädt Nachricht...</span>
          </div>
        )}
      </div>

      {/* Aktionen (Kopieren, Feedback) für Assistenten-Nachrichten */}
      {!isUser && !isStreaming && message.content && (
        <div className="flex items-center mt-1 space-x-2">
          {showCopyButton && (
            <button
              onClick={copyToClipboard}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-xs flex items-center"
              aria-label="Nachricht kopieren"
            >
              {copied ? (
                <>
                  <span className="h-3 w-3 mr-1">✓</span>
                  <span>Kopiert</span>
                </>
              ) : (
                <>
                  <span className="h-3 w-3 mr-1">📋</span>
                  <span>Kopieren</span>
                </>
              )}
            </button>
          )}

          {/* Feedback-Buttons */}
          {enableFeedback && isLastMessage && (
            <div className="flex items-center space-x-2 ml-2">
              <button
                onClick={() => sendFeedback('positive')}
                className={`p-1 rounded-full ${
                  feedback === 'positive'
                    ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                aria-label="Positive Rückmeldung"
              >
                <span className="h-3 w-3">👍</span>
              </button>
              <button
                onClick={() => sendFeedback('negative')}
                className={`p-1 rounded-full ${
                  feedback === 'negative'
                    ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                aria-label="Negative Rückmeldung"
              >
                <span className="h-3 w-3">👎</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Einfache Markdown-zu-HTML-Konvertierung als Fallback
function simpleMarkdownToHtml(text: string): string {
  // Ersetze Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>');
  
  // Ersetze **bold** mit <strong>
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Ersetze *italic* mit <em>
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Ersetze Listen (sehr einfach)
  text = text.replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>');
  
  // Prüfe, ob es irgendwelche Liste-Items gibt
  if (text.includes('<li>')) {
    // Verpacke alle benachbarten <li>-Elemente in eine <ul>
    let inList = false;
    const lines = text.split('\n');
    const processedLines = [];
    
    for (const line of lines) {
      if (line.includes('<li>')) {
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        processedLines.push(line);
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(line);
      }
    }
    
    if (inList) {
      processedLines.push('</ul>');
    }
    
    text = processedLines.join('\n');
  }
  
  // Ersetze Zeilenumbrüche mit <br />
  text = text.replace(/\n/g, '<br />');
  
  return text;
} 