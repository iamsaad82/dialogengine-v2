'use client';

import React from 'react';

interface MessageHeaderProps {
  botName: string;
  botAvatarUrl?: string;
  showName?: boolean;
  subtitle?: string;
}

/**
 * Header für Bot-Nachrichten mit Avatar und Namen
 */
export const MessageHeader: React.FC<MessageHeaderProps> = ({ botName, botAvatarUrl, showName = true, subtitle }) => {
  return (
    <div className="message-header" style={{
      animation: 'none !important',
      transition: 'none !important',
      willChange: 'auto',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      contain: 'layout style',
      opacity: 1,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      padding: '8px 0',
      position: 'relative',
      marginBottom: '12px'
    }}>
      {/* Linke Seite: Logo */}
      <div className="bot-avatar-container" style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexShrink: 0,
        width: 'auto',
        height: 'auto',
        marginRight: '12px',
        animation: 'none !important',
        transition: 'none !important',
        willChange: 'auto',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        contain: 'layout style',
        opacity: 1
      }}>
        {botAvatarUrl && (
          <img
            src={botAvatarUrl}
            alt={botName}
            className="bot-avatar"
            width="192"
            height="48"
            style={{
              objectFit: 'contain',
              borderRadius: '0',
              background: 'transparent',
              display: 'block',
              width: 'auto',
              height: '48px',
              maxWidth: '192px',
              maxHeight: '48px',
              minWidth: 'auto',
              minHeight: '48px',
              boxShadow: 'none',
              border: 'none',
              willChange: 'auto',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              animation: 'none !important',
              transition: 'none !important',
              opacity: 1,
              contain: 'layout style'
            }}
          />
        )}
      </div>

      {/* Rechte Seite: Bot-Name (optional) */}
      {showName && (
        <div className="bot-name-container" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexGrow: 1,
          overflow: 'hidden'
        }}>
          <span
            className="bot-name"
            style={{
              color: 'var(--bot-primary-color, var(--bot-accent-color))',
              display: 'block',
              fontWeight: 500,
              fontSize: '1rem',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {botName}
          </span>

          {subtitle && (
            <span
              className="bot-subtitle"
              style={{
                color: 'var(--bot-secondary-color, #666)',
                display: 'block',
                fontSize: '0.8rem',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: '2px'
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};