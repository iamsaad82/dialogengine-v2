'use client';

import React from 'react';

interface DefaultQuickOverviewProps {
  content: string;
}

/**
 * Modernisierte Standard-QuickOverview-Komponente
 */
const DefaultQuickOverview: React.FC<DefaultQuickOverviewProps> = ({ content }) => {
  return (
    <div className="schnellueberblick quick-overview-card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
        <h4>Auf einen Blick</h4>
      </div>
      <div className="card-content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default DefaultQuickOverview;