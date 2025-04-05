'use client';

import React, { useEffect, useRef } from 'react';

interface AOKContactInfoProps {
  content: string;
}

/**
 * AOK-spezifische Kontaktinformationen-Komponente
 *
 * Zeigt Kontaktdaten im AOK-Design mit hervorgehobener Telefonnummer, E-Mail, etc. an
 */
const AOKContactInfo: React.FC<AOKContactInfoProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Nachträgliche Anpassungen für Kontakt-Elemente
  useEffect(() => {
    if (!contentRef.current) return;

    // Telefonnummer-Formatierung verbessern
    const phoneElements = contentRef.current.querySelectorAll('a[href^="tel:"]');
    phoneElements.forEach(phone => {
      // Telefonnummer als hervorgehobenes Element darstellen
      if (!phone.parentElement?.classList.contains('aok-phone')) {
        const phoneContainer = document.createElement('div');
        phoneContainer.className = 'aok-phone';
        phone.parentNode?.insertBefore(phoneContainer, phone);
        phoneContainer.appendChild(phone);
      }
    });

    // E-Mail-Formatierung verbessern
    const emailElements = contentRef.current.querySelectorAll('a[href^="mailto:"]');
    emailElements.forEach(email => {
      email.classList.add('aok-email');
    });
  }, [content]);

  return (
    <div className="aok-contact-box" ref={contentRef}>
      <div className="aok-contact-title">Kontakt & Service</div>
      <div
        className="aok-contact-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default AOKContactInfo;