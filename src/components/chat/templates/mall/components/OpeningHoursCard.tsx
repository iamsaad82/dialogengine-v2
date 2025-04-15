'use client';

import React, { memo } from 'react';

export interface OpeningHoursData {
  regular: { day: string; hours: string }[];
  special?: { date: string; hours: string; note?: string }[];
}

interface OpeningHoursCardProps {
  title: string;
  data: OpeningHoursData | null;
  isStreaming: boolean;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * Öffnungszeiten-Karte Komponente
 * 
 * Diese Komponente zeigt Informationen zu Öffnungszeiten an.
 * Optimiert für Stabilität und Performance während des Streamings.
 */
const OpeningHoursCard: React.FC<OpeningHoursCardProps> = ({
  title,
  data,
  isStreaming,
  colorStyle = {
    primaryColor: '#3b1c60',
    secondaryColor: '#ff5a5f'
  }
}) => {
  // Styling für die Karte
  const cardStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    marginBottom: '1.5rem',
    transform: 'translateZ(0)',
  };

  // Styling für den Header
  const headerStyle: React.CSSProperties = {
    backgroundColor: colorStyle.primaryColor,
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  };

  // Styling für den Titel
  const titleStyle: React.CSSProperties = {
    color: 'white',
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
  };

  // Styling für den Inhalt
  const contentStyle: React.CSSProperties = {
    padding: '1rem',
  };

  // Styling für die Sektionen
  const sectionStyle: React.CSSProperties = {
    marginBottom: '1rem',
  };

  // Styling für die Sektions-Titel
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: colorStyle.primaryColor,
  };

  // Styling für die Tabelle
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  // Styling für die Zeilen
  const rowStyle: React.CSSProperties = {
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  };

  // Styling für die Zellen
  const cellStyle: React.CSSProperties = {
    padding: '0.5rem 0',
  };

  // Styling für den Tag
  const dayStyle: React.CSSProperties = {
    fontWeight: 500,
  };

  // Styling für die Stunden
  const hoursStyle: React.CSSProperties = {
    textAlign: 'right',
    fontWeight: 600,
    color: colorStyle.secondaryColor,
  };

  return (
    <div className="mall-opening-hours" style={cardStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>{title || 'Öffnungszeiten'}</h3>
      </div>
      
      {/* Inhalt */}
      <div style={contentStyle}>
        {/* Reguläre Öffnungszeiten */}
        {data && data.regular && data.regular.length > 0 && (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Reguläre Öffnungszeiten</h4>
            <table style={tableStyle}>
              <tbody>
                {data.regular.map((item, index) => (
                  <tr key={`regular-${index}`} style={rowStyle}>
                    <td style={{...cellStyle, ...dayStyle}}>{item.day}</td>
                    <td style={{...cellStyle, ...hoursStyle}}>{item.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Sonderöffnungszeiten */}
        {data && data.special && data.special.length > 0 && (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Sonderöffnungszeiten</h4>
            <table style={tableStyle}>
              <tbody>
                {data.special.map((item, index) => (
                  <tr key={`special-${index}`} style={rowStyle}>
                    <td style={{...cellStyle, ...dayStyle}}>
                      {item.date}
                      {item.note && <div style={{ fontSize: '0.8rem', color: '#666' }}>{item.note}</div>}
                    </td>
                    <td style={{...cellStyle, ...hoursStyle}}>{item.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Exportiere eine memoized Version der Komponente für bessere Performance
export default memo(OpeningHoursCard);
