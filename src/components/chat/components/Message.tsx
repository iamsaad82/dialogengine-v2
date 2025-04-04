'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { Message as MessageType } from '../types/common'
import '../styles/message-content.css'
import StreamingContent from './StreamingContent'
import { MessageContent } from './MessageContent/MessageContent'
import { MessageHeader } from './MessageHeader'
import { MessageControls } from './MessageControls'
import { Suspense, lazy } from 'react'
import { getTemplateComponents } from '../templates'

// Hilfsfunktion für Gradienten aus der Primärfarbe
const createGradientFromColor = (color: string | undefined): string => {
  console.log("GRADIENT-DEBUG: Erstelle Gradient aus Farbe:", color);

  if (!color) {
    console.log("GRADIENT-DEBUG: Keine Farbe übergeben, verwende Default-Gradient");
    return 'linear-gradient(135deg, #3b82f6, #1e40af)'; // Default-Gradient
  }

  try {
    // Ein hellerer Verlauf für die Benutzer-Nachrichten
    console.log("GRADIENT-DEBUG: Erzeuge Gradient mit Primärfarbe:", color);

    // Aus der Hex-Farbe die einzelnen RGB-Komponenten extrahieren
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Hellere Version für den Start des Gradienten (10% heller)
    const lighterColor = `#${Math.min(255, Math.floor(r * 1.1)).toString(16).padStart(2, '0')}${
      Math.min(255, Math.floor(g * 1.1)).toString(16).padStart(2, '0')}${
      Math.min(255, Math.floor(b * 1.1)).toString(16).padStart(2, '0')}`;

    // Dunklere Version für das Ende des Gradienten (15% dunkler)
    const darkerColor = `#${Math.floor(r * 0.85).toString(16).padStart(2, '0')}${
      Math.floor(g * 0.85).toString(16).padStart(2, '0')}${
      Math.floor(b * 0.85).toString(16).padStart(2, '0')}`;

    console.log("GRADIENT-DEBUG: Gradient-Farben:", { original: color, lighter: lighterColor, darker: darkerColor });

    return `linear-gradient(135deg, ${lighterColor}, ${darkerColor})`;
  } catch (e) {
    console.log("GRADIENT-DEBUG: Fehler beim Erstellen des Gradienten:", e);
    return 'linear-gradient(135deg, #3b82f6, #1e40af)'; // Fallback
  }
};

// Vereinfachte Message-Komponente ohne Animationen
export const Message: React.FC<{
  message: MessageType;
  isLast: boolean;
  botName?: string;
  botAvatarUrl?: string;
  isStreaming?: boolean;
  colorStyle?: Record<string, string>;
  settings?: {
    messageTemplate?: string | null;
    enableFeedback?: boolean;
    showCopyButton?: boolean;
    showNameInHeader?: boolean;
    botId?: string;
  };
}> = ({
  message,
  isLast,
  botName = 'Brandenburg-Dialog',
  botAvatarUrl = '/logo.png',
  isStreaming = false,
  colorStyle,
  settings
}) => {
  const { content, role } = message;
  const isBot = role === 'assistant';
  const messageTemplate = settings?.messageTemplate || 'default';

  // Template-Komponenten laden
  const TemplateComponents = getTemplateComponents(messageTemplate);

  // Template-Klasse nur für Bot-Nachrichten, User-Nachrichten bleiben unverändert
  const messageClass = isBot
    ? `${messageTemplate}-message message assistant ${isStreaming && isLast ? 'streaming-message' : ''}`
    : `message user`; // Keine Template-Klasse für User-Nachrichten

  const contentClass = `message-content ${isStreaming && isBot && isLast ? 'streaming-content' : ''}`;

  // Inline-Styles - Minimal und effektiv
  const messageStyles = {
    background: isBot
      ? colorStyle?.botBgColor || 'var(--bot-bg-color)'
      : colorStyle?.userBgColor ||
        (colorStyle?.primaryColor ? createGradientFromColor(colorStyle.primaryColor) : 'var(--user-bg-color, var(--bot-primary-color, #3b82f6))'),
    color: isBot
      ? colorStyle?.botTextColor || 'var(--bot-text-color)'
      : '#ffffff', // Immer weiß für Benutzer-Nachrichten, unabhängig von den Einstellungen
    width: 'fit-content', // Begrenze die Breite auf den Inhalt
    maxWidth: isBot ? '80%' : '70%', // User-Nachrichten etwas schmaler als Bot-Nachrichten
  };

  // Debug-Ausgabe für Farben
  console.log("MESSAGE-COLOR-DEBUG:", {
    isBot,
    userTextColor: colorStyle?.userTextColor,
    userBgColor: colorStyle?.userBgColor,
    primaryColor: colorStyle?.primaryColor,
    finalColor: messageStyles.color,
    ignoreUserTextColor: true // Wir ignorieren userTextColor und verwenden immer weiß
  });

  // Bot-Nachricht mit Template-Komponente rendern
  if (isBot) {
    return (
      <div className={`${messageTemplate}-message message assistant ${isStreaming && isLast ? 'streaming-message' : ''}`} style={messageStyles}>
        <MessageHeader
          botName={botName}
          botAvatarUrl={botAvatarUrl}
          showName={settings?.showNameInHeader !== undefined ? settings.showNameInHeader : true}
        />
        <div className="message-content-wrapper">
          <Suspense fallback={<div className="message-loading">Lade Nachricht...</div>}>
            <TemplateComponents.Message
              content={content}
              isStreaming={isStreaming && isLast}
              colorStyle={colorStyle}
              isComplete={!isStreaming || !isLast}
              messageControls={null} // Keine MessageControls mehr an das Template übergeben
            />
          </Suspense>

          {/* MessageControls am Ende der Nachricht platzieren */}
          <div className="message-controls-container">
            <MessageControls
              isBot={true}
              showCopyButton={settings?.showCopyButton !== undefined ? settings.showCopyButton : true}
              enableFeedback={settings?.enableFeedback !== undefined ? settings.enableFeedback : false}
              botAccentColor={colorStyle?.botAccentColor}
              isLastMessage={isLast}
              message={{ content, role }}
              botId={settings?.botId}
            />
          </div>
        </div>
      </div>
    );
  }

  // User-Nachricht bleibt unverändert, Textfarbe wird durch CSS-Regel erzwungen
  return (
    <div className="message user" style={messageStyles}>
      <div className="message-content-wrapper">
        <div className={contentClass}>
          <MessageContent content={content} role={role} messageTemplate={null} />
        </div>
      </div>
    </div>
  );
};

export default Message;