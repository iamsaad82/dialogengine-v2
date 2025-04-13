'use client';

import React from 'react';
import { ShopData } from './ShopCard';

interface AdaptiveShopCardProps {
  shop: ShopData | null;
  isLoading: boolean;
  cardWidth: string;
  colorStyle: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * Eine adaptive Shop-Karte, die entweder Daten oder einen Platzhalter anzeigt
 * 
 * Diese Komponente behält immer die gleiche Größe und Struktur, unabhängig davon,
 * ob sie Daten oder einen Platzhalter anzeigt. Dadurch werden Layout-Sprünge vermieden.
 */
const AdaptiveShopCard: React.FC<AdaptiveShopCardProps> = ({
  shop,
  isLoading,
  cardWidth,
  colorStyle
}) => {
  // Basis-Styling für die Karte
  const cardStyle: React.CSSProperties = {
    width: cardWidth,
    minWidth: '250px',
    height: '380px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    marginRight: '1rem',
    flex: '0 0 auto',
    position: 'relative',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoading ? 0.7 : 1,
  };
  
  // Styling für den Bild-Container
  const imageContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isLoading ? '#f0f0f0' : 'white',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    position: 'relative',
  };
  
  // Styling für das Bild
  const imageStyle: React.CSSProperties = {
    maxWidth: '80%',
    maxHeight: '80%',
    objectFit: 'contain',
    opacity: isLoading ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
  };
  
  // Styling für den Inhalt
  const contentStyle: React.CSSProperties = {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  };
  
  // Styling für den Titel
  const titleStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: colorStyle.primaryColor,
    height: '1.5rem',
    backgroundColor: isLoading ? '#f0f0f0' : 'transparent',
    borderRadius: '4px',
  };
  
  // Styling für die Kategorie
  const categoryStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.25rem',
    height: '1.2rem',
    backgroundColor: isLoading ? '#f0f0f0' : 'transparent',
    borderRadius: '4px',
    width: '70%',
  };
  
  // Styling für die Etage
  const floorStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
    height: '1.2rem',
    backgroundColor: isLoading ? '#f0f0f0' : 'transparent',
    borderRadius: '4px',
    width: '50%',
  };
  
  // Styling für die Beschreibung
  const descriptionStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#333',
    marginBottom: '0.5rem',
    flex: 1,
    backgroundColor: isLoading ? '#f0f0f0' : 'transparent',
    borderRadius: '4px',
  };
  
  // Styling für die Öffnungszeiten
  const openingStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: 'auto',
    height: '1.2rem',
    backgroundColor: isLoading ? '#f0f0f0' : 'transparent',
    borderRadius: '4px',
    width: '90%',
  };
  
  // Skeleton-Loader für die Beschreibung
  const DescriptionSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ height: '0.9rem', backgroundColor: '#f0f0f0', borderRadius: '4px', width: '100%' }} />
      <div style={{ height: '0.9rem', backgroundColor: '#f0f0f0', borderRadius: '4px', width: '90%' }} />
      <div style={{ height: '0.9rem', backgroundColor: '#f0f0f0', borderRadius: '4px', width: '80%' }} />
    </div>
  );
  
  return (
    <div style={cardStyle} className="adaptive-shop-card">
      {/* Bild-Container */}
      <div style={imageContainerStyle}>
        {shop && shop.image ? (
          <img 
            src={shop.image} 
            alt={shop.name || 'Shop'} 
            style={imageStyle}
            onError={(e) => {
              // Fallback für fehlerhafte Bilder
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Logo';
            }}
          />
        ) : isLoading ? (
          // Platzhalter für das Bild
          <div style={{ 
            width: '60%', 
            height: '60%', 
            backgroundColor: '#f0f0f0',
            borderRadius: '4px'
          }} />
        ) : (
          // Fallback für fehlendes Bild
          <div style={{ 
            width: '60%', 
            height: '60%', 
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '0.8rem'
          }}>
            Kein Bild
          </div>
        )}
      </div>
      
      {/* Inhalt */}
      <div style={contentStyle}>
        {/* Titel */}
        <div style={titleStyle}>
          {!isLoading && shop?.name}
        </div>
        
        {/* Kategorie */}
        <div style={categoryStyle}>
          {!isLoading && shop?.category}
        </div>
        
        {/* Etage */}
        <div style={floorStyle}>
          {!isLoading && shop?.floor}
        </div>
        
        {/* Beschreibung */}
        <div style={descriptionStyle}>
          {!isLoading && shop?.description ? (
            shop.description
          ) : isLoading ? (
            <DescriptionSkeleton />
          ) : null}
        </div>
        
        {/* Öffnungszeiten */}
        <div style={openingStyle}>
          {!isLoading && shop?.opening}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveShopCard;
