'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BotIcon, UserIcon, CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon } from './ui/icons'
import ReactMarkdown from 'react-markdown'
import classNames from 'classnames'
import { LunaryClient } from '@/lib/lunary'
import { BotAvatar, UserAvatar } from './ChatAvatars'
import { MessageControls } from './MessageControls'
import '../styles/message-content.css'
import Image from 'next/image'
import MessageContent from './MessageContent/MessageContent'
import StreamingContent from './StreamingContent'

// VERSION-MARKER: Message-Debug-Code - Version 010
console.log("Message.tsx geladen - Debug-Version 010");

// VERSION-MARKER: Message-Debug-Code - Version 011
console.log("Message.tsx geladen - Debug-Version 011 (Streaming-Optimierung)");

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  botId?: string;
  isLastMessage?: boolean;
  showCopyButton?: boolean;
  enableFeedback?: boolean;
  botName?: string;
  botAvatarUrl?: string;
  streaming?: boolean;
}

const Message = ({ 
  content, 
  role, 
  botId, 
  isLastMessage = false,
  showCopyButton = true,
  enableFeedback = false,
  botName = 'Dialog Engine',
  botAvatarUrl,
  streaming = false
}: MessageProps) => {
  const isBot = role === 'assistant';
  
  // Bestimme die Klasse für die Nachricht basierend auf der Rolle
  const messageClass = isBot 
    ? "rounded-lg p-3 mb-4 glassmorphism-bot" 
    : "rounded-lg p-3 mb-4 glassmorphism-user";
  
  // Bestimme die Klasse für die Animation basierend auf Rolle und Streaming-Status
  let animationClass = isBot 
    ? "fade-in-from-left" 
    : "fade-in-from-right";
  
  // Spezielle Animation für Streaming-Nachrichten
  if (streaming && isBot) {
    animationClass = "fade-in-static"; // Keine Einflug-Animation für Streaming
  }

  // Verbesserten Anzeigenamen erzeugen
  const displayName = isBot ? (
    botName === 'creditreform' ? 'Creditreform Assistent' : 
    botName === 'brandenburg' ? 'Brandenburg Dialog' : 
    botName.includes('-') || botName.length < 4 ? `${botName} Assistent` : 
    botName
  ) : '';
  
  // Debug-Ausgabe für Props
  console.log("MESSAGE-DEBUG-010: Nachricht wird gerendert:", {
    role,
    isBot,
    botId,
    isLastMessage,
    showCopyButton,
    enableFeedback,
    contentLength: content?.length || 0,
    botName,
    displayName
  });

  if (role === 'assistant') {
    // Streaming-Variante der Komponente als Memo-Wrapper
    if (streaming) {
      return (
        <StableAssistantMessage 
          content={content} 
          role={role} 
          botName={botName} 
          botAvatarUrl={botAvatarUrl} 
        />
      );
    }
    
    // Normale Komponente (wird vollständig gerendert, nur wenn nicht streaming)
    return (
      <motion.div
        className={`group relative mb-4 flex items-start justify-start max-w-full`}
        initial={{ opacity: 0, y: 10, x: -10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div 
          className={`max-w-3xl rounded-lg p-4 glassmorphism-bot mb-2`}
          style={{
            backgroundColor: 'var(--bot-bg-color)', 
            color: 'var(--bot-text-color)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div className="pb-1 flex flex-col items-center gap-1 text-xs text-gray-500 border-b border-gray-200 mb-2">
            <div className="inline-flex items-center justify-center overflow-hidden" style={{ width: '200px', height: '40px' }}>
              {botAvatarUrl ? (
                <Image 
                  src={botAvatarUrl} 
                  width={200} 
                  height={40} 
                  alt={`${botName} Logo`} 
                  className="h-auto max-h-full w-full object-contain"
                />
              ) : (
                <svg 
                  viewBox="0 0 24 24" 
                  width="40" 
                  height="40"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  className="text-primary"
                  style={{ aspectRatio: '1' }}
                >
                  <rect width="18" height="10" x="3" y="11" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" x2="8" y1="16" y2="16" />
                  <line x1="16" x2="16" y1="16" y2="16" />
                </svg>
              )}
            </div>
            <span className="text-sm font-semibold text-center leading-none">
              {botName}
            </span>
          </div>
          
          <MessageContent content={content} role={role} />
          
          <MessageControls 
            isBot={isBot}
            showCopyButton={showCopyButton}
            enableFeedback={enableFeedback}
            messageContent={content}
            botId={botId}
            isLastMessage={isLastMessage}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`group relative mb-4 flex items-start justify-end max-w-full`}
      initial={{ opacity: 0, y: 10, x: 10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`max-w-3xl ${messageClass} ${streaming ? 'streaming-message pulse-subtle' : ''}`}
        style={{
          backgroundColor: 'var(--user-bg-color)', 
          color: 'var(--user-text-color)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        {streaming ? (
          <StreamingContent content={content} role={role} />
        ) : (
          <MessageContent content={content} role={role} />
        )}
        
        {/* Zeige Kontrollelemente nur für nicht-streaming Nachrichten */}
        {!streaming && (
          <MessageControls 
            isBot={isBot}
            showCopyButton={showCopyButton}
            enableFeedback={enableFeedback}
            messageContent={content}
            botId={botId}
            isLastMessage={isLastMessage}
          />
        )}
      </div>
    </motion.div>
  );
};

// Komplett stabilisierte Komponente für Streaming
const StableAssistantMessage = React.memo(({ content, role, botName, botAvatarUrl }: { 
  content: string; 
  role: 'user' | 'assistant';
  botName: string;
  botAvatarUrl?: string;
}) => {
  // Diese Komponente wird einmal gerendert und ändert sich nicht mehr
  return (
    <motion.div
      className="group relative mb-4 flex items-start justify-start max-w-full stable-message"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      style={{
        willChange: 'opacity',
        transform: 'translateZ(0)'
      }}
    >
      <div 
        className="max-w-3xl rounded-lg p-4 glassmorphism-bot mb-2 streaming-message"
        style={{
          backgroundColor: 'var(--bot-bg-color)', 
          color: 'var(--bot-text-color)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 2px rgba(59, 130, 246, 0.3)',
          borderLeft: '4px solid #3b82f6',
          minHeight: '120px',
          overflowAnchor: 'auto',
          contain: 'paint layout',
          willChange: 'contents',
          position: 'relative'
        }}
      >
        <div className="absolute top-0 right-0 px-2 py-1 text-xs text-white bg-blue-500 rounded-tr-lg rounded-bl-lg">
          Streaming...
        </div>
        
        <div className="pb-1 flex flex-col items-center gap-1 text-xs text-gray-500 border-b border-gray-200 mb-2">
          <div className="inline-flex items-center justify-center overflow-hidden"
            style={{ 
              width: '200px', 
              height: '40px',
              willChange: 'transform', 
              transform: 'translateZ(0)' 
            }}
          >
            {botAvatarUrl ? (
              <img 
                src={botAvatarUrl} 
                width={200} 
                height={40} 
                alt={`${botName} Logo`} 
                className="h-auto max-h-full w-full object-contain"
                style={{ 
                  willChange: 'transform', 
                  transform: 'translateZ(0)',
                  position: 'relative',
                  zIndex: 10
                }}
              />
            ) : (
              <svg 
                viewBox="0 0 24 24" 
                width="40" 
                height="40"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-primary"
                style={{ aspectRatio: '1' }}
              >
                <rect width="18" height="10" x="3" y="11" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" x2="8" y1="16" y2="16" />
                <line x1="16" x2="16" y1="16" y2="16" />
              </svg>
            )}
          </div>
          <span className="text-sm font-semibold text-center leading-none">
            {botName}
            <span className="ml-2 inline-flex items-center">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </span>
          </span>
        </div>
        
        <StreamingContent content={content} role={role} />
      </div>
    </motion.div>
  );
}, () => true); // Immer true zurückgeben, damit React diese Komponente niemals neu rendert

StableAssistantMessage.displayName = 'StableAssistantMessage';

export default Message; 