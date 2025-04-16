'use client';

import React, { memo, useMemo, useEffect } from 'react';
import FluidMallMessage from './components/FluidMallMessage';
import { useChunkProgressiveStreaming } from './hooks/useChunkProgressiveStreaming.debug';
import './styles/mall-unified.css';

interface FluidMallMessageWrapperProps {
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
 * Wrapper für die FluidMallMessage-Komponente
 *
 * Diese Komponente passt die Schnittstelle von FluidMallMessage an die
 * erwartete Schnittstelle von MallTemplateRenderer an.
 */
const FluidMallMessageWrapper: React.FC<FluidMallMessageWrapperProps> = ({
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
  // Verwende den Chunk-Streaming-Hook für Content-Verarbeitung
  const { sections, partialSections, progress: streamProgress, hasError } = useChunkProgressiveStreaming(
    content,
    isStreaming,
    query
  );

  // Fortschrittsanzeige für Skeleton-Loader
  const progress = streamProgress;

  // Verwende partialSections während des Streamings und sections wenn fertig
  const displaySections = useMemo(() => {
    // Debug-Ausgabe für Sektionen
    console.log('FluidMallMessageWrapper - Verfügbare Sektionen:', {
      streaming: isStreaming,
      partialSections: partialSections.length,
      sections: sections.length,
      partialTypes: partialSections.map(s => s.type).join(', '),
      sectionTypes: sections.map(s => s.type).join(', ')
    });

    // Während des Streamings verwenden wir partialSections, sonst sections
    // Wenn keine Sektionen vorhanden sind, erstellen wir eine leere Intro-Sektion
    const result = isStreaming ? partialSections : sections;

    // Wenn wir Sektionen haben, geben wir sie zurück
    if (result.length > 0) {
      return result;
    }

    // Wenn wir keine Sektionen haben, aber Content, erstellen wir eine Intro-Sektion
    if (content.trim().length > 0) {
      console.log('Erstelle Fallback-Intro-Sektion mit Content:', content.substring(0, 100) + '...');
      return [{
        type: 'intro' as const,
        title: '',
        content: content.replace(/\n/g, '<br>'),
        query,
        isPartial: isStreaming
      }];
    }

    // Ansonsten geben wir ein leeres Array zurück
    return [];
  }, [isStreaming, partialSections, sections, content, query]);

  // Container-Styling
  const containerStyle = useMemo(() => ({
    position: 'relative',
    width: '100%',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'contents',
    contain: 'content',
  } as React.CSSProperties), []);

  // Shimmer-Animation für Skeleton-Loader
  const shimmerStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)',
    animation: 'shimmer 2s infinite',
    backgroundSize: '200% 100%',
    backgroundRepeat: 'no-repeat',
  } as React.CSSProperties), []);

  // Definiere die Shimmer-Animation
  useEffect(() => {
    // Füge die Shimmer-Animation zum Dokument hinzu, wenn sie noch nicht existiert
    if (!document.getElementById('shimmer-animation')) {
      const style = document.createElement('style');
      style.id = 'shimmer-animation';
      style.innerHTML = `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Cleanup
    return () => {
      const style = document.getElementById('shimmer-animation');
      if (style && !isStreaming) {
        style.remove();
      }
    };
  }, [isStreaming]);

  // Fehlerbehandlung
  if (hasError && !isStreaming) {
    return (
      <div className="mall-error">
        <p>Es ist ein Fehler bei der Verarbeitung der Antwort aufgetreten.</p>
      </div>
    );
  }

  // Erstelle ein Skeleton-Layout, das von Anfang an angezeigt wird
  const renderSkeleton = () => {
    return (
      <div className="mall-skeleton-layout">
        {/* Intro-Skeleton */}
        <div className="mall-intro-skeleton" style={{
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          minHeight: '80px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={shimmerStyle}></div>
        </div>

        {/* Shop-Slider-Skeleton */}
        <div className="mall-shop-slider-skeleton" style={{
          marginBottom: '24px'
        }}>
          <div style={{
            height: '24px',
            width: '120px',
            backgroundColor: '#eee',
            marginBottom: '12px',
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={shimmerStyle}></div>
          </div>
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '16px',
            padding: '8px 0'
          }}>
            {[1, 2, 3].map((i) => (
              <div key={`shop-skeleton-${i}`} style={{
                width: '280px',
                minHeight: '250px',
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '16px',
                margin: '8px',
                backgroundColor: '#f9f9f9',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={shimmerStyle}></div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#eee',
                  marginBottom: '12px',
                  borderRadius: '4px',
                  margin: '0 auto'
                }}></div>
                <div style={{
                  height: '20px',
                  width: '80%',
                  backgroundColor: '#eee',
                  marginBottom: '8px',
                  borderRadius: '4px'
                }}></div>
                <div style={{
                  height: '16px',
                  width: '60%',
                  backgroundColor: '#eee',
                  borderRadius: '4px'
                }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip-Skeleton */}
        <div className="mall-tip-skeleton" style={{
          padding: '16px',
          backgroundColor: '#fff8e1',
          borderRadius: '8px',
          marginTop: '16px',
          borderLeft: `4px solid ${colorStyle.secondaryColor}`,
          minHeight: '60px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={shimmerStyle}></div>
        </div>
      </div>
    );
  };

  // Fortschrittsanzeige für Skeleton
  const renderProgressBar = () => {
    return (
      <div style={{
        height: '4px',
        backgroundColor: '#eee',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: colorStyle.primaryColor,
          borderRadius: '2px',
          transition: 'width 0.3s ease-in-out'
        }}></div>
      </div>
    );
  };

  // Kombinierter Ansatz: Zeige Skeleton und Inhalt gleichzeitig
  return (
    <div style={containerStyle} className="fluid-mall-message-wrapper">
      {/* Zeige Fortschrittsanzeige während des Streamings */}
      {isStreaming && renderProgressBar()}

      {/* Zeige immer die FluidMallMessage, auch wenn noch keine Sektionen vorhanden sind */}
      <div style={{ position: 'relative' }}>
        {/* Skeleton im Hintergrund während des Streamings */}
        {isStreaming && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1,
            opacity: displaySections.length === 0 ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}>
            {renderSkeleton()}
          </div>
        )}

        {/* Tatsächlicher Inhalt mit höherem z-Index */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          opacity: displaySections.length === 0 ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}>
          <FluidMallMessage
            sections={displaySections}
            isStreaming={isStreaming}
            colorStyle={colorStyle}
          />
        </div>
      </div>

      {messageControls && (
        <div className="mall-message-controls">
          {messageControls}
        </div>
      )}
    </div>
  );
};

// Exportiere eine memoized Version der Komponente
export default memo(FluidMallMessageWrapper);
