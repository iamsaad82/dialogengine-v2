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

// VERSION-MARKER: Chat-Hook Debug-Code - Version 010
console.log("useChat.ts geladen - Debug-Version 010");

// Globaler Tracking-Mechanismus für Willkommensnachrichten
const processedWelcomeMessages = new Set<string>();

// VERSION-MARKER: Chat-Hook Debug-Code - Version 011
console.log("useChat.ts geladen - Debug-Version 011");

// Globaler Tracking-Mechanismus für Willkommensnachrichten
// Dies ist nun eine Kombination aus sessionStorage und einem in-memory Set
const getProcessedWelcomeMessages = (): Set<string> => {
  try {
    // Versuche, bereits verarbeitete Willkommensnachrichten aus dem sessionStorage zu laden
    const stored = sessionStorage.getItem('processedWelcomeMessages');
    if (stored) {
      return new Set<string>(JSON.parse(stored));
    }
  } catch (e) {
    console.error("Fehler beim Laden der verarbeiteten Willkommensnachrichten:", e);
  }
  return new Set<string>();
};

// Speichere verarbeitete Willkommensnachrichten im sessionStorage
const addProcessedWelcomeMessage = (key: string): void => {
  try {
    const current = getProcessedWelcomeMessages();
    current.add(key);
    sessionStorage.setItem('processedWelcomeMessages', JSON.stringify([...current]));
    console.log(`CHAT-DEBUG-011: Willkommensnachricht ${key} als verarbeitet markiert und in sessionStorage gespeichert`);
  } catch (e) {
    console.error("Fehler beim Speichern der verarbeiteten Willkommensnachrichten:", e);
  }
};

const hasProcessedWelcomeMessage = (key: string): boolean => {
  try {
    // Prüfe sowohl lokales Set als auch sessionStorage
    if (processedWelcomeMessages.has(key)) {
      return true;
    }
    
    const stored = getProcessedWelcomeMessages();
    return stored.has(key);
  } catch (e) {
    console.error("Fehler beim Überprüfen der verarbeiteten Willkommensnachrichten:", e);
    return false;
  }
};

