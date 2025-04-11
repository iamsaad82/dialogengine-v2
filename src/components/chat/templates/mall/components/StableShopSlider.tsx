'use client';

import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { ShopData } from './ShopCard';
import StableShopCard from './StableShopCard';

interface StableShopSliderProps {
  title: string;
  shops: ShopData[];
  style?: React.CSSProperties;
  isStreaming?: boolean;
}

/**
 * Eine stabilere Version des Shop-Sliders, die während des Streamings nicht flackert
 * und ein konsistentes Layout beibehält
 */
const StableShopSlider: React.FC<StableShopSliderProps> = ({
  title,
  shops,
  style = {},
  isStreaming = false
}) => {
  // Wenn keine Shops vorhanden sind, zeige nichts an
  if (!shops || shops.length === 0) return null;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [visibleItemCount, setVisibleItemCount] = useState<number>(3);

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
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [shops.length]);

  // Überprüfe, ob Pfeile angezeigt werden sollen
  useEffect(() => {
    if (!sliderRef.current) return;
    
    const checkArrows = () => {
      const slider = sliderRef.current;
      if (!slider) return;
      
      // Zeige den linken Pfeil nur, wenn wir nicht am Anfang sind
      setShowLeftArrow(currentIndex > 0);
      
      // Zeige den rechten Pfeil nur, wenn wir nicht am Ende sind
      const maxIndex = Math.max(0, shops.length - visibleItemCount);
      setShowRightArrow(currentIndex < maxIndex);
    };
    
    checkArrows();
  }, [currentIndex, shops.length, visibleItemCount]);

  // Scroll-Funktionen
  const scrollPrev = () => {
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
  };

  const scrollNext = () => {
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
  };

  // Touch-Events für mobile Geräte
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll-Geschwindigkeit
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  // Berechne die Breite der Karten basierend auf der Anzahl der sichtbaren Elemente
  const getCardWidth = () => {
    if (shops.length < 3) {
      // Bei weniger als 3 Shops, verteile sie gleichmäßig
      return `calc((100% / ${shops.length}) - 1rem)`;
    }
    return '300px'; // Standardbreite
  };

  // Container-Stil mit fester Höhe
  const containerStyle = {
    ...style,
    marginBottom: '2rem',
    overflow: 'hidden',
    position: 'relative' as React.CSSProperties['position'],
    height: '480px', // Feste Höhe für Stabilität
  };

  // Titel-Stil
  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: '#333',
  };

  // Slider-Container-Stil
  const sliderContainerStyle = {
    position: 'relative' as React.CSSProperties['position'],
    overflow: 'hidden',
    height: '420px', // Feste Höhe für Stabilität
  };

  // Slider-Stil
  const sliderStyle = {
    display: 'flex',
    overflowX: 'auto' as React.CSSProperties['overflowX'],
    scrollBehavior: 'smooth' as React.CSSProperties['scrollBehavior'],
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'],
    msOverflowStyle: 'none' as any,
    padding: '0.5rem 0',
    height: '100%',
  };

  // Pfeil-Stil
  const arrowStyle = {
    position: 'absolute' as React.CSSProperties['position'],
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
  };

  // Generiere Skeleton-Karten für das Laden
  const renderSkeletons = () => {
    return Array.from({ length: Math.min(shops.length, visibleItemCount) }).map((_, index) => (
      <StableShopCard
        key={`skeleton-${index}`}
        data={{ name: `Skeleton ${index}`, category: '', floor: '', opening: '' }}
        isLoaded={false}
        style={{ width: getCardWidth() }}
      />
    ));
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>{title}</h2>
      
      <div style={sliderContainerStyle}>
        {/* Linker Pfeil */}
        {showLeftArrow && (
          <button
            onClick={scrollPrev}
            style={{ ...arrowStyle, left: '10px' }}
            aria-label="Vorherige Shops anzeigen"
          >
            ←
          </button>
        )}
        
        {/* Rechter Pfeil */}
        {showRightArrow && (
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
          {!isLoaded && renderSkeletons()}
          
          {/* Zeige die tatsächlichen Karten, wenn geladen */}
          {isLoaded && shops.map((shop, index) => (
            <StableShopCard
              key={`${shop.name}-${index}`}
              data={shop}
              style={{ width: getCardWidth() }}
              isLoaded={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StableShopSlider;
