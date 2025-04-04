'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useMallContentStreaming } from './hooks/useMallContentStreaming';
import MallHeader from './components/MallHeader';
import MallIntroSection from './components/MallIntroSection';
import ShopSlider from './components/ShopSlider';
import RestaurantSlider from './components/RestaurantSlider';
import MallTipSection from './components/MallTipSection';
import { MallSectionType } from './utils/contentParser';

// Funktion zum Hinzufügen der globalen Styles
function useGlobalStyles() {
  useEffect(() => {
    // Nur im Browser ausführen
    if (typeof document === 'undefined') return;

    // Prüfen, ob die Styles bereits existieren
    const existingStyle = document.getElementById('mall-animation-styles');
    if (existingStyle) return;

    // Styles erstellen und hinzufügen
    const styleElement = document.createElement('style');
    styleElement.id = 'mall-animation-styles';
    styleElement.innerHTML = `
      @keyframes pulse {
        0%, 100% { transform: scale(0.8); opacity: 0.6; }
        50% { transform: scale(1.2); opacity: 1; }
      }
    `;
    document.head.appendChild(styleElement);

    // Cleanup beim Unmount
    return () => {
      const styleToRemove = document.getElementById('mall-animation-styles');
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, []);
}

interface ShoppingMallMessageProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode; // Wird nicht mehr verwendet, bleibt für Abwärtskompatibilität
  colorStyle?: Record<string, string>;
  isComplete: boolean;
}

/**
 * Shopping-Mall-spezifische Message-Komponente - überarbeitete modulare Version
 * Verarbeitet HTML-Content für Shopping-Center-Antworten mit speziellen Layouts
 */
const ShoppingMallMessage: React.FC<ShoppingMallMessageProps> = ({
  content,
  isStreaming = false,
  messageControls,
  colorStyle,
  isComplete: forceComplete = false
}) => {
  // Globale Styles für Animationen hinzufügen
  useGlobalStyles();

  // Verarbeite den Content mit dem Streaming-Hook
  const { sections, isComplete: hookIsComplete, processedHtml } = useMallContentStreaming(content, isStreaming && !forceComplete);

  // Lokaler State für isComplete, um mehr Kontrolle zu haben
  const [isComplete, setIsComplete] = useState(!isStreaming || forceComplete);

  // Aktualisiere isComplete, wenn sich hookIsComplete ändert
  useEffect(() => {
    setIsComplete(hookIsComplete || forceComplete);
  }, [hookIsComplete, forceComplete]);

  // Sicherheits-Timeout: Setze isComplete nach 3 Sekunden auf true
  useEffect(() => {
    if (isStreaming && !forceComplete) {
      const timer = setTimeout(() => {
        setIsComplete(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [content, isStreaming, forceComplete]);

  // Farben aus Bot-Settings
  const primaryColor = colorStyle?.primaryColor || '#3b1c60';
  const secondaryColor = colorStyle?.secondaryColor || '#ff5a5f';
  const tertiaryColor = colorStyle?.accentColor || '#00c1b5';
  const botBgColor = colorStyle?.botBgColor || '#ffffff';
  const botTextColor = colorStyle?.botTextColor || '#333333';

  // CSS-Variablen setzen
  const dynamicStyles = {
    '--mall-primary': primaryColor,
    '--mall-secondary': secondaryColor,
    '--mall-tertiary': tertiaryColor,
    '--mall-border-radius': '12px',
    '--mall-shadow': 'none',
    '--mall-font': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    '--mall-text': botTextColor,
    '--mall-light-text': '#ffffff',
    '--mall-background': 'transparent',

    // Base styles
    fontFamily: 'var(--mall-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif)',
    lineHeight: '1.6',
    color: 'var(--mall-text, #333333)',
    backgroundColor: 'transparent',
    // Keine Überschreibung von padding oder margin
  } as React.CSSProperties;

  // Nur notwendige CSS-Stile inline definieren, die nicht in der externen CSS-Datei sind
  const inlineCSS = `
    /* Mall Message Base - Nur für Bot-Nachrichten */
    .mall-message {
      font-family: var(--mall-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif);
      line-height: 1.6;
      color: var(--mall-text, #333333);
      /* Keine Überschreibung von background-color, padding oder margin */
    }

    /* Header */
    .mall-message .mall-header {
      background-color: var(--mall-primary, #3b1c60);
      color: var(--mall-light-text, #ffffff);
      padding: 1.5rem;
      text-align: center;
    }

    .mall-message .mall-logo {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }

    .mall-message .mall-subtitle {
      font-size: 1rem;
      margin: 0.5rem 0 0;
      opacity: 0.9;
    }

    /* Intro */
    .mall-message .mall-intro {
      margin: 1.5rem;
      font-size: 1.1rem;
      line-height: 1.5;
    }

    /* Sections */
    .mall-message .mall-section {
      margin: 1.5rem 0;
      padding: 0 1.5rem;
    }

    .mall-message .mall-section-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--mall-primary, #3b1c60);
      margin: 0 0 1.25rem 1.5rem;
    }

    /* Shop Slider */
    .mall-message .mall-shops-slider {
      margin: 0;
      padding: 0 1.5rem;
      overflow-x: auto;
      display: flex;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }

    /* Shop Card */
    .mall-message .mall-shop-card {
      flex: 0 0 auto;
      width: 220px;
      height: 280px;
      margin-right: 1rem;
      border-radius: var(--mall-border-radius, 12px);
      box-shadow: var(--mall-shadow, 0 4px 15px rgba(0, 0, 0, 0.08));
      overflow: hidden;
      background-color: white;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .mall-message .mall-shop-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--mall-shadow, 0 8px 20px rgba(0, 0, 0, 0.12));
    }

    .mall-message .mall-shop-image {
      width: 100%;
      height: 130px;
      background-color: #eee;
      object-fit: cover;
    }

    .mall-message .mall-shop-content {
      padding: 1rem;
    }

    .mall-message .mall-shop-name {
      font-weight: 600;
      font-size: 1.1rem;
      margin: 0 0 0.5rem 0;
      color: var(--mall-primary, #3b1c60);
    }

    .mall-message .mall-shop-category {
      font-size: 0.85rem;
      color: #777;
      margin: 0 0 0.5rem 0;
    }

    .mall-message .mall-shop-floor {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--mall-secondary, #ff5a5f);
      margin: 0 0 0.5rem 0;
    }

    .mall-message .mall-shop-opening {
      font-size: 0.85rem;
      color: #555;
      margin: 0;
    }

    .mall-message .mall-shop-description {
      font-size: 0.9rem;
      margin: 0.5rem 0 0;
    }

    /* Restaurant/Food Cards */
    .mall-message .mall-food-section {
      background-color: rgba(0, 0, 0, 0.02);
      padding: 1.5rem 0;
      margin: 1.5rem 0;
    }

    .mall-message .mall-food-slider {
      margin: 0;
      padding: 0 1.5rem;
      overflow-x: auto;
      display: flex;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }

    .mall-message .mall-food-card {
      flex: 0 0 auto;
      width: 260px;
      margin-right: 1rem;
      border-radius: var(--mall-border-radius, 12px);
      box-shadow: var(--mall-shadow, 0 4px 15px rgba(0, 0, 0, 0.08));
      overflow: hidden;
      background-color: white;
      transition: transform 0.2s ease-in-out;
    }

    .mall-message .mall-food-image {
      width: 100%;
      height: 150px;
      background-color: #eee;
      object-fit: cover;
    }

    .mall-message .mall-food-content {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .mall-message .mall-food-name {
      font-weight: 600;
      font-size: 1.1rem;
      margin: 0 0 0.5rem 0;
      color: var(--mall-primary, #3b1c60);
    }

    .mall-message .mall-food-description {
      font-size: 0.9rem;
      margin: 0 0 0.5rem 0;
    }

    .mall-message .mall-food-floor {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--mall-secondary, #ff5a5f);
      margin: 0.5rem 0 0;
    }

    .mall-message .mall-food-hours {
      font-size: 0.85rem;
      color: #555;
      margin: 0.3rem 0 0;
    }

    /* Generic Sections */
    .mall-message .mall-generic-section {
      padding: 0 1.5rem;
      margin: 1.5rem 0;
    }

    /* Loading & Streaming States */
    .mall-message .mall-loading {
      padding: 1.5rem;
      text-align: center;
      color: #777;
      font-style: italic;
    }

    .mall-message .mall-streaming-indicator {
      padding: 0.5rem 1.5rem;
      text-align: center;
      color: var(--mall-primary, #3b1c60);
      font-size: 1.5rem;
      animation: mall-pulse 1.5s infinite ease-in-out;
    }

    @keyframes mall-pulse {
      0% { opacity: 0.3; }
      50% { opacity: 1; }
      100% { opacity: 0.3; }
    }

    /* Responsive Adjustments */
    @media (max-width: 768px) {
      .mall-message .mall-shop-card {
        width: 180px;
        height: 250px;
      }

      .mall-message .mall-food-card {
        width: 220px;
      }

      .mall-message .mall-logo {
        font-size: 1.5rem;
      }

      .mall-message .mall-section-title {
        font-size: 1.2rem;
      }
    }
  `;

  // Fallback-Rendering wenn keine Sektionen gefunden wurden
  if (sections.length === 0 && content) {
    return (
      <div className="mall-message" style={dynamicStyles}>
        {/* Inline-CSS statt externer Datei */}
        <style dangerouslySetInnerHTML={{ __html: inlineCSS }} />
        {/* Keine Nachrichtensteuerung mehr hier, wird jetzt in der Message-Komponente angezeigt */}

        {/* Fallback: Original-Content anzeigen */}
        <div dangerouslySetInnerHTML={{ __html: content }} />

        {/* Streaming-Indikator */}
        {!isComplete && (
          <div className="mall-streaming-indicator">...</div>
        )}
      </div>
    );
  }

  return (
    <div className="mall-message" style={dynamicStyles}>
      {/* Inline-CSS statt externer Datei */}
      <style dangerouslySetInnerHTML={{ __html: inlineCSS }} />
      {/* Keine Nachrichtensteuerung mehr hier, wird jetzt in der Message-Komponente angezeigt */}

      {/* Komponenten basierend auf erkannten Sektionen rendern */}
      <Suspense fallback={<div className="mall-loading">Wird geladen...</div>}>
        {sections.map((section, index) => {
          // Jede Sektion basierend auf ihrem Typ rendern
          switch (section.type) {
            case 'header':
              // Header nicht mehr anzeigen
              return null;

            case 'intro':
              return (
                <MallIntroSection
                  key={`section-${index}-intro`}
                  content={section.content || ''}
                />
              );

            case 'shops':
              return (
                <ShopSlider
                  key={`section-${index}-shops`}
                  title={section.title}
                  shops={section.items || []}
                />
              );

            case 'restaurants':
              return (
                <RestaurantSlider
                  key={`section-${index}-restaurants`}
                  title={section.title}
                  restaurants={section.items || []}
                />
              );

            case 'services':
              return (
                <ShopSlider
                  key={`section-${index}-services`}
                  title={section.title}
                  shops={section.items || []}
                />
              );

            case 'tip':
              return (
                <MallTipSection
                  key={`section-${index}-tip`}
                  title={section.title}
                  content={section.content || ''}
                />
              );

            default:
              // Für unbekannte Sektionstypen den Inhalt direkt anzeigen
              return (
                <div
                  key={`section-${index}-other`}
                  style={{
                    padding: '0.5rem 0',
                    margin: '0.5rem 0'
                  }}
                  dangerouslySetInnerHTML={{ __html: section.content || '' }}
                />
              );
          }
        })}
      </Suspense>

      {/* Verbesserter Streaming-Indikator - nur anzeigen, wenn wirklich Streaming aktiv ist */}
      {!isComplete && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            gap: '0.5rem'
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--mall-primary, #3b1c60)',
              opacity: 0.6,
              animation: 'pulse 1.5s infinite ease-in-out'
            }}
          ></div>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--mall-primary, #3b1c60)',
              opacity: 0.6,
              animation: 'pulse 1.5s infinite ease-in-out',
              animationDelay: '0.2s'
            }}
          ></div>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--mall-primary, #3b1c60)',
              opacity: 0.6,
              animation: 'pulse 1.5s infinite ease-in-out',
              animationDelay: '0.4s'
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ShoppingMallMessage;