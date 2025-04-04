'use client';

import React from 'react';

interface MessageHeaderProps {
  botName: string;
  botAvatarUrl?: string;
}

/**
 * Header für Bot-Nachrichten mit Avatar und Namen
 */
export const MessageHeader: React.FC<MessageHeaderProps> = ({ botName, botAvatarUrl }) => {
  return (
    <div className="message-header">
      {botAvatarUrl && (
        <img
          src={botAvatarUrl}
          alt={botName}
          className="bot-avatar"
          width="48"
          height="48"
          style={{
            objectFit: 'contain',
            borderRadius: '0',
            marginRight: '10px',
            background: 'white'
          }}
        />
      )}
      <span style={{ color: 'var(--bot-primary-color, var(--bot-accent-color))' }}>
        {botName}
      </span>
    </div>
  );
}; 