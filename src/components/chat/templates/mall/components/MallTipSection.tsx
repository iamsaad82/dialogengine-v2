'use client';

import React from 'react';

interface MallTipSectionProps {
  title: string;
  content: string;
  style?: React.CSSProperties;
}

/**
 * Komponente für den Tipp/Hinweis-Bereich im Mall-Template
 */
const MallTipSection: React.FC<MallTipSectionProps> = ({
  title,
  content,
  style = {}
}) => {
  if (!content) return null;

  const tipStyle = {
    ...style,
    margin: '1.5rem 1.5rem 0.5rem 1.5rem',
    padding: '1rem 1rem 1rem 1.5rem',
    borderLeft: '3px solid var(--mall-secondary, #ff5a5f)',
    backgroundColor: 'rgba(255, 90, 95, 0.05)',
    borderRadius: '0 8px 8px 0',
    position: 'relative' as React.CSSProperties['position'],
  };

  const titleStyle = {
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: '0 0 0.5rem 0',
    color: 'var(--mall-secondary, #ff5a5f)',
    display: 'flex',
    alignItems: 'center',
  };

  const contentStyle = {
    margin: 0,
  };

  // Entferne mögliche 💡, Tipp: oder Hinweis: Präfixe aus dem Content
  const cleanContent = content.replace(/<p>(?:💡\s*|Tipp:\s*|Hinweis:\s*)/i, '<p>');

  return (
    <div style={tipStyle} className="mall-tip-section">
      <h3 style={titleStyle}>
        <span style={{ marginRight: '0.5rem' }}>💡</span> {title || 'Tipp'}
      </h3>
      <div
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    </div>
  );
};

export default MallTipSection;