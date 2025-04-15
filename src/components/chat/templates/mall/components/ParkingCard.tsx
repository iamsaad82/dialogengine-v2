'use client';

import React, { memo } from 'react';

export interface ParkingData {
  fees: { duration: string; price: string }[];
  notes?: string[];
}

interface ParkingCardProps {
  title: string;
  data: ParkingData | null;
  isStreaming: boolean;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * Parkgebühren-Karte Komponente
 * 
 * Diese Komponente zeigt Informationen zu Parkgebühren an.
 * Optimiert für Stabilität und Performance während des Streamings.
 */
const ParkingCard: React.FC<ParkingCardProps> = ({
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

  // Styling für die Dauer
  const durationStyle: React.CSSProperties = {
    fontWeight: 500,
  };

  // Styling für den Preis
  const priceStyle: React.CSSProperties = {
    textAlign: 'right',
    fontWeight: 600,
    color: colorStyle.secondaryColor,
  };

  // Styling für die Hinweise
  const noteStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0.5rem 0',
    padding: '0.5rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  };

  return (
    <div className="mall-parking" style={cardStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>{title || 'Parkgebühren'}</h3>
      </div>
      
      {/* Inhalt */}
      <div style={contentStyle}>
        {/* Parkgebühren */}
        {data && data.fees && data.fees.length > 0 && (
          <table style={tableStyle}>
            <tbody>
              {data.fees.map((item, index) => (
                <tr key={`fee-${index}`} style={rowStyle}>
                  <td style={{...cellStyle, ...durationStyle}}>{item.duration}</td>
                  <td style={{...cellStyle, ...priceStyle}}>{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Hinweise */}
        {data && data.notes && data.notes.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            {data.notes.map((note, index) => (
              <div key={`note-${index}`} style={noteStyle}>
                {note}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Exportiere eine memoized Version der Komponente für bessere Performance
export default memo(ParkingCard);
