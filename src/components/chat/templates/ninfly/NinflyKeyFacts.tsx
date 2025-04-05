'use client';

import React from 'react';

interface NinflyKeyFactsProps {
  content: string;
}

/**
 * Ninfly Sports Arena KeyFacts-Komponente
 */
const NinflyKeyFacts: React.FC<NinflyKeyFactsProps> = ({ content }) => {
  return (
    <div className="ninfly-area-card">
      <div className="ninfly-area-header">
        <div className="ninfly-area-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <span>Key Facts</span>
      </div>
      <ul className="ninfly-area-content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default NinflyKeyFacts;
