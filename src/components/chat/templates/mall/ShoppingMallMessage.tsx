'use client';

import React, { useEffect, useState } from 'react';
import { useMallContentStreaming } from './hooks/useMallContentStreaming';
import FluidMallMessage from './components/FluidMallMessage';
import styles from './ShoppingMallMessage.module.css';
import { balanceXmlTags } from './utils/xmlBalancer';

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
  // Vorverarbeitung: Balanciere XML-Tags, wenn Content vorhanden ist
  const processedContent = content ? balanceXmlTags(content) : content;

  // Verwende den optimierten Hook für Content-Streaming
  const sections = useMallContentStreaming(processedContent, isStreaming, query);

  // Stellen sicher, dass sections immer ein Array ist
  const sectionsArray = Array.isArray(sections) ? sections : [];

  // State für Fehler beim Parsen
  const [parseError, setParseError] = useState<string | null>(null);

  // Überprüfe, ob der Content geparst werden konnte
  useEffect(() => {
    // Nur wenn das Streaming abgeschlossen ist und der Content nicht leer ist
    if (content && !isStreaming && isComplete && sectionsArray.length === 0) {
      // Versuche, XML-Tags im Content zu erkennen
      const hasXmlStructure = (
        content.includes('<intro>') ||
        content.includes('<shop>') ||
        content.includes('<restaurant>') ||
        content.includes('<tip>') ||
        content.includes('<shops') ||
        content.includes('<restaurants') ||
        content.includes('<events') ||
        content.includes('<services')
      );

      // Nur wenn XML-Tags erkannt wurden, aber das Parsing fehlgeschlagen ist
      if (hasXmlStructure) {
        console.error('XML-Parsing fehlgeschlagen:', {
          contentPreview: content.substring(0, 100) + '...',
          contentLength: content.length
        });
        setParseError('Der Inhalt konnte nicht korrekt verarbeitet werden.');
      } else {
        // Wenn keine XML-Tags erkannt wurden, zeige den Rohinhalt an
        setParseError(null);
      }
    } else {
      setParseError(null);
    }
  }, [content, isStreaming, isComplete, sectionsArray]);

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
            <p>Versuche, den Inhalt als normalen Text anzuzeigen:</p>
            <div style={{
              padding: '15px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              {content && content.length > 0 ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p>Kein Inhalt vorhanden.</p>
              )}
            </div>
          </div>
        ) : (
          <FluidMallMessage
            sections={sectionsArray}
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
