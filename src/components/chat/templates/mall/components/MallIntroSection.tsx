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
    minHeight: '1.5rem', // Verhindert Größenänderungen während des Streamings
    transition: 'none', // Keine Übergänge während des Streamings
    willChange: 'contents', // Optimiert für Änderungen des Inhalts
    whiteSpace: 'pre-wrap', // Zeilenumbrüche beibehalten
    wordBreak: 'break-word', // Lange Wörter umbrechen
    overflowWrap: 'break-word', // Alternative zu word-break
    maxWidth: '100%', // Maximale Breite
    overflow: 'hidden', // Verhindert Überlauf
  };

  return (
    <div style={introStyle} className="mall-intro-section" dangerouslySetInnerHTML={{ __html: content }} />
  );
};

export default MallIntroSection;