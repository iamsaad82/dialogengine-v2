'use client';

import React from 'react';

interface SkeletonLoaderProps {
  type: 'intro' | 'shops' | 'restaurants' | 'tip' | 'events' | 'openingHours' | 'parking';
}

/**
 * Verbesserte Skeleton-Loader für verschiedene Sektionstypen im Mall-Template
 * Verhindert Layout-Shifts während des Streamings mit optimierter Performance
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type }) => {
  // Gemeinsame Basis-Stile mit verbesserten Performance-Eigenschaften
  const baseStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '8px',
    animation: 'none',
    transition: 'none',
    willChange: 'auto',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    opacity: 1,
    contain: 'strict', // Verbesserte Rendering-Performance
  };

  switch (type) {
    case 'intro':
      return (
        <div style={{
          ...baseStyle,
          height: '80px',
          width: '100%',
          margin: '1rem 0',
        }} className="mall-skeleton mall-skeleton-intro" />
      );

    case 'shops':
    case 'restaurants':
      return (
        <div className="mall-skeleton-section">
          <div style={{
            ...baseStyle,
            height: '30px',
            width: '200px',
            marginBottom: '1rem',
          }} className="mall-skeleton mall-skeleton-title" />
          <div style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'hidden',
            paddingBottom: '8px', // Verhindert Layout-Shift beim Hinzufügen von Scrollbars
          }} className="mall-skeleton-slider">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                ...baseStyle,
                height: '200px',
                width: '220px',
                flexShrink: 0,
              }} className="mall-skeleton mall-skeleton-card" />
            ))}
          </div>
        </div>
      );

    case 'events':
      return (
        <div className="mall-skeleton-section">
          <div style={{
            ...baseStyle,
            height: '30px',
            width: '200px',
            marginBottom: '1rem',
          }} className="mall-skeleton mall-skeleton-title" />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }} className="mall-skeleton-events">
            {[1, 2].map((i) => (
              <div key={i} style={{
                ...baseStyle,
                height: '100px',
                width: '100%',
              }} className="mall-skeleton mall-skeleton-event" />
            ))}
          </div>
        </div>
      );

    case 'openingHours':
      return (
        <div className="mall-skeleton-section">
          <div style={{
            ...baseStyle,
            height: '30px',
            width: '200px',
            marginBottom: '1rem',
          }} className="mall-skeleton mall-skeleton-title" />
          <div style={{
            ...baseStyle,
            height: '180px',
            width: '100%',
          }} className="mall-skeleton mall-skeleton-hours" />
        </div>
      );

    case 'parking':
      return (
        <div className="mall-skeleton-section">
          <div style={{
            ...baseStyle,
            height: '30px',
            width: '200px',
            marginBottom: '1rem',
          }} className="mall-skeleton mall-skeleton-title" />
          <div style={{
            ...baseStyle,
            height: '150px',
            width: '100%',
          }} className="mall-skeleton mall-skeleton-parking" />
        </div>
      );

    case 'tip':
      return (
        <div style={{
          ...baseStyle,
          height: '60px',
          width: '100%',
          margin: '1rem 0',
          borderLeft: '3px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '0 8px 8px 0',
        }} className="mall-skeleton mall-skeleton-tip" />
      );

    default:
      return null;
  }
};

export default SkeletonLoader;
