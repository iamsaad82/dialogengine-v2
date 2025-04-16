'use client';

import React, { useRef, useMemo } from 'react';
import { ShopData } from './ShopCard';
import FluidShopCard from './FluidShopCard';

interface FluidShopSliderProps {
  title: string;
  shops: ShopData[];
  isStreaming?: boolean; // Optional, da wir es nicht mehr verwenden
  maxShops?: number; // Optional, da wir es nicht mehr verwenden
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
  colorStyle = {
    primaryColor: '#3b1c60',
    secondaryColor: '#ff5a5f'
  }
}) => {
  // Refs für DOM-Manipulation und Animation
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Debug-Ausgabe
  console.log('FluidShopSlider: Shops:', shops.length, 'Shops-Daten:', shops);

  const cardWidth = useMemo(() => {
    // Wenn weniger als 3 Shops vorhanden sind, passen wir die Breite an, um den verfügbaren Platz zu nutzen
    // Andernfalls verwenden wir eine feste Breite für den Slider
    return shops.length < 3 ? `calc((100% / ${Math.max(shops.length || 1, 1)}) - 1rem)` : '280px';
  }, [shops.length]);

  // Wir brauchen diesen Effekt nicht mehr, da wir die Shops direkt rendern

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
    <div ref={sliderRef} style={sliderStyle} className="fluid-shop-slider">
      <h3 style={titleStyle}>{title || 'Shops'}</h3>

      <div
        ref={cardsContainerRef}
        style={cardsContainerStyle}
        className="cards-container hide-scrollbar"
      >
        {/* Zeige alle verfügbaren Shops an */}
        {shops.map((shop, index) => (
          <FluidShopCard
            key={`shop-card-${shop.name}-${index}`}
            shop={shop}
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

export default FluidShopSlider;
