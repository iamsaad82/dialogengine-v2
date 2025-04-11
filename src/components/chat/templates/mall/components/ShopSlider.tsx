'use client';

import React, { useRef, useState, useEffect } from 'react';
import ShopCard, { ShopData } from './ShopCard';

interface ShopSliderProps {
  title: string;
  shops: ShopData[];
  style?: React.CSSProperties;
}

/**
 * Slider-Komponente für eine horizontale Anzeige von Shop-Karten
 * Mit verbesserter Touch-Swipe-Unterstützung
 */
const ShopSlider: React.FC<ShopSliderProps> = ({
  title,
  shops,
  style = {}
}) => {
  if (!shops || shops.length === 0) return null;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  // Berechne die Anzahl der sichtbaren Elemente - immer 3 anzeigen
  const getVisibleItemCount = () => {
    if (!sliderRef.current) return 1;
    const containerWidth = sliderRef.current.clientWidth;
    const itemWidth = 300; // Breitere Karten
    // Maximal 3 Karten anzeigen
    const count = Math.min(3, Math.floor(containerWidth / itemWidth));
    // Stelle sicher, dass mindestens 1 zurückgegeben wird, um Division durch Null zu vermeiden
    return Math.max(1, count);
  };

  // Überprüfe, ob Pfeile angezeigt werden sollen
  const checkArrows = () => {
    if (!sliderRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;

    // Linker Pfeil immer anzeigen, aber mit unterschiedlicher Opazität
    setShowLeftArrow(scrollLeft > 20);

    // Rechter Pfeil immer anzeigen, aber mit unterschiedlicher Opazität
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20);

    // Aktuellen Index berechnen
    const itemWidth = 300; // Breitere Karten
    const newIndex = Math.round(scrollLeft / itemWidth);
    setCurrentIndex(newIndex);

    console.log('Slider Arrows:', { showLeft: scrollLeft > 20, showRight: scrollLeft + clientWidth < scrollWidth - 20 });
  };

  // Beim Laden und Resize die Pfeile prüfen
  useEffect(() => {
    checkArrows();

    // Event-Listener für Resize
    window.addEventListener('resize', checkArrows);

    // Event-Listener für Scroll
    if (sliderRef.current) {
      sliderRef.current.addEventListener('scroll', checkArrows);
    }

    return () => {
      window.removeEventListener('resize', checkArrows);
      if (sliderRef.current) {
        sliderRef.current.removeEventListener('scroll', checkArrows);
      }
    };
  }, []);

  // Scroll-Funktionen
  const handleScrollLeft = () => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Touch-Ereignisse für Swipe-Gesten
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;

    // Verhindere das Standardverhalten (z.B. Scrollen der Seite)
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);

    // Debug-Ausgabe
    console.log('Touch Start:', e.touches[0].pageX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-Geschwindigkeit
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;

    // Verhindert das Scrollen der Seite
    e.preventDefault();
    e.stopPropagation();

    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-Geschwindigkeit
    sliderRef.current.scrollLeft = scrollLeft - walk;

    // Debug-Ausgabe
    console.log('Touch Move:', x, 'Walk:', walk, 'New ScrollLeft:', sliderRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Funktion zum Behandeln von Dot-Klicks
  const handleDotClick = (index: number) => {
    if (!sliderRef.current) return;

    // Berechne die Position, zu der gescrollt werden soll
    const itemsPerPage = getVisibleItemCount();
    const targetIndex = index * itemsPerPage;

    if (targetIndex < shops.length) {
      // Finde das Element an der Zielposition
      const targetElement = sliderRef.current.children[targetIndex] as HTMLElement;
      if (targetElement) {
        // Scrolle zum Element
        sliderRef.current.scrollTo({
          left: targetElement.offsetLeft - sliderRef.current.offsetLeft,
          behavior: 'smooth'
        });

        // Aktualisiere den aktuellen Index
        setCurrentIndex(targetIndex);
      }
    }
  };

  // Moderne Stile inline definieren
  const sectionStyle = {
    ...style,
    margin: '1.5rem 0',
    padding: '0 1.5rem',
    position: 'relative' as React.CSSProperties['position'],
  };

  const titleStyle = {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--mall-primary, #3b1c60)',
    margin: '0 0 1.2rem 0',
    display: 'flex',
    alignItems: 'center',
  };

  // Icon-Stil
  const iconStyle = {
    marginRight: '0.5rem',
    fontSize: '1.2rem',
    color: 'var(--mall-primary, #3b1c60)',
    opacity: 0.7,
  };

  const sliderStyle = {
    margin: 0,
    padding: '0.75rem 0.25rem',
    overflowX: 'auto' as React.CSSProperties['overflowX'],
    display: 'flex',
    WebkitOverflowScrolling: 'touch' as any,
    scrollBehavior: 'smooth' as React.CSSProperties['scrollBehavior'],
    msOverflowStyle: 'none' as any, // IE/Edge
    scrollbarWidth: 'none' as any, // Firefox
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'pan-x' as React.CSSProperties['touchAction'], // Verbesserte Touch-Unterstützung
    WebkitUserSelect: 'none' as any, // Verhindert Textauswahl während des Swipens
    userSelect: 'none' as any, // Verhindert Textauswahl während des Swipens
    scrollSnapType: 'x mandatory' as React.CSSProperties['scrollSnapType'],
    gap: '1rem',
    position: 'relative' as React.CSSProperties['position'],
    backgroundColor: 'transparent', // Transparenter Hintergrund
    borderRadius: '8px',
    '&::-webkit-scrollbar': {
      display: 'none' // Chrome/Safari/Opera
    },
  };

  const arrowStyle = (isVisible: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex', // Immer anzeigen
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100, // Sehr hoher z-index damit die Pfeile immer sichtbar sind
    border: 'none',
    outline: 'none',
    color: 'var(--mall-primary, #3b1c60)',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    opacity: 1, // Immer voll sichtbar
    transition: 'none', // Keine Transition um Flackern zu vermeiden
  });

  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '0.75rem',
    gap: '8px',
    padding: '0.5rem 0',
  };

  const dotStyle = (isActive: boolean): React.CSSProperties => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: isActive
      ? 'var(--mall-primary, #3b1c60)'
      : 'rgba(var(--mall-primary-rgb, 59, 28, 96), 0.15)',
    transition: 'all 0.3s ease',
    transform: isActive ? 'scale(1.2)' : 'scale(1)',
    boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    margin: '0 2px',
  });

  // Swipe-Hinweis-Stil mit Timeout statt Animation
  const [showSwipeHint, setShowSwipeHint] = useState<boolean>(true);

  // Hinweis nach 3 Sekunden ausblenden
  useEffect(() => {
    if (shops.length > getVisibleItemCount()) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [shops.length]);

  const swipeHintStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    backgroundColor: 'rgba(var(--mall-primary-rgb, 59, 28, 96), 0.8)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 500,
    opacity: 0.9,
    pointerEvents: 'none',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
    transform: 'translateY(0)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    display: (shops.length > getVisibleItemCount() && showSwipeHint) ? 'flex' : 'none',
    alignItems: 'center',
    gap: '6px',
  };

  return (
    <div style={sectionStyle}>
      <h2 style={titleStyle}>
        <span style={iconStyle}>🛒</span>
        {title}
      </h2>

      {/* Navigationspfeile */}
      <button
        onClick={handleScrollLeft}
        style={{
          ...arrowStyle(showLeftArrow),
          left: '-10px',
        }}
        aria-label="Nach links scrollen"
      >
        ‹
      </button>

      <button
        onClick={handleScrollRight}
        style={{
          ...arrowStyle(showRightArrow),
          right: '-10px',
        }}
        aria-label="Nach rechts scrollen"
      >
        ›
      </button>

      {/* Shop-Karten mit Touch-Events */}
      <div
        ref={sliderRef}
        style={sliderStyle}
        onScroll={checkArrows}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
      >
        {shops.map((shop, index) => (
          <ShopCard
            key={`shop-${index}-${shop.name}`}
            data={shop}
          />
        ))}
      </div>

      {/* Pagination-Indikatoren - immer anzeigen */}
      <div style={paginationStyle}>
        {Array.from({ length: Math.max(1, Math.ceil(shops.length / getVisibleItemCount())) }).map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => handleDotClick(index)}
            style={dotStyle(Math.floor(currentIndex / Math.max(1, getVisibleItemCount())) === index)}
            aria-label={`Zu Seite ${index + 1} springen`}
          />
        ))}
      </div>

      {/* Swipe-Hinweis */}
      <div style={swipeHintStyle}>
        <span style={{fontSize: '1.1rem'}}>⇄</span>
        Wischen zum Scrollen
      </div>
    </div>
  );
};

export default ShopSlider;