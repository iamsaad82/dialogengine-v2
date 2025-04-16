'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import FluidServiceCard from './FluidServiceCard';

// Service-Datenstruktur
export interface ServiceData {
  name: string;
  category?: string;
  image?: string;
  description?: string;
  location?: string;
}

interface FluidServiceSliderProps {
  title: string;
  services: ServiceData[];
  isStreaming: boolean;
  maxItems?: number;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * Ein flüssiger Service-Slider mit optimiertem Streaming-Verhalten
 *
 * Diese Komponente verwendet fortschrittliche Techniken für ein nahtloses
 * Streaming-Erlebnis ohne Flackern oder Layout-Sprünge.
 */
const FluidServiceSlider: React.FC<FluidServiceSliderProps> = ({
  title,
  services = [],
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
  const [visibleItems, setVisibleItems] = useState<ServiceData[]>([]);

  // Memoized Werte für Stabilität
  const placeholders = useMemo(() => Array(maxItems).fill(null), [maxItems]);
  const cardWidth = useMemo(() => {
    // Wenn weniger als 3 Services vorhanden sind, passen wir die Breite an, um den verfügbaren Platz zu nutzen
    // Andernfalls verwenden wir eine feste Breite für den Slider
    return services.length < 3 ? `calc((100% / ${Math.max(services.length || 1, 1)}) - 1rem)` : '280px';
  }, [services.length]);

  // Sofort die Services anzeigen, wenn sie verfügbar sind und wir nicht streamen
  useEffect(() => {
    if (services.length > 0 && !isStreaming) {
      setVisibleItems(services.slice(0, maxItems));
    }
  }, [services, maxItems, isStreaming]);

  // Effekt für sanfte Übergänge beim Streaming
  useEffect(() => {
    if (isInitialRender) {
      // Beim ersten Render sofort die Platzhalter anzeigen
      setIsInitialRender(false);
      return;
    }

    // Sofort die Services anzeigen, wenn wir nicht mehr streamen
    if (!isStreaming && services.length > 0) {
      setVisibleItems(services.slice(0, maxItems));
      return;
    }

    // Sanft neue Services hinzufügen, mit Verzögerung für flüssige Animation während des Streamings
    const timer = setTimeout(() => {
      setVisibleItems(services.slice(0, maxItems));
    }, 100);

    return () => clearTimeout(timer);
  }, [services, maxItems, isInitialRender, isStreaming]);

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
  // Hinweis: Wir verwenden eine CSS-Klasse statt inline-Styles für Scrollbar-Anpassungen

  return (
    <div ref={sliderRef} style={sliderStyle} className="fluid-service-slider">
      <h3 style={titleStyle}>{title || 'Services'}</h3>

      <div
        ref={cardsContainerRef}
        style={cardsContainerStyle}
        className="cards-container hide-scrollbar"
      >
        {/* Zeige die tatsächlichen Services an */}
        {services.map((service, index) => (
          <FluidServiceCard
            key={`service-card-${service.name}-${index}`}
            service={service}
            isLoading={false} // Keine Ladeanzeige mehr, da wir nur rendern, wenn Daten vorhanden sind
            cardWidth={cardWidth}
            colorStyle={colorStyle}
            animationDelay={0} // Keine verzögerte Animation mehr
          />
        ))}
      </div>
    </div>
  );
};

export default FluidServiceSlider;
