'use client'

import { useState, useRef, useCallback, RefObject, useEffect } from 'react'
import { Message, ChatMode } from '../types'
import { LunaryClient } from '@/lib/lunary-client'
import { v4 as uuidv4 } from 'uuid'

// VERSION-MARKER: Eindeutiger Debug-Code - Version 007
console.log("useChat.ts geladen - Debug-Version 007");

// VERSION-MARKER: Eindeutiger Debug-Code - Version 008
console.log("useChat.ts geladen - Debug-Version 008");

// VERSION-MARKER: Eindeutiger Debug-Code - Version 009
console.log("useChat.ts geladen - Debug-Version 009");

// Tracking für bereits geladene Bots und Willkommensnachrichten
const processedWelcomeMessages = new Set<string>();

// Hilfsfunktion für Debounce
const useDebouncedCallback = (fn: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCalledRef = useRef<number>(0);

  return useCallback((...args: any[]) => {
    const now = Date.now();
    
    // Wenn bereits ein Timeout läuft oder der letzte Aufruf zu nah dran ist, abbrechen
    if (timeoutRef.current || (now - lastCalledRef.current) < delay) {
      console.log("DEBUG-007: Debounce - Verhindere mehrfachen Aufruf");
      return;
    }
    
    // Setze den Timeout für die aktuelle Funktion
    timeoutRef.current = setTimeout(() => {
      fn(...args);
      timeoutRef.current = null;
      lastCalledRef.current = Date.now();
    }, delay);
  }, [fn, delay]);
};

interface UseChatProps {
  initialMessages?: Message[]
  initialMode?: ChatMode
  initialOpen?: boolean
  botId?: string
  onError?: (error: Error) => void
}

export interface UseChatOptions {
  autoFocus?: boolean;
  isOpen?: boolean;
  botId?: string;
}

