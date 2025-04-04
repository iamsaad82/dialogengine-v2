'use client';

import React from 'react';

interface MallHeaderProps {
  title?: string;
  subtitle?: string;
  style?: React.CSSProperties;
}

/**
 * Header-Komponente für das Shopping Mall Template
 */
const MallHeader: React.FC<MallHeaderProps> = ({
  title = 'Shopping Center',
  subtitle = 'Alle Shops und Services unter einem Dach',
  style = {}
}) => {
  return (
    <div className="mall-header" style={{
      ...style,
      backgroundColor: 'var(--mall-primary, #3b1c60)',
      color: 'var(--mall-light-text, #ffffff)',
      padding: '1.5rem',
      textAlign: 'center',
      borderRadius: '8px'
    }}>
      <h1 className="mall-logo" style={{
        fontSize: '1.8rem',
        fontWeight: 700,
        margin: 0,
        lineHeight: 1.2
      }}>{title}</h1>
      <p className="mall-subtitle" style={{
        fontSize: '1rem',
        margin: '0.5rem 0 0',
        opacity: 0.9
      }}>{subtitle}</p>
    </div>
  );
};

export default MallHeader;