'use client'

import React, { useRef, useEffect } from 'react';

interface StreamingContentProps {
  content: string;
  role: string;
}

// Optimierte StreamingContent-Komponente mit Stabilisierungseigenschaften
const StreamingContent = React.memo(({ content }: StreamingContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Aktualisiere den Inhalt direkt, wenn sich content ändert
  useEffect(() => {
    if (contentRef.current && content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  return (
    <div
      className="message-content streaming-stable"
      ref={contentRef}
      dangerouslySetInnerHTML={{ __html: content || '' }}
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'contents',
        contain: 'content',
        isolation: 'isolate'
      }}
    />
  );
}, (prevProps, nextProps) => {
  // Optimierte Vergleichsfunktion: Nur aktualisieren, wenn sich der Inhalt wesentlich geändert hat
  // Verhindert unnötige Re-Renderings bei kleinen Änderungen
  if (!prevProps.content && nextProps.content) return false; // Immer aktualisieren, wenn vorher leer
  if (Math.abs((prevProps.content?.length || 0) - (nextProps.content?.length || 0)) > 10) return false; // Aktualisieren bei größeren Änderungen
  return true; // Ansonsten keine Aktualisierung
});

StreamingContent.displayName = 'StreamingContent';

export default StreamingContent;