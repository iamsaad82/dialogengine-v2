'use client';

import React, { useState, useEffect } from 'react';

// Öffnungszeiten-Datenstruktur
export interface OpeningHoursData {
  regularHours: { day: string; hours: string }[];
  specialHours?: { date: string; hours: string }[];
  notes?: string[];
}

interface FluidOpeningHoursCardProps {
  title: string;
  data: OpeningHoursData | null;
  isStreaming: boolean;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * Eine flüssige Öffnungszeiten-Karte mit optimiertem Streaming-Verhalten
 * 
 * Diese Komponente verwendet fortschrittliche Techniken für ein nahtloses
 * Streaming-Erlebnis ohne Flackern oder Layout-Sprünge.
 */
const FluidOpeningHoursCard: React.FC<FluidOpeningHoursCardProps> = ({
  title,
  data,
  isStreaming,
  colorStyle = {
    primaryColor: '#3b1c60',
    secondaryColor: '#ff5a5f'
  }
}) => {
  // State für Animation und Tracking
  const [isVisible, setIsVisible] = useState(false);
  const [regularHoursVisible, setRegularHoursVisible] = useState(false);
  const [specialHoursVisible, setSpecialHoursVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  
  // Effekt für gestaffelte Animation
  useEffect(() => {
    const mainTimer = setTimeout(() => {
      setIsVisible(true);
      
      // Gestaffelte Animation für die einzelnen Abschnitte
      setTimeout(() => setRegularHoursVisible(true), 100);
      setTimeout(() => setSpecialHoursVisible(true), 300);
      setTimeout(() => setNotesVisible(true), 500);
    }, 100);
    
    return () => clearTimeout(mainTimer);
  }, []);
  
  // Erstelle Platzhalter für Öffnungszeiten
  const regularHoursPlaceholders = Array(5).fill(null);
  const specialHoursPlaceholders = Array(2).fill(null);
  const notesPlaceholders = Array(1).fill(null);
  
  // Styling für die Karte mit CSS-Variablen für dynamische Anpassung
  const cardStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    marginBottom: '1.5rem',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isVisible ? 1 : 0.4,
    transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
    willChange: 'transform, opacity', // Optimierung für Animationen
    '--primary-color': colorStyle.primaryColor,
    '--secondary-color': colorStyle.secondaryColor,
  } as React.CSSProperties;
  
  // Styling für den Header
  const headerStyle: React.CSSProperties = {
    padding: '1rem',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
  };
  
  // Styling für den Titel
  const titleStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: 0,
  };
  
  // Styling für den Inhalt
  const contentStyle: React.CSSProperties = {
    padding: '1rem',
  };
  
  // Styling für die Abschnitte
  const sectionStyle: React.CSSProperties = {
    marginBottom: '1rem',
    transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
  };
  
  // Styling für die Abschnittstitel
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: 'var(--primary-color)',
  };
  
  // Styling für die Tabelle
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };
  
  // Styling für die Tabellenzeilen
  const rowStyle: React.CSSProperties = {
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  };
  
  // Styling für die Tabellenzellen
  const cellStyle: React.CSSProperties = {
    padding: '0.5rem 0',
    fontSize: '0.9rem',
  };
  
  // Styling für die Tage
  const dayStyle: React.CSSProperties = {
    fontWeight: 'bold',
    width: '40%',
  };
  
  // Styling für die Stunden
  const hoursStyle: React.CSSProperties = {
    color: '#666',
  };
  
  // Styling für die Notizen
  const noteStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
    padding: '0.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: '4px',
  };
  
  // Gemeinsames Styling für Skeleton-Loader
  const getSkeletonStyle = (width: string, height: string, delay: number): React.CSSProperties => ({
    height,
    width,
    backgroundColor: isStreaming && !data ? '#f0f0f0' : 'transparent',
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background-color 0.3s ease-in-out',
    ...(isStreaming && !data && {
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
  
  return (
    <div style={cardStyle} className="fluid-opening-hours-card">
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>{title || 'Öffnungszeiten'}</h3>
      </div>
      
      {/* Inhalt */}
      <div style={contentStyle}>
        {/* Reguläre Öffnungszeiten */}
        <div 
          style={{
            ...sectionStyle,
            opacity: regularHoursVisible ? 1 : 0,
            transform: regularHoursVisible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <h4 style={sectionTitleStyle}>Reguläre Öffnungszeiten</h4>
          <table style={tableStyle}>
            <tbody>
              {data && data.regularHours ? (
                data.regularHours.map((item, index) => (
                  <tr key={`regular-${index}`} style={rowStyle}>
                    <td style={{...cellStyle, ...dayStyle}}>{item.day}</td>
                    <td style={{...cellStyle, ...hoursStyle}}>{item.hours}</td>
                  </tr>
                ))
              ) : (
                regularHoursPlaceholders.map((_, index) => (
                  <tr key={`placeholder-regular-${index}`} style={rowStyle}>
                    <td style={{...cellStyle, ...dayStyle}}>
                      <div style={getSkeletonStyle('80%', '1rem', index * 50)} />
                    </td>
                    <td style={{...cellStyle, ...hoursStyle}}>
                      <div style={getSkeletonStyle('60%', '1rem', index * 50 + 25)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Sonderöffnungszeiten */}
        {(data?.specialHours?.length || isStreaming) && (
          <div 
            style={{
              ...sectionStyle,
              opacity: specialHoursVisible ? 1 : 0,
              transform: specialHoursVisible ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            <h4 style={sectionTitleStyle}>Sonderöffnungszeiten</h4>
            <table style={tableStyle}>
              <tbody>
                {data && data.specialHours ? (
                  data.specialHours.map((item, index) => (
                    <tr key={`special-${index}`} style={rowStyle}>
                      <td style={{...cellStyle, ...dayStyle}}>{item.date}</td>
                      <td style={{...cellStyle, ...hoursStyle}}>{item.hours}</td>
                    </tr>
                  ))
                ) : (
                  specialHoursPlaceholders.map((_, index) => (
                    <tr key={`placeholder-special-${index}`} style={rowStyle}>
                      <td style={{...cellStyle, ...dayStyle}}>
                        <div style={getSkeletonStyle('90%', '1rem', index * 50 + 200)} />
                      </td>
                      <td style={{...cellStyle, ...hoursStyle}}>
                        <div style={getSkeletonStyle('60%', '1rem', index * 50 + 225)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Hinweise */}
        {(data?.notes?.length || isStreaming) && (
          <div 
            style={{
              ...sectionStyle,
              opacity: notesVisible ? 1 : 0,
              transform: notesVisible ? 'translateY(0)' : 'translateY(10px)',
              marginBottom: 0,
            }}
          >
            <h4 style={sectionTitleStyle}>Hinweise</h4>
            {data && data.notes ? (
              data.notes.map((note, index) => (
                <div key={`note-${index}`} style={noteStyle}>
                  {note}
                </div>
              ))
            ) : (
              notesPlaceholders.map((_, index) => (
                <div key={`placeholder-note-${index}`} style={noteStyle}>
                  <div style={getSkeletonStyle('100%', '1rem', index * 50 + 300)} />
                  <div style={{...getSkeletonStyle('80%', '1rem', index * 50 + 325), marginTop: '0.5rem'}} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FluidOpeningHoursCard;
