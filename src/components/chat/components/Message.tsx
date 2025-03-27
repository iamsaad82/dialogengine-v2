'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { BotIcon, UserIcon, CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon } from './ui/icons'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import classNames from 'classnames'
import { LunaryClient } from '@/lib/lunary-client'

// VERSION-MARKER: Message-Debug-Code - Version 009
console.log("Message.tsx geladen - Debug-Version 009");

interface MessageProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
  isLastMessage?: boolean
  botName?: string
  showCopyButton?: boolean
  enableFeedback?: boolean
  botId?: string
  isStreaming?: boolean
}

export function Message({ 
  message, 
  isLastMessage = false,
  botName = 'SMG Dialog Engine',
  showCopyButton = true,
  enableFeedback = false,
  isStreaming = false
}: MessageProps) {
  const [copySuccess, setCopySuccess] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null)
  const isBot = message.role === 'assistant'
  
  // Zeit nur client-seitig festlegen, um Hydration-Fehler zu vermeiden
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [])
  
  // CSS-Styles für Markdown-Elemente
  useEffect(() => {
    // Füge CSS für die Formatierung hinzu, falls es noch nicht existiert
    if (!document.getElementById('markdown-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'markdown-styles';
      styleSheet.innerHTML = `
        /* Grundlegende Linkstile */
        .phone-number, .email-address, .url-address {
          display: inline-flex;
          align-items: center;
          padding: 0.15rem 0.4rem;
          border-radius: 0.25rem;
          font-weight: 500;
          white-space: nowrap;
          margin: 0 1px;
          border: 1px solid transparent;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        /* Telefonnummern */
        .phone-number {
          background-color: rgba(236, 253, 245, 0.6);
          color: #065f46;
          border-color: rgba(6, 95, 70, 0.2);
        }
        
        .phone-number:hover {
          background-color: rgba(236, 253, 245, 0.9);
          border-color: rgba(6, 95, 70, 0.4);
        }
        
        /* E-Mail-Adressen */
        .email-address {
          background-color: rgba(239, 246, 255, 0.6);
          color: #1e40af;
          border-color: rgba(30, 64, 175, 0.2);
        }
        
        .email-address:hover {
          background-color: rgba(239, 246, 255, 0.9);
          border-color: rgba(30, 64, 175, 0.4);
        }
        
        /* Webseiten */
        .url-address {
          background-color: rgba(243, 244, 246, 0.6);
          color: #374151;
          border-color: rgba(55, 65, 81, 0.2);
        }
        
        .url-address:hover {
          background-color: rgba(243, 244, 246, 0.9);
          border-color: rgba(55, 65, 81, 0.4);
        }
        
        /* Verbesserte Listenelemente */
        .list-vertical {
          padding-left: 0.25rem !important;
          margin: 0.5rem 0 1rem 0 !important;
          list-style-type: none !important;
        }
        
        .list-item {
          margin-bottom: 0.5rem !important;
          padding-left: 1.5rem !important;
          position: relative !important;
          line-height: 1.6 !important;
          display: flex !important;
          align-items: flex-start !important;
          color: #333 !important;
        }
        
        .list-item::before {
          content: "" !important;
          position: absolute !important;
          left: 0 !important;
          top: 0.5rem !important;
          width: 0.5rem !important;
          height: 0.5rem !important;
          background-color: rgba(var(--primary-rgb, 59, 130, 246), 0.8) !important;
          border-radius: 50% !important;
        }
        
        /* Verschachtelte Listen */
        .list-vertical .list-vertical {
          margin-top: 0.5rem !important;
          margin-left: 0.5rem !important;
        }
        
        .list-vertical .list-item::before {
          background-color: rgba(var(--primary-rgb, 59, 130, 246), 0.5) !important;
          width: 0.4rem !important;
          height: 0.4rem !important;
        }
        
        /* Spezielle Formatierung für Kontaktdaten */
        .contact-info {
          margin: 0.75rem 0 !important;
          padding: 0.75rem !important;
          background-color: rgba(249, 250, 251, 0.6) !important;
          border-radius: 0.375rem !important;
          border-left: 3px solid rgba(var(--primary-rgb, 59, 130, 246), 0.7) !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        }
        
        /* Verbesserte Überschriften */
        h1, h2, h3, h4, h5, h6 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          font-weight: 600;
          color: #111827;
        }
        
        h1 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          padding-bottom: 0.5rem;
        }
        
        h2 {
          font-size: 1.3rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          padding-bottom: 0.3rem;
          color: rgba(var(--primary-rgb, 59, 130, 246), 1);
        }
        
        h3 {
          font-size: 1.1rem;
          color: #4b5563;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        h4 {
          font-size: 1rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        /* Absätze und Text */
        p {
          margin: 0.5rem 0 0.75rem 0;
          line-height: 1.6;
          color: #374151;
        }
        
        strong {
          font-weight: 600;
          color: #111827;
        }
        
        /* Spezielles Styling für Kontaktbereiche */
        .contact-section {
          margin: 1rem 0;
          padding: 0.75rem;
          background-color: rgba(249, 250, 251, 0.8);
          border-radius: 0.5rem;
          border-left: 3px solid rgba(var(--primary-rgb, 59, 130, 246), 0.6);
        }
        
        .contact-label {
          color: rgba(var(--primary-rgb, 59, 130, 246), 0.9);
          margin-right: 0.25rem;
          font-weight: 600;
        }
        
        /* Füge etwas Abstand nach den Überschriften für bessere Lesbarkeit hinzu */
        h2 + p, h3 + p, h4 + p {
          margin-top: 0.5rem;
        }
        
        /* Trennlinien */
        hr {
          margin: 1.5rem 0;
          border: 0;
          height: 1px;
          background-color: rgba(0, 0, 0, 0.1);
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);
  
  // Debug-Ausgabe beim Rendern einer Nachricht
  useEffect(() => {
    console.log("MESSAGE-DEBUG-009: Nachricht gerendert:", {
      role: message.role,
      contentLength: message.content?.length || 0,
      isLastMessage,
      showCopyButton,
      enableFeedback
    });
  }, [message, isLastMessage, showCopyButton, enableFeedback]);

  // Funktion zum Kopieren der Nachricht
  const copyToClipboard = () => {
    // Erstellt einen temporären DOM-Knoten um HTML-Tags aus dem Text zu entfernen
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = message.content || ''
    const plainText = tempDiv.textContent || tempDiv.innerText || ''
    
    navigator.clipboard.writeText(plainText).then(() => {
      setCopySuccess(true)
      // Nach 2 Sekunden den Erfolgshinweis zurücksetzen
      setTimeout(() => {
        setCopySuccess(false)
      }, 2000)
    }).catch(err => {
      console.error('Fehler beim Kopieren in die Zwischenablage: ', err)
    })
  }

  // Feedback-Funktion
  const sendFeedback = (type: 'positive' | 'negative') => {
    if (feedbackGiven !== null) return; // Verhindere mehrfaches Feedback

    setFeedbackGiven(type);
    
    // Optional: Senden Sie das Feedback an den Server
    console.log(`Feedback zu Nachricht gesendet: ${type}`);
    
    // Hier können Sie Ihre eigene API aufrufen, um das Feedback zu speichern
    try {
      LunaryClient.track({
        eventName: 'chat_feedback',
        properties: { 
          messageContent: message.content,
          feedbackType: type
        }
      });
    } catch (error) {
      console.error('Fehler beim Senden des Feedbacks:', error);
    }
  };

  // Parse HTML-Tags in Markdown
  function formatTextWithHTML(text: string) {
    if (!text) return '';
    
    let processedContent = text;
    let cleanedContent = text;
    
    // Liste von HTML-Tag-Paaren, die entfernt werden müssen
    const tagPairs = [
      ['<ul>', '</ul>'],
      ['<ol>', '</ol>'],
      ['<li>', '</li>'],
      ['<p>', '</p>'],
      ['<h1>', '</h1>'],
      ['<h2>', '</h2>'],
      ['<h3>', '</h3>'],
      ['<h4>', '</h4>'],
      ['<h5>', '</h5>'],
      ['<h6>', '</h6>'],
      ['<strong>', '</strong>'],
      ['<em>', '</em>'],
      ['<i>', '</i>'],
      ['<b>', '</b>'],
      ['<a>', '</a>'],
      ['<div>', '</div>'],
      ['<span>', '</span>']
    ];
    
    // Füge bei Mustern wie "Telefon:(Nummer)" ein Leerzeichen nach dem Doppelpunkt ein
    processedContent = processedContent.replace(/(Telefon|E-Mail|Website|Kontakt|Adresse|Schulform|Schulleitung|Ganztagsschule|Standort|Fax):([\S])/g, '$1: $2');
    
    // Verbessere die Struktur von Listen, indem ein Leerzeichen zwischen Punkt und Text hinzugefügt wird
    processedContent = processedContent.replace(/^(\s*[0-9]+\.|\s*-|\s*\*\s*)([^\s])/gm, '$1 $2');
    
    // Erkenne Kontaktabschnitte und formatiere sie besser
    processedContent = processedContent.replace(/(Kontaktdaten:|Kontakt:|Adresse und Kontakt:|Adressdaten:|Anschrift:)([\s\S]*?)(?=\n\n|\n#|\n\*\*|\n__|\n<h|$)/g, (match, p1, p2) => {
      return `<div class="contact-info">${p1}${p2}</div>`;
    });
    
    // Verbessere die Formatierung von Aufzählungslisten, die mit *, - oder • beginnen
    processedContent = processedContent.replace(/^(\s*)(\*|\-|\•|\+)(\s+)([^\n]*)/gm, (match, indent, bullet, space, content) => {
      return `${indent}<li class="list-item">${content}</li>`;
    });
    
    // Füge Klassen zu ungeordneten Listen hinzu
    processedContent = processedContent.replace(/(<ul>)([\s\S]*?)(<\/ul>)/g, '<ul class="list-vertical">$2</ul>');
    
    // Telefonnummern mit speziellem Styling versehen
    // Erkennt verschiedene Telefonnummernformate: mit Vorwahl, mit Klammern, mit Leerzeichen, etc.
    processedContent = processedContent.replace(/(\+\d{1,4}[\s\-]*)?(\(?\d{2,5}\)?[\s\-]*)?\d{3,4}[\s\-]*\d{3,4}([\s\-]*\d{1,4})?/g, (match) => {
      if (match.trim().length > 6) { // Nur längere Nummern, um falsche Positive zu vermeiden
        return `<a href="tel:${match.replace(/[\s\-\(\)]/g, '')}" class="phone-number">${match}</a>`;
      }
      return match;
    });
    
    // Stelle sicher, dass zwischen aufeinanderfolgenden Sternchen ein Leerzeichen ist
    processedContent = processedContent.replace(/\*\*\s*\*\*/g, '** **');
    
    // Verbesserte Erkennung und Formatierung von E-Mail-Adressen
    // Regex für E-Mail-Adressen
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    
    // Ersetze E-Mail-Adressen mit Markdown-Links
    cleanedContent = cleanedContent.replace(emailRegex, (match) => {
      return `<a href="mailto:${match}" class="email-address">${match}</a>`;
    });
    
    // Webseiten-URLs erkennen und formatieren
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+\.[^\s]+)/g;
    cleanedContent = cleanedContent.replace(urlRegex, (match) => {
      // Stelle sicher, dass die URL ein http/https Präfix hat
      const url = match.startsWith('www.') ? 'https://' + match : match;
      // Zeige die URL ohne http/https an, wenn es mit www beginnt
      const displayText = match.startsWith('http') ? match.replace(/^https?:\/\//, '') : match;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="url-address">${displayText}</a>`;
    });
    
    return cleanedContent;
  }

  // Festlegen von Klassen und Stilen basierend auf der Rolle
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)

  return (
    <motion.div
      className={classNames(
        'px-4 py-3 mb-2 rounded-lg flex items-start',
        {
          'bg-gray-100': isUser,
          'bg-blue-50': !isUser,
          'text-gray-800': isUser,
          'text-gray-700': !isUser,
        }
      )}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar für Benutzer oder Bot */}
      <div className="mt-1 mr-3 flex-shrink-0">
        {isUser ? (
          <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm">
            <UserIcon className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="h-6 w-6 rounded-full bg-white text-primary border border-primary flex items-center justify-center text-sm">
            <BotIcon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Nachrichteninhalt und Header */}
      <div className="flex-1 min-w-0 relative">
        <div className="flex items-baseline mb-1">
          <span className="font-medium text-xs mr-auto">
            {isUser ? 'Sie' : botName}
          </span>
          <span className="text-gray-400 text-xs ml-2">{currentTime}</span>
        </div>

        {/* Markdown-Inhalt der Nachricht */}
        <div className="prose max-w-none text-sm break-words">
          <ReactMarkdown 
            components={{
              a: ({ node, ...props }) => (
                <a {...props} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" />
              ),
              ul: ({ node, ...props }) => <ul {...props} className="list-vertical" />,
              li: ({ node, ...props }) => <li {...props} className="list-item" />,
              p: ({ node, ...props }) => <p {...props} className="text-gray-700" />,
              h1: ({ node, ...props }) => <h1 {...props} className="text-xl font-bold mt-3 mb-2" />,
              h2: ({ node, ...props }) => <h2 {...props} className="text-lg font-semibold mt-2 mb-1" />,
              h3: ({ node, ...props }) => <h3 {...props} className="text-md font-semibold mt-2 mb-1" />,
              pre: ({ node, ...props }) => (
                <pre {...props} className="bg-gray-100 p-2 rounded overflow-auto text-sm" />
              ),
              code: ({ node, ...props }) => (
                <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-sm" />
              ),
            }}
          >
            {formatTextWithHTML(message.content || '')}
          </ReactMarkdown>
        </div>

        {/* Aktionsleiste (nur bei Bot-Nachrichten) */}
        {!isUser && (
          <div className="flex items-center mt-2 text-xs text-gray-500">
            {showCopyButton && !isStreaming && (
              <button
                onClick={copyToClipboard}
                className="flex items-center mr-4 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Nachricht kopieren"
              >
                {copySuccess ? (
                  <>
                    <CheckIcon className="h-3 w-3 mr-1" />
                    <span>Kopiert</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3 w-3 mr-1" />
                    <span>Kopieren</span>
                  </>
                )}
              </button>
            )}
            
            {enableFeedback && !isStreaming && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => sendFeedback('positive')}
                  className={`flex items-center hover:text-green-600 transition-colors ${
                    feedbackGiven === 'positive' ? 'text-green-600' : ''
                  }`}
                  disabled={feedbackGiven !== null}
                  aria-label="Positives Feedback"
                >
                  <ThumbsUpIcon className="h-3 w-3 mr-1" />
                </button>
                <button
                  onClick={() => sendFeedback('negative')}
                  className={`flex items-center hover:text-red-600 transition-colors ${
                    feedbackGiven === 'negative' ? 'text-red-600' : ''
                  }`}
                  disabled={feedbackGiven !== null}
                  aria-label="Negatives Feedback"
                >
                  <ThumbsDownIcon className="h-3 w-3 mr-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
} 