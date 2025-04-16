'use client';

import React, { memo, useMemo } from 'react';
import { useChunkedMallContent } from '../hooks/useChunkedMallContent';
import FluidMallMessage from './FluidMallMessage';
import styles from '../ShoppingMallMessage.module.css';
import { sanitizeHtml } from '../utils/htmlSanitizer';

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

// Memoized Error-Komponente
const ErrorDisplay = memo(({ errorMessage, validContent, content }: {
  errorMessage: string | null,
  validContent: string,
  content: string
}) => (
  <div className={styles.parseError}>
    <p>{errorMessage}</p>
    <p>Versuche, den Inhalt als normalen Text anzuzeigen:</p>
    <div style={{
      padding: '15px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      fontSize: '0.9rem',
      lineHeight: '1.5',
      transform: 'translateZ(0)',
      contain: 'content'
    }}>
      {validContent && validContent.length > 0 ? (
        <div>
          {/* Versuche, den Inhalt als HTML zu rendern */}
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(validContent) }} />

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
));

// Memoized Warning-Banner-Komponente
const WarningBanner = memo(({ errorMessage }: { errorMessage: string | null }) => (
  <div className={styles.warningBanner}>
    <span>{errorMessage}</span>
    <button
      onClick={() => console.log('Warnung ausgeblendet')}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        color: '#856404',
        padding: '0 0 0 10px'
      }}
      aria-label="Warnung ausblenden"
    >
      ×
    </button>
  </div>
));

// Memoized Loading-Komponente
const LoadingIndicator = memo(({ primaryColor }: { primaryColor: string }) => (
  <div className={styles.loadingContainer}>
    <div className={styles.loadingIndicator}>
      <div className={styles.loadingDot} style={{ backgroundColor: primaryColor }}></div>
      <div className={styles.loadingDot} style={{ backgroundColor: primaryColor }}></div>
      <div className={styles.loadingDot} style={{ backgroundColor: primaryColor }}></div>
    </div>
  </div>
));

/**
 * Chunk-basierte Mall-Message-Komponente
 *
 * Diese Komponente verarbeitet XML-Inhalte in Chunks, validiert und repariert sie,
 * und rendert sie dann als FluidMallMessage.
 *
 * Optimiert für Stabilität und Flicker-Vermeidung während des Streamings.
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
  // Verwende den optimierten Chunk-basierten Hook
  const { sections, validContent, hasError, errorMessage } = useChunkedMallContent(
    content,
    isStreaming,
    query
  );

  // Memoized Rendering-Entscheidung für Stabilität
  const renderContent = useMemo(() => {
    // Wenn ein Fehler aufgetreten ist und das Streaming abgeschlossen ist
    // Aber nur, wenn keine Sektionen gefunden wurden
    if (hasError && !isStreaming && isComplete && sections.length === 0) {
      return (
        <ErrorDisplay
          errorMessage={errorMessage}
          validContent={validContent}
          content={content}
        />
      );
    }

    // Wenn ein Fehler aufgetreten ist, aber wir trotzdem Sektionen haben
    if (hasError && !isStreaming && isComplete && sections.length > 0) {
      return (
        <>
          {errorMessage && <WarningBanner errorMessage={errorMessage} />}
          <FluidMallMessage
            sections={sections}
            isStreaming={isStreaming}
            colorStyle={colorStyle}
          />
        </>
      );
    }

    // Optimierung: Wenn keine Sektionen vorhanden sind und wir noch streamen,
    // zeigen wir einen Lade-Indikator an, anstatt eine leere FluidMallMessage
    if (isStreaming && sections.length === 0) {
      return <LoadingIndicator primaryColor={colorStyle.primaryColor} />;
    }

    // Wenn keine Sektionen vorhanden sind und wir nicht mehr streamen, zeigen wir nichts an
    if (sections.length === 0) {
      return null;
    }

    // Rendere die FluidMallMessage mit den geparsten Sektionen
    return (
      <FluidMallMessage
        sections={sections}
        isStreaming={isStreaming}
        colorStyle={colorStyle}
      />
    );
  }, [sections, validContent, hasError, errorMessage, isStreaming, isComplete, content, colorStyle]);

  // Rendere den memoisiertem Inhalt
  return (
    <div className="chunked-mall-message-container" style={{
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      willChange: 'contents',
      contain: 'content'
    }}>
      {renderContent}
    </div>
  );
};

// Exportiere eine memoized Version der Komponente
export default memo(ChunkedMallMessage);
