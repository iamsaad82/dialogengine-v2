'use client';

import React, { useEffect, useRef } from 'react';
import { extractListItems } from '../utils';

interface BrandenburgNewsProps {
  content: string;
  colorStyle?: Record<string, string>;
}

/**
 * Brandenburg-spezifische News-Komponente
 * Stellt aktuelle Informationen und Meldungen im Stadtdesign dar
 */
const BrandenburgNews: React.FC<BrandenburgNewsProps> = ({ 
  content,
  colorStyle
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Farben aus Bot-Settings
  const colorVars = {
    '--brandenburg-primary': colorStyle?.primaryColor || '#005ca9',
    '--brandenburg-secondary': colorStyle?.botAccentColor || '#003b6f',
    '--brandenburg-accent': '#e30613',
    '--brandenburg-light': '#f2f6f9',
    '--brandenburg-text': colorStyle?.botTextColor || '#333333',
  };

  // Listenelemente aus dem HTML-Inhalt extrahieren
  const items = extractListItems(content);

  // Prüfen ob der Inhalt bereits eine Überschrift enthält
  const hasHeading = content.includes('<h4>') || content.includes('</h4>');

  return (
    <div className="brandenburg-news" ref={contentRef} style={colorVars as React.CSSProperties}>
      {/* Überschrift nur rendern, wenn nicht bereits im Inhalt vorhanden */}
      {!hasHeading && <h4>Aktuelle Informationen</h4>}
      <ul className="brandenburg-news-list">
        {items.length > 0 ? (
          // Wenn Items extrahiert wurden, einzeln rendern
          items.map((item, index) => (
            <li key={index}>
              <strong>{item.icon}</strong> 
              <span dangerouslySetInnerHTML={{ __html: item.text }} />
            </li>
          ))
        ) : (
          // Fallback: Original-HTML direkt rendern
          <div dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </ul>
    </div>
  );
};

export default BrandenburgNews; 