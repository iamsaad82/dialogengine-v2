'use client';

import React from 'react';

interface AOKCallToActionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

/**
 * AOK-spezifische Call-to-Action-Komponente
 * 
 * Zeigt eine markante CTA-Box mit Titel, Beschreibung und Aktionsbutton an
 */
const AOKCallToAction: React.FC<AOKCallToActionProps> = ({ 
  title, 
  description, 
  buttonText, 
  buttonUrl 
}) => {
  return (
    <div className="aok-cta-box">
      <h2>{title}</h2>
      <p>{description}</p>
      <a 
        href={buttonUrl} 
        className="aok-cta-button" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {buttonText}
      </a>
    </div>
  );
};

export default AOKCallToAction; 