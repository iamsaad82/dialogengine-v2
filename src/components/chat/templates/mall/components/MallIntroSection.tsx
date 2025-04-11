'use client';

import React from 'react';

interface MallIntroSectionProps {
  content: string;
  style?: React.CSSProperties;
}

/**
 * Verbesserte Komponente für den einleitenden Textbereich im Mall-Template
 * Mit optimierter Performance und flackerfreiem Streaming
 */
const MallIntroSection: React.FC<MallIntroSectionProps> = ({
  content,
  style = {}
}) => {
  if (!content) return null;

  // Moderne Stile für bessere Performance und flackerfreies Streaming
  const introStyle = {
    ...style,
    margin: '0',
    padding: '1.5rem 1.5rem 1rem',
    fontSize: '1.1rem',
    lineHeight: 1.6,
    minHeight: '80px', // Feste Mindestgröße verhindert Springen
    height: '80px', // Feste Höhe verhindert Springen
    transition: 'none', // Keine Übergänge während des Streamings
    animation: 'none', // Keine Animationen während des Streamings
    willChange: 'auto', // Optimiert für Änderungen des Inhalts, aber nicht zu aggressiv
    whiteSpace: 'pre-wrap', // Zeilenumbrüche beibehalten
    wordBreak: 'break-word', // Lange Wörter umbrechen
    overflowWrap: 'break-word', // Alternative zu word-break
    maxWidth: '100%', // Maximale Breite
    overflow: 'hidden', // Verhindert Überlauf
    contain: 'content', // Verbesserte Rendering-Performance
    transform: 'translateZ(0)', // Hardware-Beschleunigung aktivieren
    backfaceVisibility: 'hidden', // Verhindert Flackern
    color: 'var(--mall-text, #333333)', // Konsistente Textfarbe
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)', // Subtile Trennung
    fontWeight: 400, // Leicht leichter für bessere Lesbarkeit
    backgroundColor: '#ffffff', // Weißer Hintergrund für bessere Lesbarkeit
    position: 'relative', // Für stabile Positionierung
    borderRadius: '8px 8px 0 0', // Abgerundete Ecken oben
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', // Leichter Schatten
  };

  // Bereinige den HTML-Content von unerwünschten Stilen und Tags
  const cleanContent = content
    // Entferne style-Attribute, die Flackern verursachen könnten
    .replace(/style="[^"]*"/g, '')
    // Stelle sicher, dass Absätze einen konsistenten Abstand haben
    .replace(/<p>/g, '<p style="margin: 0.5rem 0;">')
    // Entferne HTML-Tags
    .replace(/<\/?html>/g, '')
    // Entferne verschachtelte mall-divs
    .replace(/<div class="mall-[^"]*">/g, '')
    .replace(/<\/div>/g, '');

  return (
    <div
      style={introStyle}
      className="mall-intro-section"
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};

export default MallIntroSection;