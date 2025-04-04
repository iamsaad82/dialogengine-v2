'use client';

import React from 'react';

interface MallIntroSectionProps {
  content: string;
  style?: React.CSSProperties;
}

/**
 * Komponente für den einleitenden Textbereich im Mall-Template
 */
const MallIntroSection: React.FC<MallIntroSectionProps> = ({
  content,
  style = {}
}) => {
  if (!content) return null;

  const introStyle = {
    ...style,
    margin: '0.75rem 1.5rem 1.25rem 1.5rem',
    fontSize: '1rem',
    lineHeight: 1.5,
    padding: '0',
  };

  return (
    <div style={introStyle} dangerouslySetInnerHTML={{ __html: content }} />
  );
};

export default MallIntroSection;