'use client'

import { useEffect, useState } from 'react'
import { useChat } from './hooks/useChat'
import { ChatBubble } from './components/ChatBubble'
import { ChatHeader } from './components/ChatHeader'
import { ChatInput } from './components/ChatInput'
import { MessageList } from './components/MessageList'
import { ChatMode } from './types'

// VERSION-MARKER: Chat-Debug-Code - Version 002
console.log("Chat.tsx geladen - Debug-Version 002");

interface ChatProps {
  initialMode?: ChatMode;
  embedded?: boolean;
  botId?: string; // Neue Eigenschaft für die Bot-ID
  className?: string; // Neue Eigenschaft für CSS-Klassen
}

export function Chat({ initialMode = 'bubble', embedded = false, botId, className }: ChatProps) {
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
    botId // Bot-ID an useChat übergeben
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
      const fetchBotInfo = async () => {
        try {
          const response = await fetch(`/api/bots/${botId}`)
          if (response.ok) {
            const botData = await response.json()
            console.log("CHAT-DEBUG-002: Bot-Informationen geladen:", {
              id: botData.id,
              name: botData.name,
              welcomeMessage: botData.welcomeMessage
            });
            
            if (botData) {
              // Bot-Name setzen
              setBotName(botData.name || 'SMG Dialog Engine')
              
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
            }
          }
        } catch (error) {
          console.error("Fehler beim Laden der Bot-Informationen:", error)
        }
      }
      
      fetchBotInfo()
    }
  }, [botId])

  // Debug-Ausgabe für die Chat-Komponente
  useEffect(() => {
    console.log("CHAT-DEBUG-002: Chat-Komponente gerendert");
    console.log("CHAT-DEBUG-002: messages:", messages);
    console.log("CHAT-DEBUG-002: isLoading:", isLoading);
    console.log("CHAT-DEBUG-002: botId:", botId || "Standard-Bot");
    console.log("CHAT-DEBUG-002: botName:", botName);
    console.log("CHAT-DEBUG-002: botPrimaryColor:", botPrimaryColor);
    console.log("CHAT-DEBUG-002: showCopyButton:", showCopyButton);
    console.log("CHAT-DEBUG-002: enableFeedback:", enableFeedback);
  }, [messages, isLoading, botId, botName, botPrimaryColor, showCopyButton, enableFeedback]);

  // Beim Unmount Dialog-Modus zurücksetzen
  useEffect(() => {
    return () => {
      document.body.classList.remove('dialog-mode');
    };
  }, []);

  // Wenn nicht eingebettet und nicht im Vollbild-Modus, Chat-Logik unverändert lassen
  if (!embedded && mode !== 'fullscreen') {
    // Zeige nur die Bubble, wenn nicht geöffnet
    if (!isOpen) {
      return <ChatBubble onClick={toggleChat} />
    }

    // Normaler Chat für Bubble/Inline-Modi
    return (
      <>
        {mode === 'bubble' && <ChatBubble onClick={toggleChat} />}
        
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-dialog-title"
          className={`
            z-50 flex flex-col overflow-hidden shadow-lg bg-background
            ${mode === 'bubble' ? 'fixed bottom-5 right-5 w-[480px] h-[850px] rounded-xl border' : ''}
            ${mode === 'inline' ? 'w-full h-[500px] rounded-xl border' : ''}
            ${className || ''}
          `}
        >
          <ChatHeader 
            mode={mode} 
            onClose={toggleChat} 
            onModeChange={cycleMode}
            setMode={setMode}
            botName={botName}
            botPrimaryColor={botPrimaryColor}
          />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            {error && (
              <div 
                className="p-3 m-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md" 
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}
            
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
            
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '90px',
              zIndex: 20
            }}>
              <ChatInput 
                isLoading={isLoading} 
                onSubmit={sendMessage} 
                onCancel={cancelMessage} 
                botPrimaryColor={botPrimaryColor}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Für embedded bubble/inline ohne Switcher
  if (embedded && mode !== 'fullscreen') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-dialog-title"
        className={`
          z-50 absolute inset-0 w-full h-full
          ${mode === 'bubble' ? 'bubble-mode' : ''}
          ${mode === 'inline' ? 'inline-mode' : ''}
          ${className || ''}
        `}
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <ChatHeader 
          mode={mode} 
          onClose={toggleChat} 
          onModeChange={cycleMode}
          setMode={setMode}
          botName={botName}
          botPrimaryColor={botPrimaryColor}
        />
        
        <div 
          style={{
            position: 'absolute',
            top: '48px', 
            left: 0, 
            right: 0, 
            bottom: '90px',
            background: 'white',
            borderRadius: mode === 'bubble' ? '0' : undefined,
            boxShadow: mode === 'bubble' ? '0 6px 30px rgba(0, 0, 0, 0.2)' : 'none',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          {error && (
            <div 
              className="p-3 m-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md" 
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          
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
        
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '90px',
          zIndex: 20
        }}>
          <ChatInput 
            isLoading={isLoading} 
            onSubmit={sendMessage} 
            onCancel={cancelMessage} 
            botPrimaryColor={botPrimaryColor}
          />
        </div>
      </div>
    );
  }

  // Für Fullscreen-Modus, neue Toggle-Logik anwenden
  return (
    <div className="transparent-container">
      {/* Segment-Control Toggle für Dialog/Klassisch im verbesserten Neumorphic-Stil */}
      <div
        className="fixed z-60 overflow-hidden font-medium neumorphic"
        style={{
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '3px',
          display: 'flex',
          position: 'relative',
          width: '180px', // Feste Breite statt auto/100%
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
          <div className="flex flex-col flex-1 overflow-hidden glassmorphism-chat">
            {error && (
              <div 
                className="p-3 m-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md" 
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}
            
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
            
            <ChatInput 
              isLoading={isLoading} 
              onSubmit={sendMessage} 
              onCancel={cancelMessage} 
              botPrimaryColor={botPrimaryColor}
            />
          </div>
        </div>
      )}
      
      {/* Im Web-Modus wird kein Chat angezeigt */}
    </div>
  );
} 