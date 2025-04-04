'use client';

import React, { useEffect, useRef } from 'react';

interface CreditreformServiceSectionProps {
  content: string;
  colorStyle?: Record<string, string>;
}

/**
 * Creditreform-spezifische Service-Section-Komponente
 * Zeigt Service- und Kontaktinformationen im Creditreform-Design an
 */
const CreditreformServiceSection: React.FC<CreditreformServiceSectionProps> = ({ 
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

  // Nach dem Rendern Links und Buttons formatieren
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Tel-Links formatieren
    const telLinks = contentRef.current.querySelectorAll('a[href^="tel:"]');
    telLinks.forEach(link => {
      // Telefon-Links hervorheben
      link.classList.add('creditreform-tel-link');
    });
    
    // Mail-Links formatieren
    const mailLinks = contentRef.current.querySelectorAll('a[href^="mailto:"]');
    mailLinks.forEach(link => {
      // Mail-Links hervorheben
      link.classList.add('creditreform-mail-link');
    });
    
    // Action-Buttons formatieren
    const actionLinks = contentRef.current.querySelectorAll('a[href^="#"]');
    actionLinks.forEach(link => {
      if (!link.classList.contains('creditreform-button')) {
        link.classList.add('creditreform-button');
      }
    });
  }, [content]);

  return (
    <div className="creditreform-service-section" ref={contentRef} style={colorVars as React.CSSProperties}>
      <h3>Unser Service für Sie</h3>
      <div 
        className="creditreform-contact"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
};

export default CreditreformServiceSection; 