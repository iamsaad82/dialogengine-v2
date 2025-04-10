'use client';

import React, { useEffect, useRef, useState, useLayoutEffect, useMemo } from 'react';

interface StandardMessageProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode; // Wird nicht mehr verwendet, bleibt für Abwärtskompatibilität
  colorStyle?: Record<string, string>;
  isComplete: boolean;
}

/**
 * Standard-Message-Komponente
 * Universelles Template, das bei allen Kunden eingesetzt werden kann
 * Modernes, interaktives und informatives Design
 */
const StandardMessage: React.FC<StandardMessageProps> = ({
  content,
  isStreaming = false,
  messageControls,
  colorStyle,
  isComplete
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState('');
  const [shortAnswer, setShortAnswer] = useState<string | null>(null);
  const [lastProcessedContent, setLastProcessedContent] = useState('');
  const [isRendered, setIsRendered] = useState(false);
  const [finalHeight, setFinalHeight] = useState<number | null>(null);

  // Farben aus Bot-Settings
  const primaryColor = colorStyle?.primaryColor || '#2563eb';
  const secondaryColor = colorStyle?.secondaryColor || '#f97316';
  const successColor = colorStyle?.successColor || '#22c55e';
  const warningColor = colorStyle?.warningColor || '#eab308';
  const dangerColor = colorStyle?.dangerColor || '#ef4444';

  // CSS-Variablen setzen
  const dynamicStyles = {
    '--std-primary': primaryColor,
    '--std-secondary': secondaryColor,
    '--std-success': successColor,
    '--std-warning': warningColor,
    '--std-danger': dangerColor,
  } as React.CSSProperties;

  // Funktion, um Links in neuem Tab zu öffnen und URL-Format zu korrigieren
  const processHtmlWithLinks = (html: string) => {
    if (!html) return html;

    // Temporäres Element zum Parsen des HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Alle Links finden und anpassen
    doc.querySelectorAll('a').forEach(link => {
      // Links in neuem Tab öffnen
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');

      // URL-Format korrigieren, wenn nötig
      let href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        link.setAttribute('href', `https://${href}`);
      }
    });

    // Für interaktive Elemente wie Accordions Event-Handler hinzufügen
    doc.querySelectorAll('.standard-accordion-header').forEach(header => {
      header.setAttribute('data-accordion-toggle', 'true');
    });

    // Konvertieren des veränderten DOMs zurück zu HTML
    return doc.body.innerHTML;
  };

  // Füge Interaktivität zu Accordions hinzu
  const enhanceInteractiveElements = () => {
    if (typeof window === 'undefined' || !contentRef.current) return;

    // Accordions
    const accordionToggles = contentRef.current.querySelectorAll('[data-accordion-toggle]');
    accordionToggles.forEach(toggle => {
      if (toggle instanceof HTMLElement) {
        toggle.onclick = () => {
          const content = toggle.nextElementSibling;
          if (content instanceof HTMLElement) {
            if (content.style.display === 'none') {
              content.style.display = 'block';
              toggle.setAttribute('aria-expanded', 'true');
              // Pfeil-Icon umdrehen
              const arrow = toggle.querySelector('.accordion-arrow');
              if (arrow instanceof HTMLElement) {
                arrow.style.transform = 'rotate(180deg)';
              }
            } else {
              content.style.display = 'none';
              toggle.setAttribute('aria-expanded', 'false');
              // Pfeil-Icon zurückdrehen
              const arrow = toggle.querySelector('.accordion-arrow');
              if (arrow instanceof HTMLElement) {
                arrow.style.transform = 'rotate(0deg)';
              }
            }
          }
        };
      }
    });
  };

  // Verarbeitung des Inhalts mit useLayoutEffect für synchrones Rendering
  useLayoutEffect(() => {
    // Nur ausführen, wenn Content vorhanden und neu ist
    if (!content || content === lastProcessedContent) return;

    setLastProcessedContent(content);

    try {
      // Extrahieren der Kurzantwort
      if (content) {
        // Strategie 1: Text bis zum ersten HTML-Tag extrahieren
        const textBeforeFirstTag = content.match(/^([^<]+)/i);
        if (textBeforeFirstTag && textBeforeFirstTag[1].trim().length > 0) {
          setShortAnswer(textBeforeFirstTag[1].trim());
        }
        // Strategie 2: Ersten Absatz als Kurzantwort verwenden
        else if (!shortAnswer) {
          const firstParagraph = content.match(/<p>([^<]+)<\/p>/i);
          if (firstParagraph && firstParagraph[1].trim().length > 0) {
            setShortAnswer(firstParagraph[1].trim());
          }
        }
      }

      // Verarbeiten der Links und interaktiven Elemente
      let newContent = processHtmlWithLinks(content);

      // Füge Pfeile zu Accordion-Headern hinzu
      newContent = newContent.replace(
        /<div class="standard-accordion-header"([^>]*)>/gi,
        '<div class="standard-accordion-header"$1><span>$2</span><span class="accordion-arrow" style="transition: transform 0.3s ease;">▼</span>'
      );

      // Setze initiale Accordion-Inhalte auf ausgeblendet
      newContent = newContent.replace(
        /<div class="standard-accordion-content">/gi,
        '<div class="standard-accordion-content" style="display: none;">'
      );

      // Setze den Inhalt immer direkt
      setProcessedContent(newContent);
      setIsRendered(true);

      // Wenn das Streaming abgeschlossen ist, setzen wir die endgültige Höhe
      if (!isStreaming || isComplete) {
        // Warte einen Frame, um die Höhe zu messen
        window.setTimeout(() => {
          if (contentRef.current) {
            // Messe die Höhe des Inhalts
            const height = contentRef.current.scrollHeight;
            console.log('Standard Template: Finale Höhe gemessen:', height);
            setFinalHeight(height);
          }
        }, 100); // Längere Verzögerung für zuverlässigere Messung
      }
    } catch (error) {
      console.error('Fehler bei der Content-Verarbeitung:', error);
      // Fallback: Unveränderten Content anzeigen
      setProcessedContent(content);
      setIsRendered(true);
    }
  }, [content, shortAnswer, lastProcessedContent, isStreaming, isComplete]);

  // Nach dem Rendern interaktive Elemente verbessern
  useEffect(() => {
    enhanceInteractiveElements();
  }, [processedContent]);

  // Berechne die Stile für den Container basierend auf dem Status
  const containerStyle = useMemo(() => {
    const style: React.CSSProperties = {
      ...dynamicStyles,
      position: 'relative',
      overflow: 'hidden',
    };

    // Wenn wir eine endgültige Höhe haben und das Streaming abgeschlossen ist,
    // verwenden wir eine feste Höhe, um Layout-Shifts zu verhindern
    if (finalHeight !== null && (!isStreaming || isComplete)) {
      style.height = `${finalHeight}px`;
      // Setze auch eine CSS-Variable für die Höhe
      style['--final-height' as any] = `${finalHeight}px`;
      console.log('Standard Template: Verwende feste Höhe:', finalHeight);
    } else {
      // Sonst verwenden wir eine Mindesthöhe
      style.minHeight = '100px';
    }

    return style;
  }, [dynamicStyles, finalHeight, isStreaming, isComplete]);

  // Optimiertes Rendering mit fester Höhe nach Abschluss
  return (
    <div
      ref={contentRef}
      className={`standard-message ${isComplete ? 'standard-complete' : ''}`}
      style={containerStyle}
    >
      {/* Keine Nachrichtensteuerung mehr hier, wird jetzt in der Message-Komponente angezeigt */}

      {/* Kurzantwort anzeigen (ganz oben) */}
      {shortAnswer && (
        <div className="standard-short-answer">
          {shortAnswer}
        </div>
      )}

      {/* Inhalt mit interaktiven Elementen */}
      <div
        className="standard-content"
        style={{
          width: '100%',
          position: 'relative',
          // Keine Transitions oder Animationen im Content
          transition: 'none',
          animation: 'none',
        }}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      {/* Streaming-Indikator nur anzeigen, wenn aktiv gestreamt wird und nicht vollständig */}
      {isStreaming && !isComplete && (
        <div className="standard-streaming-indicator">...</div>
      )}
    </div>
  );
};

export default StandardMessage;