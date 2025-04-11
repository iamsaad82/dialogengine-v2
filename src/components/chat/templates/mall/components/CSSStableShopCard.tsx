'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ShopData } from './ShopCard';

interface CSSStableShopCardProps {
  data: ShopData;
  style?: React.CSSProperties;
  isLoaded?: boolean;
}

/**
 * Eine CSS-basierte stabile Shop-Karte, die während des Streamings nicht flackert
 * und ein konsistentes Layout beibehält
 */
const CSSStableShopCard: React.FC<CSSStableShopCardProps> = ({
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

  // Wenn die Karte noch nicht geladen ist, zeige ein Skeleton
  if (!isLoaded) {
    return (
      <div className="stable-shop-card" ref={cardRef} style={style}>
        <div className="stable-shop-image">
          <div className="stable-skeleton" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="stable-shop-content">
          <div className="stable-skeleton" style={{ width: '80%', height: '1.5rem', marginBottom: '0.5rem' }} />
          <div className="stable-skeleton" style={{ width: '60%', height: '1rem', marginBottom: '0.5rem' }} />
          <div className="stable-skeleton" style={{ width: '40%', height: '1rem', marginBottom: '0.5rem' }} />
          <div className="stable-skeleton" style={{ width: '70%', height: '1rem', marginBottom: '0.5rem' }} />
          <div className="stable-skeleton" style={{ width: '50%', height: '1rem', marginTop: 'auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`stable-shop-card ${isVisible ? 'loaded' : ''}`} 
      ref={cardRef}
      style={style}
    >
      <div className="stable-shop-image">
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
      <div className="stable-shop-content">
        <h3 className="stable-shop-name" title={name}>{name}</h3>

        {category && (
          <p className="stable-shop-category" title={category}>
            <span className="stable-shop-icon">📋</span>
            {category}
          </p>
        )}

        {description && (
          <div
            className="stable-shop-description"
            title={description}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {floor && (
          <p className="stable-shop-floor">
            <span className="stable-shop-icon">📍</span>
            {floor}
          </p>
        )}

        {opening && (
          <p className="stable-shop-opening">
            <span className="stable-shop-icon">🕒</span>
            {opening}
          </p>
        )}

        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="stable-shop-link">
            Mehr erfahren <span style={{marginLeft: '0.3rem'}}>→</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default CSSStableShopCard;
