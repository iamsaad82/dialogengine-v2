'use client';

import React, { useRef, useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard';
import { ShopData } from './ShopCard';

interface RestaurantSliderProps {
  title: string;
  restaurants: ShopData[];
  style?: React.CSSProperties;
}

/**
 * Slider-Komponente für eine horizontale Anzeige von Restaurant-Karten
 * Mit verbesserter Touch-Swipe-Unterstützung
 */
const RestaurantSlider: React.FC<RestaurantSliderProps> = ({
  title,
  restaurants,
  style = {}
}) => {
  if (!restaurants || restaurants.length === 0) return null;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  // Berechne die Anzahl der sichtbaren Elemente
  const getVisibleItemCount = () => {
    if (!sliderRef.current) return 1;
    const containerWidth = sliderRef.current.clientWidth;
    const itemWidth = 260; // Ungefähre Breite einer Restaurant-Karte
    return Math.floor(containerWidth / itemWidth);
  };

  // Überprüfe, ob Pfeile angezeigt werden sollen
  const checkArrows = () => {
    if (!sliderRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;

    // Linker Pfeil nur anzeigen, wenn bereits gescrollt wurde
    setShowLeftArrow(scrollLeft > 20);

    // Rechter Pfeil nur anzeigen, wenn noch nicht am Ende
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20);

    // Aktuellen Index berechnen
    const itemWidth = 260; // Ungefähre Breite einer Restaurant-Karte
    const newIndex = Math.round(scrollLeft / itemWidth);
    setCurrentIndex(newIndex);
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
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
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
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-Geschwindigkeit
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const sectionStyle = {
    ...style,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: '1.5rem',
    margin: '1.5rem',
    borderRadius: '8px',
    position: 'relative' as React.CSSProperties['position'],
  };

  const titleStyle = {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: 'var(--mall-primary, #3b1c60)',
    margin: '0 0 1rem 0'
  };

  const sliderStyle = {
    margin: 0,
    padding: '0.5rem 0',
    overflowX: 'auto' as React.CSSProperties['overflowX'],
    display: 'flex',
    WebkitOverflowScrolling: 'touch' as any,
    scrollBehavior: 'smooth' as React.CSSProperties['scrollBehavior'],
    msOverflowStyle: 'none' as any, // IE/Edge
    scrollbarWidth: 'none' as any, // Firefox
    cursor: isDragging ? 'grabbing' : 'grab',
    '&::-webkit-scrollbar': {
      display: 'none' // Chrome/Safari/Opera
    },
  };

  const arrowStyle = (isVisible: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'white',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    display: isVisible ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2,
    border: 'none',
    outline: 'none',
    color: 'var(--mall-primary, #3b1c60)',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  });

  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '0.5rem',
    gap: '6px'
  };

  const dotStyle = (isActive: boolean): React.CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isActive ? 'var(--mall-primary, #3b1c60)' : '#ccc',
    transition: 'background-color 0.3s ease'
  });

  // Swipe-Hinweis-Stil mit Timeout statt Animation
  const [showSwipeHint, setShowSwipeHint] = useState<boolean>(true);

  // Hinweis nach 3 Sekunden ausblenden
  useEffect(() => {
    if (restaurants.length > getVisibleItemCount()) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [restaurants.length]);

  const swipeHintStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    opacity: 0.8,
    pointerEvents: 'none',
    transition: 'opacity 0.5s ease',
    display: (restaurants.length > getVisibleItemCount() && showSwipeHint) ? 'block' : 'none'
  };

  return (
    <div style={sectionStyle}>
      <h2 style={titleStyle}>{title}</h2>

      {/* Navigationspfeile */}
      <button
        onClick={handleScrollLeft}
        style={{
          ...arrowStyle(showLeftArrow),
          left: '10px',
        }}
        aria-label="Nach links scrollen"
      >
        ‹
      </button>

      <button
        onClick={handleScrollRight}
        style={{
          ...arrowStyle(showRightArrow),
          right: '10px',
        }}
        aria-label="Nach rechts scrollen"
      >
        ›
      </button>

      {/* Restaurant-Karten mit Touch-Events */}
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
      >
        {restaurants.map((restaurant, index) => (
          <RestaurantCard
            key={`restaurant-${index}-${restaurant.name}`}
            data={restaurant}
          />
        ))}
      </div>

      {/* Pagination-Indikatoren */}
      {restaurants.length > 1 && (
        <div style={paginationStyle}>
          {Array.from({ length: Math.ceil(restaurants.length / getVisibleItemCount()) }).map((_, index) => (
            <div
              key={`dot-${index}`}
              style={dotStyle(Math.floor(currentIndex / getVisibleItemCount()) === index)}
            />
          ))}
        </div>
      )}

      {/* Swipe-Hinweis */}
      <div style={swipeHintStyle}>Wischen zum Scrollen</div>
    </div>
  );
};

export default RestaurantSlider;