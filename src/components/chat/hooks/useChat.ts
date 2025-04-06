'use client'

import { useState, useRef, useCallback, RefObject, useEffect } from 'react'
import { Message } from '../types'
import { LunaryClient } from '@/lib/lunary-client'
import { v4 as uuidv4 } from 'uuid'
import { BotSettings } from '@/types/bot'
import { useBotInfo } from './useBotInfo'

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

export type ChatMode = 'bubble' | 'fullscreen' | 'inline';

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
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'bubble' | 'fullscreen' | 'inline' | 'fullscreenSearch'>(initialMode)
  const [isOpen, setIsOpen] = useState(initialOpen)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const sessionIdRef = useRef<string>(uuidv4()) // Eindeutige Sitzungs-ID für Tracking
  const lastMessageTimestampRef = useRef<number>(0) // Zeitstempel der letzten gesendeten Nachricht
  const chatInitializedRef = useRef<boolean>(false) // Tracking für die Chat-Initialisierung
  const cancelRef = useRef<boolean>(false) // Ref zum Abbrechen von Operationen
  const cancelFetchRef = useRef<boolean>(false) // Ref zum Abbrechen von Fetch-Operationen
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)
  const [isDialogMode, setIsDialogMode] = useState(true)
  const [settings, setSettings] = useState<BotSettings | null>(initialSettings || null)
  const [botSettings, setBotSettings] = useState<any>(initialSettings || { showSuggestions: false })

  // Initialisiere die Session-ID bei der ersten Komponenten-Montage
  useEffect(() => {
    // Versuche, eine vorhandene Session-ID aus dem localStorage zu laden
    const storedSessionId = localStorage.getItem(`${botId || 'default'}_sessionId`);

    if (storedSessionId) {
      sessionIdRef.current = storedSessionId;
      console.log('DEBUG-007: Bestehende Session-ID geladen:', storedSessionId);
    } else {
      // Generiere eine neue Session-ID
      sessionIdRef.current = uuidv4();
      localStorage.setItem(`${botId || 'default'}_sessionId`, sessionIdRef.current);
      console.log('DEBUG-007: Neue Session-ID generiert:', sessionIdRef.current);
    }
  }, [botId]);

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

  // Wechselt zwischen den Modi (bubble -> inline -> fullscreen -> fullscreenSearch -> bubble)
  const cycleMode = useCallback(() => {
    setMode((currentMode) => {
      let nextMode;
      if (currentMode === 'bubble') {
        nextMode = 'inline';
      } else if (currentMode === 'inline') {
        nextMode = 'fullscreen';
      } else if (currentMode === 'fullscreen') {
        nextMode = 'fullscreenSearch';
      } else {
        nextMode = 'bubble';
      }

      // Tracking für Modusänderung
      LunaryClient.track({
        eventName: 'chat_mode_changed',
        properties: { mode: nextMode, botId },
        metadata: { sessionId: sessionIdRef.current }
      })

      return nextMode;
    })
  }, [botId])

  // Direkt zu einem bestimmten Modus wechseln
  const setCurrentMode = useCallback((newMode: ChatMode) => {
    setMode(newMode)
  }, [])

  // Nachrichtenliste aktualisieren mit neuer Nachricht
  useEffect(() => {
    if (messagesEndRef.current) {
      // Das Element mit einem Offset ins Sichtfeld scrollen,
      // damit der Anfang der Nachricht sichtbar ist
      const parentElement = messagesEndRef.current.parentElement;
      if (parentElement) {
        // Statt zum Ende scrollen, scrollen wir zum ersten Kind-Element der letzten Nachricht
        const lastMessage = parentElement.querySelector('.group:last-of-type');
        if (lastMessage) {
          lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback zum alten Verhalten
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages]);

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
          sessionId: sessionIdRef.current // Füge die sessionId zum Request hinzu
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(
          `Fehler beim Senden der Nachricht: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Aktualisiere die sessionId falls die API eine neue zurückgibt
      if (data.sessionId && data.sessionId !== sessionIdRef.current) {
        console.log('DEBUG-007: Neue Session-ID von API erhalten:', data.sessionId);
        sessionIdRef.current = data.sessionId;
        localStorage.setItem(`${botId || 'default'}_sessionId`, data.sessionId);
      }

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

  // Bot-Einstellungen werden jetzt über den useBotInfo-Hook geladen
  useEffect(() => {
    if (!botId) return;
    console.log("CHAT-DEBUG-012: Bot-Einstellungen werden nun über useBotInfo geladen");
  }, [botId, initialSettings]);

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