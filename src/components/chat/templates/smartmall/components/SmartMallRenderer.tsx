'use client';

import React, { memo, useEffect, useState, useRef } from 'react';
import { ShopData, EventData, ParkingData, OpeningHoursData } from '../hooks/useSmartChunkProcessor';
import styles from '../styles/SmartMall.module.css';

// Debug-Modus
const DEBUG_MODE = false;

// Typdefinitionen
interface SmartMallRendererProps {
  intro: string;
  shops: ShopData[];
  restaurants: ShopData[];
  events: EventData[];
  tip: string;
  followUp: string;
  parking: ParkingData | null;
  openingHours: OpeningHoursData | null;
  progress: number;
  isStreaming: boolean;
  isComplete: boolean;
  colorStyle: {
    primaryColor: string;
    secondaryColor: string;
  };
  hasError: boolean;
  rawContent?: string;
}

// Debug-Infobox
const DebugInfo = ({ data }: { data: SmartMallRendererProps }) => {
  if (!DEBUG_MODE) return null;
  
  return (
    <div style={{ 
      padding: '10px', 
      margin: '10px 0', 
      border: '1px dashed red', 
      fontSize: '12px',
      backgroundColor: 'rgba(255,0,0,0.05)',
      borderRadius: '4px'
    }}>
      <h4 style={{ margin: '0 0 8px 0' }}>Debug-Info:</h4>
      <ul style={{ margin: 0, padding: '0 0 0 20px' }}>
        <li>Intro: {data.intro ? `${data.intro.length} Zeichen` : 'leer'}</li>
        <li>Shops: {data.shops.length} Einträge</li>
        <li>Restaurants: {data.restaurants.length} Einträge</li>
        <li>Events: {data.events.length} Einträge</li>
        <li>Parking: {data.parking ? 'vorhanden' : 'nicht vorhanden'}</li>
        <li>OpeningHours: {data.openingHours ? `${data.openingHours.regular.length} reguläre, ${data.openingHours.special.length} spezielle` : 'nicht vorhanden'}</li>
        <li>Tip: {data.tip ? 'vorhanden' : 'leer'}</li>
        <li>Follow-Up: {data.followUp ? 'vorhanden' : 'leer'}</li>
        <li>Progress: {data.progress}%</li>
        <li>Streaming: {data.isStreaming ? 'ja' : 'nein'}</li>
        <li>Complete: {data.isComplete ? 'ja' : 'nein'}</li>
        <li>Fehler: {data.hasError ? 'ja' : 'nein'}</li>
        <li>Raw Content: {data.rawContent ? 'vorhanden' : 'leer'}</li>
      </ul>
    </div>
  );
};

// Ladebalken-Komponente
const ProgressBar = memo(({ progress, color }: { progress: number, color: string }) => (
  <div className={styles.progressContainer}>
    <div 
      className={styles.progressBar} 
      style={{ 
        width: `${progress}%`, 
        backgroundColor: color,
        transition: 'width 0.2s linear'
      }}
    />
  </div>
));

// Intro-Komponente
const IntroSection = memo(({ content }: { content: string }) => {
  if (!content) return null;
  
  return (
    <div className={styles.introSection}>
      <p>{content}</p>
    </div>
  );
});

// Shop-Card-Komponente
const ShopCard = memo(({ shop }: { shop: ShopData }) => (
  <div className={styles.shopCard}>
    {shop.imageUrl && (
      <img 
        src={shop.imageUrl} 
        alt={shop.name} 
        className={styles.shopLogo}
        onError={(e) => {
          // Fallback image bei Fehler
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=' + encodeURIComponent(shop.name.charAt(0));
        }}
      />
    )}
    <h3 className={styles.shopName}>{shop.name}</h3>
    {shop.details && <p className={styles.shopCategory}>{shop.details}</p>}
    {shop.level && <p className={styles.shopFloor}>{shop.level}</p>}
    {shop.description && <p className={styles.shopDescription}>{shop.description}</p>}
    {shop.openingHours && <p className={styles.shopOpening}>{shop.openingHours}</p>}
  </div>
));

