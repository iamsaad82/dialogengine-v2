'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSmartChunkProcessor } from './hooks/useSmartChunkProcessor';
import { SmartMallRenderer } from './components/SmartMallRenderer';
import SmartMallStyles from './styles/SmartMall.module.css';

// Debug-Modus für detaillierten Output
const DEBUG_MODE = false;

/**
 * SmartMall Message Komponente
 * 
 * Hauptkomponente für das SmartMall-Template, das einen strukturierten und
 * stabilen Renderer für Mall-Inhalte bereitstellt.
 */
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
  // Referenz für DOM-Messungen
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Cache für vorherigen Content, um ungewollte Re-Renders zu vermeiden
  const previousContentRef = useRef<string | null>(null);
  
  // Debug-Ausgabe bei Änderungen der Hauptprops
  useEffect(() => {
    if (DEBUG_MODE) {
      const contentChanged = previousContentRef.current !== content;
      console.log('SMARTMALL-MESSAGE: Komponente initialisiert/aktualisiert', {
        contentLength: content?.length || 0,
        isStreaming,
        isComplete,
        contentChanged
      });
      
      // Aktualisiere Cache für Vergleiche
      previousContentRef.current = content;
    }
  }, [content, isStreaming, isComplete]);

  // Verwendung des optimierten Smart Chunk Processor und Content-Stabilisierung
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
    openingHours,
    rawContent
  } = useSmartChunkProcessor(content, isStreaming, query);

  // Performance-Optimization: Debounce the component updates 
  // to avoid excessive re-rendering during streaming
  const [debouncedProps, setDebouncedProps] = useState({
    intro,
    shops,
    restaurants,
    events,
    tip,
    followUp,
    progress,
    hasError,
    parking,
    openingHours,
    rawContent
  });

  // Update debounced props only when content changes significantly
  useEffect(() => {
    // Nur updaten, wenn Content oder Progress sich signifikant geändert haben
    const contentChanged = content !== previousContentRef.current;
    const significantProgressChange = Math.abs(progress - debouncedProps.progress) > 10;
    
    if (contentChanged || significantProgressChange || !isStreaming) {
      const timeoutId = setTimeout(() => {
        setDebouncedProps({
          intro,
          shops,
          restaurants,
          events,
          tip,
          followUp,
          progress,
          hasError,
          parking,
          openingHours,
          rawContent
        });
        
        // Aktualisiere Cache
        previousContentRef.current = content;
      }, isStreaming ? 150 : 0); // Mehr Verzögerung während des Streamings
      
      return () => clearTimeout(timeoutId);
    }
  }, [intro, shops, restaurants, events, tip, followUp, progress, 
      hasError, parking, openingHours, isStreaming, content, rawContent]);

  // Container-Klassen für optimale Rendering-Performance
  const containerClasses = [
    SmartMallStyles.container,
    isStreaming ? SmartMallStyles.streaming : '',
    'streaming-stable' // Globale Klasse für Rendering-Stabilität
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} ref={containerRef}>
      <SmartMallRenderer
        intro={debouncedProps.intro}
        shops={debouncedProps.shops}
        restaurants={debouncedProps.restaurants}
        events={debouncedProps.events}
        tip={debouncedProps.tip}
        followUp={debouncedProps.followUp}
        progress={debouncedProps.progress}
        isStreaming={isStreaming}
        colorStyle={colorStyle}
        isComplete={isComplete}
        hasError={debouncedProps.hasError}
        parking={debouncedProps.parking}
        openingHours={debouncedProps.openingHours}
        rawContent={debouncedProps.rawContent}
      />

      {messageControls && (
        <div className={SmartMallStyles.controls}>
          {messageControls}
        </div>
      )}
    </div>
  );
};

export default SmartMallMessage; 