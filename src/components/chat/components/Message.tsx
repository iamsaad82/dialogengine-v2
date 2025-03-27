'use client'

import { useState, useEffect } from 'react'
import { Message as MessageType } from '../types'
import classNames from 'classnames'
import { LunaryClient } from '@/lib/lunary-client'

// VERSION-MARKER: Message-Debug-Code - Version 018
console.log("Message.tsx geladen - Debug-Version 018 (Duplikat-Wörter + [DONE]-Fix)");

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

  // Verbessere die processMessageContent-Funktion, um JSON-Daten zu filtern
  const processMessageContent = (content: string | null | undefined): string => {
    // Prüfe auf null/undefined/leere Strings
    if (!content || content.trim() === '') {
      console.warn("MESSAGE-RENDER-DEBUG: Leerer Inhalt erkannt!");
      return "..."; // Sichtbarer Platzhalter für leere Nachrichten
    }
    
    // Ausgabe des Inhalts für Debugging-Zwecke (begrenzt auf 100 Zeichen)
    console.warn(
      "MESSAGE-RENDER-DEBUG: Verarbeite Inhalt:", 
      content.length > 100 ? content.substring(0, 100) + "..." : content
    );
    
    // Erkenne und filtere JSON-Objekte heraus
    let formattedContent = content;
    
    // Suche nach {"event": Mustern, die auf JSON-Daten hindeuten
    const jsonRegex = /\{"event":\s*"[^"]*",\s*"data":/g;
    if (jsonRegex.test(content)) {
      console.warn("MESSAGE-RENDER-DEBUG: JSON-Daten in der Nachricht gefunden!");
      
      // Extrahiere den Abschnitt vor dem JSON
      const jsonStartIndex = content.indexOf('{"event":');
      if (jsonStartIndex > 0) {
        formattedContent = content.substring(0, jsonStartIndex);
        console.warn("MESSAGE-RENDER-DEBUG: Nachricht auf Text vor JSON gekürzt:", formattedContent);
      }
    }
    
    // Entferne [DONE] am Ende
    if (formattedContent.includes("[DONE]")) {
      formattedContent = formattedContent.replace("[DONE]", "");
      console.warn("MESSAGE-RENDER-DEBUG: [DONE] aus der Nachricht entfernt");
    }
    
    // Prüfe auf doppelte Wörter am Anfang (wie "Klar, Klar ich...")
    const words = formattedContent.trim().split(' ');
    if (words.length >= 2 && words[0] === words[1]) {
      console.warn("MESSAGE-RENDER-DEBUG: Doppeltes Wort am Anfang gefunden:", words[0]);
      formattedContent = formattedContent.replace(words[0] + ' ', '');
    }
    
    return formattedContent;
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
              __html: processMessageContent(message.content) 
            }}
          />
        ) : isStreaming ? (
          <div className="text-gray-500 italic flex items-center justify-center">
            <span className="flex space-x-1">
              <span className="animate-bounce delay-0 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
              <span className="animate-bounce delay-150 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
              <span className="animate-bounce delay-300 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
            </span>
          </div>
        ) : (
          <div className="text-gray-500 italic">
            Einen Moment bitte...
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