// Hilfsfunktion für Debounce
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface UseChatProps {
  initialMessages?: Message[]
  initialMode?: ChatMode
  initialOpen?: boolean
  botId?: string
  onError?: (error: Error) => void
  initialSettings?: any // Bot-Einstellungen direkt übergeben
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
  onError,
  initialSettings
}: UseChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [mode, setMode] = useState<ChatMode>(initialMode)
  const [input, setInput] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const sessionIdRef = useRef<string>(uuidv4()) // Eindeutige Sitzungs-ID für Tracking
  const [botSettings, setBotSettings] = useState<any>(null)
  const lastMessageTimestampRef = useRef<number>(0) // Zeitstempel der letzten gesendeten Nachricht
  const chatInitializedRef = useRef<boolean>(false) // Tracking für die Chat-Initialisierung
  const cancelRef = useRef<boolean>(false) // Ref zum Abbrechen von Operationen
  const cancelFetchRef = useRef<boolean>(false) // Ref zum Abbrechen von Fetch-Operationen

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

  // Bei Unmount Ressourcen freigeben
  useEffect(() => {
    return () => {
      // Abbrechen laufender Anfragen
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Refs für Abbruch setzen
      cancelRef.current = true;
      cancelFetchRef.current = true;
      
      // Chat-Initialisierungsstatus zurücksetzen
      chatInitializedRef.current = false;
    };
  }, []);

  // Debounced sendMessage Funktion, verhindert mehrfache Aufrufe innerhalb von 500ms
  const debouncedSendMessage = useCallback(async (content: string) => {
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
  }, [isLoading, messages, addMessage, botId]);

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
    if (!botId) {
      return;
    }
    
    // Wenn initialSettings vorhanden sind, verwende diese direkt
    if (initialSettings) {
      console.log("CHAT-DEBUG-011: Verwende übergebene Bot-Einstellungen", initialSettings);
      
      // Bot-Einstellungen im state speichern
      setBotSettings(initialSettings);
      
      // RGB-Werte für Primärfarbe berechnen für Schatten etc.
      const primaryColor = initialSettings.primaryColor || '#3b82f6';
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
      
      // Primärfarbe als CSS-Variable setzen
      document.documentElement.style.setProperty('--primary', primaryColor);
      
      // CSS-Variablen im :root setzen für Chat-Styling
      document.documentElement.style.setProperty('--bot-bg-color', initialSettings.botBgColor || 'rgba(248, 250, 252, 0.8)');
      document.documentElement.style.setProperty('--bot-text-color', initialSettings.botTextColor || '#000000');
      document.documentElement.style.setProperty('--bot-accent-color', initialSettings.botAccentColor || initialSettings.primaryColor || '#3b82f6');
      
      // User-Nachrichtenfarben
      if (initialSettings.userBgColor) {
        document.documentElement.style.setProperty('--user-bg-color', initialSettings.userBgColor);
      } else {
        // Fallback: Primärfarbe mit Gradient
        document.documentElement.style.setProperty(
          '--user-bg-color', 
          `linear-gradient(135deg, ${initialSettings.primaryColor || '#3b82f6'}, ${initialSettings.primaryColor || '#3b82f6'}cc)`
        );
      }
      
      // Benutzertextfarbe festlegen - mit höherer Spezifität
      const userTextColor = initialSettings.userTextColor || '#ffffff';
      document.documentElement.style.setProperty('--user-text-color', `${userTextColor} !important`);
      
      // Explizit eine extra-Stile hinzufügen für höhere Spezifität
      const style = document.createElement('style');
      style.innerHTML = `
        .glassmorphism-user { color: ${userTextColor} !important; }
        .glassmorphism-user * { color: ${userTextColor} !important; }
      `;
      document.head.appendChild(style);
      
      console.log(`CHAT-DEBUG-011: Setze Benutzer-Textfarbe auf ${userTextColor} mit !important`);
      
      // Wenn Willkommensnachricht vorhanden ist und noch keine Nachrichten angezeigt werden
      if (messages.length === 0 && initialSettings.welcomeMessage) {
        // Willkommensnachricht nicht mehr zu messages hinzufügen, sondern nur als separate Variable
        // setMessages([{
        //   role: "assistant",
        //   content: initialSettings.welcomeMessage
        // }]);
      }
      
      // Markiere diese Willkommensnachricht als verarbeitet
      const welcomeKey = `welcome-${botId}`;
      processedWelcomeMessages.add(welcomeKey);
      addProcessedWelcomeMessage(welcomeKey);
      
      // Chat als initialisiert markieren
      chatInitializedRef.current = true;
      
      // Wenn Willkommensnachricht vorhanden ist
      if (initialSettings.welcomeMessage) {
        // Willkommensnachricht als separate Variable speichern
        setWelcomeMessage(initialSettings.welcomeMessage);
      }
      
      return;
    }
    
    console.log(`CHAT-DEBUG-011: Chat-Hook für Bot ${botId} - Willkommensnachricht wird geprüft`, { 
      messagesLength: messages.length,
      chatInitialized: chatInitializedRef.current
    });
    
    // Markiere diese Willkommensnachricht als verarbeitet
    const welcomeKey = `welcome-${botId}`;
    processedWelcomeMessages.add(welcomeKey);
    addProcessedWelcomeMessage(welcomeKey);
    
    // Chat als initialisiert markieren
    chatInitializedRef.current = true;
    
    // Eine Verzögerung hinzufügen, um sicherzustellen, dass die Komponente vollständig gemounted ist
    const timeoutId = setTimeout(() => {
      const fetchBotSettings = async () => {
        try {
          if (cancelFetchRef.current) {
            console.log("CHAT-DEBUG-011: Fetching abgebrochen, da der Chat entfernt wurde");
            return;
          }
          
          const res = await fetch(`/api/bots/${botId}`);
          if (res.ok) {
            const botData = await res.json();
            console.log("CHAT-DEBUG-011: Geladene Bot-Daten:", {
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
              document.documentElement.style.setProperty('--user-text-color', `${userTextColor} !important`);
              
              // Explizit eine extra-Stile hinzufügen für höhere Spezifität
              const style = document.createElement('style');
              style.innerHTML = `
                .glassmorphism-user { color: ${userTextColor} !important; }
                .glassmorphism-user * { color: ${userTextColor} !important; }
              `;
              document.head.appendChild(style);
              
              console.log(`CHAT-DEBUG-011: Setze Benutzer-Textfarbe auf ${userTextColor} mit !important`);
              
              // Willkommensnachricht nur setzen, wenn noch keine Nachrichten vorhanden sind
              if (messages.length === 0 && botData.welcomeMessage) {
                console.log("CHAT-DEBUG-011: Setze Willkommensnachricht für Bot:", 
                  botData.welcomeMessage.substring(0, 50) + "...");
                
                // Sicherstellen, dass der State nicht bereits andere Nachrichten enthält
                if (cancelRef.current) {
                  console.log("CHAT-DEBUG-011: Abbruch beim Setzen der Willkommensnachricht - Chat wurde entfernt");
                  return;
                }
                
                // Willkommensnachricht nicht mehr zu messages hinzufügen, sondern nur als separate Variable
                // setMessages([{
                //   role: "assistant",
                //   content: botData.welcomeMessage
                // }]);
              }

              // Willkommensnachricht als separate Variable speichern
              if (botData.welcomeMessage) {
                console.log("CHAT-DEBUG-011: Setze Willkommensnachricht für Bot:", 
                  botData.welcomeMessage.substring(0, 50) + "...");
                
                // Sicherstellen, dass der State nicht bereits andere Nachrichten enthält
                if (cancelRef.current) {
                  console.log("CHAT-DEBUG-011: Abbruch beim Setzen der Willkommensnachricht - Chat wurde entfernt");
                  return;
                }
                
                // Willkommensnachricht als separate Variable speichern
                setWelcomeMessage(botData.welcomeMessage);
              }
            }
          } else {
            console.error("CHAT-DEBUG-011: Fehler beim Laden der Bot-Daten:", res.status);
          }
        } catch (error) {
          console.error("CHAT-DEBUG-011: Fehler beim Laden der Bot-Einstellungen:", error);
          // Fallback für die Farben
          document.documentElement.style.setProperty('--bot-bg-color', 'rgba(248, 250, 252, 0.8)');
          document.documentElement.style.setProperty('--bot-text-color', '#000000');
          document.documentElement.style.setProperty('--bot-accent-color', '#3b82f6');
          document.documentElement.style.setProperty('--user-bg-color', 'linear-gradient(135deg, #3b82f6, #3b82f6cc)');
          document.documentElement.style.setProperty('--user-text-color', '#ffffff');
        }
      };
      
      fetchBotSettings();
    }, 100); // Kurze Verzögerung, um Race Conditions zu vermeiden
    
    return () => {
      clearTimeout(timeoutId); // Timeout löschen beim Unmount
    };
  }, [botId]); // Nur von botId abhängig machen, messages entfernt

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
    welcomeMessage,
  }
} 