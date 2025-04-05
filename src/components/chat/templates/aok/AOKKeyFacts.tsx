'use client';

import React, { useEffect, useRef } from 'react';
import { extractListItems } from '../utils';

interface AOKKeyFactsProps {
  content: string;
}

/**
 * AOK-spezifische Key Facts-Komponente
 *
 * Zeigt Stichpunkte im AOK-Design mit Icons und spezieller Formatierung an
 */
const AOKKeyFacts: React.FC<AOKKeyFactsProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Verbesserungen nach dem Rendern anwenden
  useEffect(() => {
    if (!contentRef.current) return;

    // Links in den Key Facts speziell formatieren
    const links = contentRef.current.querySelectorAll('a');
    links.forEach(link => {
      // Telefon-Links hervorheben
      if (link.href.startsWith('tel:')) {
        link.classList.add('aok-tel-link');
      }
      // E-Mail-Links hervorheben
      else if (link.href.startsWith('mailto:')) {
        link.classList.add('aok-mail-link');
      }
      // Web-Links hervorheben
      else {
        link.classList.add('web-link');
      }
    });
  }, [content]);

  // Listenelemente direkt vor dem Rendern aufbereiten
  const items = extractListItems(content);

  return (
    <div className="aok-facts-box" ref={contentRef}>
      <div className="aok-box-title">Key Facts</div>
      <ul className="aok-facts-list">
        {items.length > 0 ? (
          // Wenn Items extrahiert wurden, einzeln rendern
          items.map((item, index) => (
            <li key={index}>
              <strong>{item.icon}</strong>
              <span dangerouslySetInnerHTML={{ __html: item.text }} />
            </li>
          ))
        ) : (
          // Fallback: Original-HTML direkt rendern
          <div dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </ul>
    </div>
  );
};

export default AOKKeyFacts;