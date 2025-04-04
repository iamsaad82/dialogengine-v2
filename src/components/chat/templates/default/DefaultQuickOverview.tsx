'use client';

import React from 'react';

interface DefaultQuickOverviewProps {
  content: string;
}

/**
 * Standard-QuickOverview-Komponente
 */
const DefaultQuickOverview: React.FC<DefaultQuickOverviewProps> = ({ content }) => {
  return (
    <div className="schnellueberblick">
      <h4>Auf einen Blick</h4>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default DefaultQuickOverview; 