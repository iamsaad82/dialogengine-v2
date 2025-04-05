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
    <div className="aok-box">
      <div className="aok-box-title">Auf einen Blick</div>
      <div className="aok-box-content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default AOKQuickOverview;