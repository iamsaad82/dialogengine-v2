'use client'

import { useState, useEffect, useRef } from 'react'
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
  const preRef = useRef<HTMLDivElement>(null)
  
  // Zeit nur client-seitig festlegen, um Hydration-Fehler zu vermeiden
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [])
  
  // CSS-Styles für Markdown-Elemente
  useEffect(() => {
    console.log("MESSAGE-DEBUG-009: useEffect für Styles aufgerufen");
    
    // Check if styles already exist to avoid duplicates
    if (!document.getElementById('message-component-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'message-component-styles';
      styleEl.innerHTML = `
        /* Allgemeine Formatierung */
        .message-content a {
          color: #2563eb;
          text-decoration: underline;
          text-decoration-color: rgba(37, 99, 235, 0.3);
          text-underline-offset: 2px;
          transition: text-decoration-color 0.2s;
        }
        
        .message-content a:hover {
          text-decoration-color: rgba(37, 99, 235, 0.8);
        }
        
        /* Telefonnummern, E-Mail-Links und Web-Links */
        .message-content .phone-link, 
        .message-content .email-link,
        .message-content .web-link {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          margin: 2px 0;
        }
        
        .message-content .phone-link {
          background-color: rgba(37, 99, 235, 0.1);
          color: #2563eb;
          border: 1px solid rgba(37, 99, 235, 0.2);
        }
        
        .message-content .phone-link:hover {
          background-color: rgba(37, 99, 235, 0.15);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(37, 99, 235, 0.1);
        }
        
        .message-content .email-link {
          background-color: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
          border: 1px solid rgba(14, 165, 233, 0.2);
        }
        
        .message-content .email-link:hover {
          background-color: rgba(14, 165, 233, 0.15);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(14, 165, 233, 0.1);
        }
        
        .message-content .web-link {
          background-color: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
          border: 1px solid rgba(79, 70, 229, 0.2);
        }
        
        .message-content .web-link:hover {
          background-color: rgba(79, 70, 229, 0.15);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(79, 70, 229, 0.1);
        }
        
        /* Überschriften */
        .message-content h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #24292f;
          line-height: 1.3;
        }
        
        .message-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #24292f;
          line-height: 1.3;
        }
        
        /* Listen */
        .message-content ul {
          list-style-type: none;
          padding-left: 1.5rem;
          margin-top: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .message-content li {
          position: relative;
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        
        /* Nur für normale Listenelemente Bullet-Points anzeigen */
        .message-content li:not(.numbered-item)::before {
          content: "•";
          position: absolute;
          left: -1rem;
          color: #6b7280;
        }
        
        /* Nummerierte Listenelemente */
        .message-content .numbered-item {
          padding-left: 0;
        }
        
        /* Überschreibe das Pseudo-Element für nummerierte Elemente */
        .message-content .numbered-item::before {
          content: none !important;
        }
        
        /* Kontaktinformationen */
        .message-content .contact-label {
          font-weight: 600;
          color: #4b5563;
          min-width: 100px;
          display: inline-block;
        }
      `;
      document.head.appendChild(styleEl);
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
  const containerClasses = classNames(
    "px-4 py-3 rounded-lg transition-all",
    isUser 
      ? "bg-blue-50 text-blue-800 border border-blue-100 ml-auto" 
      : "bg-white text-gray-800 border border-gray-100",
    isLastMessage && isBot && isStreaming && "animate-pulse"
  )

  // Avatar für den Bot
  const BotAvatar = () => (
    <div className="bot-avatar flex items-center justify-center w-8 h-8 text-sm font-medium mr-2 rounded-md bg-white/60 border border-primary/20 text-primary shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </div>
  )

  // Avatar für den User
  const UserAvatar = () => (
    <div className="user-avatar flex items-center justify-center w-8 h-8 text-xs font-medium ml-2 rounded-md border border-primary/20 bg-primary/90 text-white shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  )

  // VERBESSERTE FORMATIERUNGSFUNKTION mit Markdown
  const renderContent = () => {
    console.log("MESSAGE-DEBUG-009: renderContent aufgerufen");
    
    // Sicherheitsprüfung für leeren Inhalt
    if (!message.content || typeof message.content !== 'string') {
      console.log("MESSAGE-DEBUG-009: Ungültiger Inhalt:", message.content);
      return <div className="text-red-500">Ungültige Nachricht</div>;
    }
    
    // Vorverarbeitung
    let processedContent = message.content;
    
    // Entferne automatische Leerzeichen-Einfügung nach Doppelpunkten
    // processedContent = processedContent.replace(/(Telefon|E-Mail|Website|Kontakt|Adresse|Schulform|Schulleitung|Standort|Fax|Öffnungszeiten|Angebote):([\S])/g, '$1: $2');
    
    // Konvertiere Telefonnummern in Links (wenn nicht bereits Links)
    // Erweitertes Muster für verschiedene Telefonnummernformate
    processedContent = processedContent.replace(/(\(?\d{3,5}\)?\s*[-\s]?\d+[\s\d-]*\d+)/g, (match) => {
      // Überspringe, wenn bereits ein Link
      if (match.includes('[') || match.includes('](')) return match;
      
      // Telefonnummer bereinigen: Nur Zahlen behalten
      const cleanNumber = match.replace(/\D/g, '');
      return `[${match}](tel:${cleanNumber})`;
    });
    
    // Konvertiere Web-URLs in Links (wenn nicht bereits Links)
    processedContent = processedContent.replace(/(https?:\/\/[^\s]+|www\.[^\s]+\.[a-z]{2,}[^\s]*)/g, (match) => {
      // Überspringe, wenn bereits ein Link
      if (match.includes('[') || match.includes('](')) return match;
      
      // Füge http:// hinzu, wenn es mit www. beginnt
      const url = match.startsWith('www.') ? `https://${match}` : match;
      return `[${match}](${url})`;
    });
    
    // Erkenne Domänen ohne Protokoll (z.B. example.com)
    processedContent = processedContent.replace(/\b([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}(\/[^\s]*)?/g, (match) => {
      // Überspringe, wenn bereits ein Link oder Teil einer E-Mail
      if (match.includes('[') || match.includes('](') || 
          processedContent.includes(`mailto:${match}`) || 
          processedContent.includes(`@${match}`)) return match;
      
      return `[${match}](https://${match})`;
    });
    
    // Konvertiere E-Mail-Adressen in Links (wenn nicht bereits Links)
    processedContent = processedContent.replace(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, (match) => {
      if (match.includes('[') || match.includes('](')) return match; // Bereits ein Link
      return `[${match}](mailto:${match})`;
    });
    
    return (
      <div className="prose prose-sm break-words pointer-events-auto message-content">
        <ReactMarkdown
          components={{
            a: ({node, ...props}) => {
              let className = '';
              
              // Linktyp basierend auf href bestimmen
              if (props.href?.startsWith('tel:')) {
                className = 'phone-link';
              } else if (props.href?.startsWith('mailto:')) {
                className = 'email-link';
              } else if (props.href?.startsWith('http')) {
                className = 'web-link';
              }
              
              return (
                <a 
                  {...props} 
                  className={className}
                  target={props.href?.startsWith('http') ? '_blank' : undefined}
                  rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                />
              );
            },
            ul: ({node, ...props}) => <ul {...props} />,
            li: ({node, children, ...props}) => {
              // Text des Listenelements
              const content = String(children);
              
              // Prüfe, ob es mit einer Zahl mit Punkt beginnt (z.B. "1. Kita")
              const isNumbered = /^\d+\./.test(content);
              
              return (
                <li 
                  className={isNumbered ? 'numbered-item' : ''}
                  {...props}
                >
                  {children}
                </li>
              );
            },
            h2: ({node, ...props}) => <h2 {...props} />,
            h3: ({node, ...props}) => <h3 {...props} />,
            p: ({node, children, ...props}) => {
              // Prüfen auf Kontaktinformationen
              const content = String(children);
              const isContactInfo = /^(Adresse|Telefon|E-Mail|Standort|Öffnungszeiten|Angebote|Schulform|Schulleitung|Ganztagsschule|Kontakt|Website)/.test(content);
              
              if (isContactInfo) {
                // Extrahiere Labeltext (bis zum Doppelpunkt)
                const labelMatch = content.match(/^([^:]+):/);
                if (labelMatch) {
                  const label = labelMatch[1];
                  const restContent = content.replace(/^[^:]+:/, '').trim();
                  
                  return (
                    <p {...props}>
                      <span className="contact-label">{label}:</span>{restContent}
                    </p>
                  );
                }
              }
              
              return <p {...props}>{children}</p>;
            }
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  }

  // Animation für die Nachrichtenbubble
  const variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      x: isBot ? -20 : 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
        duration: 0.3,
      } 
    }
  }

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