'use client';

import React, { useEffect, useState } from 'react';
import { useMallContentStreaming } from './hooks/useMallContentStreaming';
import FluidMallMessage from './components/FluidMallMessage';
import styles from './ShoppingMallMessage.module.css';

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

/**
 * Shopping Mall Template - Hauptkomponente
 * 
 * Diese Komponente verwendet die FluidMallMessage-Komponente für ein optimiertes
 * Streaming-Erlebnis ohne Flackern oder Layout-Sprünge.
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
  // Verwende den optimierten Hook für Content-Streaming
  const sections = useMallContentStreaming(content, isStreaming, query);
  
  // State für Fehler beim Parsen
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Überprüfe, ob der Content geparst werden konnte
  useEffect(() => {
    if (content && !isStreaming && sections.length === 0) {
      setParseError('Der Inhalt konnte nicht korrekt verarbeitet werden.');
    } else {
      setParseError(null);
    }
  }, [content, isStreaming, sections]);
  
  // Styling für den Container
  const containerClasses = [
    styles.messageContainer,
    styles.assistantMessage,
    isStreaming ? styles.streamingMessage : ''
  ].filter(Boolean).join(' ');
  
  // Styling für den Inhalt
  const contentClasses = [
    styles.messageContent,
    styles.mallMessage
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {parseError ? (
          <div className={styles.parseError}>
            <p>{parseError}</p>
            <p>Roher Inhalt:</p>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', maxHeight: '200px', overflow: 'auto' }}>
              {content}
            </pre>
          </div>
        ) : (
          <FluidMallMessage
            sections={sections}
            isStreaming={isStreaming}
            colorStyle={colorStyle}
          />
        )}
        
        {messageControls && (
          <div className={styles.messageControls}>
            {messageControls}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingMallMessage;
