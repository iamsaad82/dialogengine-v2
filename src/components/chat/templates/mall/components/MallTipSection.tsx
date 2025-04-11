'use client';

import React from 'react';

interface MallTipSectionProps {
  title: string;
  content: string;
  style?: React.CSSProperties;
}

/**
 * Komponente für den Tipp/Hinweis-Bereich im Mall-Template
 */
const MallTipSection: React.FC<MallTipSectionProps> = ({
  title,
  content,
  style = {}
}) => {
  if (!content) return null;

  const tipStyle = {
    ...style,
    margin: '0.5rem 1.5rem 1.5rem',
    padding: '1rem 1.5rem',
    borderLeft: '3px solid var(--mall-secondary, #ff5a5f)',
    backgroundColor: 'rgba(var(--mall-secondary-rgb, 255, 90, 95), 0.05)',
    borderRadius: '0 12px 12px 0',
    position: 'relative' as React.CSSProperties['position'],
    transition: 'none !important', // Keine Übergänge während des Streamings
    animation: 'none !important', // Keine Animationen während des Streamings
    willChange: 'auto', // Optimiert für Änderungen des Inhalts, aber nicht zu aggressiv
    contain: 'content', // Verbesserte Rendering-Performance
    transform: 'translateZ(0)', // Hardware-Beschleunigung aktivieren
    backfaceVisibility: 'hidden', // Verhindert Flackern
    height: 'auto !important', // Verhindert Höhen-Flackern
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)', // Subtiler Schatten
    fontSize: '0.95rem', // Etwas kleinere Schrift
    lineHeight: 1.5, // Bessere Lesbarkeit
    color: '#444', // Dunklerer Text für besseren Kontrast
  };

  const titleStyle = {
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: '0 0 0.5rem 0',
    color: 'var(--mall-secondary, #ff5a5f)',
    display: 'flex',
    alignItems: 'center',
  };

  const contentStyle = {
    margin: 0,
  };

  // Entferne mögliche 💡, Tipp: oder Hinweis: Präfixe aus dem Content
  // und bereinige HTML-Tags und verschachtelte Divs
  const cleanContent = content
    .replace(/<p>(?:💡\s*|Tipp:\s*|Hinweis:\s*)/i, '<p>')
    // Entferne HTML-Tags
    .replace(/<\/?html>/g, '')
    // Entferne verschachtelte mall-divs
    .replace(/<div class="mall-[^"]*">/g, '')
    .replace(/<\/div>/g, '');

  return (
    <div style={tipStyle} className="mall-tip-section">
      <h3 style={titleStyle}>
        <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>💡</span> {title || 'Tipp'}
      </h3>
      <div
        style={{
          ...contentStyle,
          position: 'relative',
          zIndex: 1,
        }}
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />

      {/* Dekorativer Hintergrund-Indikator */}
      <div style={{
        position: 'absolute',
        top: '0.5rem',
        left: '-3px', // Ausrichtung mit dem linken Rand
        width: '6px',
        height: '2rem',
        backgroundColor: 'var(--mall-secondary, #ff5a5f)',
        borderRadius: '0 3px 3px 0',
        opacity: 0.7,
        zIndex: 0,
      }} />
    </div>
  );
};

export default MallTipSection;