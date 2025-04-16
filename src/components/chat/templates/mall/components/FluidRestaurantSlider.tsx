'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ShopData } from './ShopCard';
import FluidRestaurantCard from './FluidRestaurantCard';

interface FluidRestaurantSliderProps {
  title: string;
  shops: ShopData[];
  isStreaming?: boolean;
  maxShops?: number;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * Ein flüssiger Restaurant-Slider mit optimiertem Streaming-Verhalten
 *
 * Diese Komponente verwendet fortschrittliche Techniken für ein nahtloses
 * Streaming-Erlebnis ohne Flackern oder Layout-Sprünge.
 */
const FluidRestaurantSlider: React.FC<FluidRestaurantSliderProps> = ({
  title,
  shops = [],
  isStreaming = false,
  maxShops = 3,
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

  // Memoized Werte für Stabilität
  const cardWidth = useMemo(() => {
    // Wenn weniger als 3 Restaurants vorhanden sind, passen wir die Breite an, um den verfügbaren Platz zu nutzen
    // Andernfalls verwenden wir eine feste Breite für den Slider
    return shops.length < 3 ? `calc((100% / ${Math.max(shops.length || 1, 1)}) - 1rem)` : '280px';
  }, [shops.length]);

  // Debug-Ausgabe
  console.log('FluidRestaurantSlider: Restaurants:', shops.length, 'Restaurant-Daten:', shops);

  // Debug-Ausgabe für verfügbare Restaurants
  useEffect(() => {
    if (shops.length > 0) {
      console.log('FluidRestaurantSlider: Verfügbare Restaurants:', shops.length);
    }
  }, [shops]);

  // Effekt für sanfte Übergänge beim Streaming
  useEffect(() => {
    if (isInitialRender) {
      // Beim ersten Render sofort die Platzhalter anzeigen
      setIsInitialRender(false);
    }
  }, [isInitialRender]);

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
    <div ref={sliderRef} style={sliderStyle} className="fluid-restaurant-slider">
      <h3 style={titleStyle}>{title || 'Restaurants'}</h3>

      <div
        ref={cardsContainerRef}
        style={cardsContainerStyle}
        className="cards-container hide-scrollbar"
      >
        {/* Zeige die tatsächlichen Restaurants an */}
        {shops.map((shop, index) => (
          <FluidRestaurantCard
            key={`restaurant-card-${shop.name}-${index}`}
            restaurant={shop}
            isLoading={false}
            cardWidth={cardWidth}
            colorStyle={colorStyle}
            animationDelay={index * 100}
          />
        ))}
      </div>
    </div>
  );
};

export default FluidRestaurantSlider;
