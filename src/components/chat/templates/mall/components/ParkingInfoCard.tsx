'use client';

import React from 'react';

export interface ParkingRate {
  duration: string;
  price: string;
}

export interface ParkingInfoData {
  title?: string;
  location?: string;
  openingHours?: string;
  totalSpaces?: string;
  rates: ParkingRate[];
  specialOffers?: string[];
  notes?: string[];
}

interface ParkingInfoCardProps {
  data: ParkingInfoData;
  style?: React.CSSProperties;
}

/**
 * Komponente für die Anzeige von Parkgebühren und -informationen im Mall-Template
 */
const ParkingInfoCard: React.FC<ParkingInfoCardProps> = ({
  data,
  style = {}
}) => {
  const { title, location, openingHours, totalSpaces, rates, specialOffers, notes } = data;

  // Moderne Basis-Stile
  const cardStyle: React.CSSProperties = {
    ...style,
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    padding: '1.5rem',
    margin: '1rem 0',
    border: 'none',
    contain: 'content', // Verbesserte Rendering-Performance
    transform: 'translateZ(0)', // Hardware-Beschleunigung
    backfaceVisibility: 'hidden', // Verhindert Flackern
    position: 'relative',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'var(--mall-primary, #3b1c60)',
    marginTop: 0,
    marginBottom: '1.2rem',
    display: 'flex',
    alignItems: 'center',
  };

  const infoStyle: React.CSSProperties = {
    margin: '0.5rem 0',
    fontSize: '0.95rem',
    color: '#444',
    display: 'flex',
    alignItems: 'center',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    marginTop: '1rem',
    marginBottom: '1.2rem',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  };

  const tableHeaderStyle: React.CSSProperties = {
    textAlign: 'left' as const,
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(var(--mall-primary-rgb, 59, 28, 96), 0.05)',
    color: 'var(--mall-primary, #3b1c60)',
    fontWeight: 600,
    borderBottom: '2px solid rgba(0, 0, 0, 0.05)',
  };

  const cellStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  };

  const listStyle: React.CSSProperties = {
    margin: '0.5rem 0',
    paddingLeft: '0.5rem',
    listStyleType: 'none',
  };

  const listItemStyle: React.CSSProperties = {
    margin: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
  };

  const noteStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0.5rem 0',
    fontStyle: 'italic',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
  };

  // Icon-Stile
  const iconStyle: React.CSSProperties = {
    marginRight: '0.5rem',
    fontSize: '1.1rem',
    color: 'var(--mall-primary, #3b1c60)',
    opacity: 0.7,
  };

  // Stil für Zeilen mit alternierender Hintergrundfarbe
  const rowStyle = (index: number): React.CSSProperties => ({
    backgroundColor: index % 2 === 0 ? 'white' : 'rgba(0, 0, 0, 0.02)',
  });

  // Preis-Stil für Hervorhebung
  const priceStyle: React.CSSProperties = {
    fontWeight: 600,
    color: 'var(--mall-secondary, #ff5a5f)',
  };

  return (
    <div style={cardStyle} className="mall-parking-info-card">
      <h3 style={titleStyle}>
        <span style={iconStyle}>🚗</span>
        {title || 'Parkgebühren'}
      </h3>

      {location && (
        <p style={infoStyle}>
          <span style={{...iconStyle, fontSize: '0.9rem'}}>📍</span>
          <strong style={{marginRight: '0.5rem'}}>Standort:</strong> {location}
        </p>
      )}

      {openingHours && (
        <p style={infoStyle}>
          <span style={{...iconStyle, fontSize: '0.9rem'}}>🕒</span>
          <strong style={{marginRight: '0.5rem'}}>Öffnungszeiten:</strong> {openingHours}
        </p>
      )}

      {totalSpaces && (
        <p style={infoStyle}>
          <span style={{...iconStyle, fontSize: '0.9rem'}}>🚦</span>
          <strong style={{marginRight: '0.5rem'}}>Parkplätze:</strong> {totalSpaces}
        </p>
      )}

      {rates && rates.length > 0 && (
        <div>
          <h4 style={{...titleStyle, fontSize: '1rem', marginTop: '1.2rem', marginBottom: '0.8rem'}}>
            <span style={{...iconStyle, fontSize: '0.9rem'}}>💸</span>
            Tarife
          </h4>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Dauer</th>
                <th style={tableHeaderStyle}>Preis</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate, index) => (
                <tr key={`rate-${index}`} style={rowStyle(index)}>
                  <td style={cellStyle}>{rate.duration}</td>
                  <td style={{...cellStyle, ...priceStyle}}>{rate.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {specialOffers && specialOffers.length > 0 && (
        <div>
          <h4 style={{...titleStyle, fontSize: '1rem', marginTop: '1.2rem', marginBottom: '0.8rem'}}>
            <span style={{...iconStyle, color: 'var(--mall-secondary, #ff5a5f)'}}>🎁</span>
            Sonderangebote
          </h4>
          <ul style={listStyle}>
            {specialOffers.map((offer, index) => (
              <li key={`offer-${index}`} style={listItemStyle}>
                <span style={{...iconStyle, color: 'var(--mall-secondary, #ff5a5f)', fontSize: '0.9rem'}}>✔️</span>
                {offer}
              </li>
            ))}
          </ul>
        </div>
      )}

      {notes && notes.length > 0 && (
        <div style={{marginTop: '1.2rem'}}>
          {notes.map((note, index) => (
            <p key={`note-${index}`} style={noteStyle}>
              <span style={{...iconStyle, fontSize: '0.9rem'}}>ℹ️</span>
              {note}
            </p>
          ))}
        </div>
      )}

      {/* Dekorativer Hintergrund-Indikator */}
      <div style={{
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'rgba(var(--mall-primary-rgb, 59, 28, 96), 0.03)',
        zIndex: 0,
      }} />
    </div>
  );
};

export default ParkingInfoCard;
