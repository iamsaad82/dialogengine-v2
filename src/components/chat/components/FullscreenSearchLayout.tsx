import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types/common';
import { BotSuggestion } from '@/types/bot';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface FullscreenSearchLayoutProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onCancelMessage: () => void;
  botName: string;
  botId: string;
  botPrimaryColor?: string;
  botBgColor?: string;
  botTextColor?: string;
  botAccentColor?: string;
  userBgColor?: string;
  userTextColor?: string;
  enableFeedback?: boolean;
  showCopyButton?: boolean;
  showNameInHeader?: boolean;
  botAvatarUrl?: string;
  suggestions?: BotSuggestion[];
  messageTemplate?: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const FullscreenSearchLayout: React.FC<FullscreenSearchLayoutProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onCancelMessage,
  botName,
  botId,
  botPrimaryColor,
  botBgColor,
  botTextColor,
  botAccentColor,
  userBgColor,
  userTextColor,
  enableFeedback,
  showCopyButton,
  showNameInHeader,
  botAvatarUrl,
  suggestions = [],
  messageTemplate,
  messagesEndRef,
}) => {
  // State für den Modus (initial oder results)
  const [mode, setMode] = useState<'initial' | 'results'>(
    messages.length > 0 ? 'results' : 'initial'
  );

  // Ref für Animationen
  const canvasRef = useRef<HTMLDivElement>(null);

  // Wechselt zum Ergebnismodus, wenn Nachrichten vorhanden sind
  useEffect(() => {
    if (messages.length > 0 && mode === 'initial') {
      setMode('results');
    }
  }, [messages, mode]);

  // Funktion zum Senden einer Nachricht
  const handleSendMessage = (message: string) => {
    onSendMessage(message);
    // Animationseffekt starten
    if (mode === 'initial') {
      createThoughtCanvasAnimation();
    }
  };

  // Animationseffekt für den Übergang
  const createThoughtCanvasAnimation = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Partikel erstellen
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.classList.add('thought-canvas-particle');

      // Zufällige Position und Größe
      const size = Math.random() * 20 + 5;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // Styling
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.opacity = '0';
      particle.style.transform = 'scale(0)';

      canvas.appendChild(particle);

      // Animation
      setTimeout(() => {
        particle.style.transition = `all ${Math.random() * 0.5 + 0.5}s cubic-bezier(0.19, 1, 0.22, 1)`;
        particle.style.opacity = `${Math.random() * 0.5 + 0.2}`;
        particle.style.transform = 'scale(1)';

        // Entfernen nach Animation
        setTimeout(() => {
          particle.style.opacity = '0';
          particle.style.transform = 'scale(0)';

          setTimeout(() => {
            if (canvas.contains(particle)) {
              canvas.removeChild(particle);
            }
          }, 500);
        }, Math.random() * 1000 + 500);
      }, Math.random() * 200);
    }
  };

  // Rendert den Anfangszustand mit zentriertem Eingabefeld
  const renderInitialState = () => (
    <div className="fullscreenSearch-initial">
      <div className="fullscreenSearch-intro">
        {botAvatarUrl && <img src={botAvatarUrl} alt={botName} />}
        <h1 style={{ color: botPrimaryColor || 'inherit' }}>{botName}</h1>
        <p>Stellen Sie Ihre Frage und erhalten Sie sofort eine Antwort.</p>
      </div>

      <div className="fullscreenSearch-input-container thought-canvas" ref={canvasRef}>
        <ChatInput
          onSend={handleSendMessage}
          onCancel={onCancelMessage}
          isLoading={isLoading}
          botPrimaryColor={botPrimaryColor}
          botAccentColor={botAccentColor}
          botTextColor={botTextColor}
        />
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="fullscreenSearch-suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(suggestion.text)}
              className="px-4 py-2 rounded-full text-sm bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 backdrop-blur-sm transition-all"
              style={{
                borderColor: `${botPrimaryColor}40` || 'rgba(0,0,0,0.1)',
                borderWidth: '1px',
                borderStyle: 'solid',
                color: botTextColor || 'inherit',
              }}
            >
              {suggestion.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Rendert den Ergebniszustand mit Antworten
  const renderResultsState = () => (
    <div className="fullscreenSearch-results">
      <div className="fullscreenSearch-results-header">
        {botAvatarUrl && (
          <img src={botAvatarUrl} alt={botName} className="fullscreenSearch-results-logo" />
        )}
        <div className="fullscreenSearch-results-input">
          <ChatInput
            onSend={handleSendMessage}
            onCancel={onCancelMessage}
            isLoading={isLoading}
            botPrimaryColor={botPrimaryColor}
            botAccentColor={botAccentColor}
            botTextColor={botTextColor}
          />
        </div>
      </div>

      <div className="fullscreenSearch-results-messages expanding-universe">
        <div className="universe-core">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            botPrimaryColor={botPrimaryColor}
            botBgColor={botBgColor}
            botTextColor={botTextColor}
            botAccentColor={botAccentColor}
            userBgColor={userBgColor}
            userTextColor={userTextColor}
            enableFeedback={enableFeedback}
            showCopyButton={showCopyButton}
            showNameInHeader={showNameInHeader}
            welcomeMessage={null}
            messagesEndRef={messagesEndRef}
            botAvatarUrl={botAvatarUrl}
            botName={botName}
            botId={botId}
            onSuggestionClick={(text) => handleSendMessage(text)}
            suggestions={suggestions}
            settings={{
              primaryColor: botPrimaryColor,
              botBgColor: botBgColor,
              botTextColor: botTextColor,
              botAccentColor: botAccentColor,
              userBgColor: userBgColor,
              userTextColor: userTextColor,
              showNameInHeader: showNameInHeader,
              messageTemplate: messageTemplate
            }}
            isStreaming={isLoading}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fullscreenSearch">
      {mode === 'initial' ? renderInitialState() : renderResultsState()}
    </div>
  );
};

export default FullscreenSearchLayout;
