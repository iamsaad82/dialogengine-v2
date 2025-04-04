'use client'

import React, { useRef, useEffect } from 'react';

interface StreamingContentProps {
  content: string;
  role: string;
}

// Extrem vereinfachte StreamingContent-Komponente
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
      className="message-content"
      ref={contentRef}
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  );
}, () => false); // Erlaube Updates

StreamingContent.displayName = 'StreamingContent';

export default StreamingContent; 