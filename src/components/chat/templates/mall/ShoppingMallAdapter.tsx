'use client';

import React from 'react';
import ShoppingMallMessage from './ShoppingMallMessage';

/**
 * Adapter-Komponente für die Mall-Template-Integration
 * 
 * Diese Komponente konvertiert den generischen colorStyle-Typ in das spezifische 
 * Format, das von der ShoppingMallMessage-Komponente erwartet wird.
 */
const ShoppingMallAdapter: React.FC<{
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode;
  colorStyle?: Record<string, string>;
  isComplete: boolean;
  query?: string;
}> = ({ content, isStreaming, messageControls, colorStyle, isComplete, query }) => {
  // Konvertiere den generischen colorStyle in das spezifische Format
  const adaptedColorStyle = colorStyle ? {
    primaryColor: colorStyle.primaryColor || '#3b1c60',
    secondaryColor: colorStyle.secondaryColor || '#ff5a5f'
  } : undefined;

  return (
    <ShoppingMallMessage
      content={content}
      isStreaming={isStreaming}
      messageControls={messageControls}
      colorStyle={adaptedColorStyle}
      isComplete={isComplete}
      query={query}
    />
  );
};

export default ShoppingMallAdapter; 