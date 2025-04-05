'use client';

import React from 'react';

interface NinflyMessageProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode;
}

/**
 * Ninfly Sports Arena Message-Komponente
 */
const NinflyMessage: React.FC<NinflyMessageProps> = ({ 
  content, 
  isStreaming = false,
  messageControls 
}) => {
  return (
    <div className="message-content ninfly-template">
      {/* Nachrichtensteuerung (Kopieren, Feedback, etc.) */}
      {messageControls && (
        <div className="message-controls">{messageControls}</div>
      )}
      
      {/* Nachrichteninhalt */}
      <div 
        className={`prose prose-sm break-words ${isStreaming ? 'streaming-content' : ''}`}
        dangerouslySetInnerHTML={{ __html: content }} 
      />
      
      {/* Moderner Streaming-Indikator mit animierten Punkten */}
      {isStreaming && (
        <div className="ninfly-streaming-indicator">
          <div className="ninfly-typing-dot"></div>
          <div className="ninfly-typing-dot"></div>
          <div className="ninfly-typing-dot"></div>
        </div>
      )}
    </div>
  );
};

export default NinflyMessage;
