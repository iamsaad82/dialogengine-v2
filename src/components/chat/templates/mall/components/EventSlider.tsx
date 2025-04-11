'use client';

import React from 'react';
import EventCard, { EventData } from './EventCard';

interface EventSliderProps {
  title: string;
  events: EventData[];
  style?: React.CSSProperties;
}

/**
 * Komponente für die Anzeige einer Liste von Veranstaltungen im Mall-Template
 */
const EventSlider: React.FC<EventSliderProps> = ({
  title,
  events,
  style = {}
}) => {
  if (!events || events.length === 0) return null;

  // Moderne Basis-Stile
  const sectionStyle: React.CSSProperties = {
    ...style,
    margin: '1.5rem 0',
    padding: '0 1.5rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--mall-primary, #3b1c60)',
    margin: '0 0 1.2rem 0',
    display: 'flex',
    alignItems: 'center',
  };

  // Icon-Stil
  const iconStyle: React.CSSProperties = {
    marginRight: '0.5rem',
    fontSize: '1.2rem',
    color: 'var(--mall-primary, #3b1c60)',
    opacity: 0.7,
  };

  const eventsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  };

  return (
    <div style={sectionStyle} className="mall-events-section">
      <h2 style={titleStyle}>
        <span style={iconStyle}>🎉</span>
        {title}
      </h2>

      <div style={eventsContainerStyle} className="mall-events-container">
        {events.map((event, index) => (
          <EventCard
            key={`event-${index}-${event.title}`}
            data={event}
          />
        ))}
      </div>
    </div>
  );
};

export default EventSlider;
