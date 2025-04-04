'use client';

import React from 'react';

interface AOKSecurityNoticeProps {
  title: string;
  text: string;
}

/**
 * AOK-spezifischer Sicherheitshinweis
 * 
 * Zeigt einen Hinweis zur Datensicherheit mit Schild-Icon an
 */
const AOKSecurityNotice: React.FC<AOKSecurityNoticeProps> = ({ 
  title, 
  text 
}) => {
  return (
    <div className="aok-security-notice">
      <div className="aok-security-notice-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="rgba(139, 220, 36, 0.1)"
          />
          <path 
            d="M12 8V12"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M12 16H12.01"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <circle 
            cx="12" 
            cy="12" 
            r="9" 
            fill="none"
          />
        </svg>
      </div>
      <div className="aok-security-notice-content">
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default AOKSecurityNotice; 