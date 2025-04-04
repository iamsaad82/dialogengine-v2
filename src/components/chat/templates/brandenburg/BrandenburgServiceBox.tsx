'use client';

import React, { useEffect, useRef } from 'react';

interface BrandenburgServiceBoxProps {
  content: string;
  colorStyle?: Record<string, string>;
}

/**
 * Brandenburg-spezifische ServiceBox-Komponente
 * Zeigt Service- und Öffnungszeiteninformationen im Stadtdesign an
 */
const BrandenburgServiceBox: React.FC<BrandenburgServiceBoxProps> = ({ 
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

  // Nach dem Rendern Links und Buttons formatieren
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Tel-Links formatieren
    const telLinks = contentRef.current.querySelectorAll('a[href^="tel:"]');
    telLinks.forEach(link => {
      link.classList.add('brandenburg-tel-link');
    });
    
    // Mail-Links formatieren
    const mailLinks = contentRef.current.querySelectorAll('a[href^="mailto:"]');
    mailLinks.forEach(link => {
      link.classList.add('brandenburg-mail-link');
    });
    
    // Action-Buttons formatieren
    const actionLinks = contentRef.current.querySelectorAll('a[href^="#"]');
    actionLinks.forEach(link => {
      if (!link.classList.contains('brandenburg-button')) {
        link.classList.add('brandenburg-button');
      }
    });
  }, [content]);

  return (
    <div className="brandenburg-service-box" ref={contentRef} style={colorVars as React.CSSProperties}>
      <h4>Service & Öffnungszeiten</h4>
      <div 
        className="brandenburg-opening-hours"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
};

export default BrandenburgServiceBox; 