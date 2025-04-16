'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { MallSection } from '../utils/contentParser';
import FluidShopSlider from './FluidShopSlider';
import FluidRestaurantSlider from './FluidRestaurantSlider';
import FluidEventSlider from './FluidEventSlider';
import FluidServiceSlider from './FluidServiceSlider';
import FluidOpeningHoursCard from './FluidOpeningHoursCard';
import FluidParkingCard from './FluidParkingCard';
import { sanitizeHtml, sanitizeFollowUpContent } from '../utils/htmlSanitizer';

interface FluidMallMessageProps {
  sections: MallSection[];
  isStreaming: boolean;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

// Memoized Komponenten für bessere Performance
const MemoizedShopSlider = memo(FluidShopSlider);
const MemoizedRestaurantSlider = memo(FluidRestaurantSlider);
const MemoizedEventSlider = memo(FluidEventSlider);
const MemoizedServiceSlider = memo(FluidServiceSlider);
const MemoizedOpeningHoursCard = memo(FluidOpeningHoursCard);
const MemoizedParkingCard = memo(FluidParkingCard);

// Memoized HTML-Content-Komponente
const SanitizedHtmlContent = memo(({ content }: { content: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
});

// Memoized Follow-Up-Content-Komponente
const SanitizedFollowUpContent = memo(({ content }: { content: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeFollowUpContent(content) }} />;
});

/**
 * Eine flüssige Mall-Nachricht mit optimiertem Streaming-Verhalten
 *
 * Diese Komponente verwendet fortschrittliche Techniken für ein nahtloses
 * Streaming-Erlebnis ohne Flackern oder Layout-Sprünge.
 *
 * Optimiert mit React.memo und useMemo für maximale Rendering-Stabilität.
 */
const FluidMallMessage: React.FC<FluidMallMessageProps> = ({
  sections,
  isStreaming,
  colorStyle = {
    primaryColor: '#3b1c60',
    secondaryColor: '#ff5a5f'
  }
}) => {
  // Stellen sicher, dass sections immer ein Array ist
  const sectionsArray = Array.isArray(sections) ? sections : [];

  // State für Animation und Tracking mit verzögerter Aktualisierung
  const [visibleSections, setVisibleSections] = useState<MallSection[]>([]);

  // Ref für den letzten Sections-Array-Zustand
  const [lastSectionsLength, setLastSectionsLength] = useState(0);

  // Effekt für sanfte Übergänge beim Streaming mit Stabilisierung
  useEffect(() => {
    // Nur aktualisieren, wenn sich die Anzahl der Sektionen geändert hat
    // oder wenn das Streaming beendet wurde
    if (sectionsArray.length !== lastSectionsLength || !isStreaming) {
      // Reduzierte Verzögerung für schnellere Anzeige
      const delay = isStreaming ? 50 : 0;

      const timer = setTimeout(() => {
        setVisibleSections(sectionsArray);
        setLastSectionsLength(sectionsArray.length);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [sectionsArray, isStreaming, lastSectionsLength]);

  // Memoized Styles für Stabilität
  const containerStyle = useMemo((): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '1.5rem',
    '--primary-color': colorStyle.primaryColor,
    '--secondary-color': colorStyle.secondaryColor,
    // Stabilisierungseigenschaften
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'contents',
    contain: 'content',
  } as React.CSSProperties), [colorStyle.primaryColor, colorStyle.secondaryColor]);

  // Memoized Styles für die Intro-Sektion
  const introStyle = useMemo((): React.CSSProperties => ({
    fontSize: '1rem',
    lineHeight: '1.5',
    color: '#333',
    marginBottom: '0.5rem',
    // Stabilisierungseigenschaften
    transform: 'translateZ(0)',
    contain: 'content',
  }), []);

  // Memoized Styles für die Tip-Sektion
  const tipStyle = useMemo((): React.CSSProperties => ({
    fontSize: '1rem',
    lineHeight: '1.5',
    color: '#333',
    padding: '1rem',
    backgroundColor: 'rgba(59, 28, 96, 0.05)',
    borderRadius: '8px',
    borderLeft: '4px solid var(--primary-color)',
    // Stabilisierungseigenschaften
    transform: 'translateZ(0)',
    contain: 'content',
  }), []);

  // Memoized Styles für die FollowUp-Sektion
  const followUpStyle = useMemo((): React.CSSProperties => ({
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: 'rgba(59, 28, 96, 0.05)',
    borderRadius: '8px',
    border: '1px solid var(--primary-color)',
    // Stabilisierungseigenschaften
    transform: 'translateZ(0)',
    contain: 'content',
  }), []);

  // Memoized Styles für die FollowUp-Überschrift
  const followUpTitleStyle = useMemo((): React.CSSProperties => ({
    fontSize: '1.1rem',
    fontWeight: '600',
    marginTop: 0,
    marginBottom: '0.75rem',
    color: 'var(--primary-color)'
  }), []);

  // Memoized Sektionen für Stabilität
  const {
    introSection,
    shopsSection,
    restaurantsSection,
    eventsSection,
    servicesSection,
    openingHoursSection,
    parkingSection,
    tipSection,
    followUpSection
  } = useMemo(() => {
    return {
      introSection: visibleSections.find(section => section.type === 'intro'),
      shopsSection: visibleSections.find(section => section.type === 'shops'),
      restaurantsSection: visibleSections.find(section => section.type === 'restaurants'),
      eventsSection: visibleSections.find(section => section.type === 'events'),
      servicesSection: visibleSections.find(section => section.type === 'services'),
      openingHoursSection: visibleSections.find(section => section.type === 'openingHours'),
      parkingSection: visibleSections.find(section => section.type === 'parking'),
      tipSection: visibleSections.find(section => section.type === 'tip'),
      followUpSection: visibleSections.find(section => section.type === 'followUp')
    };
  }, [visibleSections]);

  // Reduzierte Debug-Ausgabe
  if (process.env.NODE_ENV !== 'production') {
    console.log('Rendering FluidMallMessage mit', visibleSections.length, 'Sektionen');
  }

  return (
    <div style={containerStyle} className="fluid-mall-message">
      {/* Intro-Sektion mit stabilem Layout */}
      <div style={introStyle} className="fluid-mall-intro">
        {introSection?.content ? (
          <SanitizedHtmlContent content={introSection.content} />
        ) : isStreaming ? (
          <div style={{ minHeight: '1.5rem' }} />
        ) : null}
      </div>

      {/* Shops-Sektion - nur anzeigen, wenn tatsächlich Shops vorhanden sind */}
      {(shopsSection && shopsSection.items && shopsSection.items.length > 0) && (
        <MemoizedShopSlider
          title={shopsSection?.title || 'Shops'}
          shops={shopsSection?.items || []}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}

      {/* Restaurants-Sektion - nur anzeigen, wenn tatsächlich Restaurants vorhanden sind */}
      {(restaurantsSection && restaurantsSection.items && restaurantsSection.items.length > 0) && (
        <MemoizedRestaurantSlider
          title={restaurantsSection?.title || 'Restaurants'}
          shops={restaurantsSection?.items || []}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}

      {/* Events-Sektion - nur anzeigen, wenn tatsächlich Events vorhanden sind */}
      {(eventsSection && eventsSection.items && eventsSection.items.length > 0) && (
        <MemoizedEventSlider
          title={eventsSection?.title || 'Events'}
          events={eventsSection?.items as any[] || []}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}

      {/* Services-Sektion - nur anzeigen, wenn tatsächlich Services vorhanden sind */}
      {(servicesSection && servicesSection.items && servicesSection.items.length > 0) && (
        <MemoizedServiceSlider
          title={servicesSection?.title || 'Services'}
          services={servicesSection?.items || []}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}

      {/* OpeningHours-Sektion */}
      {openingHoursSection && (
        <MemoizedOpeningHoursCard
          title={openingHoursSection?.title || 'Öffnungszeiten'}
          data={openingHoursSection?.data || null}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}

      {/* Parking-Sektion */}
      {parkingSection && (
        <MemoizedParkingCard
          title={parkingSection?.title || 'Parkgebühren'}
          data={parkingSection?.data || null}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}

      {/* Tip-Sektion */}
      {tipSection && tipSection.content && (
        <div style={tipStyle} className="fluid-mall-tip">
          <SanitizedHtmlContent content={tipSection.content} />
        </div>
      )}

      {/* FollowUp-Sektion */}
      {followUpSection && (
        <div style={followUpStyle} className="fluid-mall-followup">
          <h3 style={followUpTitleStyle}>Weitere Fragen</h3>
          {followUpSection?.content && (
            <div className="follow-up-questions">
              <SanitizedFollowUpContent content={followUpSection.content} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Exportiere eine memoized Version der Komponente
export default memo(FluidMallMessage);
