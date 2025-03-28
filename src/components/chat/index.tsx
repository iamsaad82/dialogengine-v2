'use client'

import { useEffect, useState } from 'react'
import { useChat } from './hooks/useChat'
import { ChatBubble } from './components/ChatBubble'
import { ChatHeader } from './components/ChatHeader'
import { ChatInput } from './components/ChatInput'
import { MessageList } from './components/MessageList'
import { ChatMode } from './types'

// VERSION-MARKER: Chat-Debug-Code - Version 004
console.log("Chat.tsx geladen - Debug-Version 004");

// Tracking-Mechanismus für Bot-Informationsabrufe und Willkommensnachrichten
const loadedBots = new Set<string>();
const loadedWelcomeMessages = new Set<string>();

interface ChatProps {
  initialMode?: ChatMode;
  embedded?: boolean;
  botId?: string; // Neue Eigenschaft für die Bot-ID
  className?: string; // Neue Eigenschaft für CSS-Klassen
  initialSettings?: any; // Bot-Einstellungen direkt übergeben
}

export function Chat({ initialMode = 'bubble', embedded = false, botId, className, initialSettings }: ChatProps) {
  const [botName, setBotName] = useState<string>('Dialog Engine')
  const [botPrimaryColor, setBotPrimaryColor] = useState<string | undefined>(undefined)
  const [showCopyButton, setShowCopyButton] = useState<boolean>(true)
  const [enableFeedback, setEnableFeedback] = useState<boolean>(false)
  const [isDialogMode, setIsDialogMode] = useState<boolean>(false)
  
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
    botSettings 
  } = useChat({
    initialMessages: [],
    initialMode,
    initialOpen: embedded, // Wenn eingebettet, dann direkt öffnen
    botId, // Bot-ID an useChat übergeben
    initialSettings // Bot-Einstellungen direkt übergeben
  })

  // Wenn der Modus von außen geändert wird, aktualisiere den internen Modus
  useEffect(() => {
    if (setMode) {
      setMode(initialMode);
    }
  }, [initialMode, setMode]);

  // Funktion zum Umschalten des Dialog-Modus
  const toggleDialogMode = () => {
    const newDialogMode = !isDialogMode;
    setIsDialogMode(newDialogMode);
    
    // Dialog-Modus CSS-Klasse zum body und html hinzufügen/entfernen
    if (newDialogMode) {
      document.body.classList.add('dialog-mode');
      document.documentElement.classList.add('dialog-mode');
      console.log("Dialog-Modus aktiviert. Body-Klassen:", document.body.className);
    } else {
      document.body.classList.remove('dialog-mode');
      document.documentElement.classList.remove('dialog-mode');
      console.log("Dialog-Modus deaktiviert. Body-Klassen:", document.body.className);
    }
  };
  
  // Bot-Informationen laden
  useEffect(() => {
    if (botId) {
      // Prüfen, ob dieser Bot bereits geladen wurde
      const botKey = `bot-${botId}`;
      const welcomeKey = `welcome-${botId}`;
      
      if (loadedBots.has(botKey)) {
        console.log(`CHAT-DEBUG-004: Bot ${botId} wurde bereits geladen, überspringe Abruf`);
        return;
      }
      
      // Prüfen, ob die Willkommensnachricht bereits angezeigt wurde
      const hasWelcomeMessageShown = loadedWelcomeMessages.has(welcomeKey);
      
      // Bot als geladen markieren
      loadedBots.add(botKey);
      
      const fetchBotInfo = async () => {
        try {
          console.log(`CHAT-DEBUG-004: Lade Bot-Informationen für ${botId}`);
          const response = await fetch(`/api/bots/${botId}`)
          if (response.ok) {
            const botData = await response.json()
            console.log("CHAT-DEBUG-004: Bot-Informationen geladen:", {
              id: botData.id,
              name: botData.name,
              welcomeMessage: botData.welcomeMessage ? 'vorhanden' : 'nicht vorhanden'
            });
            
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
              }
              
              // Nur wenn Willkommensnachricht noch nicht gesetzt wurde UND wenn es eine gibt
              if (!hasWelcomeMessageShown && botData.welcomeMessage) {
                console.log("CHAT-DEBUG-004: Setze Willkommensnachricht", welcomeKey);
                loadedWelcomeMessages.add(welcomeKey);
                
                // Sicherstellen, dass useChat die Willkommensnachricht erhält
                // aber keine doppelten Messages erzeugt
              }
            }
          }
        } catch (error) {
          console.error("Fehler beim Laden der Bot-Informationen:", error)
          // Bei Fehler den Bot aus dem Tracking entfernen, damit ein erneuter Versuch möglich ist
          loadedBots.delete(botKey);
        }
      }
      
      fetchBotInfo()
    }
  }, [botId])

  // Debug-Ausgabe für die Chat-Komponente
  useEffect(() => {
    console.log("CHAT-DEBUG-004: Chat-Komponente gerendert");
    console.log("CHAT-DEBUG-004: messages:", messages);
    console.log("CHAT-DEBUG-004: isLoading:", isLoading);
    console.log("CHAT-DEBUG-004: botId:", botId || "Standard-Bot");
    console.log("CHAT-DEBUG-004: botName:", botName);
    console.log("CHAT-DEBUG-004: botPrimaryColor:", botPrimaryColor);
    console.log("CHAT-DEBUG-004: showCopyButton:", showCopyButton);
    console.log("CHAT-DEBUG-004: enableFeedback:", enableFeedback);
  }, [messages, isLoading, botId, botName, botPrimaryColor, showCopyButton, enableFeedback]);

  // Beim Unmount Dialog-Modus zurücksetzen
  useEffect(() => {
    return () => {
      document.body.classList.remove('dialog-mode');
    };
  }, []);

  // Für embedded bubble/inline ohne Switcher
  if (embedded && mode !== 'fullscreen') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-dialog-title"
        className={`
          absolute inset-0 w-full h-full flex flex-col
          ${mode === 'bubble' ? 'embedded-chat bubble-mode' : ''}
          ${mode === 'inline' ? 'embedded-chat inline-mode' : ''}
          ${className || ''}
        `}
        style={{
          overflow: 'hidden'
        }}
      >
        <div className="flex-shrink-0">
          <ChatHeader 
            mode={mode} 
            onClose={toggleChat} 
            onModeChange={cycleMode}
            setMode={setMode}
            botName={botName}
            botPrimaryColor={botPrimaryColor}
          />
        </div>
        
        <div 
          className="flex-1 overflow-hidden bg-white flex flex-col min-h-0"
          style={{
            borderRadius: mode === 'bubble' ? '0' : undefined,
            boxShadow: mode === 'bubble' ? '0 6px 30px rgba(0, 0, 0, 0.2)' : 'none',
          }}
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
              messages={messages} 
              isLoading={isLoading} 
              messagesEndRef={messagesEndRef}
              botName={botName}
              showCopyButton={showCopyButton}
              enableFeedback={enableFeedback}
              botId={botId}
              botPrimaryColor={botPrimaryColor}
            />
          </div>
        </div>
        
        <div className="flex-shrink-0 h-[90px]">
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

  // Normaler Chat für Bubble/Inline-Modi
  if (!embedded && mode !== 'fullscreen') {
    // Zeige nur die Bubble, wenn nicht geöffnet
    if (!isOpen) {
      return <ChatBubble onClick={toggleChat} />
    }

    return (
      <>
        {mode === 'bubble' && <ChatBubble onClick={toggleChat} />}
        
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-dialog-title"
          className={`
            flex flex-col overflow-hidden shadow-lg bg-background
            ${mode === 'bubble' ? 'fixed bottom-5 right-5 w-[90vw] max-w-[480px] h-[90vh] max-h-[850px] rounded-xl border' : ''}
            ${mode === 'inline' ? 'w-full h-[500px] min-h-[400px] rounded-xl border' : ''}
            ${className || ''}
          `}
          style={{ 
            zIndex: 'var(--chat-z-index, 50)'
          }}
        >
          <div className="flex-shrink-0">
            <ChatHeader 
              mode={mode} 
              onClose={toggleChat} 
              onModeChange={cycleMode}
              setMode={setMode}
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
                messages={messages} 
                isLoading={isLoading} 
                messagesEndRef={messagesEndRef}
                botName={botName}
                showCopyButton={showCopyButton}
                enableFeedback={enableFeedback}
                botId={botId}
                botPrimaryColor={botPrimaryColor}
              />
            </div>
            
            <div className="flex-shrink-0 h-[90px]">
              <ChatInput 
                isLoading={isLoading} 
                onSend={sendMessage} 
                onCancel={cancelMessage} 
                botPrimaryColor={botPrimaryColor}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Für Fullscreen-Modus, bessere Layout-Struktur anwenden
  return (
    <div className={`transparent-container ${embedded ? 'embedded-chat fullscreen-mode' : ''}`}>
      {/* Segment-Control Toggle für Dialog/Klassisch */}
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

      {/* Dialog-Modus: Vollbild-Chat ohne Header */}
      {isDialogMode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-dialog-title"
          className="z-40 fixed inset-0 flex flex-col overflow-hidden pointer-events-auto"
          style={{ paddingTop: '70px' }}
        >
          <div className="flex flex-col flex-1 overflow-hidden min-h-0 glassmorphism-chat">
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
                messages={messages} 
                isLoading={isLoading} 
                messagesEndRef={messagesEndRef}
                botName={botName}
                showCopyButton={showCopyButton}
                enableFeedback={enableFeedback}
                botId={botId}
                botPrimaryColor={botPrimaryColor}
              />
            </div>
            
            <div className="flex-shrink-0 h-[90px]">
              <ChatInput 
                isLoading={isLoading} 
                onSend={sendMessage} 
                onCancel={cancelMessage} 
                botPrimaryColor={botPrimaryColor}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Im Web-Modus wird kein Chat angezeigt */}
    </div>
  );
} 