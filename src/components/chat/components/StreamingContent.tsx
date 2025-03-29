'use client'

import React, { useRef, useEffect, memo, useState } from 'react';
import '../styles/message-content.css';

interface StreamingContentProps {
  content: string;
  role: 'user' | 'assistant';
}

/**
 * Ein statischer Container, der nur einmal gerendert und dann per DOM-Manipulation aktualisiert wird.
 * Mit diesem Ansatz vermeiden wir, dass React den gesamten Komponentenbaum für jeden Token neu berechnet.
 */
const StreamingContent: React.FC<StreamingContentProps> = memo(({ content, role }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef<string>('');
  const [isStable, setIsStable] = useState(false);
  
  // Prüfe sofort ob wir initialen Content haben und richte den Container ein
  useEffect(() => {
    if (contentRef.current && !isStable) {
      // Setze eine feste Größe für den Container beim ersten Rendern
      contentRef.current.style.minHeight = '120px';
      contentRef.current.style.display = 'block';
      setIsStable(true);
    }
  }, [isStable]);

  // Direkte DOM-Manipulation statt React-Rerendering
  useEffect(() => {
    // Nur updaten, wenn neuer Inhalt vorhanden ist
    if (contentRef.current && content) {
      // Überprüfen, ob der Inhalt tatsächlich geändert wurde
      if (content !== lastContentRef.current) {
        console.log("STREAMING-DEBUG-V2: Aktualisiere Content direkt am DOM, Länge:", content.length);
        
        try {
          // Ersetze nur den Textinhalt, behalte die Container-Struktur bei
          const contentWrapper = contentRef.current.querySelector('.stream-content-text');
          
          if (contentWrapper) {
            // Direkte Zuweisung des neuen Inhalts - react-unabhängig
            contentWrapper.innerHTML = content;
          } else {
            // Falls der Wrapper noch nicht existiert, bei der ersten Aktualisierung
            const wrapper = document.createElement('div');
            wrapper.className = 'stream-content-text';
            wrapper.innerHTML = content;
            
            // Leere den Container und füge den Wrapper hinzu
            contentRef.current.innerHTML = '';
            contentRef.current.appendChild(wrapper);
          }
          
          // Content-Referenz aktualisieren
          lastContentRef.current = content;
        } catch (error) {
          console.error("STREAMING-DEBUG-V2: Fehler bei DOM-Manipulation:", error);
        }
      }
    }
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className="prose prose-sm break-words message-content streaming-content no-animations"
      style={{
        minHeight: '120px',
        isolation: 'isolate',
        contain: 'content',
        willChange: 'contents',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* Stabil gehaltener Container - DOM wird direkt manipuliert */}
      <div className="stream-content-text">
        {content || 'Initialisiere...'}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Spezielle Optimierung: Komponentenbaum nie neu rendern
  // Wir verwenden stattdessen DOM-Manipulation im useEffect
  return true; // Immer true, damit React diese Komponente nicht neu rendert
});

StreamingContent.displayName = 'StreamingContent';

export default StreamingContent; 