'use client';

import React, { memo, useMemo, useEffect, useState, useRef } from 'react';
import { useJsonProgressiveStreaming } from './hooks/useJsonProgressiveStreaming.fixed';
import { MallSection } from './utils/contentParser';
import { sanitizeHtml, sanitizeFollowUpContent } from './utils/htmlSanitizer';
import './styles/mall-unified.css';

// Memoized HTML-Content-Komponente
const SanitizedHtmlContent = memo(({ content }: { content: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
});

// Memoized Follow-Up-Content-Komponente
const SanitizedFollowUpContent = memo(({ content }: { content: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeFollowUpContent(content) }} />;
});

// Memoized Komponente für Fortschrittsanzeige
const ProgressBar = memo(({ progress, colorStyle }: {
  progress: number,
  colorStyle: { primaryColor: string, secondaryColor: string }
}) => {
  return (
    <div className="mall-progress-container">
      <div
        className="mall-progress-bar"
        style={{
          width: `${progress}%`,
          backgroundColor: colorStyle.primaryColor
        }}
      />
    </div>
  );
});

// Platzhalter-Komponente für Streaming
const PlaceholderElement = memo(({ type, colorStyle }: {
  type: 'intro' | 'shops' | 'tip',
  colorStyle: { primaryColor: string, secondaryColor: string }
}) => {
  const baseStyle = {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative' as const,
    transform: 'translateZ(0)',
    transition: 'height 0.3s ease-in-out', // Sanfte Übergänge für Höhenänderungen
  };

  const shimmerStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)`,
    animation: 'shimmer 1.5s infinite',
    backgroundSize: '200% 100%',
  };

  let content;
  switch (type) {
    case 'intro':
      content = <div style={{ ...baseStyle, height: '60px', marginBottom: '16px', minHeight: '60px' }}><div style={shimmerStyle} /></div>;
      break;
    case 'shops':
      content = (
        <div style={{ ...baseStyle, height: '220px', marginBottom: '16px', minHeight: '220px' }}>
          <div style={shimmerStyle} />
          {/* Angedeutete Shop-Karten für bessere Visualisierung */}
          <div style={{ display: 'flex', padding: '16px', gap: '16px' }}>
            <div style={{ width: '120px', height: '180px', backgroundColor: '#e0e0e0', borderRadius: '8px' }} />
            <div style={{ width: '120px', height: '180px', backgroundColor: '#e0e0e0', borderRadius: '8px' }} />
            <div style={{ width: '120px', height: '180px', backgroundColor: '#e0e0e0', borderRadius: '8px' }} />
          </div>
        </div>
      );
      break;
    case 'tip':
      content = <div style={{ ...baseStyle, height: '40px', marginBottom: '16px', minHeight: '40px' }}><div style={shimmerStyle} /></div>;
      break;
    default:
      content = null;
  }

  return <div className={`mall-placeholder mall-placeholder-${type}`}>{content}</div>;
});

// Shop-Karte Komponente mit automatischer Höhenanpassung
const ShopCard = memo(({ shop, totalItems = 3 }: { shop: any, totalItems?: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number>(0);

  // Berechne die optimale Breite basierend auf der Anzahl der Items
  const cardWidth = useMemo(() => {
    // Wenn weniger als 3 Items, mache die Karten breiter
    if (totalItems <= 3) {
      return totalItems === 1 ? '100%' : totalItems === 2 ? '48%' : '32%';
    }
    // Standardbreite für 3+ Items
    return '280px';
  }, [totalItems]);

  // Überwache die Höhe des Inhalts und passe die Kartenhöhe an
  useEffect(() => {
    if (cardRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Setze die Höhe mit etwas zusätzlichem Platz
          setCardHeight(entry.contentRect.height + 20);
        }
      });

      observer.observe(cardRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div
      className="mall-shop-card"
      style={{
        width: cardWidth,
        minHeight: Math.max(cardHeight, 250) + 'px', // Mindesthöhe basierend auf Inhalt
        height: 'auto' // Automatische Höhe
      }}
    >
      <div ref={cardRef} className="mall-shop-card-content">
        <img
          src={shop.logo || shop.image || `https://via.placeholder.com/80?text=${encodeURIComponent(shop.name)}`}
          alt={shop.name}
          className="mall-shop-logo"
        />
        <h4 className="mall-shop-name">{shop.name}</h4>
        {shop.category && <p className="mall-shop-category">{shop.category}</p>}
        {shop.floor && <p className="mall-shop-floor">{shop.floor}</p>}
        {shop.description && <p className="mall-shop-description">{shop.description}</p>}
        {shop.opening && <p className="mall-shop-opening">{shop.opening}</p>}
      </div>
    </div>
  );
});

