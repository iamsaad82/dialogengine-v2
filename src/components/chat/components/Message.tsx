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
    botName
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
        style={isBot ? {} : {
          background: 'var(--user-bg-color)',
          color: 'var(--user-text-color)'
        }}
      >
        {isBot && (
          <div className="pb-1 flex items-center gap-2 text-xs text-gray-500 border-b border-gray-200 mb-2">
            {botAvatarUrl ? (
              <Image 
                src={botAvatarUrl} 
                width={28} 
                height={28} 
                alt={`${botName} Logo`} 
                className="inline mr-1 object-contain"
              />
            ) : (
              <Image 
                src="/brandenburg-logo.svg" 
                width={128} 
                height={128} 
                alt="Brandenburg Logo" 
                className="inline mr-1"
              />
            )}
            <span className="text-sm font-semibold">{botName}</span>
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