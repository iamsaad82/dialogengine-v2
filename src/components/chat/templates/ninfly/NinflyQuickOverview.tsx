'use client';

import React from 'react';

interface NinflyQuickOverviewProps {
  content: string;
}

/**
 * Ninfly Sports Arena QuickOverview-Komponente
 */
const NinflyQuickOverview: React.FC<NinflyQuickOverviewProps> = ({ content }) => {
  return (
    <div className="ninfly-area-card">
      <div className="ninfly-area-header">
        <div className="ninfly-area-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
        <span>Auf einen Blick</span>
      </div>
      <div className="ninfly-area-content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default NinflyQuickOverview;
