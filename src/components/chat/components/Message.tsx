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

// VERSION-MARKER: Message-Debug-Code - Version 010
console.log("Message.tsx geladen - Debug-Version 010");

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  botId?: string;
  isLastMessage?: boolean;
  showCopyButton?: boolean;
  enableFeedback?: boolean;
  botName?: string;
  botAvatarUrl?: string;
}

// Als normale Funktion definieren statt React.FC<MessageProps>
const Message = ({ 
  content, 
  role, 
  botId, 
  isLastMessage = false,
  showCopyButton = true,
  enableFeedback = true,
  botName = 'Brandenburg-Dialog',
  botAvatarUrl
}: MessageProps) => {
  const isBot = role === 'assistant';
  
  // Verbesserten Anzeigenamen erzeugen
  const displayName = isBot ? (
    botName === 'creditreform' ? 'Creditreform Assistent' : 
    botName === 'brandenburg' ? 'Brandenburg Dialog' : 
    botName.includes('-') || botName.length < 4 ? `${botName} Assistent` : 
    botName
  ) : '';
  
  // Animation für das Einblenden der Nachricht
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

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

  return (
    <motion.div 
      className={`relative flex ${isBot ? 'justify-start' : 'justify-end'} group`}
      initial="hidden"
      animate="visible"
      variants={messageVariants}
    >
      <div 
        className={`max-w-3xl rounded-lg p-3 mb-4 ${
          isBot 
            ? 'glassmorphism-bot' 
            : 'glassmorphism-user'
        }`}
        style={{
          ...(isBot 
            ? { backgroundColor: 'var(--bot-bg-color)', color: 'var(--bot-text-color)' } 
            : { background: 'var(--user-bg-color)', color: 'var(--user-text-color)' })
        }}
      >
        {isBot && (
          <div className="pb-1 flex items-center gap-2 text-xs text-gray-500 border-b border-gray-200 mb-2">
            <div className="inline-flex items-center justify-center overflow-hidden" style={{ width: '200px', height: '40px' }}>
              {botAvatarUrl ? (
                <Image 
                  src={botAvatarUrl} 
                  width={200} 
                  height={40} 
                  alt={`${displayName} Logo`} 
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
            <span className="text-sm font-semibold leading-none">{displayName}</span>
          </div>
        )}
        
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
};

export default Message; 