'use client';

import React, { memo, useMemo } from 'react';
import { useJsonProgressiveStreaming } from './hooks/useJsonProgressiveStreaming';
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
 * Optimierte Mall-Template-Komponente
 *
 * Diese Komponente vereinfacht die Rendering-Hierarchie und optimiert
 * die Performance während des Streamings durch:
 * 1. Reduzierte DOM-Verschachtelung
 * 2. Optimierte Styling-Anwendung
 * 3. Verbesserte Content-Verarbeitung
 */
const MallTemplateRenderer: React.FC<MallTemplateRendererProps> = ({
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

  // Kombinierte Sektionen für progressives Rendering
  const combinedSections = useMemo(() => {
    // Wenn wir vollständige Sektionen haben, verwenden wir diese
    if (sections.length > 0) {
      return sections;
    }

    // Ansonsten verwenden wir die partiellen Sektionen für progressives Rendering
    return partialSections;
  }, [sections, partialSections]);

  // Extrahiere die verschiedenen Sektionstypen
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

    // Wenn wir Sektionen haben, zeige sie an
    if (combinedSections.length > 0) {
      return (
        <>
          {isStreaming && <ProgressBar progress={progress} colorStyle={colorStyle} />}

          <div className="mall-content">
            {/* Intro-Sektion */}
            {introSection?.content && (
              <div className="mall-intro">
                <SanitizedHtmlContent content={introSection.content} />
              </div>
            )}

            {/* Shops-Sektion */}
            {shopsSection?.items && shopsSection.items.length > 0 && (
              <div className="mall-shop-slider">
                <h3 className="mall-section-title">{shopsSection?.title || 'Shops'}</h3>
                <div className="mall-cards-container">
                  {shopsSection.items.map((shop: any, index: number) => (
                    <div key={`shop-${index}`} className="mall-shop-card">
                      <img
                        src={shop.logo || shop.image || 'https://via.placeholder.com/80?text=' + encodeURIComponent(shop.name)}
                        alt={shop.name}
                        className="mall-shop-logo"
                      />
                      <h4 className="mall-shop-name">{shop.name}</h4>
                      {shop.category && <p className="mall-shop-category">{shop.category}</p>}
                      {shop.floor && <p className="mall-shop-floor">{shop.floor}</p>}
                      {shop.description && <p className="mall-shop-description">{shop.description}</p>}
                      {shop.opening && <p className="mall-shop-opening">{shop.opening}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restaurants-Sektion */}
            {restaurantsSection?.items && restaurantsSection.items.length > 0 && (
              <div className="mall-shop-slider">
                <h3 className="mall-section-title">{restaurantsSection?.title || 'Gastronomie'}</h3>
                <div className="mall-cards-container">
                  {restaurantsSection.items.map((restaurant: any, index: number) => (
                    <div key={`restaurant-${index}`} className="mall-shop-card">
                      <img
                        src={restaurant.logo || restaurant.image || 'https://via.placeholder.com/80?text=' + encodeURIComponent(restaurant.name)}
                        alt={restaurant.name}
                        className="mall-shop-logo"
                      />
                      <h4 className="mall-shop-name">{restaurant.name}</h4>
                      {restaurant.category && <p className="mall-shop-category">{restaurant.category}</p>}
                      {restaurant.floor && <p className="mall-shop-floor">{restaurant.floor}</p>}
                      {restaurant.description && <p className="mall-shop-description">{restaurant.description}</p>}
                      {restaurant.opening && <p className="mall-shop-opening">{restaurant.opening}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events-Sektion */}
            {eventsSection?.items && eventsSection.items.length > 0 && (
              <div className="mall-events">
                <h3 className="mall-section-title">{eventsSection?.title || 'Veranstaltungen'}</h3>
                <div className="mall-events-list">
                  {eventsSection.items.map((event: any, index: number) => (
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
            {tipSection?.content && (
              <div className="mall-tip">
                <SanitizedHtmlContent content={tipSection.content} />
              </div>
            )}

            {/* FollowUp-Sektion */}
            {followUpSection?.content && (
              <div className="mall-followup">
                <h3 className="mall-followup-title">Weitere Fragen</h3>
                <div className="mall-followup-content">
                  <SanitizedFollowUpContent content={followUpSection.content} />
                </div>
              </div>
            )}
          </div>

          {/* Zeige Platzhalter für fehlende Sektionen während des Streamings */}
          {isStreaming && (
            <>
              {!introSection && <PlaceholderElement type="intro" colorStyle={colorStyle} />}
              {!shopsSection && !restaurantsSection && <PlaceholderElement type="shops" colorStyle={colorStyle} />}
              {!tipSection && <PlaceholderElement type="tip" colorStyle={colorStyle} />}
            </>
          )}
        </>
      );
    }

    // Wenn wir noch streamen, aber keine Sektionen haben, zeige Platzhalter
    if (isStreaming) {
      return (
        <>
          <ProgressBar progress={progress} colorStyle={colorStyle} />
          <PlaceholderElement type="intro" colorStyle={colorStyle} />
          <PlaceholderElement type="shops" colorStyle={colorStyle} />
          <PlaceholderElement type="tip" colorStyle={colorStyle} />
        </>
      );
    }

    // Wenn keine Sektionen vorhanden sind und wir nicht mehr streamen, zeige nichts an
    return null;
  }, [combinedSections, hasError, isStreaming, progress, colorStyle, introSection, shopsSection, restaurantsSection, eventsSection, openingHoursSection, parkingSection, tipSection, followUpSection]);

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
export default memo(MallTemplateRenderer);
