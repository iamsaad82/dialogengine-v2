'use client';

import React from 'react';
import { ShopData } from './ShopCard'; // Wiederverwendung der ShopData-Schnittstelle

interface RestaurantCardProps {
  data: ShopData;
  style?: React.CSSProperties;
}

/**
 * Komponente für einzelne Restaurant-Karten im Mall-Template
 */
const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  data,
  style = {}
}) => {
  const { name, category, floor, opening, image, description } = data;
  
  // Alle Stile inline definieren
  const cardStyle = {
    ...style,
    flex: '0 0 auto',
    width: '260px',
    marginRight: '1rem',
    borderRadius: 'var(--mall-border-radius, 12px)',
    boxShadow: 'var(--mall-shadow, 0 4px 15px rgba(0, 0, 0, 0.08))',
    overflow: 'hidden',
    backgroundColor: 'white',
    transition: 'transform 0.2s ease-in-out',
  };
  
  const imageStyle = {
    width: '100%',
    height: '150px',
    backgroundColor: '#eee',
    objectFit: 'cover' as React.CSSProperties['objectFit'],
  };
  
  const contentStyle = {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    justifyContent: 'space-between',
  };
  
  const nameStyle = {
    fontWeight: 600,
    fontSize: '1.1rem',
    margin: '0 0 0.5rem 0',
    color: 'var(--mall-primary, #3b1c60)',
  };
  
  const descriptionStyle = {
    fontSize: '0.9rem',
    margin: '0 0 0.5rem 0',
  };
  
  const floorStyle = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--mall-secondary, #ff5a5f)',
    margin: '0.5rem 0 0',
  };
  
  const hoursStyle = {
    fontSize: '0.85rem',
    color: '#555',
    margin: '0.3rem 0 0',
  };
  
  return (
    <div style={cardStyle}>
      {image ? (
        <img src={image} style={imageStyle} alt={name} />
      ) : (
        <div style={imageStyle}></div>
      )}
      <div style={contentStyle}>
        <div>
          <h3 style={nameStyle}>{name}</h3>
          {description && <p style={descriptionStyle}>{description}</p>}
          {floor && <p style={floorStyle}>{floor}</p>}
          {opening && <p style={hoursStyle}>{opening}</p>}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard; 