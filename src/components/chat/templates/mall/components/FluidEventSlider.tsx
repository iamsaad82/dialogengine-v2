'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import FluidEventCard from './FluidEventCard';

// Event-Datenstruktur
export interface EventData {
  name: string;
  date: string;
  time?: string;
  location?: string;
  image?: string;
  description?: string;
  link?: string;
}

interface FluidEventSliderProps {
  title: string;
  events: EventData[];
  isStreaming: boolean;
  maxItems?: number;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * Ein flüssiger Event-Slider mit optimiertem Streaming-Verhalten
 * 
 * Diese Komponente verwendet fortschrittliche Techniken für ein nahtloses
 * Streaming-Erlebnis ohne Flackern oder Layout-Sprünge.
 */
const FluidEventSlider: React.FC<FluidEventSliderProps> = ({
  title,
  events = [],
  isStreaming,
  maxItems = 3,
  colorStyle = {
    primaryColor: '#3b1c60',
    secondaryColor: '#ff5a5f'
  }
}) => {
  // Refs für DOM-Manipulation und Animation
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  
  // State für Animation und Tracking
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [visibleItems, setVisibleItems] = useState<EventData[]>([]);
  
  // Memoized Werte für Stabilität
  const placeholders = useMemo(() => Array(maxItems).fill(null), [maxItems]);
  const cardWidth = useMemo(() => {
    return events.length < 3 ? `calc((100% / ${Math.max(events.length || 1, 1)}) - 1rem)` : '280px';
  }, [events.length]);
  
  // Effekt für sanfte Übergänge beim Streaming
  useEffect(() => {
    if (isInitialRender) {
      // Beim ersten Render sofort die Platzhalter anzeigen
      setIsInitialRender(false);
      return;
    }
    
    // Sanft neue Events hinzufügen, mit Verzögerung für flüssige Animation
    const timer = setTimeout(() => {
      setVisibleItems(events.slice(0, maxItems));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [events, maxItems, isInitialRender]);
  
  // Styling für den Slider-Container mit CSS-Variablen für dynamische Anpassung
  const sliderStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: '1.5rem',
    position: 'relative',
    '--primary-color': colorStyle.primaryColor,
    '--secondary-color': colorStyle.secondaryColor,
  } as React.CSSProperties;
  
  // Styling für den Titel mit CSS-Variablen
  const titleStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
    color: 'var(--primary-color)',
    transition: 'opacity 0.3s ease-in-out',
  };
  
  // Styling für den Karten-Container mit optimierter Scrolling-Performance
  const cardsContainerStyle: React.CSSProperties = {
    display: 'flex',
    overflowX: 'auto',
    scrollBehavior: 'smooth',
    padding: '0.5rem 0',
    gap: '1rem',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    transition: 'opacity 0.3s ease-in-out',
    willChange: 'transform, opacity', // Optimierung für Animationen
  };
  
  // Verstecke die Scrollbar für ein saubereres Design
  const hideScrollbarStyle = {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  };
  
  return (
    <div ref={sliderRef} style={sliderStyle} className="fluid-event-slider">
      <h3 style={titleStyle}>{title || 'Events'}</h3>
      
      <div 
        ref={cardsContainerRef} 
        style={{...cardsContainerStyle, ...hideScrollbarStyle}} 
        className="cards-container"
      >
        {/* Zeige entweder die tatsächlichen Events oder Platzhalter an */}
        {placeholders.map((_, index) => (
          <FluidEventCard
            key={`event-card-${index}`}
            event={visibleItems[index] || null}
            isLoading={!visibleItems[index]}
            cardWidth={cardWidth}
            colorStyle={colorStyle}
            animationDelay={index * 100} // Gestaffelte Animation für flüssigeren Eindruck
          />
        ))}
      </div>
    </div>
  );
};

export default FluidEventSlider;
