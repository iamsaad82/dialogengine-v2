'use client';

import React, { memo } from 'react';
import { sanitizeHtml } from '../utils/htmlSanitizer';

interface SanitizedHtmlContentProps {
  content: string;
}

/**
 * Komponente zum sicheren Rendern von HTML-Inhalten
 * 
 * Diese Komponente sanitiert HTML-Inhalte, um XSS-Angriffe zu verhindern,
 * und rendert den bereinigten Inhalt.
 */
export const SanitizedHtmlContent: React.FC<SanitizedHtmlContentProps> = ({ content }) => {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
};

// Exportiere eine memoized Version der Komponente für bessere Performance
export default memo(SanitizedHtmlContent);
