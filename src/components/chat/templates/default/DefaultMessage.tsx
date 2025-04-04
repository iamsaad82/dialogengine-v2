'use client';

import React from 'react';

interface DefaultMessageProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode;
}

/**
 * Standard-Message-Komponente
 */
const DefaultMessage: React.FC<DefaultMessageProps> = ({ 
  content, 
  isStreaming = false,
  messageControls 
}) => {
  return (
    <div className="message-content">
      {/* Nachrichtensteuerung (Kopieren, Feedback, etc.) */}
      {messageControls && (
        <div className="message-controls">{messageControls}</div>
      )}
      
      {/* Nachrichteninhalt */}
      <div 
        className={`prose prose-sm break-words ${isStreaming ? 'streaming-content' : ''}`}
        dangerouslySetInnerHTML={{ __html: content }} 
      />
      
      {/* Streaming-Indikator */}
      {isStreaming && (
        <div className="streaming-indicator">...</div>
      )}
    </div>
  );
};

export default DefaultMessage; 