interface MallTemplateRendererProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
  isComplete: boolean;
  query?: string;
}

/**
 * Strikt progressive Mall-Template-Komponente
 *
 * Diese Komponente zeigt Inhalte in einer festen Reihenfolge an:
 * 1. Intro
 * 2. Shops/Restaurants (nach und nach)
 * 3. Tip
 * 4. Follow-up
 */
const ProgressiveMallTemplateRenderer: React.FC<MallTemplateRendererProps> = ({
  content,
  isStreaming = false,
  messageControls,
  colorStyle = {
    primaryColor: '#3b1c60',
    secondaryColor: '#ff5a5f'
  },
  isComplete,
  query = ''
}) => {
  // Verwende den JSON-Streaming-Hook für Content-Verarbeitung
  const { sections, partialSections, progress, hasError } = useJsonProgressiveStreaming(
    content,
    isStreaming,
    query
  );

  // Refs für Timing-Kontrolle
  const lastUpdateRef = useRef<number>(Date.now());
  const visibleItemsRef = useRef<number>(0);

  // States für progressive Anzeige
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [visibleShops, setVisibleShops] = useState<any[]>([]);
  const [visibleRestaurants, setVisibleRestaurants] = useState<any[]>([]);
  const [visibleEvents, setVisibleEvents] = useState<any[]>([]);
  const [showTip, setShowTip] = useState<boolean>(false);
  const [showFollowUp, setShowFollowUp] = useState<boolean>(false);

  // Extrahiere die verschiedenen Sektionstypen aus den kombinierten Sektionen
  const combinedSections = useMemo(() => {
    return sections.length > 0 ? sections : partialSections;
  }, [sections, partialSections]);

  const {
    introSection,
    shopsSection,
    restaurantsSection,
    eventsSection,
    openingHoursSection,
    parkingSection,
    tipSection,
    followUpSection
  } = useMemo(() => {
    return {
      introSection: combinedSections.find(section => section.type === 'intro'),
      shopsSection: combinedSections.find(section => section.type === 'shops'),
      restaurantsSection: combinedSections.find(section => section.type === 'restaurants'),
      eventsSection: combinedSections.find(section => section.type === 'events'),
      openingHoursSection: combinedSections.find(section => section.type === 'openingHours'),
      parkingSection: combinedSections.find(section => section.type === 'parking'),
      tipSection: combinedSections.find(section => section.type === 'tip'),
      followUpSection: combinedSections.find(section => section.type === 'followUp')
    };
  }, [combinedSections]);

  // Effekt für progressives Anzeigen der Inhalte
  useEffect(() => {
    if (!isStreaming && !isComplete) {
      // Wenn nicht mehr gestreamt wird, zeige alles an
      if (introSection) setShowIntro(true);
      if (shopsSection?.items) setVisibleShops(shopsSection.items);
      if (restaurantsSection?.items) setVisibleRestaurants(restaurantsSection.items);
      if (eventsSection?.items) setVisibleEvents(eventsSection.items);
      if (tipSection) setShowTip(true);
      if (followUpSection) setShowFollowUp(true);
      return;
    }

    // Zeige Intro sofort an, wenn verfügbar
    if (introSection && !showIntro) {
      setShowIntro(true);
      lastUpdateRef.current = Date.now();
    }

    // Verzögerung für die nächste Aktualisierung
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    // Nur aktualisieren, wenn genug Zeit vergangen ist (verhindert zu schnelle Updates)
    if (timeSinceLastUpdate < 300) return;

    // Shops nach und nach anzeigen
    if (shopsSection?.items && shopsSection.items.length > visibleShops.length) {
      const nextItemIndex = visibleShops.length;
      if (nextItemIndex < shopsSection.items.length) {
        setVisibleShops(prev => [...prev, shopsSection.items[nextItemIndex]]);
        lastUpdateRef.current = now;
        return; // Nur ein Element pro Update hinzufügen
      }
    }

    // Restaurants nach und nach anzeigen (nur wenn alle Shops bereits angezeigt werden)
    if (visibleShops.length === (shopsSection?.items?.length || 0) &&
        restaurantsSection?.items &&
        restaurantsSection.items.length > visibleRestaurants.length) {
      const nextItemIndex = visibleRestaurants.length;
      if (nextItemIndex < restaurantsSection.items.length) {
        setVisibleRestaurants(prev => [...prev, restaurantsSection.items[nextItemIndex]]);
        lastUpdateRef.current = now;
        return; // Nur ein Element pro Update hinzufügen
      }
    }

    // Events nach und nach anzeigen (nur wenn alle Restaurants bereits angezeigt werden)
    if (visibleRestaurants.length === (restaurantsSection?.items?.length || 0) &&
        eventsSection?.items &&
        eventsSection.items.length > visibleEvents.length) {
      const nextItemIndex = visibleEvents.length;
      if (nextItemIndex < eventsSection.items.length) {
        setVisibleEvents(prev => [...prev, eventsSection.items[nextItemIndex]]);
        lastUpdateRef.current = now;
        return; // Nur ein Element pro Update hinzufügen
      }
    }

    // Tip anzeigen (nur wenn alle Shops, Restaurants und Events bereits angezeigt werden)
    if (visibleShops.length === (shopsSection?.items?.length || 0) &&
        visibleRestaurants.length === (restaurantsSection?.items?.length || 0) &&
        visibleEvents.length === (eventsSection?.items?.length || 0) &&
        tipSection && !showTip) {
      setShowTip(true);
      lastUpdateRef.current = now;
      return;
    }

    // Follow-up anzeigen (nur wenn Tip bereits angezeigt wird)
    if (showTip && followUpSection && !showFollowUp) {
      setShowFollowUp(true);
      lastUpdateRef.current = now;
      return;
    }
  }, [
    introSection, shopsSection, restaurantsSection, eventsSection, tipSection, followUpSection,
    showIntro, visibleShops, visibleRestaurants, visibleEvents, showTip, showFollowUp,
    isStreaming, isComplete
  ]);

  // Render-Funktion für den Inhalt
  const renderContent = useMemo(() => {
    // Fehlerbehandlung
    if (hasError && !isStreaming) {
      return (
        <div className="mall-error">
          <p>Es ist ein Fehler bei der Verarbeitung der Antwort aufgetreten.</p>
        </div>
      );
    }

    return (
      <>
        {isStreaming && <ProgressBar progress={progress} colorStyle={colorStyle} />}

        <div className="mall-content">
          {/* Intro-Sektion */}
          <div className="mall-intro">
            {showIntro && introSection?.content ? (
              <SanitizedHtmlContent content={introSection.content} />
            ) : isStreaming ? (
              <PlaceholderElement type="intro" colorStyle={colorStyle} />
            ) : null}
          </div>

          {/* Shops-Sektion */}
          {visibleShops.length > 0 && (
            <div className="mall-shop-slider">
              <h3 className="mall-section-title">{shopsSection?.title || 'Shops'}</h3>
              <div className={`mall-cards-container ${visibleShops.length <= 3 ? 'mall-cards-container-few' : ''}`}>
                {visibleShops.map((shop, index) => (
                  <ShopCard
                    key={`shop-${index}`}
                    shop={shop}
                    totalItems={shopsSection?.items?.length || visibleShops.length}
                  />
                ))}
                {/* Platzhalter für noch nicht geladene Shops */}
                {isStreaming && shopsSection?.items && visibleShops.length < shopsSection.items.length && (
                  <div className="mall-shop-card mall-shop-card-placeholder">
                    <div className="mall-shop-logo-placeholder"></div>
                    <div className="mall-shop-name-placeholder"></div>
                    <div className="mall-shop-category-placeholder"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Restaurants-Sektion */}
          {visibleRestaurants.length > 0 && (
            <div className="mall-shop-slider">
              <h3 className="mall-section-title">{restaurantsSection?.title || 'Gastronomie'}</h3>
              <div className={`mall-cards-container ${visibleRestaurants.length <= 3 ? 'mall-cards-container-few' : ''}`}>
                {visibleRestaurants.map((restaurant, index) => (
                  <ShopCard
                    key={`restaurant-${index}`}
                    shop={restaurant}
                    totalItems={restaurantsSection?.items?.length || visibleRestaurants.length}
                  />
                ))}
                {/* Platzhalter für noch nicht geladene Restaurants */}
                {isStreaming && restaurantsSection?.items && visibleRestaurants.length < restaurantsSection.items.length && (
                  <div className="mall-shop-card mall-shop-card-placeholder">
                    <div className="mall-shop-logo-placeholder"></div>
                    <div className="mall-shop-name-placeholder"></div>
                    <div className="mall-shop-category-placeholder"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Events-Sektion */}
          {visibleEvents.length > 0 && (
            <div className="mall-events">
              <h3 className="mall-section-title">{eventsSection?.title || 'Veranstaltungen'}</h3>
              <div className="mall-events-list">
                {visibleEvents.map((event, index) => (
                  <div key={`event-${index}`} className="mall-event-card">
                    {event.image && (
                      <div className="mall-event-image">
                        <img src={event.image} alt={event.name} />
                      </div>
                    )}
                    <div className="mall-event-content">
                      <h4 className="mall-event-title">{event.name}</h4>
                      {event.date && <p className="mall-event-date">{event.date}</p>}
                      {event.description && <p className="mall-event-description">{event.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OpeningHours-Sektion */}
          {openingHoursSection && (
            <div className="mall-opening-hours">
              <h3 className="mall-section-title">{openingHoursSection?.title || 'Öffnungszeiten'}</h3>
              <div className="mall-opening-hours-content">
                {openingHoursSection?.data?.regular && (
                  <div className="mall-opening-hours-regular">
                    <h4>Reguläre Öffnungszeiten</h4>
                    <table>
                      <tbody>
                        {openingHoursSection.data.regular.map((item: any, index: number) => (
                          <tr key={`regular-${index}`}>
                            <td>{item.day}</td>
                            <td>{item.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parking-Sektion */}
          {parkingSection && (
            <div className="mall-parking">
              <h3 className="mall-section-title">{parkingSection?.title || 'Parkgebühren'}</h3>
              <div className="mall-parking-content">
                {parkingSection?.data?.fees && (
                  <table>
                    <tbody>
                      {parkingSection.data.fees.map((item: any, index: number) => (
                        <tr key={`fee-${index}`}>
                          <td>{item.duration}</td>
                          <td>{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {parkingSection?.data?.notes && parkingSection.data.notes.length > 0 && (
                  <div className="mall-parking-notes">
                    <h4>Hinweise</h4>
                    {parkingSection.data.notes.map((note: string, index: number) => (
                      <p key={`note-${index}`}>{note}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tip-Sektion */}
          <div className="mall-tip">
            {showTip && tipSection?.content ? (
              <SanitizedHtmlContent content={tipSection.content} />
            ) : isStreaming && (
              visibleShops.length === (shopsSection?.items?.length || 0) &&
              visibleRestaurants.length === (restaurantsSection?.items?.length || 0) &&
              visibleEvents.length === (eventsSection?.items?.length || 0)
            ) ? (
              <PlaceholderElement type="tip" colorStyle={colorStyle} />
            ) : null}
          </div>

          {/* FollowUp-Sektion */}
          {showFollowUp && followUpSection?.content && (
            <div className="mall-followup">
              <h3 className="mall-followup-title">Weitere Fragen</h3>
              <div className="mall-followup-content">
                <SanitizedFollowUpContent content={followUpSection.content} />
              </div>
            </div>
          )}
        </div>

        {/* Zeige Platzhalter für fehlende Sektionen während des Streamings */}
        {isStreaming && combinedSections.length === 0 && (
          <>
            <PlaceholderElement type="intro" colorStyle={colorStyle} />
            <PlaceholderElement type="shops" colorStyle={colorStyle} />
            <PlaceholderElement type="tip" colorStyle={colorStyle} />
          </>
        )}
      </>
    );
  }, [
    hasError, isStreaming, progress, colorStyle,
    showIntro, introSection,
    visibleShops, shopsSection,
    visibleRestaurants, restaurantsSection,
    visibleEvents, eventsSection,
    openingHoursSection, parkingSection,
    showTip, tipSection,
    showFollowUp, followUpSection,
    combinedSections
  ]);

  // Rendere den Inhalt in einem optimierten Container
  return (
    <div className="mall-template-container">
      {renderContent}
      {messageControls && (
        <div className="mall-message-controls">
          {messageControls}
        </div>
      )}
    </div>
  );
};

// Exportiere eine memoized Version der Komponente
export default memo(ProgressiveMallTemplateRenderer);
