'use client';

import React, { memo, useEffect } from 'react';
import { useSmartChunkProcessor } from './hooks/useSmartChunkProcessor';
import SmartMallRenderer from './components/SmartMallRenderer';
import SmartMallStyles from './styles/SmartMall.module.css';

// Debug-Modus
const DEBUG_MODE = false;

interface SmartMallMessageProps {
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
 * SmartMall Template - Hauptkomponente
 * 
 * Eine neue, optimierte Implementierung des Mall-Templates mit Fokus auf:
 * - Flüssiges, progressives Rendering
 * - Robuste Chunk-Verarbeitung
 * - Stabile Layout-Struktur
 * - Keine visuellen Sprünge oder Flackern
 */
const SmartMallMessage: React.FC<SmartMallMessageProps> = ({
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
  // Debug-Ausgabe bei Änderungen der Hauptprops
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log('SMARTMALL-MESSAGE: Komponente initialisiert/aktualisiert', {
        contentLength: content?.length || 0,
        isStreaming,
        isComplete
      });
    }
  }, [content, isStreaming, isComplete]);

  // Verwende den optimierten Chunk-Processor für das Flowise-Format
  const { 
    intro,
    shops, 
    restaurants, 
    events, 
    tip, 
    followUp,
    progress,
    hasError,
    parking,
    openingHours
  } = useSmartChunkProcessor(content, isStreaming, query);

  // Container-Klassen für optimale Rendering-Performance
  const containerClasses = [
    SmartMallStyles.container,
    isStreaming ? SmartMallStyles.streaming : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <SmartMallRenderer
        intro={intro}
        shops={shops}
        restaurants={restaurants}
        events={events}
        tip={tip}
        followUp={followUp}
        progress={progress}
        isStreaming={isStreaming}
        colorStyle={colorStyle}
        isComplete={isComplete}
        hasError={hasError}
        parking={parking}
        openingHours={openingHours}
      />

      {messageControls && (
        <div className={SmartMallStyles.controls}>
          {messageControls}
        </div>
      )}
    </div>
  );
};

export default memo(SmartMallMessage); 