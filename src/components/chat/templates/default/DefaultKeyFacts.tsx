'use client';

import React from 'react';

interface DefaultKeyFactsProps {
  content: string;
}

/**
 * Modernisierte Standard-KeyFacts-Komponente
 */
const DefaultKeyFacts: React.FC<DefaultKeyFactsProps> = ({ content }) => {
  return (
    <div className="keyfacts key-facts-card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h4>Key Facts</h4>
      </div>
      <ul className="keyfacts-list card-content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default DefaultKeyFacts;