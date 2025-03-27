'use client'

import { useState, useEffect } from 'react'
import { Message as MessageType } from '../types'
import classNames from 'classnames'
import { LunaryClient } from '@/lib/lunary-client'
import { BotIcon } from './ui/icons'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import React from 'react'

// VERSION-MARKER: Message-Debug-Code - Version 018
console.log("Message.tsx geladen - Debug-Version 018 (Duplikat-Wörter + [DONE]-Fix)");

// VERSION-MARKER: Message-Debug-Code - Version 019
console.log("Message.tsx geladen - Debug-Version 019 (Ladeanimation-Fix)");

// VERSION-MARKER: Message-Debug-Code - Version 020
console.log("Message.tsx geladen - Debug-Version 020 (Verbesserte Duplikat-Erkennung)");

// VERSION-MARKER: Message-Debug-Code - Version 021
console.log("Message.tsx geladen - Debug-Version 021 (HTML-Duplikat-Erkennung-Fix)");

// VERSION-MARKER: Message-Debug-Code - Version 022
console.log("Message.tsx geladen - Debug-Version 022 (Nur Ladeanimation, Text entfernt)");

// VERSION-MARKER: Message-Debug-Code - Version 023
console.log("Message.tsx geladen - Debug-Version 023 (react-markdown Integration)");

// VERSION-MARKER: Message-Debug-Code - Version 024
console.log("Message.tsx geladen - Debug-Version 024 (verbesserte Markdown-Darstellung)");

// VERSION-MARKER: Message-Debug-Code - Version 025
console.log("Message.tsx geladen - Debug-Version 025 (Tabellarische Darstellung für Schulen)");

