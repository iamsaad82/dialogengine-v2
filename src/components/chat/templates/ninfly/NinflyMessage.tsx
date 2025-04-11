'use client';

import React from 'react';

interface NinflyMessageProps {
  content: string;
  isStreaming?: boolean;
  messageControls?: React.ReactNode;
  isComplete: boolean;
  colorStyle?: Record<string, string>;
}

/**
 * Ninfly Sports Arena Message-Komponente
 */
const NinflyMessage: React.FC<NinflyMessageProps> = ({
  content,
  isStreaming = false,
  messageControls,
  isComplete = true,
  colorStyle
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

      {/* Moderner Streaming-Indikator mit animierten Punkten - nur anzeigen, wenn aktiv gestreamt wird und nicht vollständig */}
      {isStreaming && !isComplete && (
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
