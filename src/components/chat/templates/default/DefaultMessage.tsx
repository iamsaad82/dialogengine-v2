'use client';

import React from 'react';

interface DefaultMessageProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode;
}

/**
 * Modernisierte Standard-Message-Komponente
 */
const DefaultMessage: React.FC<DefaultMessageProps> = ({
  content,
  isStreaming = false,
  messageControls
}) => {
  return (
    <div className="message-content modern-message">
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
        <div className="streaming-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      )}
    </div>
  );
};

export default DefaultMessage;