// Entferne Abhängigkeit von externen Icons durch einfache SVG-Implementierungen
const IconUser = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconCopy = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconThumbUp = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const IconThumbDown = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

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

  // Bereinige den Nachrichteninhalt vor dem Rendern
  const cleanMessageContent = (content: string | null | undefined): string => {
    if (!content || content.trim() === '') {
      console.log("MESSAGE-RENDER-DEBUG: Leerer Inhalt erkannt");
      return "";
    }

    let cleanedContent = content;
    
    // Entferne JSON-Artefakte
    if (cleanedContent.includes('{"event":')) {
      const jsonStartIndex = cleanedContent.indexOf('{"event":');
      if (jsonStartIndex > 0) {
        cleanedContent = cleanedContent.substring(0, jsonStartIndex);
      }
    }
    
    // Entferne [DONE] am Ende
    cleanedContent = cleanedContent.replace(/\[DONE\]$/g, '');

    // Erkennung von Schuldaten für bessere Formatierung
    const containsSchoolInfo = /Schulform:|Adresse:|Kontakt:|Telefon:|E-Mail:|Website:/i.test(cleanedContent);
    
    if (containsSchoolInfo) {
      console.log("MESSAGE-RENDER-DEBUG: Schulinformationen erkannt, formatiere speziell");
      
      // Standardisiere Überschriften und Schlüsselwörter
      cleanedContent = cleanedContent
        .replace(/(\n|^)Name:(\s*)/g, '$1**Name:**$2')
        .replace(/(\n|^)Schulform:(\s*)/g, '$1**Schulform:**$2')
        .replace(/(\n|^)Schulleitung:(\s*)/g, '$1**Schulleitung:**$2')
        .replace(/(\n|^)Adresse:(\s*)/g, '$1**Adresse:**$2')
        .replace(/(\n|^)Kontakt:(\s*)/g, '$1**Kontakt:**$2')
        .replace(/(\n|^)Telefon:(\s*)/g, '$1**Telefon:**$2')
        .replace(/(\n|^)E-Mail:(\s*)/g, '$1**E-Mail:**$2')
        .replace(/(\n|^)Website:(\s*)/g, '$1**Website:**$2')
        .replace(/(\n|^)Angebote:(\s*)/g, '$1**Angebote:**$2')
        .replace(/(\n|^)Öffnungszeiten:(\s*)/g, '$1**Öffnungszeiten:**$2')
        .replace(/(\n|^)Von:(\s*)/g, '$1**Von:**$2')
        .replace(/(\n|^)Bis:(\s*)/g, '$1**Bis:**$2')
        .replace(/(\n|^)Ganztagsschule:(\s*)/g, '$1**Ganztagsschule:**$2')
        .replace(/(\n|^)Link:(\s*)/g, '$1**Link:**$2');
        
      // Formatiere URL-Links korrekt
      cleanedContent = cleanedContent.replace(
        /(https?:\/\/[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+(\.[a-z]{2,})([\/\w\.-]*)*\/?)/gi, 
        '[$1]($1)'
      );
      
      // Stelle sicher, dass Listeneinträge korrekt formatiert sind
      cleanedContent = cleanedContent.replace(/(\n|^)- /g, '\n- ');
      
      // Füge Abstand zwischen Schulen ein, wenn mehrere Schulen aufgelistet sind
      cleanedContent = cleanedContent.replace(/(\n\n)([A-Z][a-zäöüÄÖÜß]+ [A-Z][a-zäöüÄÖÜß]+)/g, '$1\n## $2');
      
      console.log("MESSAGE-RENDER-DEBUG: Formatierte Schulinfos:", 
        cleanedContent.length > 100 ? cleanedContent.substring(0, 100) + "..." : cleanedContent);
    }
    
    // Versuche doppelte Anfänge zu identifizieren und zu entfernen
    try {
      // Erstelle ein temporäres Element für Text-Extraktion
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanedContent;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // Teile in Wörter und prüfe auf Duplikate am Anfang
      const words = textContent.trim().split(/\s+/);
      
      if (words.length >= 4) {
        for (let count = 1; count <= Math.min(3, Math.floor(words.length/2)); count++) {
          const firstPart = words.slice(0, count).join(' ').toLowerCase();
          const secondPart = words.slice(count, count*2).join(' ').toLowerCase();
          
          if (firstPart === secondPart) {
            // Muster für die ersten Wörter mit möglichen HTML-Tags
            const pattern = new RegExp(`(<[^>]*>\\s*)?${escapeRegExp(firstPart)}\\s*`, 'i');
            cleanedContent = cleanedContent.replace(pattern, '');
            break;
          }
        }
      }
    } catch (error) {
      console.error("MESSAGE-RENDER-DEBUG: Fehler bei Duplikat-Prüfung:", error);
    }
    
    return cleanedContent;
  }

  // Hilfsfunktion zum Escapen von Zeichen für RegExp
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Verarbeite den Nachrichteninhalt für die Anzeige
  const processedContent = message.content ? cleanMessageContent(message.content) : '';

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
        {/* Nachrichten-Inhalt mit React Markdown */}
        {message.content && message.content.trim() !== "" ? (
          <div className="message-content prose dark:prose-invert max-w-full">
            {/* ReactMarkdown als ESM Import verwenden mit dynamischer Typisierung */}
            {React.createElement(ReactMarkdown as any, {
              rehypePlugins: [rehypeRaw],
              components: {
                // Verbessere die Darstellung bestimmter Elemente
                h1: ({node, ...props}: {node: any, children: React.ReactNode}) => 
                  <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                h2: ({node, ...props}: {node: any, children: React.ReactNode}) => 
                  <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                h3: ({node, ...props}: {node: any, children: React.ReactNode}) => 
                  <h3 className="text-base font-bold mt-2 mb-1" {...props} />,
                p: ({node, ...props}: {node: any, children: React.ReactNode}) => 
                  <p className="my-1" {...props} />,
                ul: ({node, ...props}: {node: any, children: React.ReactNode}) => 
                  <ul className="pl-5 my-2 list-disc" {...props} />,
                ol: ({node, ...props}: {node: any, children: React.ReactNode}) => 
                  <ol className="pl-5 my-2 list-decimal" {...props} />,
                li: ({node, ...props}: {node: any, children: React.ReactNode}) => 
                  <li className="mb-1" {...props} />,
                a: ({node, href, ...props}: {node: any, href: string, children: React.ReactNode}) => 
                  <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" href={href} {...props} />,
                // Spezielle Klassen für Schulinformationen
                strong: ({node, ...props}: {node: any, children: React.ReactNode}) => {
                  // Prüfe, ob es eine Informationskennzeichnung ist (z.B. "Name:", "Adresse:")
                  const content = props.children?.toString() || '';
                  if (content.endsWith(':')) {
                    return <strong className="inline-block min-w-24 font-semibold" {...props} />;
                  }
                  return <strong className="font-semibold" {...props} />;
                }
              },
              className: "break-words"
            }, processedContent)}
          </div>
        ) : isStreaming ? (
          <div className="flex items-center justify-start p-2">
            <div className="flex space-x-2">
              <div className="animate-bounce delay-0 h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-gray-300"></div>
              <div className="animate-bounce delay-150 h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-gray-300"></div>
              <div className="animate-bounce delay-300 h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-gray-300"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-start p-2">
            <div className="flex space-x-2">
              <div className="h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-gray-300"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-gray-300"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-gray-300"></div>
            </div>
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