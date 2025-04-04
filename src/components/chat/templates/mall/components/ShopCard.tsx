'use client';

import React from 'react';

export interface ShopData {
  name: string;
  category?: string;
  floor?: string;
  opening?: string;
  image?: string;
  description?: string;
}

interface ShopCardProps {
  data: ShopData;
  style?: React.CSSProperties;
}

/**
 * Komponente für einzelne Shop-Karten im Mall-Template
 */
const ShopCard: React.FC<ShopCardProps> = ({ 
  data,
  style = {}
}) => {
  const { name, category, floor, opening, image, description } = data;
  
  // Alle Stile inline definieren
  const cardStyle = {
    ...style,
    flex: '0 0 auto',
    width: '220px',
    minHeight: '100px',
    marginRight: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    backgroundColor: 'white',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    border: '1px solid #eaeaea',
  };
  
  const imageStyle = {
    width: '100%',
    height: '130px',
    backgroundColor: '#f5f5f5',
    objectFit: 'cover' as React.CSSProperties['objectFit'],
  };
  
  const contentStyle = {
    padding: '1rem',
  };
  
  const nameStyle = {
    fontWeight: 600,
    fontSize: '1.1rem',
    margin: '0 0 0.5rem 0',
    color: 'var(--mall-primary, #3b1c60)',
  };
  
  const categoryStyle = {
    fontSize: '0.85rem',
    color: '#777',
    margin: '0 0 0.5rem 0',
  };
  
  const floorStyle = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--mall-secondary, #ff5a5f)',
    margin: '0 0 0.5rem 0',
  };
  
  const openingStyle = {
    fontSize: '0.85rem',
    color: '#555',
    margin: '0',
  };
  
  const descriptionStyle = {
    fontSize: '0.9rem',
    margin: '0.5rem 0 0',
  };
  
  return (
    <div style={cardStyle}>
      {image ? (
        <img src={image} style={imageStyle} alt={name} />
      ) : (
        <div style={imageStyle}></div>
      )}
      <div style={contentStyle}>
        <h3 style={nameStyle}>{name}</h3>
        {category && <p style={categoryStyle}>{category}</p>}
        {floor && <p style={floorStyle}>{floor}</p>}
        {opening && <p style={openingStyle}>{opening}</p>}
        {description && <p style={descriptionStyle}>{description}</p>}
      </div>
    </div>
  );
};

export default ShopCard; 