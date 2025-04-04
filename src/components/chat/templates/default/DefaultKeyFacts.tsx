'use client';

import React from 'react';

interface DefaultKeyFactsProps {
  content: string;
}

/**
 * Standard-KeyFacts-Komponente
 */
const DefaultKeyFacts: React.FC<DefaultKeyFactsProps> = ({ content }) => {
  return (
    <div className="keyfacts">
      <h4>Key Facts</h4>
      <ul className="keyfacts-list" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default DefaultKeyFacts; 