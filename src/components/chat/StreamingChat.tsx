'use client'

import { useEffect, useState } from 'react'
import { useStreamChat } from './hooks/useStreamChat'
import { ChatHeader } from './components/ChatHeader'
import { ChatInput } from './components/ChatInput'
import { MessageList } from './components/MessageList'
import { MessageContent } from './components/MessageContent/MessageContent'
import { Message } from './types'
import dynamic from 'next/dynamic'
import type { BotSettings } from '@/types/bot'
import type { StreamChatMode } from './hooks/useStreamChat'
import { SuggestionsBar } from './SuggestionsBar'
import type { BotSuggestion } from '@/types/bot'

// VERSION-MARKER: StreamingChat-Debug-Code - Version 001
console.log("StreamingChat.tsx geladen - Debug-Version 001");

interface StreamingChatProps {
  initialMode?: 'bubble' | 'fullscreen' | 'inline'; // Unterstützt jetzt auch inline-Modus
  embedded?: boolean;
  botId?: string;
  className?: string;
  initialSettings?: any;
  suggestions?: BotSuggestion[];
}

export function StreamingChat({ 
  initialMode = 'bubble', 
  embedded = false, 
  botId, 
  className, 
  initialSettings,
  suggestions = []
}: StreamingChatProps) {
  const [botName, setBotName] = useState<string>('Dialog Engine')
  const [botPrimaryColor, setBotPrimaryColor] = useState<string>('#3b82f6')
  const [showCopyButton, setShowCopyButton] = useState<boolean>(true)
  const [enableFeedback, setEnableFeedback] = useState<boolean>(false)
  const [botAvatarUrl, setBotAvatarUrl] = useState<string | undefined>(undefined)
  
  // Debug-Ausgabe für initialMode
  console.log("StreamingChat: initialMode =", initialMode, "embedded =", embedded);

  const { 
    messages, 
    isLoading, 
    error, 
    isOpen, 
    mode,
    sendMessage, 
    cancelMessage, 
    toggleChat, 
    cycleMode,
    setMode, 
    messagesEndRef,
    botSettings,
    welcomeMessage,
    currentStreamedMessage
  } = useStreamChat({
    initialMessages: [],
    initialMode,
    initialOpen: embedded,
    botId,
    initialSettings
  })

  // Wenn der Modus von außen geändert wird, aktualisiere den internen Modus
  useEffect(() => {
    if (setMode) {
      setMode(initialMode);
    }
  }, [initialMode, setMode]);
  
  // Bot-Informationen laden
  useEffect(() => {
    if (botId) {
      const fetchBotInfo = async () => {
        try {
          console.log(`STREAMINGCHAT-DEBUG-001: Lade Bot-Informationen für ${botId}`);
          const response = await fetch(`/api/bots/${botId}`)
          if (response.ok) {
            const botData = await response.json()
            
            if (botData) {
              // Bot-Name setzen
              setBotName(botData.name || 'Dialog Engine')
              
              // Bot-Einstellungen setzen, wenn vorhanden
              if (botData.settings) {
                if (botData.settings.primaryColor) {
                  setBotPrimaryColor(botData.settings.primaryColor)
                }
                
                // Kopier-Button-Einstellung übernehmen
                setShowCopyButton(typeof botData.settings.showCopyButton === 'boolean' 
                  ? botData.settings.showCopyButton 
                  : true)
                
                // Feedback-Button-Einstellung übernehmen
                setEnableFeedback(typeof botData.settings.enableFeedback === 'boolean' 
                  ? botData.settings.enableFeedback
                  : false)
                  
                // Avatar-URL setzen, zuerst aus den Settings, dann aus dem Bot-Objekt
                setBotAvatarUrl(botData.settings.avatarUrl || botData.avatarUrl || undefined)
              } else if (botData.avatarUrl) {
                // Fallback: Avatar-URL direkt aus dem Bot-Objekt
                setBotAvatarUrl(botData.avatarUrl)
              }
            }
          }
        } catch (error) {
          console.error("Fehler beim Laden der Bot-Informationen:", error)
        }
      }
      
      fetchBotInfo()
    }
  }, [botId])

  // Hilfsfunktion, um Modus-spezifische Klassen zu erhalten
  const getModeClass = (currentMode: StreamChatMode): string => {
    switch(currentMode) {
      case 'bubble': return 'embedded-chat bubble-mode';
      case 'fullscreen': return 'embedded-chat fullscreen-mode';
      case 'inline': return 'embedded-chat inline-mode';
      default: return '';
    }
  };
  
  // Hilfsfunktion für Modus-spezifisches Styling
  const getModeStyle = (currentMode: StreamChatMode) => {
    switch(currentMode) {
      case 'bubble':
        return {
          borderRadius: '0',
          boxShadow: '0 6px 30px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        };
      case 'inline':
        return {
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          height: '100%'
        };
      case 'fullscreen':
        return {
          overflow: 'hidden'
        };
      default:
        return {
          overflow: 'hidden'
        };
    }
  };

  // Kombinierte Nachrichtenliste mit der aktuell gestreamten Nachricht
  const allMessages = () => {
    console.log("STREAMINGCHAT-DEBUG-005: allMessages aufgerufen, isLoading:", isLoading, 
      "currentStreamedMessage:", currentStreamedMessage ? "vorhanden" : "nicht vorhanden",
      "Nachrichten:", messages.length);
    
    // Wenn keine gestreamte Nachricht vorhanden ist, zeige nur die normalen Nachrichten
    if (!currentStreamedMessage) {
      console.log("STREAMINGCHAT-DEBUG-005: Nur normale Nachrichten anzeigen:", messages.length);
      return messages;
    }
    
    // Streamed-Message nur anzeigen, wenn sie Inhalt hat
    if (!currentStreamedMessage.content || currentStreamedMessage.content.trim() === '') {
      console.log("STREAMINGCHAT-DEBUG-005: Leerer Streaming-Inhalt, zeige nur normale Nachrichten");
      return messages;
    }
    
    // Suche nach einer bereits vorhandenen gestreamten Nachricht
    const existingStreamingMessage = messages.find(message => message.streaming === true);
    
    // Suche nach einer Assistenten-Nachricht mit genau dem gleichen Inhalt
    const exactMatchMessage = messages.find(
      message => message.role === 'assistant' && 
                 message.content.trim() === currentStreamedMessage.content.trim()
    );
    
    // Wenn es eine exakte Übereinstimmung gibt, gib die Originalnachrichten zurück
    if (exactMatchMessage) {
      console.log("STREAMINGCHAT-DEBUG-005: Exakte Übereinstimmung in der Liste gefunden");
      return messages;
    }
    
    // Array für die finalen Nachrichten
    let finalMessages = [...messages];
    
    // Wenn es bereits eine Streaming-Nachricht gibt, ersetze sie
    if (existingStreamingMessage) {
      console.log("STREAMINGCHAT-DEBUG-005: Aktualisiere bestehende Streaming-Nachricht");
      finalMessages = messages.map(message => {
        if (message.streaming) {
          return { 
            ...message, 
            content: currentStreamedMessage.content,
            timestamp: Date.now()
          };
        }
        return message;
      });
    } else {
      // Ansonsten füge eine neue Streaming-Nachricht hinzu
      console.log("STREAMINGCHAT-DEBUG-005: Füge neue Streaming-Nachricht hinzu, Länge:", currentStreamedMessage.content.length);
      
      // Erzeuge eine eindeutige ID für die gestreamte Nachricht
      const streamedMessage: Message = { 
        id: `streaming-msg-${Date.now()}`,
        role: 'assistant', 
        content: currentStreamedMessage.content,
        streaming: true,
        timestamp: Date.now()
      };
      
      finalMessages = [...messages, streamedMessage];
    }
    
    return finalMessages;
  };

  // Neue Funktion zum Senden von Vorschlägen
  const handleSuggestionClick = (text: string) => {
    if (sendMessage) {
      sendMessage(text);
    }
  };

  // Debug-Ausgabe für Vorschläge
  useEffect(() => {
    console.log("SUGGESTIONS-DEBUG: Vorschläge nach Initialisierung:", { 
      suggestions, 
      showSuggestions: botSettings?.showSuggestions,
      messagesCount: messages.length,
      shouldShow: botSettings?.showSuggestions && suggestions.length > 0 && messages.length === 0
    });
  }, [suggestions, botSettings, messages.length]);

  // Für embedded bubble/inline ohne Switcher
  if (embedded) {
    // Wenn Bubble-Modus UND nicht geöffnet, zeigen wir nur den Button an
    if (mode === 'bubble' && !isOpen) {
      return (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 w-16 h-16 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          style={{ backgroundColor: botPrimaryColor }}
          aria-label="Chat öffnen"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      );
    }
    
    // Inline-Modus oder Bubble-Modus mit geöffnetem Chat
    if (mode !== 'fullscreen') {
      return (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-dialog-title"
          className={`
            absolute inset-0 w-full h-full flex flex-col
            ${getModeClass(mode)}
            ${className || ''}
          `}
          style={getModeStyle(mode)}
        >
          <div className="flex-shrink-0">
            <ChatHeader 
              mode={mode as any} 
              onClose={toggleChat} 
              onModeChange={cycleMode}
              setMode={setMode as any}
              botName={botName}
              botPrimaryColor={botPrimaryColor}
            />
          </div>
          
          <div 
            className="flex-1 overflow-hidden bg-white flex flex-col min-h-0"
          >
            {error && (
              <div 
                className="p-3 m-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md flex-shrink-0" 
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto min-h-0">
              <MessageList 
                messages={allMessages()} 
                isLoading={isLoading} 
                messagesEndRef={messagesEndRef}
                botName={botName}
                showCopyButton={showCopyButton}
                enableFeedback={enableFeedback}
                botId={botId}
                botPrimaryColor={botPrimaryColor}
                welcomeMessage={welcomeMessage}
                botAvatarUrl={botAvatarUrl}
              />
              
              {botSettings?.showSuggestions && suggestions.length > 0 && messages.length === 0 && (
                <div className="px-4 mb-1">
                  <SuggestionsBar 
                    suggestions={suggestions} 
                    onSuggestionClick={handleSuggestionClick} 
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0 h-[70px]">
            <ChatInput 
              isLoading={isLoading} 
              onSend={sendMessage} 
              onCancel={cancelMessage} 
              botPrimaryColor={botPrimaryColor}
            />
          </div>
        </div>
      );
    }
  }

  // Für fullscreen-Modus in embedded Ansicht
  if (embedded && mode === 'fullscreen') {
    // Dialog-Modus State für Fullscreen
    const [isDialogMode, setIsDialogMode] = useState(true);
    console.log("SUGGESTIONS-DEBUG: Im fullscreen embedded Modus, botSettings:", botSettings, "Vorschläge:", suggestions.length);

    // Umschalten zwischen Dialog und Web Modus
    const toggleDialogMode = () => {
      setIsDialogMode(prev => !prev);
    };
    
    // Dialog-Modus CSS-Klasse zum body und html hinzufügen/entfernen
    useEffect(() => {
      if (isDialogMode) {
        document.body.classList.add('dialog-mode');
        document.documentElement.classList.add('dialog-mode');
        document.body.style.background = `linear-gradient(135deg, rgba(36, 59, 85, 0.8), rgba(20, 30, 48, 0.95))`;
      } else {
        document.body.classList.remove('dialog-mode');
        document.documentElement.classList.remove('dialog-mode');
        document.body.style.background = 'transparent';
      }
      
      // Cleanup beim Unmounten
      return () => {
        document.body.classList.remove('dialog-mode');
        document.documentElement.classList.remove('dialog-mode');
        document.body.style.background = '';
      };
    }, [isDialogMode]);

    return (
      <div 
        className={`
          fixed inset-0 flex flex-col z-50
          ${mode === 'fullscreen' ? 'fullscreen-chat embedded-fullscreen' : ''}
          ${isDialogMode ? 'glassmorphism-chat' : 'bg-transparent'} 
          ${className || ''}
        `}
        style={{ 
          pointerEvents: isDialogMode ? 'auto' : 'none',
          paddingTop: '70px'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-dialog-title"
      >
        {/* Dialog/Web Toggle hinzufügen */}
        <div
          className="fixed z-60 overflow-hidden font-medium neumorphic"
          style={{
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '3px',
            display: 'flex',
            position: 'relative',
            width: '180px',
            pointerEvents: 'auto',
          }}
        >
          {/* Hintergrund-Indikator mit 3D-Effekt */}
          <div
            className="absolute toggle-indicator"
            style={{
              left: isDialogMode ? '50%' : '0',
              top: '3px',
              width: '50%',
              height: 'calc(100% - 6px)',
              borderRadius: '100px',
              backgroundColor: botPrimaryColor || 'hsl(var(--primary))',
              zIndex: 0,
              transform: isDialogMode ? 'translateX(0)' : 'translateX(0)',
            }}
          >
            {/* Oberer Highlight-Effekt */}
            <div 
              className="absolute opacity-80" 
              style={{
                top: '0',
                left: '10%',
                right: '10%',
                height: '1px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '100px',
              }}
            />
          </div>
          
          <button
            className={`py-2 px-3 z-10 transition-all duration-300 relative flex items-center justify-center gap-1.5 neumorphic-btn ${!isDialogMode ? 'text-white font-bold' : 'text-gray-600 hover:text-gray-800'}`}
            style={{
              borderRadius: '100px',
              flex: 1,
              transform: !isDialogMode ? 'scale(1.02)' : 'scale(1)',
            }}
            onClick={() => {
              if (isDialogMode) toggleDialogMode();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Web</span>
          </button>
          
          <button
            className={`py-2 px-3 z-10 transition-all duration-300 relative flex items-center justify-center gap-1.5 neumorphic-btn ${isDialogMode ? 'text-white font-bold' : 'text-gray-600 hover:text-gray-800'}`}
            style={{
              borderRadius: '100px',
              flex: 1,
              transform: isDialogMode ? 'scale(1.02)' : 'scale(1)',
            }}
            onClick={() => {
              if (!isDialogMode) toggleDialogMode();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-sm">Dialog</span>
          </button>
        </div>
        <div className="flex-shrink-0">
          <ChatHeader 
            mode="fullscreen" 
            onClose={toggleChat} 
            onModeChange={cycleMode}
            setMode={setMode as any}
            botName={botName}
            botPrimaryColor={botPrimaryColor}
          />
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {error && (
            <div 
              className="p-3 m-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md flex-shrink-0" 
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto min-h-0">
            <MessageList 
              messages={allMessages()} 
              isLoading={isLoading} 
              messagesEndRef={messagesEndRef}
              botName={botName}
              showCopyButton={showCopyButton}
              enableFeedback={enableFeedback}
              botId={botId}
              botPrimaryColor={botPrimaryColor}
              welcomeMessage={welcomeMessage}
              botAvatarUrl={botAvatarUrl}
            />
            
            {botSettings?.showSuggestions && suggestions.length > 0 && messages.length === 0 && (
              <div className="px-4 mb-1">
                <SuggestionsBar 
                  suggestions={suggestions} 
                  onSuggestionClick={handleSuggestionClick} 
                />
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 h-[70px]">
            <ChatInput 
              isLoading={isLoading} 
              onSend={sendMessage} 
              onCancel={cancelMessage} 
              botPrimaryColor={botPrimaryColor}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isOpen ? (
        <div 
          className={`
            fixed inset-0 flex flex-col z-50
            ${mode === 'fullscreen' ? 'fullscreen-chat' : 'bg-white'}
            ${className || ''}
          `}
          style={{
            pointerEvents: mode === 'fullscreen' ? 'auto' : 'auto',
            paddingTop: mode === 'fullscreen' ? '70px' : '0'
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-dialog-title"
        >
          {/* Dialog/Web Toggle für die normale Fullscreen-Ansicht */}
          {mode === 'fullscreen' && (
            <>
              <DialogWebToggle 
                botPrimaryColor={botPrimaryColor} 
                suggestions={suggestions}
                botSettings={botSettings}
              />
            </>
          )}
          <div className="flex-shrink-0">
            <ChatHeader 
              mode={mode}  // Übergebe den aktuellen Modus
              onClose={toggleChat} 
              onModeChange={cycleMode}
              setMode={setMode as any}
              botName={botName}
              botPrimaryColor={botPrimaryColor}
            />
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {error && (
              <div 
                className="p-3 m-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md flex-shrink-0" 
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto min-h-0">
              <MessageList 
                messages={allMessages()} 
                isLoading={isLoading} 
                messagesEndRef={messagesEndRef}
                botName={botName}
                showCopyButton={showCopyButton}
                enableFeedback={enableFeedback}
                botId={botId}
                botPrimaryColor={botPrimaryColor}
                welcomeMessage={welcomeMessage}
                botAvatarUrl={botAvatarUrl}
              />
              
              {botSettings?.showSuggestions && suggestions.length > 0 && messages.length === 0 && (
                <div className="px-4 mb-1">
                  <SuggestionsBar 
                    suggestions={suggestions} 
                    onSuggestionClick={handleSuggestionClick} 
                  />
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 h-[70px]">
              <ChatInput 
                isLoading={isLoading} 
                onSend={sendMessage} 
                onCancel={cancelMessage} 
                botPrimaryColor={botPrimaryColor}
              />
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 w-16 h-16 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          style={{ backgroundColor: botPrimaryColor }}
          aria-label="Chat öffnen"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </>
  );
}

// Dialog/Web Toggle Komponente für die Fullscreen-Ansicht
const DialogWebToggle = ({ 
  botPrimaryColor,
  suggestions, 
  botSettings
}: { 
  botPrimaryColor: string | null | undefined,
  suggestions: any[],
  botSettings: any
}) => {
  // Standardmäßig mit Klassisch/Dialog starten
  const [isDialogMode, setIsDialogMode] = useState(true);
  
  // Dialog-Modus CSS-Klasse zum body und html hinzufügen/entfernen
  useEffect(() => {
    if (isDialogMode) {
      document.body.classList.add('dialog-mode');
      document.documentElement.classList.add('dialog-mode');
      document.body.style.background = `linear-gradient(135deg, rgba(36, 59, 85, 0.8), rgba(20, 30, 48, 0.95))`;
      console.log("Dialog-Modus aktiviert. Body-Klassen:", document.body.className);
    } else {
      document.body.classList.remove('dialog-mode');
      document.documentElement.classList.remove('dialog-mode');
      document.body.style.background = 'transparent';
      console.log("Dialog-Modus deaktiviert. Body-Klassen:", document.body.className);
    }
    
    // Cleanup beim Unmounten
    return () => {
      document.body.classList.remove('dialog-mode');
      document.documentElement.classList.remove('dialog-mode');
      document.body.style.background = '';
    };
  }, [isDialogMode]);
  
  // Debug-Ausgaben
  useEffect(() => {
    console.log("SUGGESTIONS-DEBUG: Im regulären Fullscreen-Modus, botSettings:", botSettings, "Vorschläge:", suggestions.length, "isDialogMode:", isDialogMode);
  }, [botSettings, suggestions, isDialogMode]);
  
  // Umschalten zwischen Dialog und Web Modus
  const toggleDialogMode = () => {
    setIsDialogMode(prev => !prev);
  };
  
  return (
    <div
      className="fixed z-60 overflow-hidden font-medium neumorphic"
      style={{
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '3px',
        display: 'flex',
        position: 'relative',
        width: '180px',
        pointerEvents: 'auto',
      }}
    >
      {/* Hintergrund-Indikator mit 3D-Effekt */}
      <div
        className="absolute toggle-indicator"
        style={{
          left: isDialogMode ? '50%' : '0',
          top: '3px',
          width: '50%',
          height: 'calc(100% - 6px)',
          borderRadius: '100px',
          backgroundColor: botPrimaryColor || 'hsl(var(--primary))',
          zIndex: 0,
          transform: isDialogMode ? 'translateX(0)' : 'translateX(0)',
        }}
      >
        {/* Oberer Highlight-Effekt */}
        <div 
          className="absolute opacity-80" 
          style={{
            top: '0',
            left: '10%',
            right: '10%',
            height: '1px',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '100px',
          }}
        />
      </div>
      
      <button
        className={`py-2 px-3 z-10 transition-all duration-300 relative flex items-center justify-center gap-1.5 neumorphic-btn ${!isDialogMode ? 'text-white font-bold' : 'text-gray-600 hover:text-gray-800'}`}
        style={{
          borderRadius: '100px',
          flex: 1,
          transform: !isDialogMode ? 'scale(1.02)' : 'scale(1)',
        }}
        onClick={() => {
          if (isDialogMode) toggleDialogMode();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm">Web</span>
      </button>
      
      <button
        className={`py-2 px-3 z-10 transition-all duration-300 relative flex items-center justify-center gap-1.5 neumorphic-btn ${isDialogMode ? 'text-white font-bold' : 'text-gray-600 hover:text-gray-800'}`}
        style={{
          borderRadius: '100px',
          flex: 1,
          transform: isDialogMode ? 'scale(1.02)' : 'scale(1)',
        }}
        onClick={() => {
          if (!isDialogMode) toggleDialogMode();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="text-sm">Dialog</span>
      </button>
    </div>
  );
}; 