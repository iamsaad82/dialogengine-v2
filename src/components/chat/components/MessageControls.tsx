'use client';

import React, { useState } from 'react';
import { Message } from '../types/common';
import { CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon } from './ui/icons';
import { LunaryClient } from '@/lib/lunary';

export interface MessageControlsProps {
  showCopyButton?: boolean;
  enableFeedback?: boolean;
  message?: Message;
  isBot: boolean;
  botId?: string;
  isLastMessage?: boolean;
  botAccentColor?: string;
}

/**
 * Steuerelemente für Nachrichten (Kopieren, Feedback, etc.)
 */
export const MessageControls: React.FC<MessageControlsProps> = ({
  showCopyButton = true,
  enableFeedback = false,
  message,
  isBot,
  botId = 'default',
  isLastMessage = false,
  botAccentColor = '#3b82f6'
}) => {
  const [copied, setCopied] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Kopiert den Nachrichteninhalt in die Zwischenablage
  const handleCopy = () => {
    if (!message?.content) return;

    // HTML-Tags entfernen für reinen Text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = message.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    navigator.clipboard.writeText(textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Positives Feedback senden
  const sendPositiveFeedback = () => {
    // API-Aufruf zum Speichern des Feedbacks
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 2000);

    // Tracking für Feedback
    LunaryClient.trackFeedback({
      rating: 'positive',
      conversationId: botId || 'unknown',
      botId: botId,
      comment: `Feedback zu Nachricht: ${message?.content.slice(0, 50)}...`
    });

    console.log(`Feedback gesendet: positiv für Bot ${botId}`);
  };

  // Negatives Feedback senden
  const sendNegativeFeedback = () => {
    // API-Aufruf zum Speichern des Feedbacks
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 2000);

    // Tracking für Feedback
    LunaryClient.trackFeedback({
      rating: 'negative',
      conversationId: botId || 'unknown',
      botId: botId,
      comment: `Feedback zu Nachricht: ${message?.content.slice(0, 50)}...`
    });

    console.log(`Feedback gesendet: negativ für Bot ${botId}`);
  };

  // Zeit-Anzeige im Footer der Nachricht
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mt-1 flex items-center justify-end gap-2 text-xs text-muted-foreground/70">
      {isBot && (
        <div className="flex items-center gap-2">
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 opacity-100 hover:bg-muted/50"
              aria-label="Nachricht kopieren"
              title="Nachricht kopieren"
              style={{ '--accent-color': botAccentColor } as React.CSSProperties}
            >
              {copied ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5" style={{ color: botAccentColor }} />
                  <span style={{ color: botAccentColor }}>Kopiert</span>
                </>
              ) : (
                <>
                  <CopyIcon className="h-3.5 w-3.5" />
                  <span>Kopieren</span>
                </>
              )}
            </button>
          )}

          {enableFeedback && !feedbackSent && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={sendPositiveFeedback}
                className="rounded p-1 opacity-100 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
                aria-label="Positive Bewertung"
                title="Diese Nachricht war hilfreich"
                style={{ '--accent-color': botAccentColor } as React.CSSProperties}
              >
                <ThumbsUpIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={sendNegativeFeedback}
                className="rounded p-1 opacity-100 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                aria-label="Negative Bewertung"
                title="Diese Nachricht war nicht hilfreich"
                style={{ '--accent-color': botAccentColor } as React.CSSProperties}
              >
                <ThumbsDownIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {enableFeedback && feedbackSent && (
            <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400" style={{ color: botAccentColor }}>
              Danke für Ihr Feedback!
            </span>
          )}
        </div>
      )}

      {!isBot && isLastMessage && (
        <div className="flex items-center gap-1">
          <CheckIcon className="h-3.5 w-3.5" style={{ color: botAccentColor }} />
          <span style={{ color: botAccentColor }}>Gesendet</span>
        </div>
      )}

      <span suppressHydrationWarning>
        {currentTime}
      </span>
    </div>
  );
};