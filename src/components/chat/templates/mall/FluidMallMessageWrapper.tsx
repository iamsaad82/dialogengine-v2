'use client';

import React, { memo, useMemo } from 'react';
import FluidMallMessage from './components/FluidMallMessage';
import { useChunkProgressiveStreaming } from './hooks/useChunkProgressiveStreaming.keyvalue';
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
  const { sections, partialSections, progress, hasError } = useChunkProgressiveStreaming(
    content,
    isStreaming,
    query
  );

  // Verwende partialSections während des Streamings und sections wenn fertig
  const displaySections = useMemo(() => {
    return isStreaming ? partialSections : sections;
  }, [isStreaming, partialSections, sections]);

  // Container-Styling
  const containerStyle = useMemo(() => ({
    position: 'relative',
    width: '100%',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'contents',
    contain: 'content',
  } as React.CSSProperties), []);

  // Fehlerbehandlung
  if (hasError && !isStreaming) {
    return (
      <div className="mall-error">
        <p>Es ist ein Fehler bei der Verarbeitung der Antwort aufgetreten.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle} className="fluid-mall-message-wrapper">
      <FluidMallMessage
        sections={displaySections}
        isStreaming={isStreaming}
        colorStyle={colorStyle}
      />

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
