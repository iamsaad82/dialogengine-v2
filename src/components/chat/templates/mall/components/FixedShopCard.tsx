'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ShopData } from './ShopCard';

interface FixedShopCardProps {
  data: ShopData;
  style?: React.CSSProperties;
  isLoaded?: boolean;
}

/**
 * Eine vollständig überarbeitete Shop-Karte mit festem Layout und Icons
 */
const FixedShopCard: React.FC<FixedShopCardProps> = ({
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
      // Längere Verzögerung für stabilere Anzeige
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Feste Stile für die Karte
  const cardStyle: React.CSSProperties = {
    width: '300px',
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    marginRight: '1rem',
    flex: '0 0 auto',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease-out',
    ...style
  };

  // Feste Stile für das Bild
  const imageContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '160px',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative'
  };

  // Feste Stile für den Inhalt
  const contentStyle: React.CSSProperties = {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto'
  };

  // Feste Stile für den Namen
  const nameStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: '0 0 0.5rem 0',
    color: '#333',
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as any,
    maxHeight: '2.6rem'
  };

  // Feste Stile für die Kategorie
  const categoryStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#555',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600,
    backgroundColor: '#f8f8f8',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    width: 'fit-content'
  };

  // Feste Stile für die Etage
  const floorStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--mall-secondary, #ff5a5f)',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    width: 'fit-content'
  };

  // Feste Stile für die Öffnungszeiten
  const openingStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#555',
    margin: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    fontStyle: 'italic'
  };

  // Feste Stile für die Beschreibung
  const descriptionStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    margin: '0 0 0.75rem 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as any,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.4,
    color: '#555',
    flex: '1 1 auto',
    height: '2.8rem',
    whiteSpace: 'normal'
  };

  // Feste Stile für den Link
  const linkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--mall-primary, #007bff)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginTop: 'auto'
  };

  // Feste Stile für Icons
  const iconStyle: React.CSSProperties = {
    marginRight: '0.5rem',
    fontSize: '1rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    flexShrink: 0
  };

  // Skeleton-Stil für Ladeanimation
  const skeletonStyle: React.CSSProperties = {
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite'
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
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '10px',
              backgroundColor: 'white',
            }}
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

        {floor && (
          <p style={floorStyle}>
            <span style={iconStyle}>📍</span>
            {floor}
          </p>
        )}

        {description && (
          <div
            style={descriptionStyle}
            title={description}
            dangerouslySetInnerHTML={{ __html: description }}
          />
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

export default FixedShopCard;
