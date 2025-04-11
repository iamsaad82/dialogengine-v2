'use client';

import React from 'react';
import { ShopData } from './ShopCard'; // Wiederverwendung der ShopData-Schnittstelle

interface RestaurantCardProps {
  data: ShopData;
  style?: React.CSSProperties;
}

/**
 * Verbesserte Komponente für einzelne Restaurant-Karten im Mall-Template
 * Mit optimierter Performance und Bildladung
 */
const RestaurantCard: React.FC<RestaurantCardProps> = ({
  data,
  style = {}
}) => {
  const { name, category, floor, opening, image, description, link } = data;

  // Moderne Stile mit Performance-Optimierungen
  const cardStyle = {
    ...style,
    flex: '0 0 auto',
    width: '260px',
    marginRight: '1rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    backgroundColor: 'white',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: 'none',
    contain: 'content', // Verbesserte Rendering-Performance
    position: 'relative',
    transform: 'translateZ(0)', // Hardware-Beschleunigung
    backfaceVisibility: 'hidden' as React.CSSProperties['backfaceVisibility'],
  };

  const imageContainerStyle = {
    width: '100%',
    height: '160px',
    backgroundColor: '#f8f8f8',
    position: 'relative' as React.CSSProperties['position'],
    overflow: 'hidden',
    contain: 'strict', // Verbesserte Rendering-Performance
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as React.CSSProperties['objectFit'],
    transition: 'transform 0.5s ease',
    transform: 'scale(1.01)', // Leicht vergrößert für bessere Kanten
  };

  const contentStyle = {
    padding: '1.2rem',
    display: 'flex',
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    height: 'calc(100% - 160px)', // Restliche Höhe nach Abzug des Bildes
  };

  const nameStyle = {
    fontWeight: 600,
    fontSize: '1.1rem',
    margin: '0 0 0.5rem 0',
    color: 'var(--mall-primary, #3b1c60)',
    whiteSpace: 'nowrap' as React.CSSProperties['whiteSpace'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const categoryStyle = {
    fontSize: '0.85rem',
    color: '#777',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
  };

  const descriptionStyle = {
    fontSize: '0.9rem',
    margin: '0 0 0.5rem 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as any,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.4',
    color: '#555',
    flex: '1 1 auto', // Nimmt verfügbaren Platz ein
  };

  const floorStyle = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--mall-secondary, #ff5a5f)',
    margin: '0.5rem 0 0',
    display: 'flex',
    alignItems: 'center',
  };

  const hoursStyle = {
    fontSize: '0.85rem',
    color: '#555',
    margin: '0.3rem 0 0',
    display: 'flex',
    alignItems: 'center',
  };

  const linkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '0.75rem',
    fontSize: '0.85rem',
    color: 'var(--mall-primary, #3b1c60)',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'color 0.2s ease',
  };

  // Icon-Stile für bessere visuelle Hierarchie
  const iconStyle = {
    marginRight: '0.4rem',
    fontSize: '0.9rem',
    opacity: 0.7,
  };

  // Cuisine-Badge-Stil für Kategorien
  const cuisineBadgeStyle = {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    backgroundColor: 'rgba(var(--mall-primary-rgb, 59, 28, 96), 0.08)',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--mall-primary, #3b1c60)',
    marginRight: '0.5rem',
    marginBottom: '0.5rem',
  };

  // Optimierte Bildladung mit Fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  // Kategorie in Cuisine-Badges aufteilen, falls vorhanden
  const cuisines = category ? category.split(/,\s*|\s*\|\s*|\s*&\s*|\s*und\s*/) : [];

  return (
    <div style={cardStyle} className="mall-restaurant-card">
      <div style={imageContainerStyle}>
        {image ? (
          <img
            src={image}
            style={imageStyle}
            alt={name}
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{color: '#ccc', fontSize: '2rem'}}>🍴</span>
          </div>
        )}
      </div>
      <div style={contentStyle}>
        <div>
          <h3 style={nameStyle} title={name}>{name}</h3>

          {/* Cuisine-Badges für Kategorien */}
          {cuisines.length > 0 && (
            <div style={{display: 'flex', flexWrap: 'wrap', margin: '0.5rem 0'}}>
              {cuisines.map((cuisine, index) => (
                <span key={`cuisine-${index}`} style={cuisineBadgeStyle}>{cuisine.trim()}</span>
              ))}
            </div>
          )}

          {description && <p style={descriptionStyle} title={description}>{description}</p>}

          {floor && (
            <p style={floorStyle}>
              <span style={iconStyle}>📍</span>
              {floor}
            </p>
          )}

          {opening && (
            <p style={hoursStyle}>
              <span style={iconStyle}>🕒</span>
              {opening}
            </p>
          )}

          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              Speisekarte ansehen <span style={{marginLeft: '0.3rem'}}>→</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;