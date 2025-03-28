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

// VERSION-MARKER: Message-Debug-Code - Version 009
console.log("Message.tsx geladen - Debug-Version 009");

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  botId?: string;
  isLastMessage?: boolean;
  showCopyButton?: boolean;
  enableFeedback?: boolean;
}

export const Message: React.FC<MessageProps> = ({ 
  content, 
  role, 
  botId, 
  isLastMessage = false,
  showCopyButton = true,
  enableFeedback = true
}) => {
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

  return (
    <motion.div 
      className={`relative flex ${isBot ? 'justify-start' : 'justify-end'}`}
      initial="hidden"
      animate="visible"
      variants={messageVariants}
    >
      <div 
        className={`max-w-3xl rounded-lg p-3 mb-4 ${
          isBot 
            ? 'bg-[#F7F7FC] text-gray-800' 
            : 'bg-[#5D5FEF] text-white'
        }`}
      >
        {isBot && (
          <div className="pb-1 flex items-center gap-2 text-xs text-gray-500 border-b border-gray-200 mb-2">
            <Image 
              src="/brandenburg-logo.svg" 
              width={20} 
              height={20} 
              alt="Brandenburg Logo" 
              className="inline mr-1"
            />
            <span>Brandenburg-Dialog</span>
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