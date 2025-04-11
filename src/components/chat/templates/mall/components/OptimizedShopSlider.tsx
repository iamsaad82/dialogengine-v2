'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useMemo, useCallback, useTransition } from 'react';
import { ShopData } from './ShopCard';
import FixedShopCard from './FixedShopCard';

interface OptimizedShopSliderProps {
  title: string;
  shops: ShopData[];
  style?: React.CSSProperties;
  isStreaming?: boolean;
}

/**
 * Eine hochoptimierte Shop-Slider-Komponente mit stabilem Rendering
 * Implementiert die Entwickler-Tipps:
 * - Ref-basiertes Anhängen statt vollständigem Re-Rendering
 * - Reduzierte State-Änderungen
 * - Stabile Keys und Memo für DOM-Stabilität
 * - Fixierte Kartenhöhen
 * - Debouncing von Rendering-Updates
 */
const OptimizedShopSlider: React.FC<OptimizedShopSliderProps> = ({
  title,
  shops,
  style = {},
  isStreaming = false
}) => {
  // Wenn keine Shops vorhanden sind, zeige nichts an
  if (!shops || shops.length === 0) return null;

  // Refs für DOM-Manipulation
  const sliderRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reduzierte States für weniger Re-Renders
  const [arrowState, setArrowState] = useState({ showLeft: false, showRight: true });
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, scrollLeft: 0 });
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isInitiallyLoaded, setIsInitiallyLoaded] = useState<boolean>(false);
  const [visibleItemCount, setVisibleItemCount] = useState<number>(3);
  
  // useTransition für flüssigere UI-Updates
  const [isPending, startTransition] = useTransition();

  // Memoize die Shop-Liste für Stabilität
  const memoizedShops = useMemo(() => shops, [JSON.stringify(shops)]);
  
  // Memoize die Card-Breite für Stabilität
  const cardWidth = useMemo(() => {
    if (shops.length < 3) {
      return `calc((100% / ${shops.length}) - 1rem)`;
    }
    return '300px';
  }, [shops.length]);

  // Berechne die Anzahl der sichtbaren Elemente - einmal beim Laden
  useLayoutEffect(() => {
    if (!sliderRef.current) return;
    
    const calculateVisibleItems = () => {
      const containerWidth = sliderRef.current?.clientWidth || 0;
      const itemWidth = 300; // Standardbreite einer Karte
      
      // Wenn weniger als 3 Shops vorhanden sind, passe die Breite an
      if (shops.length < 3) {
        return shops.length; // Zeige nur so viele wie vorhanden
      }
      
      // Maximal 3 Karten anzeigen
      const count = Math.min(3, Math.floor(containerWidth / itemWidth));
      // Stelle sicher, dass mindestens 1 zurückgegeben wird
      return Math.max(1, count);
    };
    
    setVisibleItemCount(calculateVisibleItems());
    
    // Verzögere das Laden der Karten, um Flackern zu vermeiden
    // Nur einmal beim ersten Laden ausführen
    if (!isInitiallyLoaded) {
      const timer = setTimeout(() => {
        startTransition(() => {
          setIsInitiallyLoaded(true);
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [shops.length, isInitiallyLoaded]);

  // Überprüfe, ob Pfeile angezeigt werden sollen - memoized
  const checkArrows = useCallback(() => {
    if (!sliderRef.current) return;
    
    const slider = sliderRef.current;
    if (!slider) return;
    
    // Zeige den linken Pfeil nur, wenn wir nicht am Anfang sind
    const showLeft = currentIndex > 0;
    
    // Zeige den rechten Pfeil nur, wenn wir nicht am Ende sind
    const maxIndex = Math.max(0, shops.length - visibleItemCount);
    const showRight = currentIndex < maxIndex;
    
    // Nur aktualisieren, wenn sich etwas geändert hat
    if (showLeft !== arrowState.showLeft || showRight !== arrowState.showRight) {
      setArrowState({ showLeft, showRight });
    }
  }, [currentIndex, shops.length, visibleItemCount, arrowState]);

  // Überprüfe Pfeile bei Änderungen
  useEffect(() => {
    checkArrows();
  }, [checkArrows]);

  // Scroll-Funktionen - memoized
  const scrollPrev = useCallback(() => {
    if (currentIndex <= 0) return;
    
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    
    if (sliderRef.current) {
      const itemWidth = 300 + 16; // Kartenbreite + Margin
      sliderRef.current.scrollTo({
        left: newIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  const scrollNext = useCallback(() => {
    const maxIndex = Math.max(0, shops.length - visibleItemCount);
    if (currentIndex >= maxIndex) return;
    
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    setCurrentIndex(newIndex);
    
    if (sliderRef.current) {
      const itemWidth = 300 + 16; // Kartenbreite + Margin
      sliderRef.current.scrollTo({
        left: newIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, shops.length, visibleItemCount]);

  // Touch-Events für mobile Geräte - optimiert
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragState({
      isDragging: true,
      startX: e.pageX - (sliderRef.current?.offsetLeft || 0),
      scrollLeft: sliderRef.current?.scrollLeft || 0
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging) return;
    e.preventDefault();
    
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - dragState.startX) * 2; // Scroll-Geschwindigkeit
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = dragState.scrollLeft - walk;
    }
  }, [dragState]);

  // Memoized Styles für Stabilität
  const containerStyle = useMemo<React.CSSProperties>(() => ({
    ...style,
    marginBottom: '2rem',
    overflow: 'hidden',
    position: 'relative',
    height: '480px', // Feste Höhe für Stabilität
    contain: 'layout style', // CSS containment für Leistung
  }), [style]);

  const titleStyle = useMemo<React.CSSProperties>(() => ({
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: '#333',
  }), []);

  const sliderContainerStyle = useMemo<React.CSSProperties>(() => ({
    position: 'relative',
    overflow: 'hidden',
    height: '420px', // Feste Höhe für Stabilität
  }), []);

  const sliderStyle = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    overflowX: 'auto',
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none' as any,
    msOverflowStyle: 'none' as any,
    padding: '0.5rem 0',
    height: '100%',
    willChange: 'transform', // Optimierung für Animationen
    transform: 'translateZ(0)', // Hardware-Beschleunigung
  }), []);

  const arrowStyle = useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2,
    border: 'none',
    outline: 'none',
    fontSize: '1.5rem',
    color: '#333',
  }), []);

  // Memoized Skeleton-Renderer für Stabilität
  const renderSkeletons = useMemo(() => {
    return Array.from({ length: Math.min(shops.length, visibleItemCount) }).map((_, index) => (
      <FixedShopCard
        key={`skeleton-${index}`}
        data={{ name: `Skeleton ${index}`, category: '', floor: '', opening: '' }}
        isLoaded={false}
        style={{ width: cardWidth }}
      />
    ));
  }, [shops.length, visibleItemCount, cardWidth]);

  // Memoized Shop-Karten für Stabilität
  const shopCards = useMemo(() => {
    return memoizedShops.map((shop, index) => (
      <FixedShopCard
        key={`${shop.name}-${index}-${shop.floor || ''}`} // Stabiler Key
        data={shop}
        style={{ width: cardWidth }}
        isLoaded={true}
      />
    ));
  }, [memoizedShops, cardWidth]);

  return (
    <div ref={containerRef} style={containerStyle}>
      <h2 ref={titleRef} style={titleStyle}>{title}</h2>
      
      <div style={sliderContainerStyle}>
        {/* Linker Pfeil */}
        {arrowState.showLeft && (
          <button
            onClick={scrollPrev}
            style={{ ...arrowStyle, left: '10px' }}
            aria-label="Vorherige Shops anzeigen"
          >
            ←
          </button>
        )}
        
        {/* Rechter Pfeil */}
        {arrowState.showRight && (
          <button
            onClick={scrollNext}
            style={{ ...arrowStyle, right: '10px' }}
            aria-label="Weitere Shops anzeigen"
          >
            →
          </button>
        )}
        
        {/* Slider mit Karten */}
        <div
          ref={sliderRef}
          style={sliderStyle}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {/* Zeige Skeletons während des Ladens */}
          {!isInitiallyLoaded && renderSkeletons}
          
          {/* Zeige die tatsächlichen Karten, wenn geladen */}
          {isInitiallyLoaded && shopCards}
        </div>
      </div>
    </div>
  );
};

// Exportiere eine memoized Version für Stabilität
export default React.memo(OptimizedShopSlider);
