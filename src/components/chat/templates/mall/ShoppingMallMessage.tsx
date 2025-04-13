'use client';

import React, { useRef, useMemo } from 'react';
import { useMallContentStreaming } from './hooks/useMallContentStreaming';
import { addFollowUpQuestions } from './utils/followUpQuestions';
import MallCard from './components/MallCard';
import MallSlider from './components/MallSlider';
import MallDataSection from './components/MallDataSection';
import IconShopSlider from './components/IconShopSlider';
import './styles/mall-styles.css';

interface ShoppingMallMessageProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode;
  colorStyle?: Record<string, string>;
  isComplete: boolean;
  query?: string;
}

/**
 * Verbesserte Shopping-Mall-Komponente mit dreistufiger Struktur:
 * 1. Intro: Direkte Antwort auf die Frage
 * 2. Data: Strukturierte Daten in Slider-Form
 * 3. Tip: Mehrwert-Tipp als Ergänzung
 *
 * Das neue Design folgt dem im Prompt beschriebenen dreistufigen Aufbau für Shopping-Mall-Antworten,
 * mit klarem Fokus auf stabile Darstellung und optimiertem UX durch horizontale Slider.
 */
const ShoppingMallMessage: React.FC<ShoppingMallMessageProps> = ({
  content,
  isStreaming = false,
  colorStyle,
  isComplete: forceComplete = false,
  query = ''
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Verarbeite den Content mit minimalen State-Updates
  const processedContent = useMemo(() =>
    addFollowUpQuestions(content, query),
  [content, query]);

  // Content-Hook mit minimaler Verarbeitung
  const { sections } = useMallContentStreaming(
    processedContent,
    isStreaming && !forceComplete,
    query
  );

  // Setze CSS-Variablen für dynamisches Theming
  const rootStyle = {
    '--mall-primary': colorStyle?.primaryColor || '#3b1c60',
    '--mall-secondary': colorStyle?.secondaryColor || '#ff5a5f'
  } as React.CSSProperties;

  // Farbvariablen für Komponenten die kein CSS-Variablen unterstützen
  const primaryColor = colorStyle?.primaryColor || '#3b1c60';
  const secondaryColor = colorStyle?.secondaryColor || '#ff5a5f';

  // Fallback für leeren Content
  if (sections.length === 0 && content) {
    return (
      <div ref={contentRef} className="mall-message" style={rootStyle}>
        <div className="mall-intro"
             dangerouslySetInnerHTML={{ __html: content.replace(/<\/?html>/g, '') }} />
      </div>
    );
  }

  // Extrahiere die wichtigen Sektionstypen
  const introSection = sections.find(s => s.type === 'intro');
  const tipSection = sections.find(s => s.type === 'tip');
  const shopSections = sections.filter(s => s.type === 'shops');
  const restaurantSections = sections.filter(s => s.type === 'restaurants');
  const eventSections = sections.filter(s => s.type === 'events');
  const otherSections = sections.filter(s =>
    !['intro', 'shops', 'restaurants', 'events', 'tip'].includes(s.type));

  // Hauptkomponente rendern
  return (
    <div ref={contentRef} className="mall-message" style={rootStyle}>
      {/* 1. INTRO: Direkte Antwort */}
      {introSection && introSection.content && (
        <div className="mall-intro"
             dangerouslySetInnerHTML={{ __html: introSection.content }} />
      )}

      {/* 2. DATA: Strukturierte Daten */}
      <MallDataSection>
        {/* Shops-Slider */}
        {shopSections.map((section, sectionIndex) => (
          section.items && section.items.length > 0 && (
            <IconShopSlider
              key={`shop-section-${sectionIndex}`}
              title={section.title || 'Shops'}
              shops={section.items}
              isStreaming={isStreaming}
            />
          )
        ))}

        {/* Restaurants-Slider */}
        {restaurantSections.map((section, sectionIndex) => (
          section.items && section.items.length > 0 && (
            <MallSlider
              key={`restaurant-section-${sectionIndex}`}
              title={section.title || 'Gastronomie'}
            >
              {section.items.map((restaurant, restaurantIndex) => (
                <MallCard
                  key={`restaurant-${sectionIndex}-${restaurantIndex}`}
                  name={restaurant.name}
                  image={restaurant.image}
                  category={restaurant.category}
                  floor={restaurant.floor}
                  opening={restaurant.opening}
                  description={restaurant.description}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              ))}
            </MallSlider>
          )
        ))}

        {/* Events-Slider */}
        {eventSections.map((section, sectionIndex) => (
          section.items && section.items.length > 0 && (
            <MallSlider
              key={`event-section-${sectionIndex}`}
              title={section.title || 'Events'}
            >
              {section.items.map((event, eventIndex) => (
                <MallCard
                  key={`event-${sectionIndex}-${eventIndex}`}
                  name={event.name}
                  image={event.image}
                  date={event.date}
                  description={event.description}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              ))}
            </MallSlider>
          )
        ))}

        {/* Andere Sektionen (wie Öffnungszeiten, Parken, etc.) */}
        {otherSections.map((section, sectionIndex) => (
          section.content && (
            <div key={`other-section-${sectionIndex}`}>
              {section.title && <h3>{section.title}</h3>}
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          )
        ))}
      </MallDataSection>

      {/* 3. TIP: Mehrwert-Tipp */}
      {tipSection && tipSection.content && (
        <div className="mall-tip"
             dangerouslySetInnerHTML={{ __html: tipSection.content }} />
      )}
    </div>
  );
};

export default ShoppingMallMessage;