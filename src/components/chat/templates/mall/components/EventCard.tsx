'use client';

import React from 'react';

export interface EventData {
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  image?: string;
  link?: string;
}

interface EventCardProps {
  data: EventData;
  style?: React.CSSProperties;
}

/**
 * Komponente für die Anzeige von Veranstaltungen im Mall-Template
 */
const EventCard: React.FC<EventCardProps> = ({
  data,
  style = {}
}) => {
  const { title, date, time, location, description, image, link } = data;

  // Moderne Basis-Stile
  const cardStyle: React.CSSProperties = {
    ...style,
    display: 'flex',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    margin: '0.75rem 0',
    border: 'none',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    contain: 'content', // Verbesserte Rendering-Performance
    transform: 'translateZ(0)', // Hardware-Beschleunigung
    backfaceVisibility: 'hidden', // Verhindert Flackern
    position: 'relative',
  };

  const imageContainerStyle: React.CSSProperties = {
    width: '130px',
    flexShrink: 0,
    backgroundColor: '#f8f8f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    contain: 'strict', // Verbesserte Rendering-Performance
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transition: 'transform 0.5s ease',
    padding: '5px',
    backgroundColor: '#f8f8f8',
  };

  const contentStyle: React.CSSProperties = {
    padding: '1.2rem',
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: '0 0 0.5rem 0',
    color: 'var(--mall-primary, #3b1c60)',
    lineHeight: 1.3,
  };

  const dateTimeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    margin: '0 0 0.5rem 0',
    color: 'var(--mall-secondary, #ff5a5f)',
    fontWeight: 500,
  };

  const locationStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    margin: '0 0 0.5rem 0',
    color: '#555',
    display: 'flex',
    alignItems: 'center',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    margin: '0.5rem 0 0',
    color: '#444',
    lineHeight: 1.5,
    flex: '1 1 auto', // Nimmt verfügbaren Platz ein
  };

  const linkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '0.75rem',
    fontSize: '0.9rem',
    color: 'var(--mall-primary, #3b1c60)',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'color 0.2s ease',
    alignSelf: 'flex-start',
  };

  // Icon-Stile
  const iconStyle: React.CSSProperties = {
    marginRight: '0.4rem',
    fontSize: '0.9rem',
    opacity: 0.7,
  };

  // Badge-Stil für Datum
  const dateBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0.5rem',
    left: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '0.3rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--mall-primary, #3b1c60)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 1,
  };

  // Optimierte Bildladung mit Fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div style={cardStyle} className="mall-event-card">
      <div style={imageContainerStyle}>
        {image ? (
          <>
            <img
              src={image}
              alt={title}
              style={imageStyle}
              loading="lazy"
              onError={handleImageError}
            />
            {date && <div style={dateBadgeStyle}>{date}</div>}
          </>
        ) : (
          <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{color: '#ccc', fontSize: '2rem'}}>🎉</span>
          </div>
        )}
      </div>

      <div style={contentStyle}>
        <h3 style={titleStyle}>{title}</h3>

        <div style={dateTimeStyle}>
          <span style={{...iconStyle, color: 'var(--mall-secondary, #ff5a5f)'}}>📅</span>
          <strong>Datum:</strong> <span style={{marginRight: time ? '0.5rem' : 0}}>{date}</span>
          {time && (
            <>
              <span style={{margin: '0 0.5rem'}}>•</span>
              <span style={{...iconStyle, color: 'var(--mall-secondary, #ff5a5f)', marginLeft: '0.25rem'}}>🕒</span>
              <strong>Zeit:</strong> <span>{time}</span>
            </>
          )}
        </div>

        {location && (
          <div style={locationStyle}>
            <span style={iconStyle}>📍</span>
            <strong>Ort:</strong> {location}
          </div>
        )}

        {description && (
          <p style={descriptionStyle}>{description}</p>
        )}

        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Mehr Informationen <span style={{marginLeft: '0.3rem'}}>→</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default EventCard;
