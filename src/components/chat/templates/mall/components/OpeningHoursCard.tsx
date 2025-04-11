'use client';

import React from 'react';

export interface OpeningHoursData {
  title?: string;
  regularHours?: {
    day: string;
    hours: string;
  }[];
  specialHours?: {
    date: string;
    hours: string;
    note?: string;
  }[];
  notes?: string[];
}

interface OpeningHoursCardProps {
  data: OpeningHoursData;
  style?: React.CSSProperties;
}

/**
 * Komponente für die Anzeige von Öffnungszeiten im Mall-Template
 */
const OpeningHoursCard: React.FC<OpeningHoursCardProps> = ({
  data,
  style = {}
}) => {
  const { title, regularHours, specialHours, notes } = data;

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

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    marginBottom: '1.2rem',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  };

  const cellStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  };

  const dayStyle: React.CSSProperties = {
    fontWeight: 600,
    width: '40%',
    color: 'var(--mall-primary, #3b1c60)',
  };

  const hoursStyle: React.CSSProperties = {
    color: '#444',
  };

  const specialDayStyle: React.CSSProperties = {
    fontWeight: 600,
    color: 'var(--mall-secondary, #ff5a5f)',
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

  return (
    <div style={cardStyle} className="mall-opening-hours-card">
      <h3 style={titleStyle}>
        <span style={iconStyle}>🕒</span>
        {title || 'Öffnungszeiten'}
      </h3>

      {regularHours && regularHours.length > 0 && (
        <table style={tableStyle}>
          <tbody>
            {regularHours.map((item, index) => (
              <tr key={`regular-${index}`} style={rowStyle(index)}>
                <td style={{...cellStyle, ...dayStyle}}>{item.day}</td>
                <td style={{...cellStyle, ...hoursStyle}}>{item.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {specialHours && specialHours.length > 0 && (
        <div>
          <h4 style={{...titleStyle, fontSize: '1rem', marginTop: '1rem', marginBottom: '0.8rem'}}>
            <span style={{...iconStyle, color: 'var(--mall-secondary, #ff5a5f)'}}>📅</span>
            Sonderöffnungszeiten
          </h4>
          <table style={tableStyle}>
            <tbody>
              {specialHours.map((item, index) => (
                <tr key={`special-${index}`} style={rowStyle(index)}>
                  <td style={{...cellStyle, ...specialDayStyle}}>{item.date}</td>
                  <td style={{...cellStyle, ...hoursStyle}}>
                    {item.hours}
                    {item.note && (
                      <div style={{fontSize: '0.85rem', color: '#666', marginTop: '0.3rem'}}>
                        {item.note}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default OpeningHoursCard;
