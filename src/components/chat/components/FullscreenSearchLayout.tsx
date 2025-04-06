import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types/common';
import { BotSuggestion } from '@/types/bot';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Hilfsfunktion zum Generieren von Segmentinhalten basierend auf dem Thema
  const generateSegmentContent = (segment: string, content: string): string => {
    // Extrahiere relevante Informationen aus dem Inhalt basierend auf dem Segment
    const contentLower = content.toLowerCase();

    switch(segment) {
      case 'Definitionen':
        if (contentLower.includes('künstliche intelligenz') || contentLower.includes('ki')) {
          return 'Künstliche Intelligenz (KI) bezeichnet Systeme, die menschliche Intelligenz simulieren, lernen und Probleme lösen können.';
        }
        return 'Grundlegende Begriffe und Konzepte zu diesem Thema.';

      case 'Anwendungsbereiche':
        if (contentLower.includes('medizin')) {
          return 'In der Medizin wird KI für Diagnosen, Bildanalyse und personalisierte Behandlungen eingesetzt.';
        } else if (contentLower.includes('wirtschaft') || contentLower.includes('ökonomie')) {
          return 'In der Wirtschaft optimiert KI Prozesse, Prognosen und Kundenservice.';
        }
        return 'Praktische Einsatzgebiete und reale Anwendungsfälle.';

      case 'Technologien':
        if (contentLower.includes('machine learning') || contentLower.includes('maschinelles lernen')) {
          return 'Machine Learning, Deep Learning und neuronale Netze sind Kernkomponenten moderner KI-Systeme.';
        }
        return 'Technische Grundlagen und aktuelle Entwicklungen in diesem Bereich.';

      case 'Entwicklung':
        if (contentLower.includes('zukunft')) {
          return 'Die Zukunft der KI verspricht noch stärkere Integration in den Alltag und neue ethische Herausforderungen.';
        }
        return 'Historische Entwicklung und zukünftige Trends in diesem Bereich.';

      default:
        return 'Weitere Informationen zu diesem Themenbereich.';
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
        <div className="fullscreenSearch-header-content">
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
      </div>

      <div className="fullscreenSearch-results-messages expanding-universe">
        <div className="universe-core">
          {/* Benutzerfragen anzeigen */}
          {messages.filter(msg => msg.role === 'user').map((userMessage, userIndex) => (
            <div key={`user-${userIndex}`} className="search-user-query">
              <div className="search-query-text">
                <span className="search-query-icon">🔍</span>
                {userMessage.content}
              </div>
            </div>
          ))}

          {/* Bot-Antworten als futuristische Suchergebnisse anzeigen */}
          <AnimatePresence>
            {messages.filter(msg => msg.role === 'assistant').map((botMessage, botIndex) => {
              // Zufällige verwandte Fragen generieren
              const relatedQuestions = [
                "Was sind Anwendungen von KI im Alltag?",
                "Wie funktioniert maschinelles Lernen?",
                "Was ist der Unterschied zwischen KI und Machine Learning?",
                "Welche ethischen Fragen wirft KI auf?",
                "Wie wird sich KI in Zukunft entwickeln?"
              ].slice(0, 3 + Math.floor(Math.random() * 3));

              return (
                <motion.div
                  key={`bot-${botIndex}`}
                  className="universe-cluster"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="search-result-card">
                    {/* Hauptantwort */}
                    <div className="search-result-content">
                      <h2 style={{ color: botPrimaryColor || 'inherit', marginTop: 0, fontSize: '1.5rem' }}>
                        {botMessage.content.split('.')[0]}.
                      </h2>

                      <div className="search-result-main-text">
                        {botMessage.content.split('\n\n').slice(0, 2).map((paragraph, pIndex) => (
                          <p key={pIndex}>{paragraph}</p>
                        ))}
                      </div>

                      {/* Segmente der Antwort */}
                      <div className="search-result-segments">
                        {['Definitionen', 'Anwendungsbereiche', 'Technologien', 'Entwicklung'].slice(0, 2).map((segment, sIndex) => (
                          <div
                            key={sIndex}
                            className="search-result-segment"
                            style={{ '--segment-index': sIndex } as React.CSSProperties}
                          >
                            <h4>{segment}</h4>
                            <p>{generateSegmentContent(segment, botMessage.content)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Verwandte Fragen */}
                      <div className="search-related-questions">
                        <h4>Verwandte Suchanfragen</h4>
                        {relatedQuestions.map((question, qIndex) => (
                          <div
                            key={qIndex}
                            className="search-related-question"
                            style={{ '--question-index': qIndex } as React.CSSProperties}
                            onClick={() => handleSendMessage(question)}
                          >
                            {question}
                          </div>
                        ))}
                      </div>

                      {/* Vertrauensindikator */}
                      <div className="search-confidence">
                        <span className="search-confidence-indicator"></span>
                        Hohe Übereinstimmung mit Ihrer Suchanfrage
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Lade-Animation für neue Antworten */}
            {isLoading && (
              <motion.div
                className="universe-cluster loading-cluster"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="search-result-card">
                  <div className="search-result-loading">
                    <div className="search-loading-pulse"></div>
                    <h3>Suche nach der besten Antwort...</h3>
                    <p>Analysiere Informationen und erstelle eine umfassende Antwort für Sie.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
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
