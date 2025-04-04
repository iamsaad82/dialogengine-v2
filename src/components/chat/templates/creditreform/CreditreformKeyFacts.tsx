'use client';

import React, { useEffect, useRef } from 'react';
import { extractListItems } from '../utils';

interface CreditreformKeyFactsProps {
  content: string;
  colorStyle?: Record<string, string>;
}

/**
 * Creditreform-spezifische KeyFacts-Komponente
 * Stellt wichtige Informationen strukturiert und im Creditreform-Design dar
 */
const CreditreformKeyFacts: React.FC<CreditreformKeyFactsProps> = ({ 
  content,
  colorStyle
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Farben aus Bot-Settings
  const colorVars = {
    '--creditreform-primary': colorStyle?.primaryColor || '#243b55',
    '--creditreform-secondary': colorStyle?.botAccentColor || '#141E30',
    '--creditreform-accent': colorStyle?.botAccentColor || '#004B9B',
    '--creditreform-light': '#f0f4f8',
    '--creditreform-text': colorStyle?.botTextColor || '#333333',
    '--creditreform-highlight': '#e74c3c',
  };

  // Nach dem Rendern spezielle Links formatieren
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Tel-Links formatieren
    const telLinks = contentRef.current.querySelectorAll('a[href^="tel:"]');
    telLinks.forEach(link => {
      link.classList.add('creditreform-tel-link');
    });
    
    // Mail-Links formatieren
    const mailLinks = contentRef.current.querySelectorAll('a[href^="mailto:"]');
    mailLinks.forEach(link => {
      link.classList.add('creditreform-mail-link');
    });
    
    // Entferne doppelte Überschriften
    const headings = contentRef.current.querySelectorAll('h4');
    if (headings.length > 1) {
      // Nur die erste Überschrift behalten
      for (let i = 1; i < headings.length; i++) {
        headings[i].remove();
      }
    }
  }, [content]);

  // Listenelemente aus dem HTML-Inhalt extrahieren
  const items = extractListItems(content);

  // Prüfen ob der Inhalt bereits eine Überschrift enthält
  const hasHeading = content.includes('<h4>') || content.includes('</h4>');

  return (
    <div className="creditreform-keyfacts" ref={contentRef} style={colorVars as React.CSSProperties}>
      {/* Überschrift nur rendern, wenn nicht bereits im Inhalt vorhanden */}
      {!hasHeading && <h4>Wichtige Informationen</h4>}
      <ul className="creditreform-list">
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

export default CreditreformKeyFacts; 