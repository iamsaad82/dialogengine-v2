'use client';

import React, { memo } from 'react';
import { sanitizeFollowUpContent } from '../utils/htmlSanitizer';

interface SanitizedFollowUpContentProps {
  content: string;
}

/**
 * Komponente zum sicheren Rendern von Follow-Up-Inhalten
 * 
 * Diese Komponente sanitiert Follow-Up-Inhalte, fügt spezielle Styling-Klassen hinzu
 * und stellt sicher, dass Links in einem neuen Tab geöffnet werden.
 */
export const SanitizedFollowUpContent: React.FC<SanitizedFollowUpContentProps> = ({ content }) => {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeFollowUpContent(content) }} />;
};

// Exportiere eine memoized Version der Komponente für bessere Performance
export default memo(SanitizedFollowUpContent);
