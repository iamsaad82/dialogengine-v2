'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { BotIcon, UserIcon, CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon } from './ui/icons'
import { motion } from 'framer-motion'
import Linkify from 'linkify-react'
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
}

export function Message({ 
  message, 
  isLastMessage = false,
  botName = 'SMG Dialog Engine',
  showCopyButton = true,
  enableFeedback = false,
  botId = 'default'
}: MessageProps) {
  const [copySuccess, setCopySuccess] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null)
  const isBot = message.role === 'assistant'
  
  // Zeit nur client-seitig festlegen, um Hydration-Fehler zu vermeiden
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [])
  
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

    // Versuche erst navigator.clipboard.writeText zu verwenden
    const copyWithAPI = () => {
      navigator.clipboard.writeText(plainText).then(
        () => {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
          
          // Tracking für Kopieren
          LunaryClient.track({
            eventName: 'message_copied',
            properties: { botId },
            metadata: { messageContent: plainText.slice(0, 100) }
          })
        },
        (err) => {
          console.error('Fehler beim Kopieren mit Clipboard API:', err)
          // Fallback zu document.execCommand
          copyWithExecCommand()
        }
      )
    }

    // Fallback mit document.execCommand
    const copyWithExecCommand = () => {
      try {
        // Erstelle temporäres Textarea-Element
        const textArea = document.createElement('textarea')
        textArea.value = plainText
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        // Führe Kopier-Befehl aus
        const successful = document.execCommand('copy')
        if (successful) {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
          
          // Tracking für Kopieren
          LunaryClient.track({
            eventName: 'message_copied',
            properties: { botId },
            metadata: { messageContent: plainText.slice(0, 100) }
          })
        } else {
          console.error('Fehler beim Kopieren mit execCommand')
        }
        
        // Entferne temporäres Element
        document.body.removeChild(textArea)
      } catch (err) {
        console.error('Fehler beim Kopieren mit Fallback-Methode:', err)
      }
    }

    // Versuche erst die moderne API, dann den Fallback
    try {
      copyWithAPI()
    } catch (err) {
      console.error('Clipboard API nicht verfügbar, verwende Fallback:', err)
      copyWithExecCommand()
    }
  }
  
  // Funktion zum Senden von Feedback
  const sendFeedback = (isPositive: boolean) => {
    setFeedbackGiven(isPositive ? 'positive' : 'negative')
    
    // Tracking für Feedback
    LunaryClient.trackFeedback({
      rating: isPositive,
      userId: 'anonymous',
      metadata: { 
        botId,
        messageContent: message.content.slice(0, 100) // Ersten 100 Zeichen
      }
    })
    
    console.log(`Feedback gesendet: ${isPositive ? 'positiv' : 'negativ'} für Bot ${botId}`)
  }

  // Festlegen von Klassen und Stilen basierend auf der Rolle
  const isUser = message.role === 'user'
  const containerClasses = classNames(
    "px-4 py-3 rounded-lg transition-all",
    isUser 
      ? "glassmorphism-user ml-auto max-w-[85%] md:max-w-[75%] mb-3" 
      : "glassmorphism-bot mr-auto max-w-[85%] md:max-w-[75%] mb-3"
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

  // VERBESSERTE FORMATIERUNGSFUNKTION mit Markdown und Rich Media Unterstützung
  const renderContent = () => {
    console.log("MESSAGE-DEBUG-009: renderContent aufgerufen");
    
    // Sicherheitsprüfung für leeren Inhalt
    if (!message.content || typeof message.content !== 'string') {
      console.log("MESSAGE-DEBUG-009: Ungültiger Inhalt:", message.content);
      return <div className="text-red-500">Ungültige Nachricht</div>;
    }
    
    // Zurück zu einer direkteren HTML-Verarbeitung mit manueller Link-Erkennung
    let processedContent = message.content;
    
    // Spezieller Fix für doppelte Sternchen (Fettdruck)
    processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Einzelne Sternchen (Kursivdruck)
    processedContent = processedContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Telefonnummern erkennen und formatieren - präzisere Regex-Muster
    const phoneRegex = /(\+\d{1,4}[\s-]?)?\(?(?:\d{2,6})\)?[\s-]?\d{3,}[\s-]?\d{1,}/g;
    let phoneMatches = processedContent.match(phoneRegex);
    if (phoneMatches) {
      for (const phoneMatch of phoneMatches) {
        // Prüfen, ob es sich um eine gültige Telefonnummer handelt
        const digitCount = phoneMatch.replace(/[^\d]/g, '').length;
        if (digitCount < 5 || digitCount > 15) continue;
        
        // Telefonnummer als klickbaren Link formatieren
        const cleanPhone = phoneMatch.replace(/[^\d+]/g, '');
        const phoneLink = `<a href="tel:${cleanPhone}" class="phone-number">${phoneMatch}</a>`;
        
        // Ersetze die Telefonnummer durch den Link mit exaktem String-Matching
        const escapedPhoneMatch = phoneMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regexPhone = new RegExp(`\\b${escapedPhoneMatch}\\b`, 'g');
        processedContent = processedContent.replace(regexPhone, phoneLink);
      }
    }
    
    // E-Mail-Adressen erkennen und als klickbaren Link formatieren
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatches = [...processedContent.matchAll(emailRegex)];

    for (const match of emailMatches) {
      const emailMatch = match[0];
      // Formatieren als klickbaren Link
      const emailLink = `<a href="mailto:${emailMatch}" class="email-address">${emailMatch}</a>`;
      
      // Ersetze die E-Mail durch den Link mit exaktem String-Matching
      const escapedEmailMatch = emailMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexEmail = new RegExp(`\\b${escapedEmailMatch}\\b`, 'g');
      processedContent = processedContent.replace(regexEmail, emailLink);
    }
    
    // URLs erkennen und als klickbaren Link formatieren
    const urlRegex = /\b(https?:\/\/|www\.)[^\s<\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]+(?=\s|$|\)|\]|\}|"|'|<|$|\p{Emoji})/gu;
    const urlMatches = [...processedContent.matchAll(urlRegex)];

    for (const match of urlMatches) {
      const urlMatch = match[0];
      // URL als klickbaren Link formatieren
      const href = urlMatch.startsWith('www.') ? `https://${urlMatch}` : urlMatch;
      const urlLink = `<a href="${href}" target="_blank" rel="noopener noreferrer" class="url-address">${urlMatch}</a>`;
      
      // Ersetze die URL durch den Link mit exaktem String-Matching
      const escapedUrlMatch = urlMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexUrl = new RegExp(`${escapedUrlMatch}`, 'g');
      processedContent = processedContent.replace(regexUrl, urlLink);
    }
    
    // Konvertiere Listenelemente, bevor Zeilenumbrüche in <br> umgewandelt werden
    const listLines = processedContent.split('\n');
    const processedLines: string[] = [];
    let inList = false;
    let listType: 'bullet' | 'numbered' | null = null;
    let listItems: (string | { number: string; text: string })[] = [];

    for (let i = 0; i < listLines.length; i++) {
      const line = listLines[i];
      const bulletMatch = line.match(/^-\s+(.+)$/);
      const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
      
      if (bulletMatch) {
        if (!inList || listType !== 'bullet') {
          if (inList) {
            // Beende vorherige Liste
            processedLines.push(renderListItems(listItems, listType));
            listItems = [];
          }
          inList = true;
          listType = 'bullet';
        }
        listItems.push(bulletMatch[1].trim());
      } else if (numberedMatch) {
        if (!inList || listType !== 'numbered') {
          if (inList) {
            // Beende vorherige Liste
            processedLines.push(renderListItems(listItems, listType));
            listItems = [];
          }
          inList = true;
          listType = 'numbered';
        }
        const numberMatch = line.match(/^\d+/);
        if (numberMatch) {
          listItems.push({
            number: numberMatch[0],
            text: numberedMatch[1].trim()
          });
        }
      } else {
        if (inList) {
          // Beende Liste
          processedLines.push(renderListItems(listItems, listType));
          listItems = [];
          inList = false;
          listType = null;
        }
        processedLines.push(line);
      }
    }
    
    // Falls die letzte Zeile zu einer Liste gehört
    if (inList) {
      processedLines.push(renderListItems(listItems, listType));
    }
    
    function renderListItems(
      items: (string | { number: string; text: string })[], 
      type: 'bullet' | 'numbered' | null
    ): string {
      if (items.length === 0) return '';
      
      // Bestimme, ob horizontale Darstellung basierend auf Länge und Anzahl der Elemente
      const isShortList = items.length <= 3 && items.every(item => 
        (typeof item === 'string' && item.length < 25) || 
        (typeof item === 'object' && item.text.length < 25)
      );
      
      if (isShortList) {
        // Horizontale Darstellung für kurze Listen
        const htmlItems = items.map(item => {
          if (type === 'bullet') {
            return `<span class="list-item-horizontal">• ${item as string}</span>`;
          } else {
            const numberedItem = item as { number: string; text: string };
            return `<span class="list-item-horizontal">${numberedItem.number}. ${numberedItem.text}</span>`;
          }
        }).join('');
        
        return `<div class="list-horizontal">${htmlItems}</div>`;
      } else {
        // Vertikale Liste für längere Einträge
        const htmlItems = items.map(item => {
          if (type === 'bullet') {
            return `<li class="list-item">• ${item as string}</li>`;
          } else {
            const numberedItem = item as { number: string; text: string };
            return `<li class="list-item">${numberedItem.number}. ${numberedItem.text}</li>`;
          }
        }).join('');
        
        return `<ul class="list-vertical">${htmlItems}</ul>`;
      }
    }
    
    // Kombiniere die verarbeiteten Zeilen
    processedContent = processedLines.join('\n');
    
    // Überschriften
    processedContent = processedContent.replace(/^#\s+(.+)$/gm, '<h3 class="text-lg font-bold mt-2 mb-0.5">$1</h3>');
    processedContent = processedContent.replace(/^##\s+(.+)$/gm, '<h4 class="text-md font-semibold mt-1.5 mb-0.5">$1</h4>');
    
    // Zeilenumbrüche durch <br> ersetzen
    processedContent = processedContent.replace(/\n/g, '<br>');
    
    // Füge CSS hinzu, um sicherzustellen, dass die Listen korrekt angezeigt werden
    const inlineCSS = `
      <style>
        .phone-number {
          display: inline-flex;
          align-items: center;
          background-color: #f0f4f8;
          color: #2d3748;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
          white-space: nowrap;
          margin: 0 1px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          text-decoration: none;
        }
        
        .phone-number:hover {
          background-color: #e6eef7;
        }
        
        .email-address, .url-address {
          display: inline-flex;
          align-items: center;
          background-color: rgba(var(--primary-rgb, 59, 130, 246), 0.1);
          color: rgba(var(--primary-rgb, 59, 130, 246), 1);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
          white-space: nowrap;
          margin: 0 1px;
          border: 1px solid rgba(var(--primary-rgb, 59, 130, 246), 0.2);
          cursor: pointer;
          text-decoration: none;
        }
        
        .email-address:hover, .url-address:hover {
          background-color: rgba(var(--primary-rgb, 59, 130, 246), 0.15);
        }
        
        /* Vertikale Listen */
        .list-vertical {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
          list-style-type: none;
        }
        
        .list-item {
          margin-bottom: 0.4rem;
          line-height: 1.4;
        }
        
        /* Horizontale Listen */
        .list-horizontal {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 0.5rem 0;
        }
        
        .list-item-horizontal {
          display: inline-block;
          background-color: rgba(var(--background-end-rgb, 240, 245, 255), 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.95em;
        }

        /* Überschriften mit konsistenten Abständen */
        h3.text-lg {
          margin-top: 1rem;
          margin-bottom: 0.25rem;
        }
        
        h4.text-md {
          margin-top: 0.75rem;
          margin-bottom: 0.25rem;
        }
      </style>
    `;
    
    return (
      <div className="prose prose-sm break-words pointer-events-auto">
        <div 
          dangerouslySetInnerHTML={{ __html: inlineCSS + processedContent }} 
          className="rich-content"
        />
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
      className={`group relative mb-4 flex items-start ${
        isBot ? 'justify-start' : 'justify-end'
      } max-w-full`}
      initial="hidden"
      animate="visible"
      variants={variants}
      role={isBot ? 'region' : 'none'}
      aria-label={isBot ? 'Antwort des Assistenten' : 'Deine Nachricht'}
    >
      <div 
        className={`flex max-w-[85%] items-start gap-3 rounded-lg p-3 shadow-lg ${
          isBot ? 'glassmorphism-bot text-foreground' : 'glassmorphism-user text-white'
        }`}
        style={{
          backgroundColor: isBot 
            ? 'var(--bot-bg-color, rgba(248, 250, 252, 0.8))' 
            : 'var(--user-bg-color, linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.85)))',
          color: isBot
            ? 'var(--bot-text-color, currentColor)'
            : 'var(--user-text-color, #ffffff)',
          boxShadow: isBot 
            ? '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(255, 255, 255, 0.1) inset' 
            : '0 8px 32px rgba(var(--primary-rgb), 0.25)'
        }}
      >
        {isBot && (
          <div 
            className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background/90 backdrop-blur-sm shadow-inner"
            style={{
              backgroundColor: 'var(--bot-avatar-bg, hsla(var(--background), 0.9))',
              borderColor: 'var(--bot-accent-color, hsla(var(--border), 0.5))'
            }}
          >
            <BotIcon 
              aria-hidden="true" 
              className="h-5 w-5" 
              style={{ color: 'var(--bot-accent-color, currentColor)' }}
            />
          </div>
        )}
        
        <div className="flex-1 space-y-2 overflow-hidden">
          <div 
            className="text-sm font-medium"
            style={{ color: isBot ? 'var(--bot-text-color, currentColor)' : 'var(--user-text-color, #ffffff)' }}
          >
            {isBot ? botName : 'Du'}
          </div>
          {renderContent()}
          
          <div className="mt-1 flex items-center justify-end gap-2 text-xs text-muted-foreground/70">
            {isBot && (
              <div className="flex items-center gap-2">
                {showCopyButton && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 opacity-0 hover:bg-muted/50 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Nachricht kopieren"
                    title="Nachricht kopieren"
                  >
                    {copySuccess ? (
                      <>
                        <CheckIcon className="h-3.5 w-3.5" />
                        <span>Kopiert</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span>Kopieren</span>
                      </>
                    )}
                  </button>
                )}
                
                {enableFeedback && feedbackGiven === null && (
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => sendFeedback(true)}
                      className="rounded p-1 opacity-0 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Positive Bewertung"
                      title="Diese Nachricht war hilfreich"
                    >
                      <ThumbsUpIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => sendFeedback(false)}
                      className="rounded p-1 opacity-0 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Negative Bewertung"
                      title="Diese Nachricht war nicht hilfreich"
                    >
                      <ThumbsDownIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                
                {enableFeedback && feedbackGiven === 'positive' && (
                  <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                    Danke für Ihr positives Feedback!
                  </span>
                )}
                
                {enableFeedback && feedbackGiven === 'negative' && (
                  <span className="ml-2 text-xs text-rose-600 dark:text-rose-400">
                    Danke für Ihr Feedback. Wir verbessern uns stetig.
                  </span>
                )}
              </div>
            )}
            
            {isUser && isLastMessage && (
              <div className="flex items-center gap-1">
                <CheckIcon className="h-3.5 w-3.5" />
                <span>Gesendet</span>
              </div>
            )}
            
            <span suppressHydrationWarning>
              {currentTime}
            </span>
          </div>
        </div>
        
        {isUser && (
          <UserAvatar />
        )}
      </div>
    </motion.div>
  )
} 