'use client'

import { useState, useRef, useCallback, RefObject, useEffect } from 'react'
import { ChatMode, Message } from '../types/common'
import { LunaryClient } from '@/lib/lunary-client'
import { v4 as uuidv4 } from 'uuid'
import { BotSettings } from '@/types/bot'
import { useBotInfo } from './useBotInfo'

// Typendefinition für Stream-Chat-Mode erweitern - verwende jetzt die gemeinsame Definition
// export type StreamChatMode = 'bubble' | 'fullscreen' | 'inline'; // Unterstützt jetzt auch inline-Modus

// DEBUG VERSION
console.log("useStreamChat.ts geladen - Debug-Version 001");

// Globaler Tracking-Mechanismus für Willkommensnachrichten
const processedWelcomeMessages = new Set<string>();

// Hilfsfunktion für Debounce
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function(...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface UseStreamChatProps {
  initialMessages?: Message[]
  initialMode?: ChatMode
  initialOpen?: boolean
  botId?: string
  onError?: (error: Error) => void
  initialSettings?: any
}

interface SectionChunk {
  type: string;
  content: string;
  complete: boolean;
}

/**
 * Konvertiert einen Hex-Farbwert in ein RGB-Format
 */
const hexToRGB = (hex: string, defaultValue = '0, 0, 0'): string => {
  try {
    // Entferne das # am Anfang, falls vorhanden
    hex = hex.replace('#', '');

    // Konvertiere kurzes Format (z.B. #fff) in langes Format
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    // Überprüfe, ob der Hex-Wert gültig ist
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return defaultValue;
    }

    // Konvertiere Hex zu RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  } catch (error) {
    console.error('Fehler bei der Konvertierung von Hex zu RGB:', error);
    return defaultValue;
  }
};

