'use client';

import React from 'react';

interface CreditreformInfoProps {
  content: string;
  colorStyle?: Record<string, string>;
}

/**
 * Creditreform-spezifische Info-Komponente
 * Zeigt allgemeine Informationen und Erklärungen im Creditreform-Design an
 */
const CreditreformInfo: React.FC<CreditreformInfoProps> = ({ 
  content,
  colorStyle
}) => {
  // Farben aus Bot-Settings
  const colorVars = {
    '--creditreform-primary': colorStyle?.primaryColor || '#243b55',
    '--creditreform-secondary': colorStyle?.botAccentColor || '#141E30',
    '--creditreform-accent': colorStyle?.botAccentColor || '#004B9B',
    '--creditreform-light': '#f0f4f8',
    '--creditreform-text': colorStyle?.botTextColor || '#333333',
    '--creditreform-highlight': '#e74c3c',
  };

  return (
    <div className="creditreform-info" style={colorVars as React.CSSProperties}>
      <h4>Hintergrundinformationen</h4>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default CreditreformInfo; 