'use client';

import React, { useEffect } from 'react';
import SmartMallMessage from './SmartMallMessage';

// Debug-Modus
const DEBUG_MODE = true;

/**
 * SmartMall Template Adapter
 * 
 * Dieser Adapter stellt die Kompatibilität zwischen dem generischen Template-Interface
 * und dem spezifischen SmartMall-Template her.
 */
const SmartMallAdapter: React.FC<{
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode;
  colorStyle?: Record<string, string>;
  isComplete: boolean;
  query?: string;
}> = ({ content, isStreaming, messageControls, colorStyle, isComplete, query }) => {
  // Debug-Ausgabe beim Empfangen von Content
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log('SMARTMALL-ADAPTER: Content empfangen', {
        contentLength: content?.length || 0,
        isStreaming,
        isComplete,
        contentPreview: content ? `${content.substring(0, 100)}${content.length > 100 ? '...' : ''}` : 'leer'
      });
    }
  }, [content, isStreaming, isComplete]);

  // Konvertiere den generischen colorStyle in das spezifische Format
  const adaptedColorStyle = colorStyle ? {
    primaryColor: colorStyle.primaryColor || colorStyle.primary || '#3b1c60',
    secondaryColor: colorStyle.secondaryColor || colorStyle.secondary || '#ff5a5f'
  } : undefined;

  return (
    <SmartMallMessage
      content={content}
      isStreaming={isStreaming}
      messageControls={messageControls}
      colorStyle={adaptedColorStyle}
      isComplete={isComplete}
      query={query}
    />
  );
};

export default SmartMallAdapter; 