'use client';

import React, { memo } from 'react';
import ShopCard from './ShopCard';
import { ShopData } from '../utils/contentParser';

interface ShopSliderProps {
  title: string;
  shops: ShopData[];
  isStreaming?: boolean;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * Shop-Slider Komponente
 *
 * Diese Komponente zeigt eine horizontale Liste von Shops an.
 * Optimiert für Stabilität und Performance während des Streamings.
 */
const ShopSlider: React.FC<ShopSliderProps> = ({
  title,
  shops = [],
  isStreaming = false,
  colorStyle = {
    primaryColor: '#3b1c60',
    secondaryColor: '#ff5a5f'
  }
}) => {
  // Styling für den Slider
  const sliderStyle: React.CSSProperties = {
    width: '100%',
    marginBottom: '1.5rem',
    transform: 'translateZ(0)',
    contain: 'content',
  };

  // Styling für den Titel
  const titleStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    color: colorStyle.primaryColor,
  };

  // Styling für den Container der Karten
  const cardsContainerStyle: React.CSSProperties = {
    display: 'flex',
    overflowX: 'auto',
    overflowY: 'hidden',
    gap: '1rem',
    padding: '0.25rem 0.25rem 1rem',
    margin: '0 -0.25rem',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none' as 'none',
    msOverflowStyle: 'none',
    contain: 'layout size',
    willChange: 'transform',
  };

  return (
    <div style={sliderStyle} className="mall-shop-slider">
      <h3 style={titleStyle}>{title}</h3>

      <div
        style={cardsContainerStyle}
        className="mall-cards-container"
      >
        {/* Zeige alle verfügbaren Shops an */}
        {shops.map((shop, index) => (
          <ShopCard
            key={`shop-card-${shop.name}-${index}`}
            data={shop}
          />
        ))}
      </div>
    </div>
  );
};

// Exportiere eine memoized Version der Komponente für bessere Performance
export default memo(ShopSlider);
