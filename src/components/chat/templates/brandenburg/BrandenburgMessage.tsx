'use client';

import React, { useEffect, useRef, useState, useLayoutEffect, useMemo } from 'react';

interface BrandenburgMessageProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode;
  colorStyle?: Record<string, string>;
  isComplete: boolean;
}

/**
 * Brandenburg-spezifische Message-Komponente
 * Kümmert sich um das Styling und die Struktur von Brandenburg-Nachrichten
 */
const BrandenburgMessage: React.FC<BrandenburgMessageProps> = ({
  content,
  isStreaming = false,
  messageControls,
  colorStyle,
  isComplete
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState('');
  const [lastProcessedContent, setLastProcessedContent] = useState('');
  const [isRendered, setIsRendered] = useState(false);
  const [finalHeight, setFinalHeight] = useState<number | null>(null);

  // Farben aus Bot-Settings
  const primaryColor = colorStyle?.primaryColor || '#003c8e';
  const secondaryColor = colorStyle?.secondaryColor || '#9c132d';

  // CSS-Variablen setzen
  const dynamicStyles = {
    '--brandenburg-primary': primaryColor,
    '--brandenburg-secondary': secondaryColor,
  } as React.CSSProperties;

  // Funktion zum Verarbeiten von Links im HTML
  const processHtmlWithLinks = (html: string): string => {
    if (!html) return '';

    // Nur clientseitig ausführen (DOMParser ist nur im Browser verfügbar)
    if (typeof window === 'undefined') return html;

    try {
      // Einfache DOM-Manipulation mit DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

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
          link.classList.add('brandenburg-tel-link');
        } else if (href?.startsWith('mailto:')) {
          link.classList.add('brandenburg-mail-link');
        }
      });

      // Konvertieren des veränderten DOMs zurück zu HTML
      return doc.body.innerHTML;
    } catch (error) {
      console.error('Fehler bei der Link-Verarbeitung:', error);
      return html; // Bei Fehler den ursprünglichen HTML-String zurückgeben
    }
  };

  // Funktion, um die alte HTML-Struktur in die neue zu konvertieren
  const convertHtmlToNewStructure = (html: string) => {
    if (!html) return html;

    try {
      // Zuerst Links verarbeiten
      let newHtml = processHtmlWithLinks(html);

    // Logo und Titel NICHT automatisch hinzufügen, um Bot-Header nicht zu überschreiben
    // Der Header wird bereits vom Chat-System verwaltet
    // if (!newHtml.includes('brandenburg-header')) {
    //   newHtml = `
    //     <div class="brandenburg-header">
    //       <h1 class="brandenburg-logo">Stadt Brandenburg.</h1>
    //       <p class="brandenburg-subtitle">Willkommen an der Havel</p>
    //     </div>
    //   ` + newHtml;
    // }

    // "Aktuelle Informationen" in "Auf einen Blick" umwandeln
    newHtml = newHtml.replace(
      /<div.*?Aktuelle Informationen.*?<\/div>/i,
      '<div class="brandenburg-blick"><div class="brandenburg-blick-title">Auf einen Blick:</div>'
    );

    // Die alte "Wichtige Informationen:" in Titel für die Info-Box umwandeln
    newHtml = newHtml.replace(
      /<div.*?Wichtige Informationen:.*?<\/div>/i,
      '<div class="brandenburg-info-title">Wichtige Informationen:</div>'
    );

    // Die Schnellüberblick-Box in die neue brandenburg-blick-Klasse umwandeln
    newHtml = newHtml.replace(
      /<div class="schnellueberblick">([\s\S]*?)<\/div>/gi,
      '<div class="brandenburg-blick"><div class="brandenburg-blick-title">Auf einen Blick:</div>$1</div>'
    );

    // Die keyfacts-Box in die neue brandenburg-info-box-Klasse umwandeln
    newHtml = newHtml.replace(
      /<div class="keyfacts">([\s\S]*?)<h4>(.*?)<\/h4>([\s\S]*?)<\/div>/gi,
      '<div class="brandenburg-info-box"><div class="brandenburg-info-title">Wichtige Informationen:</div>$3</div>'
    );

    // Die tipp-Box in die neue brandenburg-tipp-Klasse umwandeln
    newHtml = newHtml.replace(
      /<div class="tipp">([\s\S]*?)<\/div>/gi,
      '<div class="brandenburg-tipp">$1</div>'
    );

    // Wandle spezifische Listen-Elemente in Info-Items um
    // Ort
    newHtml = newHtml.replace(
      /📍 Ort:(.*?)(?=<\/li>|<br>)/gi,
      '<div class="brandenburg-info-item"><span class="brandenburg-info-item-icon">📍</span><span class="brandenburg-info-item-label">Ort:</span><span class="brandenburg-info-item-value">$1</span></div>'
    );

    // Kontakt
    newHtml = newHtml.replace(
      /📞 Kontakt Bürgerservice:(.*?)(?=<\/li>|<br>)/gi,
      '<div class="brandenburg-info-item"><span class="brandenburg-info-item-icon">📞</span><span class="brandenburg-info-item-label">Kontakt Bürgerservice:</span><span class="brandenburg-info-item-value">$1</span></div>'
    );

    // Kosten
    newHtml = newHtml.replace(
      /💰 Kosten für neuen Personalausweis:(.*?)(?=<\/li>|<br>)/gi,
      '<div class="brandenburg-info-item"><span class="brandenburg-info-item-icon">💰</span><span class="brandenburg-info-item-label">Kosten für neuen Personalausweis:</span><span class="brandenburg-info-item-value">$1</span></div>'
    );

    // Bearbeitungsdauer
    newHtml = newHtml.replace(
      /⏱️ Bearbeitungsdauer:(.*?)(?=<\/li>|<br>)/gi,
      '<div class="brandenburg-info-item"><span class="brandenburg-info-item-icon">⏱️</span><span class="brandenburg-info-item-label">Bearbeitungsdauer:</span><span class="brandenburg-info-item-value">$1</span></div>'
    );

    // Allgemeine Formatierung für bestimmte Listenelemente mit starkem Icon-Format
    newHtml = newHtml.replace(
      /<li><strong>(📍|🕒|📞|📧|🔗|💰|⏱️) (.*?)<\/strong>(.*?)<\/li>/gi,
      '<div class="brandenburg-info-item"><span class="brandenburg-info-item-icon">$1</span><span class="brandenburg-info-item-label">$2</span><span class="brandenburg-info-item-value">$3</span></div>'
    );

    // Nummerierte Überschriften erstellen
    let sectionCounter = 1;
    newHtml = newHtml.replace(
      /<h3>(.*?)<\/h3>/gi,
      (match, title) => {
        return `<div class="brandenburg-section"><h3 class="brandenburg-section-title">${sectionCounter++}. ${title}</h3>`;
      }
    );

    // Überprüfe auf Überschriften, die bereits nummeriert sind, und entferne die doppelte Nummerierung
    newHtml = newHtml.replace(
      /<h3 class="brandenburg-section-title">(\d+)\. (\d+)\.(.*?)<\/h3>/gi,
      '<h3 class="brandenburg-section-title">$1. $3</h3>'
    );

    // Wickle Absätze außerhalb von Klassen in brandenburg-intro
    newHtml = newHtml.replace(/<p>([\s\S]*?)<\/p>/gi, (match, content) => {
      // Wenn der Match nicht innerhalb einer brandenburg-* Klasse ist
      if (!match.includes('brandenburg-')) {
        return `<p class="brandenburg-intro">${content}</p>`;
      }
      return match;
    });

    // Schließe Abschnitte korrekt
    newHtml = newHtml.replace(/<h3 class="brandenburg-section-title">/gi, '</div><div class="brandenburg-section"><h3 class="brandenburg-section-title">');

    // Entferne den ersten schließenden div-Tag, falls vorhanden
    newHtml = newHtml.replace(/^<\/div>/, '');

    // Füge einen schließenden div-Tag am Ende hinzu, wenn Abschnitte vorhanden sind
    if (newHtml.includes('<div class="brandenburg-section">')) {
      newHtml = newHtml + '</div>';
    }

    // Umschließe die wichtigen Informationen mit einer info-box, falls noch nicht geschehen
    if (newHtml.includes('<div class="brandenburg-info-title">') && !newHtml.includes('<div class="brandenburg-info-box">')) {
      newHtml = newHtml.replace(
        /<div class="brandenburg-info-title">([\s\S]*?)(?=<div class="brandenburg-section">|<div class="brandenburg-tipp">|$)/i,
        '<div class="brandenburg-info-box"><div class="brandenburg-info-title">$1</div>'
      );

      // Schließen der info-box
      if (newHtml.includes('<div class="brandenburg-info-box">')) {
        const lastSectionIndex = newHtml.lastIndexOf('<div class="brandenburg-section">');
        const lastTippIndex = newHtml.lastIndexOf('<div class="brandenburg-tipp">');

        let insertIndex;
        if (lastSectionIndex > 0 && lastTippIndex > 0) {
          insertIndex = Math.min(lastSectionIndex, lastTippIndex);
        } else if (lastSectionIndex > 0) {
          insertIndex = lastSectionIndex;
        } else if (lastTippIndex > 0) {
          insertIndex = lastTippIndex;
        } else {
          insertIndex = newHtml.length;
        }

        if (insertIndex > 0) {
          newHtml = newHtml.substring(0, insertIndex) + '</div>' + newHtml.substring(insertIndex);
        }
      }
    }

    // Füge spezielle Formatierung für Tipps hinzu
    newHtml = newHtml.replace(
      /Wichtig:([\s\S]*?)(?=<\/p>|<\/div>)/gi,
      '<div class="brandenburg-tipp"><p>Wichtig:$1</p></div>'
    );

    return newHtml;
    } catch (error) {
      console.error('Fehler bei der HTML-Konvertierung:', error);
      return html; // Bei Fehler den ursprünglichen HTML-String zurückgeben
    }
  };

  // Die processHtmlWithLinks-Funktion ist bereits oben definiert

  // Verarbeitung des Inhalts mit useLayoutEffect für synchrones Rendering
  useLayoutEffect(() => {
    // Nur ausführen, wenn im Browser und Content vorhanden
    if (typeof window === 'undefined' || !content || content === lastProcessedContent) return;

    setLastProcessedContent(content);

    try {
      // Immer die vollständige Verarbeitung verwenden, um das Layout konsistent zu halten
      let newContent = convertHtmlToNewStructure(content);

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
            console.log('Finale Höhe gemessen:', height);
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
  }, [content, lastProcessedContent, isStreaming, isComplete]);

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
      console.log('Verwende feste Höhe:', finalHeight);
    } else {
      // Sonst verwenden wir eine Mindesthöhe
      style.minHeight = '100px';
      console.log('Verwende Mindesthöhe');
    }

    return style;
  }, [dynamicStyles, finalHeight, isStreaming, isComplete]);

  // Optimiertes Rendering mit fester Höhe nach Abschluss
  return (
    <div
      ref={contentRef}
      className={`brandenburg-message ${isComplete ? 'brandenburg-complete' : ''}`}
      style={containerStyle}
    >
      {/* Content mit der neuen HTML-Struktur und Links */}
      <div
        className="brandenburg-content"
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
        <div className="brandenburg-streaming-indicator">...</div>
      )}
    </div>
  );
};

export default BrandenburgMessage;