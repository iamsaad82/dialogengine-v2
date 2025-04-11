'use client';

import React from 'react';

interface SkeletonLoaderProps {
  type: 'intro' | 'shops' | 'restaurants' | 'tip';
}

/**
 * Skeleton-Loader für verschiedene Sektionstypen im Mall-Template
 * Verhindert Layout-Shifts während des Streamings
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type }) => {
  // Gemeinsame Basis-Stile
  const baseStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '8px',
    animation: 'none !important',
    transition: 'none !important',
    willChange: 'auto',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    opacity: 1,
  };

  switch (type) {
    case 'intro':
      return (
        <div style={{
          ...baseStyle,
          height: '80px',
          width: '100%',
          margin: '1rem 0',
        }} />
      );

    case 'shops':
    case 'restaurants':
      return (
        <div>
          <div style={{
            ...baseStyle,
            height: '30px',
            width: '200px',
            marginBottom: '1rem',
          }} />
          <div style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'hidden',
          }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                ...baseStyle,
                height: '200px',
                width: '220px',
                flexShrink: 0,
              }} />
            ))}
          </div>
        </div>
      );

    case 'tip':
      return (
        <div style={{
          ...baseStyle,
          height: '60px',
          width: '100%',
          margin: '1rem 0',
        }} />
      );

    default:
      return null;
  }
};

export default SkeletonLoader;