export function useChat({ 
  initialMessages = [], 
  initialMode = 'bubble', 
  initialOpen = false,
  botId,
  onError
}: UseChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [mode, setMode] = useState<ChatMode>(initialMode)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const sessionIdRef = useRef<string>(uuidv4()) // Eindeutige Sitzungs-ID für Tracking
  const [botSettings, setBotSettings] = useState<any>(null)
  const lastMessageTimestampRef = useRef<number>(0) // Zeitstempel der letzten gesendeten Nachricht
  const chatInitializedRef = useRef<boolean>(false) // Tracking für die Chat-Initialisierung

  // Toggle Chat öffnen/schließen
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev)
    
    // Tracking für Chat-Öffnen/Schließen
    LunaryClient.track({
      eventName: isOpen ? 'chat_closed' : 'chat_opened',
      properties: { botId },
      metadata: { sessionId: sessionIdRef.current }
    })
  }, [isOpen, botId])

  // Wechselt zwischen den Modi (bubble -> inline -> fullscreen -> bubble)
  const cycleMode = useCallback(() => {
    setMode((currentMode) => {
      const nextMode = currentMode === 'bubble' ? 'inline' : currentMode === 'inline' ? 'fullscreen' : 'bubble'
      
      // Tracking für Modusänderung
      LunaryClient.track({
        eventName: 'chat_mode_changed',
        properties: { mode: nextMode, botId },
        metadata: { sessionId: sessionIdRef.current }
      })
      
      return nextMode
    })
  }, [botId])

  // Direkt zu einem bestimmten Modus wechseln
  const setCurrentMode = useCallback((newMode: ChatMode) => {
    setMode(newMode)
  }, [])

  // Wenn neue Nachrichten hinzugefügt werden, scroll nach unten
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Nachricht zur Liste hinzufügen
  const addMessage = useCallback((message: Message) => {
    console.log("DEBUG-007: addMessage aufgerufen", message);
    
    // Überprüfen, ob die Nachricht bereits existiert (um Duplikate zu vermeiden)
    setMessages((prevMessages) => {
      // Prüfe auf identische Nachricht in den letzten 3 Elementen
      // (Für den Fall mehrerer Nachrichten in kurzer Zeit)
      const recentMessages = prevMessages.slice(-3);
      const isDuplicate = recentMessages.some(
        (m) => m.role === message.role && m.content === message.content
      );
      
      if (isDuplicate) {
        console.log("DEBUG-007: Duplikat gefunden, Nachricht wird nicht hinzugefügt");
        return prevMessages;
      }
      
      return [...prevMessages, message];
    });
  }, []);

  // Debounced sendMessage Funktion, verhindert mehrfache Aufrufe innerhalb von 500ms
  const debouncedSendMessage = useDebouncedCallback(async (content: string) => {
    // Die normale sendMessage-Logik hier
    if (!content || content.trim() === '') {
      return;
    }
    
    // Verhindere erneutes Senden, wenn gerade geladen wird
    if (isLoading) {
      console.log('DEBUG-007: Sendeprozess läuft bereits, ignoriere erneuten Aufruf');
      return;
    }
    
    // Prüfe, ob die letzte Nachricht erst kürzlich gesendet wurde (doppelte Absicherung)
    const now = Date.now();
    if (now - lastMessageTimestampRef.current < 1000) {
      console.log('DEBUG-007: Letzte Nachricht wurde vor weniger als 1 Sekunde gesendet, ignoriere');
      return;
    }
    lastMessageTimestampRef.current = now;
    
    try {
      // Anfang des Ladevorgangs
      setIsLoading(true);
      setError(null);
      
      // Benutzer-Nachricht hinzufügen
      const userMessage: Message = { role: 'user', content };
      addMessage(userMessage);
      
      // Abbrechen wenn schon eine Anfrage läuft
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Neue AbortController-Instanz erstellen
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      // Tracking für gesendete Nachricht
      LunaryClient.track({
        eventName: 'message_sent',
        properties: { 
          content: content.slice(0, 100), // Ersten 100 Zeichen der Nachricht
          botId 
        },
        metadata: { sessionId: sessionIdRef.current }
      });
      
      // Sende Anfrage an API
      console.log('DEBUG-007: Sende API-Anfrage', content);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          history: messages,
          botId: botId,
        }),
        signal,
      });
      
      if (!response.ok) {
        throw new Error(
          `Fehler beim Senden der Nachricht: ${response.status} ${response.statusText}`
        );
      }
      
      const data = await response.json();
      
      // Füge Bot-Antwort hinzu
      let botContent = '';
      
      if (data.text) {
        botContent = data.text;
      } else if (data.response) {
        botContent = data.response;
      } else if (data.content) {
        botContent = data.content;
      } else if (data.assistant) {
        botContent = data.assistant;
      } else if (data.message) {
        botContent = data.message;
      } else {
        botContent = 'Entschuldigung, ich konnte keine Antwort generieren.';
      }
      
      const botMessage: Message = { role: 'assistant', content: botContent };
      addMessage(botMessage);

      // Tracking für empfangene Antwort
      LunaryClient.track({
        eventName: 'message_received',
        properties: { 
          content: botContent.slice(0, 100), // Ersten 100 Zeichen der Antwort
          botId,
          responseTime: Date.now() - performance.now() // Ungefähre Antwortzeit
        },
        metadata: { sessionId: sessionIdRef.current }
      });

    } catch (err) {
      // Prüfe, ob es sich um einen Abbruch handelt
      if ((err as Error).name === 'AbortError') {
        console.log('DEBUG-007: Anfrage wurde abgebrochen');
        return;
      }
      
      console.error('Fehler beim Senden der Nachricht:', err);
      setError('Beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
      
      // Tracking für Fehler
      LunaryClient.track({
        eventName: 'message_error',
        properties: { 
          error: err instanceof Error ? err.message : 'Unbekannter Fehler',
          botId 
        },
        metadata: { sessionId: sessionIdRef.current }
      });
      
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      setInput('');
    }
  }, 500);

  // Wrapper-Funktion für sendMessage, die den debounced-Aufruf triggert
  const sendMessage = useCallback((content: string) => {
    console.log('DEBUG-007: sendMessage aufgerufen mit:', content);
    debouncedSendMessage(content);
  }, [debouncedSendMessage]);

  // Laufende Anfrage abbrechen
  const cancelMessage = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  // Bot-Einstellungen beim ersten Laden abrufen
  useEffect(() => {
    if (botId) {
      // Eindeutiger Schlüssel für diesen Bot und diese Chat-Instanz
      const welcomeKey = `welcome-${botId}-${sessionIdRef.current}`;
      const hasProcessedWelcomeMessage = processedWelcomeMessages.has(welcomeKey);
      
      console.log(`CHAT-DEBUG-010: Chat-Hook für Bot ${botId}`, { 
        hasProcessedWelcomeMessage, 
        messagesLength: messages.length,
        chatInitialized: chatInitializedRef.current
      });
      
      // Nur einmal pro Chat-Instanz die Willkommensnachricht anzeigen
      if (hasProcessedWelcomeMessage) {
        console.log(`CHAT-DEBUG-010: Willkommensnachricht für ${welcomeKey} bereits verarbeitet`);
        return;
      }
      
      // Als verarbeitet markieren (unabhängig davon, ob eine Nachricht existiert)
      processedWelcomeMessages.add(welcomeKey);
      console.log(`CHAT-DEBUG-010: Bot ${botId} wird als verarbeitet markiert`);
      
      // Chat als initialisiert markieren
      chatInitializedRef.current = true;
      
      const fetchBotSettings = async () => {
        try {
          const res = await fetch(`/api/bots/${botId}`);
          if (res.ok) {
            const botData = await res.json();
            console.log("CHAT-DEBUG-010: Geladene Bot-Daten:", {
              id: botData.id,
              name: botData.name,
              welcomeMessage: botData.welcomeMessage ? 'vorhanden' : 'nicht vorhanden'
            });
            
            if (botData && botData.settings) {
              // Bot-Einstellungen im state speichern
              setBotSettings(botData.settings);
              
              // RGB-Werte für Primärfarbe berechnen für Schatten etc.
              const primaryColor = botData.settings.primaryColor || '#3b82f6';
              const r = parseInt(primaryColor.slice(1, 3), 16);
              const g = parseInt(primaryColor.slice(3, 5), 16);
              const b = parseInt(primaryColor.slice(5, 7), 16);
              document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
              
              // Primärfarbe als CSS-Variable setzen
              document.documentElement.style.setProperty('--primary', primaryColor);
              
              // CSS-Variablen im :root setzen für Chat-Styling
              document.documentElement.style.setProperty('--bot-bg-color', botData.settings.botBgColor || 'rgba(248, 250, 252, 0.8)');
              document.documentElement.style.setProperty('--bot-text-color', botData.settings.botTextColor || '#000000');
              document.documentElement.style.setProperty('--bot-accent-color', botData.settings.botAccentColor || botData.settings.primaryColor || '#3b82f6');
              
              // User-Nachrichtenfarben
              if (botData.settings.userBgColor) {
                document.documentElement.style.setProperty('--user-bg-color', botData.settings.userBgColor);
              } else {
                // Fallback: Primärfarbe mit Gradient
                document.documentElement.style.setProperty(
                  '--user-bg-color', 
                  `linear-gradient(135deg, ${botData.settings.primaryColor || '#3b82f6'}, ${botData.settings.primaryColor || '#3b82f6'}cc)`
                );
              }
              
              // Benutzertextfarbe festlegen - mit höherer Spezifität
              const userTextColor = botData.settings.userTextColor || '#ffffff';
              document.documentElement.style.setProperty('--user-text-color', userTextColor);
              document.documentElement.style.setProperty('--user-text-color-override', userTextColor + ' !important');
              console.log(`CHAT-DEBUG-010: Setze Benutzer-Textfarbe auf ${userTextColor}`);
              
              // Willkommensnachricht nur setzen, wenn noch keine Nachrichten vorhanden sind
              if (messages.length === 0 && botData.welcomeMessage) {
                console.log("CHAT-DEBUG-010: Setze Willkommensnachricht für Bot:", 
                  botData.welcomeMessage.substring(0, 50) + "...");
                
                // Nur eine Nachricht hinzufügen, wenn der State noch leer ist
                setMessages([{
                  role: "assistant",
                  content: botData.welcomeMessage
                }]);
              }
            }
          } else {
            console.error("CHAT-DEBUG-010: Fehler beim Laden der Bot-Daten:", res.status);
          }
        } catch (error) {
          console.error("CHAT-DEBUG-010: Fehler beim Laden der Bot-Einstellungen:", error);
          // Fallback für die Farben
          document.documentElement.style.setProperty('--bot-bg-color', 'rgba(248, 250, 252, 0.8)');
          document.documentElement.style.setProperty('--bot-text-color', '#000000');
          document.documentElement.style.setProperty('--bot-accent-color', '#3b82f6');
          document.documentElement.style.setProperty('--user-bg-color', 'linear-gradient(135deg, #3b82f6, #3b82f6cc)');
          document.documentElement.style.setProperty('--user-text-color', '#ffffff');
        }
      };
      
      fetchBotSettings();
    } else {
      // Standard-Farben für den Fall, dass kein Bot angegeben ist
      console.log("CHAT-DEBUG-010: Kein Bot-ID angegeben, verwende Standard-Farben");
      document.documentElement.style.setProperty('--bot-bg-color', 'rgba(248, 250, 252, 0.8)');
      document.documentElement.style.setProperty('--bot-text-color', '#000000');
      document.documentElement.style.setProperty('--bot-accent-color', 'hsl(var(--primary))');
      document.documentElement.style.setProperty('--user-bg-color', 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.85))');
      document.documentElement.style.setProperty('--user-text-color', '#ffffff');
    }
  }, [botId]); // Wichtig: messages.length entfernt, verhindert wiederholten Aufruf

  // Bei Unmount Ressourcen freigeben
  useEffect(() => {
    return () => {
      // Abbrechen laufender Anfragen
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Chat-Initialisierungsstatus zurücksetzen
      chatInitializedRef.current = false;
    };
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    isOpen,
    mode,
    sendMessage,
    cancelMessage,
    toggleChat,
    cycleMode,
    setMode: setCurrentMode,
    messagesEndRef,
    botSettings,
  }
} 