'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShopData } from './ShopCard';
import AdaptiveShopCard from './AdaptiveShopCard';

interface AdaptiveShopSliderProps {
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
 * Ein adaptiver Shop-Slider, der Platzhalter verwendet, um Layout-Sprünge zu vermeiden
 * 
 * Dieser Slider zeigt sofort eine feste Anzahl von Platzhalter-Karten an und füllt sie
 * dann nach und nach mit Daten, während diese gestreamt werden.
 */
const AdaptiveShopSlider: React.FC<AdaptiveShopSliderProps> = ({
  title,
  shops = [],
  isStreaming,
  maxShops = 3,
  colorStyle = {
    primaryColor: '#3b1c60',
    secondaryColor: '#ff5a5f'
  }
}) => {
  // Refs für DOM-Manipulation
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Erstelle ein Array mit Platzhaltern für die maximale Anzahl von Shops
  const placeholders = Array(maxShops).fill(null);
  
  // Berechne die Anzahl der anzuzeigenden Shops (entweder die tatsächliche Anzahl oder maxShops)
  const visibleShopCount = Math.min(shops.length, maxShops);
  
  // Berechne die Breite der Karten basierend auf der Anzahl der anzuzeigenden Shops
  const cardWidth = shops.length < 3 ? `calc((100% / ${Math.max(shops.length, 1)}) - 1rem)` : '280px';
  
  // Styling für den Slider-Container
  const sliderStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: '1.5rem',
    position: 'relative',
  };
  
  // Styling für den Titel
  const titleStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
    color: colorStyle.primaryColor,
  };
  
  // Styling für den Karten-Container
  const cardsContainerStyle: React.CSSProperties = {
    display: 'flex',
    overflowX: 'auto',
    scrollBehavior: 'smooth',
    padding: '0.5rem 0',
    gap: '1rem',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  };
  
  // Verstecke die Scrollbar
  const hideScrollbarStyle = {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  };
  
  return (
    <div ref={sliderRef} style={sliderStyle} className="adaptive-shop-slider">
      <h3 style={titleStyle}>{title || 'Shops'}</h3>
      
      <div style={{...cardsContainerStyle, ...hideScrollbarStyle}} className="cards-container">
        {/* Zeige entweder die tatsächlichen Shops oder Platzhalter an */}
        {isStreaming ? (
          // Während des Streamings: Zeige so viele Platzhalter wie nötig und fülle sie mit Daten, sobald verfügbar
          placeholders.map((_, index) => (
            <AdaptiveShopCard
              key={`shop-placeholder-${index}`}
              shop={shops[index] || null}
              isLoading={!shops[index]}
              cardWidth={cardWidth}
              colorStyle={colorStyle}
            />
          ))
        ) : (
          // Nach dem Streaming: Zeige nur die tatsächlichen Shops
          shops.map((shop, index) => (
            <AdaptiveShopCard
              key={`shop-${index}`}
              shop={shop}
              isLoading={false}
              cardWidth={cardWidth}
              colorStyle={colorStyle}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AdaptiveShopSlider;
