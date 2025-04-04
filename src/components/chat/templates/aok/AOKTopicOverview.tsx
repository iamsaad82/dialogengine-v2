'use client';

import React from 'react';
import Image from 'next/image';

interface AOKTopicOverviewProps {
  title: string;
  titleHighlight?: string;
  badge?: string;
  description: string;
  image: string;
  sections: {
    title: string;
    content: string;
    bulletPoints?: string[];
  }[];
}

/**
 * AOK-Themenübersicht Komponente
 * 
 * Zeigt eine strukturierte Übersicht zu einem AOK-Thema mit Bild, 
 * Titel, Beschreibung und mehreren Inhaltsabschnitten
 */
const AOKTopicOverview: React.FC<AOKTopicOverviewProps> = ({
  title,
  titleHighlight,
  badge,
  description,
  image,
  sections
}) => {
  // Titel aufteilen, wenn ein hervorgehobener Teil vorhanden ist
  const renderTitle = () => {
    if (titleHighlight) {
      const parts = title.split(titleHighlight);
      return (
        <>
          {parts[0]}
          <span className="highlight">{titleHighlight}</span>
          {parts[1] || ''}
        </>
      );
    }
    return title;
  };

  return (
    <div className="aok-topic-overview">
      <div className="aok-topic-header">
        {badge && (
          <div className="aok-topic-badge">{badge}</div>
        )}
        <h1 className="aok-topic-title">{renderTitle()}</h1>
        <p className="aok-topic-description">{description}</p>
      </div>
      
      {image && (
        <img 
          src={image} 
          alt={title} 
          className="aok-topic-image" 
        />
      )}
      
      <div className="aok-topic-content">
        {sections.map((section, index) => (
          <div key={index} className="aok-topic-section">
            <h2 className="aok-topic-section-title">{section.title}</h2>
            <p className="aok-topic-section-text">{section.content}</p>
            
            {section.bulletPoints && section.bulletPoints.length > 0 && (
              <ul className="aok-topic-list">
                {section.bulletPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AOKTopicOverview; 