'use client';

import React from 'react';

export interface ShopData {
  name: string;
  category?: string;
  floor?: string;
  opening?: string;
  image?: string;
  description?: string;
  link?: string;
}

interface ShopCardProps {
  data: ShopData;
  style?: React.CSSProperties;
}

/**
 * Verbesserte Komponente für einzelne Shop-Karten im Mall-Template
 * Mit optimierter Performance und Bildladung
 */
const ShopCard: React.FC<ShopCardProps> = ({
  data,
  style = {}
}) => {
  const { name, category, floor, opening, image, description, link } = data;

  // Moderne Stile mit Performance-Optimierungen
  const cardStyle = {
    ...style,
    flex: '0 0 auto',
    width: '300px', // Breitere Karten
    minHeight: '100px',
    marginRight: '1rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    backgroundColor: 'white',
    transition: 'none', // Keine Transition um Flackern zu vermeiden
    border: '1px solid rgba(0, 0, 0, 0.1)',
    contain: 'content', // Verbesserte Rendering-Performance
    position: 'relative' as React.CSSProperties['position'],
    transform: 'translateZ(0)', // Hardware-Beschleunigung
    backfaceVisibility: 'hidden' as React.CSSProperties['backfaceVisibility'],
  };

  const imageContainerStyle = {
    width: '100%',
    height: '160px',
    backgroundColor: 'white',
    position: 'relative' as React.CSSProperties['position'],
    overflow: 'hidden',
    contain: 'strict', // Verbesserte Rendering-Performance
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const imageStyle = {
    width: '80%',
    height: '80%',
    objectFit: 'contain' as React.CSSProperties['objectFit'],
    transition: 'none',
    padding: '0',
    backgroundColor: 'white',
    maxWidth: '200px',
    maxHeight: '120px',
  };

  const contentStyle = {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    height: 'calc(100% - 160px)', // Restliche Höhe nach Abzug des Bildes
    backgroundColor: 'white',
    borderTop: '1px solid #f0f0f0',
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
    fontSize: '0.9rem',
    color: '#555',
    margin: '0 0 0.5rem 0',
    whiteSpace: 'nowrap' as React.CSSProperties['whiteSpace'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600,
    backgroundColor: '#f8f8f8',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    width: 'fit-content',
  };

  const floorStyle = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--mall-secondary, #ff5a5f)',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    width: 'fit-content',
  };

  const openingStyle = {
    fontSize: '0.85rem',
    color: '#555',
    margin: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    fontStyle: 'italic',
  };

  const descriptionStyle = {
    fontSize: '0.9rem',
    margin: '0 0 0.75rem 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as any,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.4',
    color: '#555',
    flex: '1 1 auto', // Nimmt verfügbaren Platz ein
    whiteSpace: 'normal' as React.CSSProperties['whiteSpace'], // Verhindert, dass HTML-Tags als Text angezeigt werden
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

  // Optimierte Bildladung mit Fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div style={cardStyle} className="mall-shop-card">
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
            <span style={{color: '#ccc', fontSize: '2rem'}}>🏬</span>
          </div>
        )}
      </div>
      <div style={contentStyle}>
        <h3 style={nameStyle} title={name}>{name}</h3>

        {category && (
          <p style={categoryStyle} title={category}>
            <span style={iconStyle}>📋</span>
            {category}
          </p>
        )}

        {description && (
          <p
            style={descriptionStyle}
            title={description}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {floor && (
          <p style={floorStyle}>
            <span style={iconStyle}>📍</span>
            {floor}
          </p>
        )}

        {opening && (
          <p style={openingStyle}>
            <span style={iconStyle}>🕒</span>
            {opening}
          </p>
        )}

        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Mehr erfahren <span style={{marginLeft: '0.3rem'}}>→</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default ShopCard;