export function useStreamChat({
  initialMessages = [],
  initialMode = 'bubble',
  initialOpen = false,
  botId,
  onError,
  initialSettings
}: UseStreamChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<ChatMode>(initialMode)

  // Wenn embedded=true und mode nicht 'bubble' ist, dann soll der Chat initial geöffnet sein
  // Wenn embedded=true und mode 'bubble' ist, dann soll der Chat initial geschlossen sein
  // Ansonsten den übergebenen initialOpen-Wert verwenden
  const shouldBeInitiallyOpen = initialOpen || (initialOpen && initialMode !== 'bubble');
  const [isOpen, setIsOpen] = useState(shouldBeInitiallyOpen)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const sessionIdRef = useRef<string>(uuidv4()) // Eindeutige Sitzungs-ID für Tracking

  // Initialisiere botSettings mit showSuggestions aus initialSettings
  console.log("STREAM-DEBUG-008: initialSettings bei Initialisierung", initialSettings);
  const initialBotSettings = {
    // Kopiere alle Eigenschaften aus initialSettings, falls vorhanden
    ...(initialSettings && typeof initialSettings === 'object' ? initialSettings : {}),

    // Stelle sicher, dass showSuggestions immer explizit als Boolean gesetzt ist,
    // unabhängig davon, ob initialSettings vorhanden ist oder nicht
    showSuggestions: initialSettings?.showSuggestions === true
  };
  console.log("STREAM-DEBUG-008: Initialisierte botSettings", initialBotSettings);
  const [botSettings, setBotSettings] = useState<any>(initialBotSettings)
  const lastMessageTimestampRef = useRef<number>(0)
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)
  const [currentStreamedMessage, setCurrentStreamedMessage] = useState<{
    content: string,
    sections: Map<string, string>
  } | null>(null)
  // Cache für den Inhalt der gestreamten Nachricht (bleibt erhalten, auch wenn currentStreamedMessage auf null gesetzt wird)
  const lastStreamContentRef = useRef<string>('');
  // Flag zur Vermeidung von mehrfachen Nachrichtenzusätzen bei Stream-Ende
  const endEventProcessedRef = useRef<boolean>(false);

  // Initialisiere die Session-ID bei der ersten Komponenten-Montage
  useEffect(() => {
    // Versuche, eine vorhandene Session-ID aus dem localStorage zu laden
    const storedSessionId = localStorage.getItem(`${botId || 'default'}_sessionId`);

    if (storedSessionId) {
      sessionIdRef.current = storedSessionId;
      console.log('STREAM-DEBUG-001: Bestehende Session-ID geladen:', storedSessionId);
    } else {
      // Generiere eine neue Session-ID
      sessionIdRef.current = uuidv4();
      localStorage.setItem(`${botId || 'default'}_sessionId`, sessionIdRef.current);
      console.log('STREAM-DEBUG-001: Neue Session-ID generiert:', sessionIdRef.current);
    }
  }, [botId]);

  // Toggle Chat öffnen/schließen
  const toggleChat = useCallback(() => {
    setIsOpen(!isOpen)
    console.log("useStreamChat: toggleChat - neuer Status:", !isOpen, "aktueller Modus:", mode);

    // Tracking für Chat-Öffnen/Schließen
    LunaryClient.track({
      eventName: isOpen ? 'chat_closed' : 'chat_opened',
      properties: { botId },
      metadata: { sessionId: sessionIdRef.current }
    })
  }, [isOpen, botId, mode])

  // Wechselt zwischen den Modi (bubble -> fullscreen -> bubble)
  const cycleMode = useCallback(() => {
    setMode((currentMode) => {
      const nextMode = currentMode === 'bubble' ? 'fullscreen' : currentMode === 'fullscreen' ? 'inline' : 'bubble';

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
    console.log("useStreamChat: setCurrentMode - neuer Modus:", newMode, "isOpen:", isOpen);
  }, [isOpen])

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

  // Nachricht zur Liste hinzufügen - mit verbesserter Duplikaterkennung
  const addMessage = useCallback((message: Message) => {
    console.log("STREAM-DEBUG-002: addMessage aufgerufen", message.role, message.content.substring(0, 30));

    // Überprüfen, ob die Nachricht bereits existiert (um Duplikate zu vermeiden)
    setMessages((prevMessages) => {
      // Prüfe, ob eine identische Nachricht bereits in der Liste existiert
      const isDuplicate = prevMessages.some(
        (m) => m.role === message.role && m.content === message.content
      );

      if (isDuplicate) {
        console.log("STREAM-DEBUG-002: Doppelte Nachricht ignoriert");
        return prevMessages;
      }

      // Wenn es eine Benutzer-Nachricht ist, prüfe, ob der Benutzer bereits eine ähnliche Nachricht gesendet hat
      if (message.role === 'user') {
        // Überprüfe die letzte Benutzer-Nachricht
        const lastUserMessage = [...prevMessages].reverse().find(m => m.role === 'user');

        if (lastUserMessage && Math.abs(lastUserMessage.content.length - message.content.length) < 5) {
          // Die Nachrichten haben ähnliche Länge, was auf ein mögliches Duplikat hinweist
          console.log("STREAM-DEBUG-002: Ähnliche Benutzer-Nachricht bereits in der Liste, ignoriere");
          return prevMessages;
        }
      }

      console.log("STREAM-DEBUG-002: Nachricht zu Liste hinzugefügt:", message.role);
      // Normale Nachricht hinzufügen
      return [...prevMessages, message];
    });
  }, []);

  // Event-Verarbeitung für Stream-Ereignisse
  const processStreamEvent = useCallback((event: MessageEvent) => {
    const eventType = event.type;
    let data;

    console.log('STREAM-DEBUG-001: Verarbeite Event-Typ:', eventType, 'Raw-Daten:', event.data.slice(0, 50) + '...');

    try {
      data = JSON.parse(event.data);
    } catch (e) {
      console.error("STREAM-DEBUG-001: Fehler beim Parsen der Stream-Daten:", e);
      console.log("STREAM-DEBUG-001: Problematische Daten:", event.data);
      return;
    }

    console.log('STREAM-DEBUG-001: Geparste Daten:', data);

    // Spezielle Verarbeitung für progressive Token-Events
    if (eventType === 'progressive-token') {
      // Sofortige Verarbeitung ohne Debouncing für flüssiges Streaming
      if (data.type === 'token' && data.content) {
        setCurrentStreamedMessage(prev => {
          const sections = new Map(prev?.sections || new Map());
          const existingContent = sections.get('other') || '';
          sections.set('other', existingContent + data.content);

          // Kombiniere alle Sektionen
          let combinedContent = '';
          if (sections.has('intro')) combinedContent += sections.get('intro') || '';
          if (sections.has('schnellueberblick')) combinedContent += sections.get('schnellueberblick') || '';
          if (sections.has('content')) combinedContent += sections.get('content') || '';
          if (sections.has('keyfacts')) combinedContent += sections.get('keyfacts') || '';
          if (sections.has('tipp')) combinedContent += sections.get('tipp') || '';
          if (sections.has('other')) combinedContent += sections.get('other') || '';

          // Cache aktualisieren
          lastStreamContentRef.current = combinedContent;

          return {
            content: combinedContent,
            sections
          };
        });

        return; // Beende die Verarbeitung hier für progressive Token
      }
    }

    // Optimierte Verarbeitung für Token-Events (schnellere Anzeige)
    if (eventType === 'token') {
      // Direktes Token-Event vom Server - sofort verarbeiten ohne Debouncing
      let sectionContent = '';

      if (data.type === 'other' && data.content) {
        sectionContent = data.content;
      } else if (data.event === 'token' && data.data) {
        sectionContent = data.data;
      } else if (typeof data.content === 'string') {
        sectionContent = data.content;
      }

      if (sectionContent) {
        // Sofort aktualisieren ohne Debouncing
        setCurrentStreamedMessage(prev => {
          const sections = new Map(prev?.sections || new Map());
          const existingContent = sections.get('other') || '';
          sections.set('other', existingContent + sectionContent);

          // Alle Sektionen zu einem vollständigen Inhalt kombinieren
          let combinedContent = '';

          // Bestimmte Reihenfolge für die Sektionen einhalten
          if (sections.has('intro')) combinedContent += sections.get('intro') || '';
          if (sections.has('schnellueberblick')) combinedContent += sections.get('schnellueberblick') || '';
          if (sections.has('content')) combinedContent += sections.get('content') || '';
          if (sections.has('keyfacts')) combinedContent += sections.get('keyfacts') || '';
          if (sections.has('tipp')) combinedContent += sections.get('tipp') || '';
          if (sections.has('other')) combinedContent += sections.get('other') || '';

          // Content im Cache speichern, um ihn im end-Event zu verwenden
          lastStreamContentRef.current = combinedContent;

          return {
            content: combinedContent,
            sections
          };
        });
      }
    }
    // Korrigierte Bedingung für die Verarbeitung von Sektionen
    else if (eventType === 'section' || (data && (data.type || data.event === 'token'))) {
      // Wir erhalten eine komplette Sektion oder ein Token
      let sectionType = 'other';
      let sectionContent = '';

      // Verschiedene Formate verarbeiten
      if (data.type) {
        // Direktes Sektionsformat
        sectionType = data.type;
        sectionContent = data.content || '';
      } else if (data.event === 'token' && data.data) {
        // Token-Format vom Flowise Server
        sectionType = 'other';
        sectionContent = data.data;
      }

      console.log('STREAM-DEBUG-001: Sektionstyp erhalten:', sectionType, 'Inhalt:', sectionContent.substring(0, 30));

      setCurrentStreamedMessage(prev => {
        const sections = new Map(prev?.sections || new Map());

        // Für Typ 'other' fügen wir zum bestehenden Inhalt hinzu (kumulativ)
        if (sectionType === 'other') {
          const existingContent = sections.get('other') || '';
          sections.set('other', existingContent + sectionContent);
        } else {
          sections.set(sectionType, sectionContent);
        }

        // Alle Sektionen zu einem vollständigen Inhalt kombinieren
        let combinedContent = '';

        // Bestimmte Reihenfolge für die Sektionen einhalten
        if (sections.has('intro')) combinedContent += sections.get('intro') || '';
        if (sections.has('schnellueberblick')) combinedContent += sections.get('schnellueberblick') || '';
        if (sections.has('content')) combinedContent += sections.get('content') || '';
        if (sections.has('keyfacts')) combinedContent += sections.get('keyfacts') || '';
        if (sections.has('tipp')) combinedContent += sections.get('tipp') || '';
        if (sections.has('other')) combinedContent += sections.get('other') || '';

        // Content im Cache speichern, um ihn im end-Event zu verwenden
        lastStreamContentRef.current = combinedContent;

        return {
          content: combinedContent,
          sections
        };
      });
    } else if (eventType === 'meta') {
      console.log('STREAM-DEBUG-001: Meta-Event erhalten:', data);

      // Metadaten wie SessionID verarbeiten
      if (data.sessionId) {
        console.log('STREAM-DEBUG-001: SessionID aus Metadaten erhalten:', data.sessionId);
        sessionIdRef.current = data.sessionId;
        localStorage.setItem(`${botId || 'default'}_sessionId`, data.sessionId);
      }
    } else if (eventType === 'error') {
      console.error("STREAM-DEBUG-001: Fehler vom Stream:", data.error);
      setError(data.error || "Ein unbekannter Fehler ist aufgetreten");
      setIsLoading(false);
    } else if (eventType === 'end') {
      console.log("STREAM-DEBUG-006: Stream-Ende erhalten, finalisiere Nachricht",
                 "currentStreamedMessage:",
                 currentStreamedMessage ? "vorhanden" : "nicht vorhanden",
                 "Cache-Inhalt vorhanden:", lastStreamContentRef.current ? "ja" : "nein");

      // Prüfen, ob dieses End-Event bereits verarbeitet wurde
      if (endEventProcessedRef.current) {
        console.log("STREAM-DEBUG-007: End-Event wurde bereits verarbeitet, überspringe");
        return;
      }

      // End-Event als verarbeitet markieren
      endEventProcessedRef.current = true;

      // WICHTIG: Erst final die Nachrichtenliste aktualisieren, bevor wir den Streaming-Status zurücksetzen
      // Überprüfe zuerst, ob wir überhaupt eine gestreamte Nachricht haben
      let finalContent = '';
      let messageToAdd: Message | null = null;

      if (currentStreamedMessage) {
        console.log("STREAM-DEBUG-007: Streamed Nachricht gefunden, Länge:",
                    currentStreamedMessage.content?.length || 0,
                    "Inhalt (Anfang):", currentStreamedMessage.content?.substring(0, 30) || "leer");

        // Erstelle eine Kopie des Inhalts - WICHTIG!
        finalContent = String(currentStreamedMessage.content || "");
      } else if (lastStreamContentRef.current) {
        // Verwende den gecachten Inhalt, falls currentStreamedMessage nicht mehr verfügbar ist
        console.log("STREAM-DEBUG-007: Verwende gecachten Inhalt, Länge:", lastStreamContentRef.current.length);
        finalContent = lastStreamContentRef.current;
      }

      console.log("STREAM-DEBUG-007: Finale Nachricht, Länge:", finalContent.length);

      // Überprüfe, ob der Inhalt nach dem Trimmen nicht leer ist
      if (finalContent && finalContent.trim().length > 0) {
        console.log("STREAM-DEBUG-007: Erstelle finale Bot-Antwort");

        // Sichere die Nachricht, bevor wir irgendwelche State-Updates machen
        messageToAdd = {
          id: `msg-final-${Date.now()}`,
          role: 'assistant',
          content: finalContent,
          timestamp: Date.now()
        } as Message;

        // DIREKT die Nachrichtenliste erweitern - nicht async oder über eine Callback-Funktion
        console.log("STREAM-DEBUG-007: Füge finale Nachricht direkt zur Liste hinzu");
        if (messageToAdd) {
          setMessages(prevMessages => {
            // Überprüfen, ob bereits eine sehr ähnliche Nachricht vorhanden ist
            const hasSimilar = prevMessages.some(m =>
              m.role === 'assistant' &&
              Math.abs(m.content.length - finalContent.length) < 10
            );

            if (hasSimilar) {
              console.log("STREAM-DEBUG-007: Ähnliche Nachricht bereits in der Liste, keine Änderung");
              return prevMessages;
            }

            // TypeScript versteht nicht, dass messageToAdd hier garantiert nicht null ist
            // Daher verwenden wir eine Typ-Assertion
            return [...prevMessages, messageToAdd as Message];
          });
        } else {
          console.warn("STREAM-DEBUG-007: messageToAdd ist null, keine Nachricht hinzugefügt");
        }

        // Auch in localStorage speichern als Backup
        try {
          localStorage.setItem(`chat_current_message_${botId || 'default'}`, finalContent);
          localStorage.setItem(`chat_message_added_${botId || 'default'}`, 'true');
        } catch (e) {
          console.warn("STREAM-DEBUG-007: Lokales Backup fehlgeschlagen", e);
        }
      } else {
        console.warn("STREAM-DEBUG-007: Leerer Nachrichteninhalt, keine Nachricht hinzugefügt");
      }

      // Sofort den Ladestatus zurücksetzen (für schnellere Anzeige)
      setIsLoading(false);
      console.log("STREAM-DEBUG-007: Ladestatus sofort zurückgesetzt");

      // Minimale Verzögerung vor dem Zurücksetzen des gestreamten Inhalts
      setTimeout(() => {
        // Zurücksetzen des End-Event-Flags nach Abschluss der Verarbeitung
        endEventProcessedRef.current = false;

        // Nur wenn wir tatsächlich eine Nachricht hinzugefügt haben
        if (messageToAdd) {
          console.log("STREAM-DEBUG-007: Streamed-Nachricht zurückgesetzt");
          setCurrentStreamedMessage(null);
        }
      }, 50);

      // Tracking für empfangene Antwort
      LunaryClient.track({
        eventName: 'message_received',
        properties: {
          content: currentStreamedMessage?.content.slice(0, 100) || '', // Ersten 100 Zeichen der Antwort
          botId,
          responseTime: Date.now() - lastMessageTimestampRef.current // Antwortzeit
        },
        metadata: { sessionId: sessionIdRef.current }
      });
    } else {
      console.log('STREAM-DEBUG-001: Unbekannter Event-Typ erhalten:', eventType);
    }
  }, [addMessage, botId, currentStreamedMessage]);

  // Stream-Verbindung abbrechen
  const cancelMessage = useCallback(() => {
    if (abortControllerRef.current) {
      console.log("STREAM-DEBUG-001: Anfrage abgebrochen");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setCurrentStreamedMessage(null);
    }
  }, []);

  // Streaming-Nachricht senden
  const sendMessage = useCallback(async (content: string) => {
    if (!content || content.trim() === '') {
      return;
    }

    // Verhindere erneutes Senden, wenn gerade geladen wird
    if (isLoading) {
      console.log('STREAM-DEBUG-001: Sendeprozess läuft bereits, ignoriere erneuten Aufruf');
      return;
    }

    // Prüfe, ob die letzte Nachricht erst kürzlich gesendet wurde
    const now = Date.now();
    if (now - lastMessageTimestampRef.current < 1000) {
      console.log('STREAM-DEBUG-001: Letzte Nachricht wurde vor weniger als 1 Sekunde gesendet, ignoriere');
      return;
    }
    lastMessageTimestampRef.current = now;

    try {
      // Anfang des Ladevorgangs
      setIsLoading(true);
      setError(null);

      // Benutzer-Nachricht hinzufügen - mit deduplizierungscheck
      const userMessage: Message = {
        id: `user-msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now()
      };

      // Prüfe auf Duplikate, bevor wir die Nachricht hinzufügen
      const isDuplicate = messages.some(m =>
        m.role === 'user' &&
        m.content === content
      );

      if (!isDuplicate) {
        console.log("STREAM-DEBUG-005: Füge neue Benutzer-Nachricht hinzu");
        addMessage(userMessage);
      } else {
        console.log("STREAM-DEBUG-005: Benutzer-Nachricht bereits vorhanden, überspringe Hinzufügen");
      }

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

      // Sende Anfrage an Streaming-API
      console.log('STREAM-DEBUG-001: Sende Streaming-API-Anfrage', content);

      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          history: messages,
          botId: botId,
          sessionId: sessionIdRef.current
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(
          `Fehler beim Senden der Nachricht: ${response.status} ${response.statusText}`
        );
      }

      if (!response.body) {
        throw new Error("Keine Stream-Antwort erhalten");
      }

      // Debug-Ausgabe
      console.log('STREAM-DEBUG-001: Stream-Antwort erhalten, beginne mit dem Lesen');

      // Stream-Reader erstellen
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // EventSource-ähnliche Verarbeitung
      let buffer = '';

      // Leere die aktuelle Streamnachricht
      setCurrentStreamedMessage({
        content: '',
        sections: new Map()
      });

      // Stream lesen und verarbeiten
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('STREAM-DEBUG-004: Stream beendet');
          break;
        }

        // Bytes in Text umwandeln und zum Buffer hinzufügen
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        console.log('STREAM-DEBUG-004: Chunk empfangen, Länge:', chunk.length, 'Daten:', chunk.substring(0, 50));

        // Versuche zuerst, Tokens direkt zu extrahieren
        try {
          const data = JSON.parse(chunk);
          if (data.event === 'token' && data.data) {
            // Direktes Token-Format vom Flowise
            console.log('STREAM-DEBUG-004: Direktes Token gefunden:', data.data.substring(0, 30));

            // Als Token-Event behandeln für schnellere Verarbeitung
            processStreamEvent(new MessageEvent('token', {
              data: JSON.stringify({
                type: 'other',
                content: data.data
              })
            }));

            // Buffer leeren, da wir den Chunk bereits verarbeitet haben
            buffer = '';
            continue;
          }
        } catch (e) {
          // Kein gültiges JSON, normaler Event-basierter Stream
        }

        // Nach Events suchen (SSE-Format mit event/data)
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Letzter Teil ist möglicherweise unvollständig

        console.log('STREAM-DEBUG-004: Gefundene Event-Blöcke:', lines.length);

        for (const line of lines) {
          if (!line.trim()) continue;

          // Verschiedene Formate verarbeiten

          // 1. Standard-SSE-Format (event: X\ndata: Y)
          const eventMatch = line.match(/^event: (.+)$/m);
          const dataMatch = line.match(/^data: (.+)$/m);

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1].trim();
            const eventData = dataMatch[1].trim();

            console.log('STREAM-DEBUG-004: SSE-Event gefunden:', eventType, 'mit Daten:', eventData.substring(0, 50));

            // Event verarbeiten
            processStreamEvent(new MessageEvent(eventType, { data: eventData }));
            continue;
          }

          // 2. Nur data: ohne event: (als token behandeln)
          const onlyDataMatch = line.match(/^data: (.+)$/m);
          if (onlyDataMatch) {
            const dataContent = onlyDataMatch[1].trim();
            console.log('STREAM-DEBUG-004: Nur Data gefunden:', dataContent.substring(0, 50));

            try {
              // Versuche als JSON zu parsen
              const parsedData = JSON.parse(dataContent);

              // Bestimme den Event-Typ basierend auf dem Inhalt
              if (parsedData.event === 'token' && parsedData.data) {
                // Flowise Token-Format
                console.log('STREAM-DEBUG-004: Token-Event in Data gefunden');
                processStreamEvent(new MessageEvent('token', {
                  data: JSON.stringify({
                    type: 'other',
                    content: parsedData.data
                  })
                }));
              } else if (parsedData.type) {
                // Sektion mit Typ
                console.log('STREAM-DEBUG-004: Sektions-Event in Data gefunden');
                processStreamEvent(new MessageEvent('section', { data: dataContent }));
              } else {
                // Generisches Event
                console.log('STREAM-DEBUG-004: Unbekanntes JSON-Format in Data');
                processStreamEvent(new MessageEvent('message', { data: dataContent }));
              }
            } catch (e) {
              // Kein gültiges JSON, als rohes Token behandeln
              console.log('STREAM-DEBUG-004: Data ist kein JSON, behandle als Text-Token');
              processStreamEvent(new MessageEvent('section', {
                data: JSON.stringify({
                  type: 'other',
                  content: dataContent
                })
              }));
            }
            continue;
          }

          // 3. Direktes JSON-Format (keine event/data Struktur)
          try {
            const directData = JSON.parse(line);
            console.log('STREAM-DEBUG-004: Direktes JSON gefunden:', JSON.stringify(directData).substring(0, 50));

            // Bestimme Event-Typ basierend auf der Datenstruktur
            if (directData.event === 'token' && directData.data) {
              // Flowise Token Format
              processStreamEvent(new MessageEvent('token', {
                data: JSON.stringify({
                  type: 'other',
                  content: directData.data
                })
              }));
            } else if (directData.type) {
              // Sektions-Format
              const inferredType = 'section';
              processStreamEvent(new MessageEvent(inferredType, { data: line }));
            } else {
              // Unbekanntes Format, als Nachricht behandeln
              processStreamEvent(new MessageEvent('message', { data: line }));
            }
          } catch (e) {
            // Kein gültiges JSON und kein erkanntes Format
            console.log('STREAM-DEBUG-004: Unbekanntes Format:', line);

            // Als Rohtext behandeln, falls nicht leer
            if (line.trim().length > 0) {
              processStreamEvent(new MessageEvent('section', {
                data: JSON.stringify({
                  type: 'other',
                  content: line
                })
              }));
            }
          }
        }
      }

      // Stream ist beendet, aber überprüfen wir, ob noch ein finales Event im Buffer ist
      if (buffer.trim()) {
        console.log('STREAM-DEBUG-001: Verarbeite verbleibenden Buffer:', buffer.length);

        const eventMatch = buffer.match(/^event: (.+)$/m);
        const dataMatch = buffer.match(/^data: (.+)$/m);

        if (eventMatch && dataMatch) {
          const eventType = eventMatch[1].trim();
          const eventData = dataMatch[1].trim();

          console.log('STREAM-DEBUG-001: Letztes Event gefunden:', eventType);

          // Event verarbeiten
          processStreamEvent(new MessageEvent(eventType, { data: eventData }));
        }
      }

      // Überprüfen, ob wir ein "end"-Event bekommen haben, falls nicht, erzwingen wir ein Ende
      if (isLoading && (currentStreamedMessage || lastStreamContentRef.current)) {
        console.log('STREAM-DEBUG-007: Stream beendet ohne end-Event, erzwinge Ende');

        // Prüfen ob End-Event bereits verarbeitet wurde
        if (endEventProcessedRef.current) {
          console.log("STREAM-DEBUG-007: End-Event bereits verarbeitet, überspringe erzwungenes Ende");
          return;
        }

        // Als verarbeitet markieren
        endEventProcessedRef.current = true;

        // Kopie des aktuellen Inhalts sichern
        let finalContent = '';

        if (currentStreamedMessage?.content) {
          finalContent = currentStreamedMessage.content;
        } else if (lastStreamContentRef.current) {
          finalContent = lastStreamContentRef.current;
        }

        // Stream ist beendet, füge die finale Nachricht hinzu (wenn nicht leer)
        if (finalContent && finalContent.trim().length > 0) {
          console.log('STREAM-DEBUG-007: Füge finale Nachricht ohne end-Event hinzu, Länge:', finalContent.length);

          // Eindeutige ID für diese Nachricht
          const messageId = `msg-forced-${Date.now()}`;

          const botMessage: Message = {
            id: messageId,
            role: 'assistant',
            content: finalContent,
            timestamp: Date.now()
          };

          // Direkt zur Nachrichtenliste hinzufügen
          setMessages(prevMessages => {
            // Prüfen ob bereits eine ähnliche Nachricht vorhanden
            const hasSimilar = prevMessages.some(m =>
              m.role === 'assistant' &&
              Math.abs(m.content.length - finalContent.length) < 10
            );

            if (hasSimilar) {
              return prevMessages;
            }

            return [...prevMessages, botMessage];
          });

          // Cache im localStorage speichern
          try {
            localStorage.setItem(`chat_current_message_${botId || 'default'}`, finalContent);
            localStorage.setItem(`chat_message_added_${botId || 'default'}`, 'true');
          } catch (e) {
            console.warn("STREAM-DEBUG-007: Lokales Backup fehlgeschlagen", e);
          }
        }

        // Sofort den Ladestatus zurücksetzen
        setIsLoading(false);

        // Minimale Verzögerung vor dem Zurücksetzen des gestreamten Inhalts
        setTimeout(() => {
          endEventProcessedRef.current = false;
          setCurrentStreamedMessage(null);
        }, 50);
      }

    } catch (err: any) {
      console.error('STREAM-DEBUG-001: Fehler bei Stream-Verarbeitung:', err);

      setError(err?.message || 'Ein Fehler ist bei der Kommunikation aufgetreten');
      setIsLoading(false);

      if (onError && err instanceof Error) {
        onError(err);
      }

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
      setInput('');
    }
  }, [isLoading, messages, processStreamEvent, addMessage, botId]);

  // Lade Bot-Einstellungen und setze CSS-Variablen
  useEffect(() => {
    if (!botId) return;

    // Einfache Funktion zur Konvertierung von Hex zu RGB
    const hexToRGB = (hex: string) => {
      if (hex.startsWith('#')) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
      }
      return '59, 130, 246'; // Fallback: RGB für #3b82f6
    };

    console.log("STREAM-DEBUG-010: Bot-Einstellungen werden nun über useBotInfo geladen");
  }, [botId, initialSettings]);

  // Helfer-Funktion zum Hinzufügen einer Nachricht und Zurücksetzen des Stream-Status
  const addMessageAndResetStream = useCallback((message: Message, originalContent: string) => {
    console.log("STREAM-DEBUG-005: addMessageAndResetStream aufgerufen mit Nachrichtenlänge:", originalContent.length);

    // Erstelle eine Kopie des aktuellen Nachrichteninhalts
    const finalMessageContent = originalContent;

    // Wichtig: Wir erstellen eine lokale Kopie der aktuellen Nachrichten
    // um sicherzustellen, dass wir die neuesten Nachrichten haben
    setMessages(prevMessages => {
      // Prüfe auf Duplikate, aber nicht zu streng
      const similarMessageExists = prevMessages.some(m =>
        m.role === 'assistant' &&
        // Entweder gleicher Inhalt oder sehr ähnliche Länge
        (m.content === finalMessageContent || Math.abs(m.content.length - finalMessageContent.length) < 5)
      );

      if (similarMessageExists) {
        console.log("STREAM-DEBUG-005: Ähnliche Nachricht bereits in der Liste, keine Aktualisierung");
        return prevMessages;
      }

      // Neue eindeutige Nachricht mit Zeitstempel erzeugen
      const uniqueMessage: Message = {
        ...message,
        id: `msg-final-${Date.now()}`,
        timestamp: Date.now(),
        content: finalMessageContent
      };

      console.log("STREAM-DEBUG-005: Füge finale Nachricht zur Liste hinzu, neue Länge:", prevMessages.length + 1);

      // Wichtig: Erstelle eine neue Array-Referenz
      const updatedMessages = [...prevMessages, uniqueMessage];

      // Speichere die aktualisierten Nachrichten auch in lokalem Storage als Backup
      try {
        localStorage.setItem(`chat_backup_${botId || 'default'}`,
          JSON.stringify(updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp || Date.now()
          }))));
        console.log("STREAM-DEBUG-005: Nachrichten im lokalen Storage gesichert");
      } catch (e) {
        console.warn("STREAM-DEBUG-005: Konnte Nachrichten nicht im lokalen Storage sichern:", e);
      }

      return updatedMessages;
    });

    // Reduzierte Verzögerung für schnellere Anzeige
    // Wir setzen den Stream-Status sofort zurück
    console.log("STREAM-DEBUG-005: Setze Stream-Status sofort zurück");
    setIsLoading(false);

    // Minimale Verzögerung vor dem Zurücksetzen des gestreamten Inhalts
    // um sicherzustellen, dass die UI aktualisiert wird
    setTimeout(() => {
      console.log("STREAM-DEBUG-005: Setze gestreamten Inhalt zurück");
      setCurrentStreamedMessage(null);
    }, 50);
  }, [botId]);

  // Füge einen Fallback-Mechanismus für den Fall hinzu, dass das end-Event nicht ankommt
  useEffect(() => {
    // Wenn wir im Lade-Zustand sind und eine gestreamte Nachricht haben,
    // aber für längere Zeit keine Updates erhalten, betrachten wir den Stream als beendet

    if (isLoading && currentStreamedMessage) {
      // Timer für Stream-Timeout
      const timeoutId = setTimeout(() => {
        console.log("STREAM-DEBUG-004: Stream-Timeout ausgelöst, kein end-Event erhalten");

        if (currentStreamedMessage.content && currentStreamedMessage.content.trim().length > 0) {
          // Erstelle eine Nachricht aus dem aktuellen Stream-Inhalt
          const messageId = `msg-timeout-${Date.now()}`;
          const finalContent = currentStreamedMessage.content;

          const timeoutMessage: Message = {
            id: messageId,
            role: 'assistant',
            content: finalContent,
            timestamp: Date.now()
          };

          // Füge die Nachricht hinzu und setze den Stream zurück
          console.log("STREAM-DEBUG-004: Füge Timeout-Nachricht hinzu, Länge:", finalContent.length);
          addMessageAndResetStream(timeoutMessage, finalContent);
        } else {
          // Leere Nachricht, nur Status zurücksetzen
          console.warn("STREAM-DEBUG-004: Leerer Stream-Inhalt beim Timeout");
          setCurrentStreamedMessage(null);
          setIsLoading(false);
        }
      }, 5000); // 5 Sekunden ohne Updates als Timeout betrachten

      // Cleanup
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, currentStreamedMessage, addMessageAndResetStream]);

  // Wenn der Modus von außen geändert wird, aktualisiere den internen Modus
  useEffect(() => {
    console.log("useStreamChat: Modus-Update - Aktueller Modus:", mode, "Neuer initialMode:", initialMode);
    if (setMode && initialMode !== mode) {
      console.log("useStreamChat: Setze Modus von", mode, "auf", initialMode);
      setMode(initialMode);
    }
  }, [initialMode, setMode, mode]);

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
    setMode,
    messagesEndRef,
    botSettings,
    welcomeMessage,
    currentStreamedMessage,
  }
}