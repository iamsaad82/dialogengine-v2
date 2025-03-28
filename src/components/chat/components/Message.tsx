'use client'

import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { BotIcon, UserIcon, CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon } from './ui/icons'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import classNames from 'classnames'
import { LunaryClient } from '@/lib/lunary'
import { BotAvatar, UserAvatar } from './ChatAvatars'

// VERSION-MARKER: Message-Debug-Code - Version 009
console.log("Message.tsx geladen - Debug-Version 009");

interface MessageProps {
  message: {
    role: 'user' | 'assistant'
    content: string
    id?: string
    timestamp?: number
  }
  isLastMessage?: boolean
  botName?: string
  showCopyButton?: boolean
  enableFeedback?: boolean
  botId?: string
  botPrimaryColor?: string
}

export function Message({ 
  message, 
  isLastMessage = false,
  botName = 'SMG Dialog Engine',
  showCopyButton = true,
  enableFeedback = false,
  botId = 'default',
  botPrimaryColor = 'var(--primary)'
}: MessageProps) {
  const [copySuccess, setCopySuccess] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null)
  const isBot = message.role === 'assistant'
  const preRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
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
  
  // CSS-Styles für Markdown-Elemente mit verbesserten Regeln für verschachtelte Listen
  useEffect(() => {
    console.log("MESSAGE-DEBUG-010: useEffect für Styles aufgerufen");
    
    // Entferne altes Style-Element, falls vorhanden
    const oldStyleEl = document.getElementById('message-component-styles');
    if (oldStyleEl) {
      oldStyleEl.remove();
    }
    
    // Füge neue, verbesserte Styles hinzu
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
      
      /* Verbesserte Listen */
      .message-content ul, .message-content ol {
        list-style-type: none;
        padding-left: 1.5rem;
        margin-top: 0.75rem;
        margin-bottom: 1rem;
      }
      
      .message-content li {
        position: relative;
        margin-bottom: 0.5rem;
        line-height: 1.5;
        padding-left: 0.5rem;
      }
      
      /* Reguläre Listen mit Punkten */
      .message-content ul > li::before {
        content: "•";
        position: absolute;
        left: -1rem;
        color: #6b7280;
      }
      
      /* Verschachtelte Listen richtig einrücken */
      .message-content li > ul, 
      .message-content li > ol {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        padding-left: 1.5rem;
      }
      
      /* Listenstile für verschachtelte Listen */
      .message-content li > ul > li::before {
        content: "◦";
        left: -1rem;
      }
      
      .message-content li > ul > li > ul > li::before {
        content: "▪";
        left: -1rem;
        font-size: 0.8em;
      }
      
      /* Key Facts spezifische Formatierung */
      .message-content p.key-facts-heading {
        font-weight: 600;
        font-size: 1.1rem;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
        color: #374151;
      }
      
      .message-content p.key-facts-heading + ul {
        background-color: rgba(248, 250, 252, 0.6);
        border-radius: 0.5rem;
        padding: 0.75rem 1.5rem;
        margin: 0.75rem 0 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      
      /* Key Facts Listenelemente */
      .message-content li.key-fact-item {
        margin-bottom: 0.75rem;
        display: flex;
        align-items: flex-start;
      }
      
      /* Emojis in Key Facts Listenelementen */
      .message-content li.key-fact-item p {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
      }
      
      /* Emoji vor dem Text */
      .message-content li.key-fact-item strong:first-child {
        margin-right: 0.5rem;
        min-width: 1.5rem;
        display: inline-block;
      }
      
      /* Formatierung für Empfehlungen und Standort-Info */
      .message-content li p strong:has(span:contains("Empfehlung")),
      .message-content li p strong:has(span:contains("Standort")),
      .message-content li p strong:has(span:contains("Infos")),
      .message-content li p strong:has(span:contains("Beratung")) {
        display: inline-flex;
        min-width: 120px;
        margin-right: 0.5rem;
      }
      
      /* Nummerierte Listen */
      .message-content ol {
        counter-reset: item;
      }
      
      /* Schnellüberblick-Sektion */
      .message-content p:has(strong:contains("Schnellüberblick")) + ul,
      .message-content p strong:contains("Schnellüberblick") + ul {
        background-color: rgba(248, 250, 252, 0.6);
        border-radius: 0.5rem;
        padding: 0.75rem 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      
      /* Key Facts-Formatierung */
      .message-content p:has(strong:contains("Key Facts")) + ul,
      .message-content p strong:contains("Key Facts") + ul,
      .message-content p:contains("Key Facts:") + ul {
        background-color: rgba(248, 250, 252, 0.6);
        border-radius: 0.5rem;
        padding: 0.75rem 1.5rem;
        margin: 1.5rem 0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      
      /* Sicherstellen, dass Listenpunkte in Key Facts immer sichtbar sind */
      .message-content p:contains("Key Facts:") + ul > li::before,
      .message-content p strong:contains("Key Facts") + ul > li::before {
        content: "•";
        position: absolute;
        left: -1rem;
        color: #6b7280;
      }
      
      /* Tipps und Hinweise mit besonderer Formatierung */
      .message-content p:has(span:contains("Tipp:")),
      .message-content p:contains("Tipp:") {
        margin-top: 1rem;
        font-style: italic;
        color: #4b5563;
        padding-left: 1rem;
        border-left: 2px solid rgba(37, 99, 235, 0.3);
      }
      
      /* Kontaktinformationen */
      .message-content .contact-label {
        font-weight: 600;
        color: #4b5563;
        min-width: 120px;
        display: inline-block;
      }
      
      /* Nummerierte Abschnitte im Fließtext */
      .message-content p strong:has(span:matches(/^\\d+\\./)),
      .message-content p strong:matches(/^\\d+\\./) {
        display: block;
        font-size: 1.1rem;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
        color: #374151;
      }
      
      /* Allgemeine Textformatierung in User-Nachrichten */
      .user-message-container * {
        color: var(--user-text-color-override, #ffffff) !important;
      }
      
      /* Fett formatierter Text in Listen */
      .message-content li strong {
        font-weight: 600;
      }
      
      /* Listenpunkte mit Emojis als Icons */
      .message-content li p:first-child:has(strong:first-child:matches(/[📍🕒📞🔗💰📋📧🌐]/)) {
        display: flex;
        align-items: flex-start;
      }
      
      .message-content li p:first-child:has(strong:first-child:matches(/[📍🕒📞🔗💰📋📧🌐]/)) strong:first-child {
        min-width: 24px;
        margin-right: 8px;
        display: inline-block;
      }
    `;
    document.head.appendChild(styleEl);
    
    console.log("MESSAGE-DEBUG-010: Neue verbesserte Styles für Listen wurden hinzugefügt");
  }, []);
  
  // CSS-Styles für Markdown-Elemente mit verbesserten Regeln für verschachtelte Listen und Key Facts
  useEffect(() => {
    console.log("MESSAGE-DEBUG-011: useEffect für verbesserte Styles aufgerufen");
    
    // Entferne altes Style-Element, falls vorhanden
    const oldStyleEl = document.getElementById('message-component-styles');
    if (oldStyleEl) {
      oldStyleEl.remove();
    }
    
    // Füge neue, verbesserte Styles hinzu
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
      
      /* Verbesserte Listen */
      .message-content ul, .message-content ol {
        list-style-type: none;
        padding-left: 1.5rem;
        margin-top: 0.75rem;
        margin-bottom: 1rem;
      }
      
      .message-content li {
        position: relative;
        margin-bottom: 0.5rem;
        line-height: 1.5;
        padding-left: 0.5rem;
      }
      
      /* Reguläre Listen mit Punkten */
      .message-content ul > li::before {
        content: "•";
        position: absolute;
        left: -1rem;
        color: #6b7280;
      }
      
      /* Verschachtelte Listen richtig einrücken */
      .message-content li > ul, 
      .message-content li > ol {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        padding-left: 1.5rem;
      }
      
      /* Listenstile für verschachtelte Listen */
      .message-content li > ul > li::before {
        content: "◦";
        left: -1rem;
      }
      
      .message-content li > ul > li > ul > li::before {
        content: "▪";
        left: -1rem;
        font-size: 0.8em;
      }
      
      /* Key Facts spezifische Formatierung */
      .message-content p.key-facts-heading {
        font-weight: 600;
        font-size: 1.1rem;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
        color: #374151;
      }
      
      .message-content p.key-facts-heading + ul {
        background-color: rgba(248, 250, 252, 0.6);
        border-radius: 0.5rem;
        padding: 0.75rem 1.5rem;
        margin: 0.75rem 0 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      
      /* Key Facts Listenelemente */
      .message-content li.key-fact-item {
        margin-bottom: 1rem !important;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      
      .message-content li.key-fact-item:last-child {
        border-bottom: none;
        margin-bottom: 0.25rem !important;
      }
      
      /* Emojis in Key Facts Listenelementen */
      .message-content li.key-fact-item p {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
      }
      
      /* Emoji vor dem Text */
      .message-content li.key-fact-item p strong:first-child {
        display: inline-block;
        min-width: 1.75rem;
        margin-right: 0.5rem;
        font-size: 1rem;
      }
      
      /* Text nach dem Emoji */
      .message-content li.key-fact-item p strong:contains("Unterkunftssuche:"),
      .message-content li.key-fact-item p strong:contains("Touristinformation:"),
      .message-content li.key-fact-item p strong:contains("E-Mail:"),
      .message-content li.key-fact-item p strong:contains("Standort:"),
      .message-content li.key-fact-item p strong:contains("Empfehlung:") {
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        min-width: 9rem;
      }
      
      /* Spezielle Links in Key Facts */
      .message-content li.key-fact-item a {
        display: inline-flex;
        align-items: center;
        margin-left: 0.25rem;
      }
      
      /* Tipps am Ende von Nachrichtenblöcken */
      .message-content p.tipp-paragraph {
        margin-top: 1.25rem;
        font-style: italic;
        color: #4b5563;
        padding: 0.75rem 1rem;
        border-left: 2px solid rgba(37, 99, 235, 0.3);
        background-color: rgba(248, 250, 252, 0.5);
        border-radius: 0 0.5rem 0.5rem 0;
      }
      
      /* Tipps mit Links */
      .message-content p.tipp-paragraph a {
        color: #4f46e5;
        font-weight: 500;
      }
      
      /* Key Facts-Hauptformatierung */
      .message-content p:contains("Key Facts:"),
      .message-content p.key-facts-heading {
        font-weight: 600;
        font-size: 1.1rem;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        color: #374151;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding-bottom: 0.5rem;
      }
      
      /* Key Facts-Listen */
      .message-content p:contains("Key Facts:") + ul,
      .message-content p.key-facts-heading + ul {
        background-color: rgba(248, 250, 252, 0.6);
        border-radius: 0.5rem;
        padding: 1rem 1.5rem;
        margin: 0.75rem 0 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      
      /* Sicherstellen, dass Listenpunkte in Key Facts nicht angezeigt werden */
      .message-content p:contains("Key Facts:") + ul > li::before,
      .message-content p.key-facts-heading + ul > li::before {
        content: none !important;
      }
      
      /* Nummerierte Abschnitte im Fließtext */
      .message-content p strong:matches(/^\\d+\\./) {
        display: block;
        font-size: 1.1rem;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
        color: #374151;
      }
      
      /* Allgemeine Textformatierung in User-Nachrichten */
      .user-message-container * {
        color: var(--user-text-color-override, #ffffff) !important;
      }
      
      /* Fett formatierter Text in Listen */
      .message-content li strong {
        font-weight: 600;
      }
      
      /* Listenpunkte mit Emojis als Icons */
      .message-content li p:first-child:has(strong:first-child:matches(/[📍🕒📞🔗💰📋📧🌐📝]/)) {
        display: flex;
        align-items: flex-start;
      }
      
      .message-content li p:first-child:has(strong:first-child:matches(/[📍🕒📞🔗💰📋📧🌐📝]/)) strong:first-child {
        min-width: 24px;
        margin-right: 8px;
        display: inline-block;
      }
    `;
    document.head.appendChild(styleEl);
    
    console.log("MESSAGE-DEBUG-011: Neue verbesserte Styles für Key Facts und Links wurden hinzugefügt");
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

  // Kopieren des Nachrichteninhalts
  const copyToClipboard = async () => {
    const plainText = message.content.replace(/\*\*(.*?)\*\*/g, '$1') // Entferne Markdown-Formatierung
    
    // Tracking für Kopieren

    // Tracking für Kopieren
    LunaryClient.track({
      message: 'Nachricht kopiert',
      botId: botId,
      metadata: { messageContent: plainText.slice(0, 100) }
    })

    // Erstellt einen temporären DOM-Knoten um HTML-Tags aus dem Text zu entfernen
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = message.content || ''
    const plainTextFromContent = tempDiv.textContent || tempDiv.innerText || ''

    // Versuche erst navigator.clipboard.writeText zu verwenden
    const copyWithAPI = () => {
      navigator.clipboard.writeText(plainTextFromContent).then(
        () => {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
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
        textArea.value = plainTextFromContent
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

    // Tracking für Feedback
    LunaryClient.trackFeedback({
      rating: isPositive ? 'positive' : 'negative',
      conversationId: botId || 'unknown',
      botId: botId,
      metadata: { 
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

  // VERBESSERTE FORMATIERUNGSFUNKTION mit Markdown
  const renderContent = () => {
    console.log("MESSAGE-DEBUG-011: renderContent aufgerufen");
    
    // Sicherheitsprüfung für leeren Inhalt
    if (!message.content || typeof message.content !== 'string') {
      console.log("MESSAGE-DEBUG-011: Ungültiger Inhalt:", message.content);
      return <div className="text-red-500">Ungültige Nachricht</div>;
    }
    
    // Spezielle Vorverarbeitung für Key Facts
    let processedContent = message.content;
    
    // 1. Spezielle Ersetzung für bekannte Key Facts-Strukturen
    
    // [Erlebnis Brandenburg [Unterkünfte](https://erlebnis-brandenburg.de/uebernachten)) zu korrigieren
    // -> Erlebnis Brandenburg: [Unterkünfte](https://erlebnis-brandenburg.de/uebernachten)
    processedContent = processedContent.replace(/\[([^[\]]+) \[([^[\]]+)]\(([^()]+)\)]/g, (match, prefix, text, url) => {
      return `${prefix}: [${text}](${url})`;
    });
    
    // Spezielle Ersetzung für Telefonnummern im Format [[012345] 67 89 [00]](tel:+....)
    processedContent = processedContent.replace(/\[\[([^[\]]+)] ([^[\]]+) \[([^[\]]+)]]\(([^()]+)\)/g, (match, part1, part2, part3, url) => {
      return `[${part1} ${part2} ${part3}](${url})`;
    });
    
    // Allgemeinere Ersetzung für verschachtelte eckige Klammern (z.B. bei E-Mail-Adressen)
    processedContent = processedContent.replace(/\[\[([^[\]]+)](\.[^[\]]+)]/g, (match, email, domain) => {
      return `[${email}${domain}]`;
    });
    
    // Allgemeine Korrektur für falsch formatierte Linkstruktur mit fehlenden eckigen Klammern
    processedContent = processedContent.replace(/(\w+)]\(([^()]+)\)/g, (match, text, url) => {
      // Nur ersetzen, wenn nicht bereits korrekt formatiert
      if (!/\[.*\]/.test(match)) {
        return `[${text}](${url})`;
      }
      return match;
    });
    
    // 2. Spezielle Behandlung für bestimmte Schlüsselwörter in Key Facts
    
    // a. 🔗 Unterkunftssuche: (https://erlebnis-brandenburg.de/uebernachten)
    processedContent = processedContent.replace(/(🔗\s*Unterkunftssuche:)\s*\(([^()]+)\)/g, 
      (match, label, url) => `${label} [zur Unterkunftssuche](${url})`);
    
    // b. 📞 Touristinformation: [(03381) 58 80 [00]](tel:+4933815800)
    processedContent = processedContent.replace(/(📞\s*Touristinformation:)\s*\[\[([^[\]]+)] ([^[\]]+) \[([^[\]]+)]]\(([^()]+)\)/g, 
      (match, label, part1, part2, part3, url) => `${label} [${part1} ${part2} ${part3}](${url})`);
      
    // c. 📧 E-Mail: [[tourismus@stadt-brandenburg.de]](mailto:tourismus@stadt-brandenburg.de)
    processedContent = processedContent.replace(/(📧\s*E-Mail:)\s*\[\[([^[\]]+)]]\(([^()]+)\)/g, 
      (match, label, email, url) => `${label} [${email}](${url})`);
    
    // 3. Allgemeine Linkformatierungen
    
    // Konvertiere Telefonnummern, wenn nicht bereits Links
    processedContent = processedContent.replace(/(\(?\d{3,5}\)?\s*[-\s]?\d+[\s\d-]*\d+)/g, (match) => {
      // Überspringe, wenn bereits ein Link
      if (match.includes('[') || match.includes('](') || match.startsWith('tel:')) return match;
      
      // Telefonnummer bereinigen: Nur Zahlen behalten
      const cleanNumber = match.replace(/\D/g, '');
      return `[${match}](tel:+${cleanNumber})`;
    });
    
    // Konvertiere E-Mail-Adressen in Links
    processedContent = processedContent.replace(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, (match) => {
      // Überspringe, wenn bereits ein Link
      if (match.includes('[') || match.includes('](') || match.startsWith('mailto:')) return match;
      
      return `[${match}](mailto:${match})`;
    });
    
    // Konvertiere Web-URLs in Links
    processedContent = processedContent.replace(/\b(https?:\/\/[^\s]+|www\.[^\s]+\.[a-z]{2,}[^\s]*)\b/g, (match) => {
      // Überspringe, wenn bereits ein Link
      if (match.includes('[') || match.includes('](')) return match;
      
      // Füge http:// hinzu, wenn es mit www. beginnt
      const url = match.startsWith('www.') ? `https://${match}` : match;
      return `[${match}](${url})`;
    });
    
    // Korrektur für Tipps und abschließende Formatierung
    processedContent = processedContent.replace(/Tipp: (.+?)]\(([^)]+)\)/g, (match, text, url) => {
      if (!text.includes('[')) {
        return `Tipp: [${text}](${url})`;
      }
      return match;
    });
    
    console.log("MESSAGE-DEBUG-011: Verarbeiteter Inhalt:", processedContent.substring(0, 200) + "...");
    
    // Füge diese Funktion hinzu, um nach dem Rendern die Key Facts zu verbessern
    useEffect(() => {
      if (message.role === 'assistant' && contentRef.current) {
        // Verbessere die Key Facts, wenn vorhanden
        enhanceKeyFacts();
      }
    }, [message.content]);

    // Verarbeitung der Key Facts mit Icons und besserer Struktur
    const enhanceKeyFacts = () => {
      if (!contentRef.current) return;
      
      const keyFactsDiv = contentRef.current.querySelector('.keyfacts');
      if (!keyFactsDiv) return;
      
      // Finde alle Listenelemente in den Key Facts
      const listItems = keyFactsDiv.querySelectorAll('li');
      
      listItems.forEach(item => {
        const text = item.textContent || '';
        
        // Bestimme das passende Icon basierend auf dem Text-Inhalt
        let iconContent = '📌'; // Standard-Icon
        
        if (text.includes('Veranstalter')) iconContent = '🎭';
        else if (text.includes('Kartenreservierung')) iconContent = '🎟️';
        else if (text.includes('Telefon') || text.includes('Tel')) iconContent = '📞';
        else if (text.includes('E-Mail')) iconContent = '📧';
        else if (text.includes('Website') || text.includes('Link')) iconContent = '🔗';
        else if (text.includes('Adresse') || text.includes('Standort')) iconContent = '📍';
        else if (text.includes('Programm')) iconContent = '📋';
        else if (text.includes('Hauptspielstätten')) iconContent = '🏛️';
        else if (text.includes('Uhrzeit') || text.includes('Öffnungszeiten')) iconContent = '🕒';
        else if (text.includes('Preis') || text.includes('Kosten')) iconContent = '💰';
        
        // Erstelle das Icon-Element
        const iconDiv = document.createElement('div');
        iconDiv.className = 'fact-icon';
        iconDiv.textContent = iconContent;
        
        // Erstelle das Content-Div für den Text
        const contentDiv = document.createElement('div');
        contentDiv.className = 'fact-content';
        
        // Verschiebe den Inhalt in das Content-Div
        contentDiv.innerHTML = item.innerHTML;
        
        // Leere das ursprüngliche Element und füge Icon + Inhalt hinzu
        item.innerHTML = '';
        item.appendChild(iconDiv);
        item.appendChild(contentDiv);
        
        // Füge bei Links einen kleinen Hover-Effekt hinzu
        const links = contentDiv.querySelectorAll('a');
        links.forEach(link => {
          link.addEventListener('mouseover', () => {
            link.style.transform = 'translateY(-1px)';
          });
          link.addEventListener('mouseout', () => {
            link.style.transform = 'translateY(0)';
          });
        });
      });
      
      // Füge einen Titel hinzu, falls nicht vorhanden
      if (!keyFactsDiv.querySelector('h3')) {
        const title = document.createElement('h3');
        title.textContent = 'Key Facts';
        keyFactsDiv.insertBefore(title, keyFactsDiv.firstChild);
      }
    };

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
              
              // Prüfe, ob es sich um ein Key Facts Element handelt
              const isKeyFactItem = content.includes('📝 Empfehlung:') || 
                                   content.includes('📍 Standort:') || 
                                   content.includes('🔗 Unterkunftssuche:') ||
                                   content.includes('🔗 Weitere Infos:') ||
                                   content.includes('📞 Touristinformation:') ||
                                   content.includes('📧 E-Mail:') ||
                                   content.includes('📞 Touristische Beratung:');
              
              return (
                <li 
                  className={`${isNumbered ? 'numbered-item' : ''} ${isKeyFactItem ? 'key-fact-item' : ''}`}
                  {...props}
                >
                  {children}
                </li>
              );
            },
            h2: ({node, ...props}) => <h2 {...props} />,
            h3: ({node, ...props}) => <h3 {...props} />,
            p: ({node, children, ...props}) => {
              // Prüfen auf Kontaktinformationen oder Key Facts
              const content = String(children);
              const isContactInfo = /^(Adresse|Telefon|E-Mail|Standort|Öffnungszeiten|Angebote|Schulform|Schulleitung|Ganztagsschule|Kontakt|Website)/.test(content);
              const isKeyFact = content === 'Key Facts:' || content.includes('Key Facts');
              const isTipp = content.startsWith('Tipp:') || content.includes('Tipp:');
              
              if (isKeyFact) {
                return (
                  <p {...props} className="key-facts-heading">
                    {children}
                  </p>
                );
              }
              
              if (isTipp) {
                return (
                  <p {...props} className="tipp-paragraph">
                    {children}
                  </p>
                );
              }
              
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
          isBot ? 'glassmorphism-bot text-foreground' : 'glassmorphism-user text-white user-message-container'
        }`}
        style={{
          backgroundColor: isBot 
            ? 'var(--bot-bg-color, rgba(248, 250, 252, 0.8))' 
            : 'var(--user-bg-color, linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.85)))',
          color: isBot
            ? 'var(--bot-text-color, currentColor)'
            : 'var(--user-text-color-override, #ffffff)',
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
            style={{ color: isBot ? 'var(--bot-text-color, currentColor)' : 'var(--user-text-color-override, #ffffff)' }}
          >
            {isBot ? botName : 'Du'}
          </div>
          <div ref={contentRef}>
            {renderContent()}
          </div>
          
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