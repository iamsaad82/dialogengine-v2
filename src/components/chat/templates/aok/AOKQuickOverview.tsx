'use client';

import React from 'react';

interface AOKQuickOverviewProps {
  content: string;
}

/**
 * AOK-spezifische Schnellüberblick-Komponente
 * 
 * Zeigt eine übersichtliche Zusammenfassung wichtiger Informationen im AOK-Design an
 */
const AOKQuickOverview: React.FC<AOKQuickOverviewProps> = ({ content }) => {
  return (
    <div className="aok-quick-overview">
      <h4>Auf einen Blick</h4>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default AOKQuickOverview; 