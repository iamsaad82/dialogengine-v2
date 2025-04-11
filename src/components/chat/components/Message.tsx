'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { Message as MessageType } from '../types/common'
import '../styles/message-content.css'
import '../styles/message-header.css'
import StreamingContent from './StreamingContent'
import { MessageContent } from './MessageContent/MessageContent'
import { MessageHeader } from './MessageHeader'
import { MessageControls } from './MessageControls'
import { Suspense, lazy } from 'react'
import { getTemplateComponents } from '../templates'
import { hexToRgbString } from '@/utils/colorUtils'

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
  // Entferne streaming-message Klasse, um Flackern zu verhindern
  const messageClass = isBot
    ? `${messageTemplate}-message message assistant no-animation`
    : `message user no-animation`; // Keine Template-Klasse für User-Nachrichten

  // Entferne streaming-content Klasse, um Flackern zu verhindern
  const contentClass = `message-content no-animation`;

  // RGB-Werte für CSS-Variablen extrahieren
  const primaryColorRgb = colorStyle?.primaryColor ? hexToRgbString(colorStyle.primaryColor) : '59, 130, 246';
  const accentColorRgb = colorStyle?.botAccentColor ? hexToRgbString(colorStyle.botAccentColor) : '59, 130, 246';
  const botBgColorRgb = '248, 250, 252'; // Standardwert für Hintergrund

  // Inline-Styles - Minimal und effektiv
  const messageStyles = {
    background: isBot
      ? colorStyle?.botBgColor || 'var(--bot-bg-color)'
      : colorStyle?.primaryColor || 'var(--user-bg-color, var(--bot-primary-color, #3b82f6))', // Verwende die Primärfarbe aus den Bot-Einstellungen
    color: isBot
      ? colorStyle?.botTextColor || 'var(--bot-text-color)'
      : colorStyle?.userTextColor || 'var(--user-text-color, #1e293b)', // Verwende die Textfarbe aus den Bot-Einstellungen
    width: 'fit-content', // Begrenze die Breite auf den Inhalt
    maxWidth: isBot ? '80%' : '70%', // User-Nachrichten etwas schmaler als Bot-Nachrichten
    '--bot-primary-color-rgb': primaryColorRgb,
    '--bot-accent-color-rgb': accentColorRgb,
    '--bot-bg-color-rgb': botBgColorRgb,
    padding: isBot ? undefined : '0.75rem 1rem', // Direktes Padding für User-Nachrichten
  } as React.CSSProperties;

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
      <>
        <MessageHeader
          botName={botName}
          botAvatarUrl={botAvatarUrl}
          showName={settings?.showNameInHeader !== undefined ? settings.showNameInHeader : true}
        />
        <div className={`${messageTemplate}-message message assistant`} style={messageStyles}>
          <div className="message-content-wrapper" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', contain: 'layout' }}>
            <Suspense fallback={<div className="message-loading">Lade Nachricht...</div>}>
              <TemplateComponents.Message
                content={content}
                isStreaming={isStreaming && isLast}
                colorStyle={colorStyle}
                isComplete={!isStreaming || !isLast}
                messageControls={null} // Keine MessageControls mehr an das Template übergeben
                query={message.content} // Die ursprüngliche Anfrage des Nutzers für bessere Relevanzfilterung
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
      </>
    );
  }

  // User-Nachricht ohne Wrapper, um Abstände zu vermeiden
  return (
    <div className="message user" style={messageStyles}>
      <div className={contentClass} style={{ width: '100%', minWidth: '60px' }}>
        <MessageContent content={content} role={role} messageTemplate={null} />
      </div>
    </div>
  );
};

export default Message;