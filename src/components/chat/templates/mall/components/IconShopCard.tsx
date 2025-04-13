'use client';

import React, { useRef, useEffect, useState, useMemo, useTransition } from 'react';
import { ShopData } from './ShopCard';

interface IconShopCardProps {
  data: ShopData;
  style?: React.CSSProperties;
  isLoaded?: boolean;
}

/**
 * Eine optimierte Shop-Karte mit Icons und stabilem Layout
 */
const IconShopCard: React.FC<IconShopCardProps> = ({
  data,
  style = {},
  isLoaded = true
}) => {
  const { name, category, floor, opening, image, description, link } = data;
  const [isVisible, setIsVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  // Verzögerte Anzeige, um Flackern zu vermeiden
  useEffect(() => {
    if (isLoaded) {
      // Längere Verzögerung für stabilere Anzeige
      const timer = setTimeout(() => {
        startTransition(() => {
          setIsVisible(true);
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Memoized Styles für Stabilität
  const cardStyle = useMemo<React.CSSProperties>(() => ({
    width: '280px',
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
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease-out, transform 0.2s ease',
    willChange: 'opacity, transform',
    transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
    ...style
  }), [isVisible, style]);

  const imageContainerStyle = useMemo<React.CSSProperties>(() => ({
    width: '100%',
    height: '140px',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative'
  }), []);

  const contentStyle = useMemo<React.CSSProperties>(() => ({
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto'
  }), []);

  const nameStyle = useMemo<React.CSSProperties>(() => ({
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: '0 0 0.75rem 0',
    color: 'var(--mall-primary, #3b1c60)',
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as any,
    maxHeight: '2.6rem'
  }), []);

  const infoContainerStyle = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.75rem'
  }), []);

  const tagStyle = useMemo<React.CSSProperties>(() => ({
    fontSize: '0.85rem',
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f8f8f8',
    width: 'fit-content'
  }), []);

  const floorTagStyle = useMemo<React.CSSProperties>(() => ({
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--mall-secondary, #ff5a5f)',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    width: 'fit-content'
  }), []);

  const descriptionStyle = useMemo<React.CSSProperties>(() => ({
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
  }), []);

  const linkStyle = useMemo<React.CSSProperties>(() => ({
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--mall-primary, #3b1c60)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginTop: 'auto',
    padding: '0.5rem 0',
    borderTop: '1px solid #f0f0f0'
  }), []);

  const iconStyle = useMemo<React.CSSProperties>(() => ({
    marginRight: '0.5rem',
    fontSize: '1rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    flexShrink: 0
  }), []);

  const skeletonStyle = useMemo<React.CSSProperties>(() => ({
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite'
  }), []);

  // Memoized Image-Placeholder
  const imagePlaceholder = useMemo(() => (
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
  ), [name]);

  // Wenn die Karte noch nicht geladen ist, zeige ein Skeleton
  if (!isLoaded) {
    return (
      <div style={cardStyle} ref={cardRef}>
        <div style={imageContainerStyle}>
          <div style={{ ...skeletonStyle, width: '100%', height: '100%' }} />
        </div>
        <div style={contentStyle}>
          <div style={{ ...skeletonStyle, width: '80%', height: '1.5rem', marginBottom: '0.5rem' }} />
          <div style={{ ...skeletonStyle, width: '100%', height: '1.5rem', marginBottom: '0.5rem' }} />
          <div style={{ ...skeletonStyle, width: '60%', height: '1rem', marginBottom: '0.5rem' }} />
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
        ) : imagePlaceholder}
      </div>
      <div style={contentStyle}>
        <h3 style={nameStyle} title={name}>{name}</h3>

        <div style={infoContainerStyle}>
          {category && (
            <div style={tagStyle} title={category}>
              <span style={iconStyle}>📋</span>
              {category}
            </div>
          )}

          {floor && (
            <div style={floorTagStyle}>
              <span style={iconStyle}>📍</span>
              {floor}
            </div>
          )}
        </div>

        {description && (
          <div
            style={descriptionStyle}
            title={description}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {opening && (
          <p style={{
            fontSize: '0.85rem',
            color: '#555',
            margin: '0.5rem 0',
            display: 'flex',
            alignItems: 'center',
          }}>
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

// Exportiere eine memoized Version für Stabilität
export default React.memo(IconShopCard);
