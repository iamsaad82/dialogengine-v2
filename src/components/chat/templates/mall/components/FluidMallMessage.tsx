'use client';

import React, { useState, useEffect } from 'react';
import { MallSection } from '../utils/contentParser';
import FluidShopSlider from './FluidShopSlider';
import FluidRestaurantSlider from './FluidRestaurantSlider';
import FluidEventSlider from './FluidEventSlider';
import FluidServiceSlider from './FluidServiceSlider';
import FluidOpeningHoursCard from './FluidOpeningHoursCard';
import FluidParkingCard from './FluidParkingCard';

interface FluidMallMessageProps {
  sections: MallSection[];
  isStreaming: boolean;
  colorStyle?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * Eine flüssige Mall-Nachricht mit optimiertem Streaming-Verhalten
 * 
 * Diese Komponente verwendet fortschrittliche Techniken für ein nahtloses
 * Streaming-Erlebnis ohne Flackern oder Layout-Sprünge.
 */
const FluidMallMessage: React.FC<FluidMallMessageProps> = ({
  sections,
  isStreaming,
  colorStyle = {
    primaryColor: '#3b1c60',
    secondaryColor: '#ff5a5f'
  }
}) => {
  // State für Animation und Tracking
  const [visibleSections, setVisibleSections] = useState<MallSection[]>([]);
  
  // Effekt für sanfte Übergänge beim Streaming
  useEffect(() => {
    // Sanft neue Sektionen hinzufügen, mit Verzögerung für flüssige Animation
    const timer = setTimeout(() => {
      setVisibleSections(sections);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [sections]);
  
  // Styling für den Container
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '1.5rem',
    '--primary-color': colorStyle.primaryColor,
    '--secondary-color': colorStyle.secondaryColor,
  } as React.CSSProperties;
  
  // Styling für die Intro-Sektion
  const introStyle: React.CSSProperties = {
    fontSize: '1rem',
    lineHeight: '1.5',
    color: '#333',
    marginBottom: '0.5rem',
  };
  
  // Styling für die Tip-Sektion
  const tipStyle: React.CSSProperties = {
    fontSize: '1rem',
    lineHeight: '1.5',
    color: '#333',
    padding: '1rem',
    backgroundColor: 'rgba(59, 28, 96, 0.05)',
    borderRadius: '8px',
    borderLeft: '4px solid var(--primary-color)',
  };
  
  // Finde die Intro-Sektion
  const introSection = visibleSections.find(section => section.type === 'intro');
  
  // Finde die Tip-Sektion
  const tipSection = visibleSections.find(section => section.type === 'tip');
  
  // Finde die Shops-Sektion
  const shopsSection = visibleSections.find(section => section.type === 'shops');
  
  // Finde die Restaurants-Sektion
  const restaurantsSection = visibleSections.find(section => section.type === 'restaurants');
  
  // Finde die Events-Sektion
  const eventsSection = visibleSections.find(section => section.type === 'events');
  
  // Finde die Services-Sektion
  const servicesSection = visibleSections.find(section => section.type === 'services');
  
  // Finde die OpeningHours-Sektion
  const openingHoursSection = visibleSections.find(section => section.type === 'openingHours');
  
  // Finde die Parking-Sektion
  const parkingSection = visibleSections.find(section => section.type === 'parking');
  
  return (
    <div style={containerStyle} className="fluid-mall-message">
      {/* Intro-Sektion */}
      {(introSection || isStreaming) && (
        <div style={introStyle} className="fluid-mall-intro">
          {introSection?.content && (
            <div dangerouslySetInnerHTML={{ __html: introSection.content }} />
          )}
        </div>
      )}
      
      {/* Shops-Sektion */}
      {(shopsSection || isStreaming) && (
        <FluidShopSlider
          title={shopsSection?.title || 'Shops'}
          shops={shopsSection?.items || []}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}
      
      {/* Restaurants-Sektion */}
      {(restaurantsSection || isStreaming) && (
        <FluidRestaurantSlider
          title={restaurantsSection?.title || 'Restaurants'}
          restaurants={restaurantsSection?.items || []}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}
      
      {/* Events-Sektion */}
      {(eventsSection || isStreaming) && (
        <FluidEventSlider
          title={eventsSection?.title || 'Events'}
          events={eventsSection?.items || []}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}
      
      {/* Services-Sektion */}
      {(servicesSection || isStreaming) && (
        <FluidServiceSlider
          title={servicesSection?.title || 'Services'}
          services={servicesSection?.items || []}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}
      
      {/* OpeningHours-Sektion */}
      {(openingHoursSection || isStreaming) && (
        <FluidOpeningHoursCard
          title={openingHoursSection?.title || 'Öffnungszeiten'}
          data={openingHoursSection?.data || null}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}
      
      {/* Parking-Sektion */}
      {(parkingSection || isStreaming) && (
        <FluidParkingCard
          title={parkingSection?.title || 'Parkgebühren'}
          data={parkingSection?.data || null}
          isStreaming={isStreaming}
          colorStyle={colorStyle}
        />
      )}
      
      {/* Tip-Sektion */}
      {(tipSection || isStreaming) && (
        <div style={tipStyle} className="fluid-mall-tip">
          {tipSection?.content && (
            <div dangerouslySetInnerHTML={{ __html: tipSection.content }} />
          )}
        </div>
      )}
    </div>
  );
};

export default FluidMallMessage;
