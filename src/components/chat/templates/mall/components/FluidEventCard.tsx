'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EventData } from './FluidEventSlider';

interface FluidEventCardProps {
  event: EventData | null;
  isLoading: boolean;
  cardWidth: string;
  colorStyle: {
    primaryColor: string;
    secondaryColor: string;
  };
  animationDelay?: number;
}

/**
 * Eine flüssige Event-Karte mit optimiertem Streaming-Verhalten
 * 
 * Diese Komponente verwendet fortschrittliche Techniken für ein nahtloses
 * Streaming-Erlebnis ohne Flackern oder Layout-Sprünge.
 */
const FluidEventCard: React.FC<FluidEventCardProps> = ({
  event,
  isLoading,
  cardWidth,
  colorStyle,
  animationDelay = 0
}) => {
  // Refs für DOM-Manipulation und Animation
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // State für Animation und Tracking
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Effekt für gestaffelte Animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);
    
    return () => clearTimeout(timer);
  }, [animationDelay]);
  
  // Effekt für Bildladung
  useEffect(() => {
    if (event?.image && imageRef.current) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = event.image;
    }
  }, [event?.image]);
  
  // Basis-Styling für die Karte mit CSS-Variablen für dynamische Anpassung
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
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isVisible ? 1 : 0.4,
    transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
    willChange: 'transform, opacity', // Optimierung für Animationen
    '--primary-color': colorStyle.primaryColor,
    '--secondary-color': colorStyle.secondaryColor,
  } as React.CSSProperties;
  
  // Styling für den Bild-Container mit optimierter Animation
  const imageContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isLoading ? '#f5f5f5' : 'white',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    position: 'relative',
    transition: 'background-color 0.5s ease-in-out',
  };
  
  // Styling für das Bild mit sanftem Übergang
  const imageStyle: React.CSSProperties = {
    maxWidth: '80%',
    maxHeight: '80%',
    objectFit: 'contain',
    opacity: imageLoaded ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out',
    willChange: 'opacity',
  };
  
  // Styling für den Inhalt mit gestaffelten Übergängen
  const contentStyle: React.CSSProperties = {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  };
  
  // Gemeinsames Styling für Skeleton-Loader
  const getSkeletonStyle = (width: string, height: string, delay: number): React.CSSProperties => ({
    height,
    width,
    backgroundColor: isLoading ? '#f0f0f0' : 'transparent',
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background-color 0.3s ease-in-out',
    ...(isLoading && {
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        animation: `shimmer 1.5s infinite ${delay}ms`,
      }
    }),
  });
  
  // Styling für den Titel mit Skeleton-Loader
  const titleStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: 'var(--primary-color)',
    height: '1.5rem',
    ...getSkeletonStyle('100%', '1.5rem', 0),
  };
  
  // Styling für das Datum mit Skeleton-Loader
  const dateStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: 'var(--secondary-color)',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
    height: '1.2rem',
    ...getSkeletonStyle('70%', '1.2rem', 100),
  };
  
  // Styling für die Zeit mit Skeleton-Loader
  const timeStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.25rem',
    height: '1.2rem',
    ...getSkeletonStyle('50%', '1.2rem', 150),
  };
  
  // Styling für den Ort mit Skeleton-Loader
  const locationStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
    height: '1.2rem',
    ...getSkeletonStyle('60%', '1.2rem', 200),
  };
  
  // Styling für die Beschreibung mit Skeleton-Loader
  const descriptionStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#333',
    marginBottom: '0.5rem',
    flex: 1,
    ...getSkeletonStyle('100%', 'auto', 300),
  };
  
  // Fortschrittlicher Skeleton-Loader für die Beschreibung mit Welleneffekt
  const DescriptionSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={getSkeletonStyle('100%', '0.9rem', 300)} />
      <div style={getSkeletonStyle('90%', '0.9rem', 350)} />
      <div style={getSkeletonStyle('80%', '0.9rem', 400)} />
    </div>
  );
  
  // Optimierter Bild-Platzhalter mit Pulseffekt
  const ImagePlaceholder = () => (
    <div 
      style={{ 
        width: '60%', 
        height: '60%', 
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        position: 'relative',
        overflow: 'hidden',
        ...(isLoading && {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            animation: 'shimmer 1.5s infinite',
          }
        }),
      }} 
    />
  );
  
  return (
    <div ref={cardRef} style={cardStyle} className="fluid-event-card">
      {/* Bild-Container mit optimierter Ladung */}
      <div style={imageContainerStyle}>
        {event && event.image ? (
          <img 
            ref={imageRef}
            src={event.image} 
            alt={event.name || 'Event'} 
            style={imageStyle}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              // Fallback für fehlerhafte Bilder
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Event';
            }}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      
      {/* Inhalt mit gestaffelten Übergängen */}
      <div style={contentStyle}>
        {/* Titel */}
        <div style={titleStyle}>
          {!isLoading && event?.name}
        </div>
        
        {/* Datum */}
        <div style={dateStyle}>
          {!isLoading && event?.date}
        </div>
        
        {/* Zeit */}
        {(event?.time || isLoading) && (
          <div style={timeStyle}>
            {!isLoading && event?.time}
          </div>
        )}
        
        {/* Ort */}
        {(event?.location || isLoading) && (
          <div style={locationStyle}>
            {!isLoading && event?.location}
          </div>
        )}
        
        {/* Beschreibung */}
        <div style={descriptionStyle}>
          {!isLoading && event?.description ? (
            event.description
          ) : isLoading ? (
            <DescriptionSkeleton />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FluidEventCard;
