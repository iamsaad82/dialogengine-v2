'use client';

import React from 'react';
import { useChunkedMallContent } from '../hooks/useChunkedMallContent';
import FluidMallMessage from './FluidMallMessage';
import styles from '../ShoppingMallMessage.module.css';

interface ChunkedMallMessageProps {
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
  query?: string;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * Chunk-basierte Mall-Message-Komponente
 * 
 * Diese Komponente verarbeitet XML-Inhalte in Chunks, validiert und repariert sie,
 * und rendert sie dann als FluidMallMessage.
 */
const ChunkedMallMessage: React.FC<ChunkedMallMessageProps> = ({
  content,
  isStreaming,
  isComplete,
  query = '',
  colorStyle = {
    primaryColor: '#3b1c60',
    secondaryColor: '#ff5a5f'
  }
}) => {
  // Verwende den Chunk-basierten Hook
  const { sections, validContent, hasError, errorMessage } = useChunkedMallContent(
    content,
    isStreaming,
    query
  );
  
  // Wenn ein Fehler aufgetreten ist und das Streaming abgeschlossen ist
  if (hasError && !isStreaming && isComplete) {
    return (
      <div className={styles.parseError}>
        <p>{errorMessage}</p>
        <p>Versuche, den Inhalt als normalen Text anzuzeigen:</p>
        <div style={{
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          {validContent && validContent.length > 0 ? (
            <div>
              {/* Versuche, den Inhalt als HTML zu rendern */}
              <div dangerouslySetInnerHTML={{ __html: validContent }} />
              
              {/* Zeige auch den Rohinhalt an, falls die HTML-Darstellung fehlschlägt */}
              <details style={{ marginTop: '15px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#666' }}>Rohinhalt anzeigen</summary>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.8rem',
                  backgroundColor: '#f0f0f0',
                  padding: '10px',
                  borderRadius: '4px',
                  marginTop: '10px',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  {content}
                </pre>
              </details>
            </div>
          ) : (
            <p>Kein Inhalt vorhanden.</p>
          )}
        </div>
      </div>
    );
  }
  
  // Rendere die FluidMallMessage mit den geparsten Sektionen
  return (
    <FluidMallMessage
      sections={sections}
      isStreaming={isStreaming}
      colorStyle={colorStyle}
    />
  );
};

export default ChunkedMallMessage;
