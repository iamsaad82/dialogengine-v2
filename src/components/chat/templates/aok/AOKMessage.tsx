'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AOKMessageProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode; // Wird nicht mehr verwendet, bleibt für Abwärtskompatibilität
  colorStyle?: Record<string, string>;
  isComplete: boolean;
}

/**
 * AOK-spezifische Message-Komponente
 * Kümmert sich um das Styling und die Struktur von AOK-Nachrichten
 * Vereinfachte Version für bessere Kompatibilität
 */
const AOKMessage: React.FC<AOKMessageProps> = ({
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

  // Farben aus Bot-Settings
  const primaryColor = colorStyle?.primaryColor || '#009fe3';
  const secondaryColor = colorStyle?.secondaryColor || '#e3000f';

  // CSS-Variablen setzen
  const dynamicStyles = {
    '--aok-primary': primaryColor,
    '--aok-secondary': secondaryColor,
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

      // Spezielle Klassen für Telefon- und E-Mail-Links
      if (href?.startsWith('tel:')) {
        link.classList.add('aok-tel-link');
      } else if (href?.startsWith('mailto:')) {
        link.classList.add('aok-mail-link');
      }
    });

    // Konvertieren des veränderten DOMs zurück zu HTML
    return doc.body.innerHTML;
  };

  useEffect(() => {
    if (!content || content === lastProcessedContent) return;

    setLastProcessedContent(content);

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

    // Verarbeiten der Links
    let newContent = processHtmlWithLinks(content);

    // Ändern von Klassen, um mit dem neuen CSS zu funktionieren
    // key-facts → facts-box
    newContent = newContent
      .replace(/<div class="aok-key-facts">([\s\S]*?)<h4>(.*?)<\/h4>/gi,
               '<div class="aok-facts-box"><div class="aok-box-title">$2</div>')
      .replace(/<ul class="aok-key-facts-list">/gi,
               '<ul class="aok-facts-list">');

    // quick-overview → box
    newContent = newContent
      .replace(/<div class="aok-quick-overview">([\s\S]*?)<h4>(.*?)<\/h4>/gi,
               '<div class="aok-box"><div class="aok-box-title">$2</div>');

    // info-box
    newContent = newContent
      .replace(/<div class="aok-info-box"[^>]*>([\s\S]*?)<h2>(.*?)<\/h2>/gi,
               '<div class="aok-info-box"><div class="aok-info-box-title">$2</div>');

    // security-notice
    newContent = newContent
      .replace(/<div class="aok-security-notice">([\s\S]*?)<h2>(.*?)<\/h2>([\s\S]*?)<p>(.*?)<\/p>/gi,
               '<div class="aok-security-notice"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="rgba(139, 220, 36, 0.1)"/></svg><p class="aok-security-notice-text"><strong>$2:</strong> $4</p>');

    // cta-button → button
    newContent = newContent
      .replace(/class="aok-cta-button"/gi, 'class="aok-button"');

    setProcessedContent(newContent);
  }, [content, shortAnswer, lastProcessedContent]);

  // Nach dem Rendern spezielle Elemente verbessern
  useEffect(() => {
    if (typeof window === 'undefined' || !contentRef.current) return;

    // Spezielle Anweisungen für den Content
    const contentElement = contentRef.current;

    // Alle Buttons mit externen Links versehen
    const buttons = contentElement.querySelectorAll('.aok-button');
    buttons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.setAttribute('target', '_blank');
        button.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }, [processedContent]);

  // Während des Streamings einfacheres Layout verwenden
  if (isStreaming) {
    return (
      <div
        ref={contentRef}
        className="aok-message"
        style={dynamicStyles}
      >
        {/* Keine Nachrichtensteuerung mehr hier, wird jetzt in der Message-Komponente angezeigt */}

        {/* Kurzantwort während des Streamings extrahieren */}
        {shortAnswer && (
          <div className="aok-short-answer">
            {shortAnswer}
          </div>
        )}

        {/* Während des Streamings den gesamten Inhalt anzeigen, aber Links korrigieren */}
        <div dangerouslySetInnerHTML={{ __html: processedContent }} />
        <div className="aok-streaming-indicator">...</div>
      </div>
    );
  }

  return (
    <div
      ref={contentRef}
      className="aok-message"
      style={dynamicStyles}
    >
      {/* Keine Nachrichtensteuerung mehr hier, wird jetzt in der Message-Komponente angezeigt */}

      {/* Kurzantwort anzeigen (ganz oben) */}
      {shortAnswer && (
        <div className="aok-short-answer">
          {shortAnswer}
        </div>
      )}

      {/* Regulärer Inhalt (mit ersetzen Klassen für bessere CSS-Kompatibilität) */}
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />

      {/* Streaming-Indikator */}
      {!isComplete && (
        <div className="aok-streaming-indicator">...</div>
      )}
    </div>
  );
};

export default AOKMessage;