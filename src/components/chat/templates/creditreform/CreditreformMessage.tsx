'use client';

import React, { useEffect, useRef } from 'react';
import { processHtmlContent } from '../utils';

interface CreditreformMessageProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode; // Wird nicht mehr verwendet, bleibt für Abwärtskompatibilität
  colorStyle?: Record<string, string>;
  isComplete?: boolean;
}

/**
 * Creditreform-spezifische Message-Komponente
 * Zeigt Nachrichten im Corporate Design der Creditreform an
 */
const CreditreformMessage: React.FC<CreditreformMessageProps> = ({
  content,
  isStreaming = false,
  messageControls,
  colorStyle
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // HTML-Inhalt verarbeiten, um spezielle Sektionen zu extrahieren
  const {
    hasKeyFacts,
    keyFactsContent,
    hasContactInfo,
    contactInfoContent,
    hasInfoBox,
    infoBoxContent,
    regularContent
  } = processHtmlContent(content);

  // Farben aus Bot-Settings
  const colorVars = {
    '--creditreform-primary': colorStyle?.primaryColor || '#243b55', // Die Primärfarbe aus den Bot-Settings
    '--creditreform-secondary': colorStyle?.botAccentColor || '#141E30', // Die Akzentfarbe als dunkleres Blau
    '--creditreform-accent': colorStyle?.botAccentColor || '#004B9B', // Die Akzentfarbe für Links und Highlights
    '--creditreform-light': '#f0f4f8', // Heller Hintergrund
    '--creditreform-text': colorStyle?.botTextColor || '#333333', // Text-Farbe aus Bot-Settings
    '--creditreform-highlight': '#e74c3c', // Highlight-Farbe für Warnungen
  };

  // Nach dem Rendern spezielle Elemente verbessern
  useEffect(() => {
    if (!contentRef.current) return;

    // Buttons im Creditreform-Stil formatieren
    const buttons = contentRef.current.querySelectorAll('a[href^="#"]');
    buttons.forEach(button => {
      if (!button.classList.contains('creditreform-button')) {
        button.classList.add('creditreform-button');
      }
    });

    // Kontakt-Links mit speziellen Klassen versehen
    const telLinks = contentRef.current.querySelectorAll('a[href^="tel:"]');
    telLinks.forEach(link => {
      link.classList.add('creditreform-tel-link');
    });

    const mailLinks = contentRef.current.querySelectorAll('a[href^="mailto:"]');
    mailLinks.forEach(link => {
      link.classList.add('creditreform-mail-link');
    });
  }, [content]);

  // Kurzantwort extrahieren - prüft zuerst auf reinen Text am Anfang
  const getShortAnswer = () => {
    if (!content || !regularContent) return null;

    // Strategie 1: Extrahiere Text bis zum ersten HTML-Tag
    const firstTagMatch = content.match(/^(.*?)(<\/?div|<\/?p|<\/?h|<br)/i);
    if (firstTagMatch && firstTagMatch[1]?.trim()) {
      return firstTagMatch[1].trim();
    }

    // Strategie 2: Extrahiere den ersten Paragraphen
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = regularContent;
    const firstParagraph = tempDiv.querySelector('p');

    if (firstParagraph && firstParagraph.textContent) {
      return firstParagraph.textContent;
    }

    return null;
  };

  const shortAnswer = getShortAnswer();

  // Key Facts separat rendern, falls vorhanden
  const renderKeyFacts = () => {
    if (!hasKeyFacts || !keyFactsContent) return null;

    return (
      <div className="creditreform-keyfacts" style={colorVars as React.CSSProperties}>
        <h4>Wichtige Informationen</h4>
        <div
          className="creditreform-list"
          dangerouslySetInnerHTML={{ __html: keyFactsContent }}
        />
      </div>
    );
  };

  // Service/Kontakt-Sektion separat rendern, falls vorhanden
  const renderContactInfo = () => {
    if (!hasContactInfo || !contactInfoContent) return null;

    return (
      <div className="creditreform-service-section" style={colorVars as React.CSSProperties}>
        <div
          className="creditreform-contact"
          dangerouslySetInnerHTML={{ __html: contactInfoContent }}
        />
      </div>
    );
  };

  // Allgemeine Info-Box separat rendern, falls vorhanden
  const renderInfoBox = () => {
    if (!hasInfoBox || !infoBoxContent) return null;

    return (
      <div className="creditreform-info" style={colorVars as React.CSSProperties}>
        <div dangerouslySetInnerHTML={{ __html: infoBoxContent }} />
      </div>
    );
  };

  // Bereinigten regulären Inhalt rendern (ohne Kurzantwort)
  const renderRegularContent = () => {
    if (!regularContent) return null;

    // Wenn wir eine Kurzantwort haben und diese aus dem ersten Paragraphen stammt,
    // entfernen wir den ersten Paragraphen aus dem regulären Inhalt
    if (shortAnswer) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = regularContent;
      const firstParagraph = tempDiv.querySelector('p');

      if (firstParagraph && firstParagraph.textContent === shortAnswer) {
        firstParagraph.remove();
        return tempDiv.innerHTML;
      }
    }

    return regularContent;
  };

  const cleanedRegularContent = renderRegularContent();

  return (
    <div className="creditreform-message" ref={contentRef} style={colorVars as React.CSSProperties}>
      {/* Keine Nachrichtensteuerung mehr hier, wird jetzt in der Message-Komponente angezeigt */}

      {/* ZUERST: Kurzantwort anzeigen */}
      {shortAnswer && (
        <div className="creditreform-short-answer">
          {shortAnswer}
        </div>
      )}

      {/* Spezielle Sektionen */}
      {renderKeyFacts()}
      {renderContactInfo()}
      {renderInfoBox()}

      {/* Regulärer Inhalt (bereinigt) */}
      {cleanedRegularContent && (
        <div
          className="creditreform-regular-content"
          dangerouslySetInnerHTML={{ __html: cleanedRegularContent }}
        />
      )}

      {/* Streaming-Indikator */}
      {isStreaming && (
        <div className="creditreform-streaming-indicator">...</div>
      )}
    </div>
  );
};

export default CreditreformMessage;