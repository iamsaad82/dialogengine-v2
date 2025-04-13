'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ShopData } from './ShopCard';
import FluidShopCard from './FluidShopCard';

interface FluidShopSliderProps {
  title: string;
  shops: ShopData[];
  isStreaming: boolean;
  maxShops?: number;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * Ein flüssiger Shop-Slider mit optimiertem Streaming-Verhalten
 * 
 * Diese Komponente verwendet fortschrittliche Techniken, um ein nahtloses
 * Streaming-Erlebnis ohne Flackern oder Layout-Sprünge zu bieten:
 * 
 * 1. Sofortige Anzeige von Platzhaltern mit exakten Dimensionen
 * 2. Sanfte Übergänge beim Befüllen der Platzhalter
 * 3. Optimierte Rendering-Performance durch Memoization
 * 4. Präzise Animation mit CSS-Transitions statt JavaScript
 */
const FluidShopSlider: React.FC<FluidShopSliderProps> = ({
  title,
  shops = [],
  isStreaming,
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
  const [visibleShops, setVisibleShops] = useState<ShopData[]>([]);
  
  // Memoized Werte für Stabilität
  const placeholders = useMemo(() => Array(maxShops).fill(null), [maxShops]);
  const cardWidth = useMemo(() => {
    return shops.length < 3 ? `calc((100% / ${Math.max(shops.length || 1, 1)}) - 1rem)` : '280px';
  }, [shops.length]);
  
  // Effekt für sanfte Übergänge beim Streaming
  useEffect(() => {
    if (isInitialRender) {
      // Beim ersten Render sofort die Platzhalter anzeigen
      setIsInitialRender(false);
      return;
    }
    
    // Sanft neue Shops hinzufügen, mit Verzögerung für flüssige Animation
    const timer = setTimeout(() => {
      setVisibleShops(shops.slice(0, maxShops));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [shops, maxShops, isInitialRender]);
  
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
    <div ref={sliderRef} style={sliderStyle} className="fluid-shop-slider">
      <h3 style={titleStyle}>{title || 'Shops'}</h3>
      
      <div 
        ref={cardsContainerRef} 
        style={{...cardsContainerStyle, ...hideScrollbarStyle}} 
        className="cards-container"
      >
        {/* Zeige entweder die tatsächlichen Shops oder Platzhalter an */}
        {placeholders.map((_, index) => (
          <FluidShopCard
            key={`shop-card-${index}`}
            shop={visibleShops[index] || null}
            isLoading={!visibleShops[index]}
            cardWidth={cardWidth}
            colorStyle={colorStyle}
            animationDelay={index * 100} // Gestaffelte Animation für flüssigeren Eindruck
          />
        ))}
      </div>
    </div>
  );
};

export default FluidShopSlider;
