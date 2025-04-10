'use client';

import React, { useEffect, useRef, useState, useLayoutEffect, useMemo } from 'react';

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
  const [isRendered, setIsRendered] = useState(false);
  const [finalHeight, setFinalHeight] = useState<number | null>(null);

  // Farben aus Bot-Settings
  const primaryColor = colorStyle?.primaryColor || '#006e3b'; // Neues AOK-Grün
  const secondaryColor = colorStyle?.secondaryColor || '#8bc100'; // Neues AOK-Hellgrün

  // Wir entfernen den Code, der versucht, den MessageHeader zu modifizieren,
  // da wir jetzt eine globale Lösung mit message-header.css haben

  // CSS-Variablen setzen
  const dynamicStyles = {
    '--aok-primary': primaryColor,
    '--aok-secondary': secondaryColor,
    '--aok-primary-rgb': primaryColor.startsWith('#') ?
      `${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}` :
      '0, 110, 59',
    '--aok-secondary-rgb': secondaryColor.startsWith('#') ?
      `${parseInt(secondaryColor.slice(1, 3), 16)}, ${parseInt(secondaryColor.slice(3, 5), 16)}, ${parseInt(secondaryColor.slice(5, 7), 16)}` :
      '139, 193, 0',
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

    // Verarbeiten der Links
    let newContent = processHtmlWithLinks(content);

    // Entfernen der aok-short-answer p-Tags, da wir die Kurzantwort bereits extrahiert haben
    // und separat anzeigen, um Dopplung zu vermeiden
    newContent = newContent.replace(/<p class="aok-short-answer">(.*?)<\/p>/gi, '');

    // Korrigieren von extrem langen Bild-URLs, die den Alt-Text enthalten
    // Beispiel: https://www.aok.de/.../Bild-mit-sehr-langem-alt-text-als-dateiname.jpg
    newContent = newContent.replace(/background-image: url\(['"](https:\/\/www\.aok\.de\/.*?\/).*?-[A-Za-z0-9-]{50,}\.(jpg|png|gif|jpeg)['"]/gi,
                                   'background-image: url("$1aok-image.$2")');

    // Korrigieren von falschen Link-Strukturen
    // Wenn ein Link nicht der korrekten AOK-Struktur entspricht, auf die Hauptseite umleiten
    newContent = newContent.replace(/href="https:\/\/www\.aok\.de\/pk\/(?!leistungen|chronische-erkrankungen|vorsorge|kontakt|faq|magazin|fileadmin)[^"]*"/gi,
                                   'href="https://www.aok.de/"');

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
            console.log('AOK Template: Finale Höhe gemessen:', height);
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
      console.log('AOK Template: Verwende feste Höhe:', finalHeight);
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
      className={`aok-message ${isComplete ? 'aok-complete' : ''}`}
      style={containerStyle}
    >
      {/* Keine Nachrichtensteuerung mehr hier, wird jetzt in der Message-Komponente angezeigt */}

      {/* Kurzantwort anzeigen (ganz oben) */}
      {shortAnswer && (
        <div className="aok-short-answer">
          {shortAnswer}
        </div>
      )}

      {/* Inhalt mit korrigierten Links */}
      <div
        className="aok-content"
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
        <div className="aok-streaming-indicator">
          <div className="aok-typing-dot"></div>
          <div className="aok-typing-dot"></div>
          <div className="aok-typing-dot"></div>
        </div>
      )}
    </div>
  );
};

export default AOKMessage;