// Shop-Liste als Slider-Komponente mit Controls
const ShopList = memo(({ shops, title }: { shops: ShopData[], title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3; // Anzahl der Karten pro Ansicht
  
  // Bestimme die Anzahl der Karten pro Ansicht basierend auf Bildschirmbreite
  const [itemsPerView, setItemsPerView] = useState(cardsPerView);
  
  // Debounce-Timer für Resize-Events
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Responsive Anpassung mit Debounce
    const handleResize = () => {
      // Bestehenden Timer löschen
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      
      // Neuen Timer setzen mit 150ms Verzögerung
      resizeTimerRef.current = setTimeout(() => {
        const width = window.innerWidth;
        let newItemsPerView;
        
        if (width <= 480) {
          newItemsPerView = 1;
        } else if (width <= 768) {
          newItemsPerView = 2;
        } else {
          newItemsPerView = 3;
        }
        
        // Nur aktualisieren, wenn sich die Anzahl tatsächlich ändert
        if (newItemsPerView !== itemsPerView) {
          setItemsPerView(newItemsPerView);
          // Beim Wechsel der Ansichtsgröße den Index anpassen, um die aktuelle Karte im Sichtfeld zu halten
          if (currentIndex > 0) {
            const firstVisibleItem = currentIndex * itemsPerView;
            const newIndex = Math.floor(firstVisibleItem / newItemsPerView);
            setCurrentIndex(newIndex);
          }
        }
      }, 150);
    };
    
    // Initiale Anpassung
    handleResize();
    
    // Event-Listener für Fenstergrößenänderungen
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
    };
  }, [itemsPerView, currentIndex]);
  
  if (!shops || shops.length === 0) return null;
  
  const totalSlides = Math.max(1, Math.ceil(shops.length / itemsPerView));
  
  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : 0));
  };
  
  const handleNext = () => {
    setCurrentIndex(prev => (prev < totalSlides - 1 ? prev + 1 : prev));
  };
  
  // Berechne die sichtbaren Shops für den aktuellen Index
  const visibleStart = currentIndex * itemsPerView;
  const visibleEnd = Math.min(visibleStart + itemsPerView, shops.length);
  const visibleShops = shops.slice(visibleStart, visibleEnd);
  
  // Optimierte Klassen-Bestimmung - nur wenn nötig
  const getSliderClass = () => {
    let baseClass = styles.sliderTrack;
    if (visibleShops.length === 1) return `${baseClass} ${styles.singleItem}`;
    if (visibleShops.length === 2) return `${baseClass} ${styles.twoItems}`;
    return baseClass;
  };
  
  // Vorberechnete Klasse für den Slider
  const sliderTrackClass = getSliderClass();
  
  return (
    <div className={styles.shopListSection}>
      <div className={styles.sliderHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {totalSlides > 1 && (
          <div className={styles.sliderControls}>
            <button 
              className={`${styles.sliderButton} ${currentIndex === 0 ? styles.sliderButtonDisabled : ''}`} 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Vorherige Karten"
            >
              ←
            </button>
            <span className={styles.sliderPagination}>
              {currentIndex + 1} / {totalSlides}
            </span>
            <button 
              className={`${styles.sliderButton} ${currentIndex === totalSlides - 1 ? styles.sliderButtonDisabled : ''}`} 
              onClick={handleNext}
              disabled={currentIndex === totalSlides - 1}
              aria-label="Nächste Karten"
            >
              →
            </button>
          </div>
        )}
      </div>
      
      <div className={styles.sliderContainer}>
        <div className={sliderTrackClass}>
          {visibleShops.map((shop, index) => (
            <div 
              key={`${shop.name}-${index + visibleStart}`} 
              className={styles.sliderItem}
              style={{ 
                opacity: 1, 
                transform: 'translateZ(0) scale(1)' 
              }}
            >
              <ShopCard shop={shop} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Event-Card-Komponente
const EventCard = memo(({ event }: { event: EventData }) => (
  <div className={styles.eventCard}>
    {event.imageUrl && (
      <img 
        src={event.imageUrl} 
        alt={event.name} 
        className={styles.eventImage}
        onError={(e) => {
          // Fallback image bei Fehler
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=' + encodeURIComponent(event.name.charAt(0));
        }}
      />
    )}
    <h3 className={styles.eventName}>{event.name}</h3>
    {event.date && <p className={styles.eventDate}>{event.date}</p>}
    {event.description && <p className={styles.eventDescription}>{event.description}</p>}
  </div>
));

// Event-Liste als Slider umbauen
const EventList = memo(({ events }: { events: EventData[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3; // Anzahl der Karten pro Ansicht
  
  // Bestimme die Anzahl der Karten pro Ansicht basierend auf Bildschirmbreite
  const [itemsPerView, setItemsPerView] = useState(cardsPerView);
  
  // Debounce-Timer für Resize-Events
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Responsive Anpassung mit Debounce
    const handleResize = () => {
      // Bestehenden Timer löschen
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      
      // Neuen Timer setzen mit 150ms Verzögerung
      resizeTimerRef.current = setTimeout(() => {
        const width = window.innerWidth;
        let newItemsPerView;
        
        if (width <= 480) {
          newItemsPerView = 1;
        } else if (width <= 768) {
          newItemsPerView = 2;
        } else {
          newItemsPerView = 3;
        }
        
        // Nur aktualisieren, wenn sich die Anzahl tatsächlich ändert
        if (newItemsPerView !== itemsPerView) {
          setItemsPerView(newItemsPerView);
          // Beim Wechsel der Ansichtsgröße den Index anpassen, um die aktuelle Karte im Sichtfeld zu halten
          if (currentIndex > 0) {
            const firstVisibleItem = currentIndex * itemsPerView;
            const newIndex = Math.floor(firstVisibleItem / newItemsPerView);
            setCurrentIndex(newIndex);
          }
        }
      }, 150);
    };
    
    // Initiale Anpassung
    handleResize();
    
    // Event-Listener für Fenstergrößenänderungen
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
    };
  }, [itemsPerView, currentIndex]);
  
  if (!events || events.length === 0) return null;
  
  const totalSlides = Math.max(1, Math.ceil(events.length / itemsPerView));
  
  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : 0));
  };
  
  const handleNext = () => {
    setCurrentIndex(prev => (prev < totalSlides - 1 ? prev + 1 : prev));
  };
  
  // Berechne die sichtbaren Events für den aktuellen Index
  const visibleStart = currentIndex * itemsPerView;
  const visibleEnd = Math.min(visibleStart + itemsPerView, events.length);
  const visibleEvents = events.slice(visibleStart, visibleEnd);
  
  // Optimierte Klassen-Bestimmung - nur wenn nötig
  const getSliderClass = () => {
    let baseClass = styles.sliderTrack;
    if (visibleEvents.length === 1) return `${baseClass} ${styles.singleItem}`;
    if (visibleEvents.length === 2) return `${baseClass} ${styles.twoItems}`;
    return baseClass;
  };
  
  // Vorberechnete Klasse für den Slider
  const sliderTrackClass = getSliderClass();
  
  return (
    <div className={styles.eventListSection}>
      <div className={styles.sliderHeader}>
        <h2 className={styles.sectionTitle}>Veranstaltungen</h2>
        {totalSlides > 1 && (
          <div className={styles.sliderControls}>
            <button 
              className={`${styles.sliderButton} ${currentIndex === 0 ? styles.sliderButtonDisabled : ''}`} 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Vorherige Veranstaltungen"
            >
              ←
            </button>
            <span className={styles.sliderPagination}>
              {currentIndex + 1} / {totalSlides}
            </span>
            <button 
              className={`${styles.sliderButton} ${currentIndex === totalSlides - 1 ? styles.sliderButtonDisabled : ''}`} 
              onClick={handleNext}
              disabled={currentIndex === totalSlides - 1}
              aria-label="Nächste Veranstaltungen"
            >
              →
            </button>
          </div>
        )}
      </div>
      
      <div className={styles.sliderContainer}>
        <div className={sliderTrackClass}>
          {visibleEvents.map((event, index) => (
            <div 
              key={`${event.name}-${index + visibleStart}`} 
              className={styles.sliderItem}
              style={{ 
                opacity: 1, 
                transform: 'translateZ(0) scale(1)' 
              }}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Tipp-Komponente
const TipSection = memo(({ content }: { content: string }) => {
  if (!content) return null;
  
  return (
    <div className={styles.tipSection}>
      <p>{content}</p>
    </div>
  );
});

// Follow-Up-Komponente
const FollowUpSection = memo(({ content }: { content: string }) => {
  if (!content) return null;
  
  return (
    <div className={styles.followUpSection}>
      <p>{content}</p>
    </div>
  );
});

// Fehler-Komponente
const ErrorSection = memo(() => (
  <div className={styles.errorSection}>
    <p>Der Inhalt konnte nicht korrekt verarbeitet werden.</p>
  </div>
));

// Leerer Zustand
const EmptyState = memo(({ rawContent }: { rawContent?: string }) => {
  if (rawContent) {
    // Entferne alle Chunk-Tags und führende Whitespaces aus jeder Zeile
    const cleanContent = rawContent
      .replace(/<\/?chunk[^>]*>/g, '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
      
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginTop: '20px',
        whiteSpace: 'pre-wrap',
        overflow: 'auto',
        maxHeight: '500px',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Fallback-Anzeige:</div>
        {cleanContent}
      </div>
    );
  }
  
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      color: '#666',
      border: '1px solid #eee',
      borderRadius: '8px',
      marginTop: '20px'
    }}>
      <p>Keine Informationen verfügbar. Bitte versuchen Sie eine andere Anfrage.</p>
    </div>
  );
});

// Parking-Section Komponente
const ParkingSection = memo(({ parkingData }: { parkingData: ParkingData }) => {
  if (!parkingData) return null;
  
  return (
    <div className={styles.parkingSection}>
      <h2 className={styles.sectionTitle}>Parkhaus-Informationen</h2>
      
      {parkingData.fees.length > 0 && (
        <div className={styles.parkingFees}>
          <h3 className={styles.parkingSubtitle}>Parkgebühren</h3>
          <div className={styles.feeTable}>
            {parkingData.fees.map((fee, index) => (
              <div key={index} className={styles.feeRow}>
                <div className={styles.feeDuration}>{fee.duration}</div>
                <div className={styles.feePrice}>{fee.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {parkingData.notes.length > 0 && (
        <div className={styles.parkingNotes}>
          <h3 className={styles.parkingSubtitle}>Hinweise</h3>
          <ul className={styles.notesList}>
            {parkingData.notes.map((note, index) => (
              <li key={index} className={styles.noteItem}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

// OpeningHours-Section Komponente
const OpeningHoursSection = memo(({ openingHoursData }: { openingHoursData: OpeningHoursData }) => {
  if (!openingHoursData) return null;
  
  const { regular, special } = openingHoursData;
  
  return (
    <div className={styles.openingHoursSection}>
      <h2 className={styles.sectionTitle}>Öffnungszeiten</h2>
      
      {regular.length > 0 && (
        <div className={styles.regularHours}>
          <h3 className={styles.openingHoursSubtitle}>Reguläre Öffnungszeiten</h3>
          <div className={styles.hoursTable}>
            {regular.map((item, index) => (
              <div key={index} className={styles.hoursRow}>
                <div className={styles.hoursDay}>{item.day}</div>
                <div className={styles.hoursTime}>{item.hours}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {special.length > 0 && (
        <div className={styles.specialHours}>
          <h3 className={styles.openingHoursSubtitle}>Sonderöffnungszeiten</h3>
          <div className={styles.hoursTable}>
            {special.map((item, index) => (
              <div key={index} className={styles.hoursRow}>
                <div className={styles.hoursDate}>{item.date}</div>
                <div className={styles.hoursTime}>{item.hours}</div>
                {item.note && <div className={styles.hoursNote}>{item.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// Hauptkomponente
const SmartMallRenderer: React.FC<SmartMallRendererProps> = ({
  intro,
  shops,
  restaurants,
  events,
  tip,
  followUp,
  parking,
  openingHours,
  progress,
  isStreaming,
  colorStyle,
  hasError,
  isComplete,
  rawContent
}) => {
  // Debug-Log bei Initialisierung und Änderungen
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("SMARTMALL-RENDERER: Komponentendaten:", {
        intro: intro?.substring(0, 30) + (intro?.length > 30 ? '...' : '') || 'leer',
        shops: shops?.length || 0,
        restaurants: restaurants?.length || 0,
        events: events?.length || 0,
        parking: parking ? 'vorhanden' : 'nicht vorhanden',
        openingHours: openingHours ? `${openingHours.regular.length} reguläre, ${openingHours.special.length} spezielle` : 'nicht vorhanden',
        progress,
        isStreaming,
        isComplete,
        rawContent: rawContent ? 'vorhanden' : 'nicht vorhanden'
      });
    }
  }, [intro, shops, restaurants, events, parking, openingHours, progress, isStreaming, isComplete, rawContent]);

  // Leerer Zustand: Wenn keine strukturierten Daten vorhanden sind und das Streaming abgeschlossen ist
  const isEmpty = !intro && shops.length === 0 && restaurants.length === 0 && 
                  events.length === 0 && tip === '' && followUp === '' && !parking && !openingHours && !isStreaming;

  // Direkte Anzeige des Rohcontents, wenn vorhanden, unabhängig vom isEmpty-Status
  const hasRawContent = rawContent && rawContent.length > 0;

  // Keine Anzeige während des Ladens zu Beginn
  if (isStreaming && progress === 0 && !intro && shops.length === 0 && 
      restaurants.length === 0 && events.length === 0) {
    return (
      <div className={styles.renderer}>
        <ProgressBar progress={5} color={colorStyle.primaryColor} />
        <div className={styles.content} style={{ minHeight: '100px', padding: '20px 0' }}>
          <div className={styles.loadingIndicator}>
            <div className={styles.loadingAnimation}>
              <div className={styles.loadingDot}></div>
              <div className={styles.loadingDot}></div>
              <div className={styles.loadingDot}></div>
            </div>
            <div className={styles.loadingText}>
              Informationen werden gesammelt...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.renderer}>
      {/* Debug-Infos anzeigen */}
      {DEBUG_MODE && (
        <DebugInfo 
          data={{ 
            intro, shops, restaurants, events, tip, followUp, 
            progress, isStreaming, colorStyle, hasError, isComplete, rawContent, parking, openingHours
          }} 
        />
      )}

      {/* Progress Bar nur während des Streamings anzeigen */}
      {isStreaming && progress < 100 && (
        <ProgressBar progress={progress} color={colorStyle.primaryColor} />
      )}

      {/* Content Bereich */}
      <div className={styles.content}>
        {hasError ? (
          <ErrorSection />
        ) : isEmpty && !hasRawContent ? (
          <EmptyState rawContent={""} />
        ) : (
          <>
            {/* Intro immer zuerst anzeigen, wenn vorhanden */}
            {intro && <IntroSection content={intro} />}
            
            {/* OpeningHours-Informationen */}
            {openingHours && <OpeningHoursSection openingHoursData={openingHours} />}
            
            {/* Parking-Informationen */}
            {parking && <ParkingSection parkingData={parking} />}

            {/* Shop-Listen */}
            {shops.length > 0 && (
              <ShopList shops={shops} title="Shops" />
            )}

            {/* Restaurant-Liste */}
            {restaurants.length > 0 && (
              <ShopList shops={restaurants} title="Gastronomie" />
            )}

            {/* Event-Liste */}
            {events.length > 0 && (
              <EventList events={events} />
            )}

            {/* Tipp und Follow-Up am Ende */}
            {tip && <TipSection content={tip} />}
            {followUp && <FollowUpSection content={followUp} />}
            
            {/* Fallback-Anzeige IMMER zeigen, wenn Rohinhalt vorhanden ist */}
            {hasRawContent && (
              <div style={{ marginTop: '20px' }}>
                <EmptyState rawContent={rawContent} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default memo(SmartMallRenderer); 