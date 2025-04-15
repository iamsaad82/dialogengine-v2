'use client';

import React, { memo } from 'react';
// import ChunkedMallMessage from './components/ChunkedMallMessage'; // Nicht mehr verwendet
import ProgressiveMallTemplateRenderer from './MallTemplateRenderer.progressive';
import styles from './ShoppingMallMessage.module.css';
import './styles/progressive-streaming.css';

interface ShoppingMallMessageProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
  isComplete: boolean;
  query?: string;
}

// Memoized MessageControls-Komponente
const MessageControlsWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <div className={styles.messageControls}>
    {children}
  </div>
));

/**
 * Shopping Mall Template - Hauptkomponente
 *
 * Diese Komponente verwendet die ProgressiveMallMessage-Komponente für ein optimiertes
 * Streaming-Erlebnis mit progressivem Aufbau der Inhalte in Echtzeit.
 *
 * Optimiert für Stabilität, Flicker-Vermeidung und flüssige Übergänge während des Streamings.
 */
const ShoppingMallMessage: React.FC<ShoppingMallMessageProps> = ({
  content,
  isStreaming = false,
  messageControls,
  colorStyle = {
    primaryColor: '#3b1c60',
    secondaryColor: '#ff5a5f'
  },
  isComplete,
  query = ''
}) => {
  // Styling für den Container mit Stabilisierungseigenschaften
  const containerClasses = [
    styles.messageContainer,
    styles.assistantMessage,
    isStreaming ? styles.streamingMessage : ''
  ].filter(Boolean).join(' ');

  // Styling für den Inhalt mit Stabilisierungseigenschaften
  const contentClasses = [
    styles.messageContent,
    styles.mallMessage
  ].filter(Boolean).join(' ');

  // Wir verwenden die progressive Streaming-Implementierung
  // für flüssigen Aufbau der Inhalte in Echtzeit
  return (
    <div
      className={containerClasses}
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
        contain: 'layout style',
      }}
    >
      <div
        className={contentClasses}
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'contents',
          contain: 'content',
        }}
      >
        <ProgressiveMallTemplateRenderer
          content={content}
          isStreaming={isStreaming}
          isComplete={isComplete}
          query={query}
          colorStyle={colorStyle}
          messageControls={messageControls}
        />

        {messageControls && (
          <MessageControlsWrapper>
            {messageControls}
          </MessageControlsWrapper>
        )}
      </div>
    </div>
  );
};

// Exportiere eine memoized Version der Komponente
export default memo(ShoppingMallMessage);
