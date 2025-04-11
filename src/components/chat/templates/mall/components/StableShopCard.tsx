'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ShopData } from './ShopCard';

interface StableShopCardProps {
  data: ShopData;
  style?: React.CSSProperties;
  isLoaded?: boolean;
}

/**
 * Eine stabilere Version der Shop-Karte, die während des Streamings nicht flackert
 * und ein konsistentes Layout beibehält
 */
const StableShopCard: React.FC<StableShopCardProps> = ({
  data,
  style = {},
  isLoaded = true
}) => {
  const { name, category, floor, opening, image, description, link } = data;
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Verzögerte Anzeige, um Flackern zu vermeiden
  useEffect(() => {
    if (isLoaded) {
      // Kurze Verzögerung, um sicherzustellen, dass alle Inhalte bereit sind
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Grundlegende Kartenstile, die immer gleich bleiben
  const cardStyle = {
    ...style,
    flex: '0 0 auto',
    width: '300px',
    height: '400px', // Feste Höhe für Stabilität
    marginRight: '1rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    backgroundColor: 'white',
    transition: 'opacity 0.3s ease-out',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    opacity: isVisible ? 1 : 0,
    display: 'flex',
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    position: 'relative' as React.CSSProperties['position'],
  };

  // Bild-Container mit fester Höhe
  const imageContainerStyle = {
    width: '100%',
    height: '160px',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative' as React.CSSProperties['position'],
  };

  // Bild-Stil mit Anpassungen
  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain' as React.CSSProperties['objectFit'],
    padding: '10px',
    backgroundColor: 'white',
  };

  // Container für den Inhalt mit fester Struktur
  const contentStyle = {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    flex: '1 1 auto',
  };

  // Konsistente Stile für den Namen
  const nameStyle = {
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: '0 0 0.5rem 0',
    color: '#333',
    lineHeight: '1.3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as any,
    maxHeight: '2.6rem',
  };

  // Kategorie-Stil
  const categoryStyle = {
    fontSize: '0.9rem',
    color: '#555',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600,
    backgroundColor: '#f8f8f8',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    width: 'fit-content',
  };

  // Etagen-Stil
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

  // Öffnungszeiten-Stil
  const openingStyle = {
    fontSize: '0.85rem',
    color: '#555',
    margin: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    fontStyle: 'italic',
  };

  // Beschreibungs-Stil mit fester Höhe
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
    flex: '1 1 auto',
    height: '2.8rem', // Feste Höhe für Stabilität
    whiteSpace: 'normal' as React.CSSProperties['whiteSpace'],
  };

  // Link-Stil
  const linkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--mall-primary, #007bff)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginTop: 'auto',
  };

  // Icon-Stil
  const iconStyle = {
    marginRight: '0.5rem',
    fontSize: '1rem',
  };

  // Skeleton-Stil für Ladeanimation
  const skeletonStyle = {
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  };

  // Wenn die Karte noch nicht geladen ist, zeige ein Skeleton
  if (!isLoaded) {
    return (
      <div style={cardStyle} ref={cardRef}>
        <div style={imageContainerStyle}>
          <div style={{ ...skeletonStyle, width: '100%', height: '100%' }} />
        </div>
        <div style={contentStyle}>
          <div style={{ ...skeletonStyle, width: '80%', height: '1.5rem', marginBottom: '0.5rem' }} />
          <div style={{ ...skeletonStyle, width: '60%', height: '1rem', marginBottom: '0.5rem' }} />
          <div style={{ ...skeletonStyle, width: '40%', height: '1rem', marginBottom: '0.5rem' }} />
          <div style={{ ...skeletonStyle, width: '70%', height: '1rem', marginBottom: '0.5rem' }} />
          <div style={{ ...skeletonStyle, width: '50%', height: '1rem', marginTop: 'auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle} ref={cardRef}>
      <div style={imageContainerStyle}>
        {image ? (
          <img
            src={image}
            alt={name}
            style={imageStyle}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '80%',
            height: '80%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f8f8',
            color: '#aaa',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}>
            {name.charAt(0)}
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
          <div
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

export default StableShopCard;
