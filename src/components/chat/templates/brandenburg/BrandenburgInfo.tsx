'use client';

import React from 'react';

interface BrandenburgInfoProps {
  content: string;
  colorStyle?: Record<string, string>;
}

/**
 * Brandenburg-spezifische Info-Komponente
 * Zeigt allgemeine Informationen und Erklärungen im Stadtdesign an
 */
const BrandenburgInfo: React.FC<BrandenburgInfoProps> = ({ 
  content,
  colorStyle
}) => {
  // Farben aus Bot-Settings
  const colorVars = {
    '--brandenburg-primary': colorStyle?.primaryColor || '#005ca9',
    '--brandenburg-secondary': colorStyle?.botAccentColor || '#003b6f',
    '--brandenburg-accent': '#e30613',
    '--brandenburg-light': '#f2f6f9',
    '--brandenburg-text': colorStyle?.botTextColor || '#333333',
  };

  // Prüfen ob der Inhalt bereits eine Überschrift enthält
  const hasHeading = content.includes('<h4>') || content.includes('</h4>');

  return (
    <div className="brandenburg-info" style={colorVars as React.CSSProperties}>
      {/* Überschrift nur rendern, wenn nicht bereits im Inhalt vorhanden */}
      {!hasHeading && <h4>Weitere Informationen</h4>}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default BrandenburgInfo; 