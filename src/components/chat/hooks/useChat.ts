'use client'

import { useState, useRef, useCallback, RefObject, useEffect } from 'react'
import { Message, ChatMode } from '../types'
import { LunaryClient } from '@/lib/lunary-client'
import { v4 as uuidv4 } from 'uuid'

// VERSION-MARKER: Eindeutiger Debug-Code - Version 007
console.log("useChat.ts geladen - Debug-Version 007 (Streaming)");

// VERSION-MARKER: useChat-Debug-Code - Version 008
console.log("useChat.ts geladen - Debug-Version 008 (Verbesserte Nachrichtenverarbeitung)");

// Hilfsfunktionen für Markdown-Formatierung
const ensureCompleteMarkdown = (text: string): string => {
  // Prüfe auf unvollständige Codeblöcke
  const codeBlockCount = (text.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    return text + "\n```"; // Schließe unvollständige Codeblöcke
  }
  
  // Prüfe auf unvollständige fette/kursive Formatierung
  const boldCount = (text.match(/\*\*/g) || []).length;
  if (boldCount % 2 !== 0) {
    return text + "**"; // Schließe unvollständige Fettschrift
  }
  
  const italicCount = (text.match(/\*/g) || []).length - boldCount;
  if (italicCount % 2 !== 0) {
    return text + "*"; // Schließe unvollständige Kursivschrift
  }
  
  return text;
}

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
  const [streamingBuffer, setStreamingBuffer] = useState<string>('') // Buffer für Streaming
  const [isStreaming, setIsStreaming] = useState<boolean>(false) // Streaming-Status
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [mode, setMode] = useState<ChatMode>(initialMode)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const sessionIdRef = useRef<string>(uuidv4()) // Eindeutige Sitzungs-ID für Tracking
  const [botSettings, setBotSettings] = useState<any>(null);

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
  }, [messages, streamingBuffer])

  // Nachricht zur Liste hinzufügen
  const addMessage = useCallback((message: Message) => {
    console.log("DEBUG-007: addMessage aufgerufen", message);
    
    // Überprüfen, ob die Nachricht bereits existiert (um Duplikate zu vermeiden)
    setMessages((prevMessages) => {
      const isDuplicate = prevMessages.some(
        (m) => m.role === message.role && m.content === message.content
      )
      
      if (isDuplicate) {
        console.log("DEBUG-007: Duplikat gefunden, Nachricht wird nicht hinzugefügt");
        return prevMessages
      }
      
      return [...prevMessages, message]
    })
  }, [])
  
  // Aktualisiere die letzte Nachricht (für Streaming-Updates)
  const updateLastMessage = useCallback((content: string) => {
    setMessages((prevMessages) => {
      if (prevMessages.length === 0) return prevMessages;
      
      const newMessages = [...prevMessages];
      const lastMessageIndex = newMessages.length - 1;
      
      // Nur aktualisieren, wenn die letzte Nachricht vom Assistenten ist
      if (newMessages[lastMessageIndex].role === 'assistant') {
        newMessages[lastMessageIndex] = {
          ...newMessages[lastMessageIndex],
          content
        };
      }
      
      return newMessages;
    });
  }, []);

  // Verbessere die sendMessage Funktion, um Fehler beim Streaming zu behandeln

  // Verbessere die Fehlerbehandlung beim Streaming
  const sendMessageWithStreaming = async (content: string): Promise<void> => {
    if (!content.trim()) {
      console.warn("useChat-DEBUG: Leere Nachricht wurde nicht gesendet");
      return;
    }

    console.log("useChat-DEBUG: Bereite Nachricht vor:", content.substring(0, 30) + (content.length > 30 ? "..." : ""));

    // Zuerst zur Liste hinzufügen
    const userMessage: Message = {
      role: 'user',
      content: content
    };

    // Aktualisiere den UI-Zustand mit der Nachricht vom Benutzer
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Setze Chat-Zustand
    setIsOpen(true);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingBuffer("");
    let error = false;

    try {
      // Bereite den API-Request-Body vor
      const requestBody = {
        message: content,
        messages: updatedMessages,
        botId: botId
      };

      // Konfiguriere die Stream-Anfrage für die API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      // Prüfe auf HTTP-Fehler
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `HTTP-Fehler: ${response.status}`;
        } catch (err) {
          errorMessage = `HTTP-Fehler: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Stream konnte nicht gelesen werden");
      }

      // Puffer für unvollständige Daten
      let buffer = '';
      let streamContent = '';
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("useChat-DEBUG: Stream beendet");
          break;
        }

        // Decodiere den Chunk und füge ihn zum Puffer hinzu
        const chunk = new TextDecoder().decode(value);
        buffer += chunk;

        console.log(`useChat-DEBUG: Stream-Chunk empfangen, Länge: ${chunk.length}`);
        
        // Verarbeite alle vollständigen Zeilen im Puffer
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          // Extrahiere eine Zeile
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.length === 0) continue;

          // Verarbeite Server-Sent Events (SSE)
          if (line.startsWith('data:')) {
            try {
              const data = line.slice(5).trim();
              
              // Ignoriere Heartbeat-Nachrichten
              if (data === ':heartbeat') {
                console.log("useChat-DEBUG: Heartbeat empfangen");
                continue;
              }
              
              // Versuche JSON zu parsen
              try {
                const jsonData = JSON.parse(data);
                console.log("useChat-DEBUG: JSON-Daten empfangen:", jsonData.event || "unbekanntes Event");
                
                // Ignoriere bestimmte Metadaten-Events
                if (jsonData.event === "sourceDocuments" || 
                    jsonData.event === "metadata" || 
                    jsonData.event === "end") {
                  console.log(`useChat-DEBUG: Event "${jsonData.event}" ignoriert`);
                  continue;
                }
                
                // Extrahiere den tatsächlichen Inhalt
                let tokenContent = null;
                
                if (jsonData.event === "token" && jsonData.data) {
                  tokenContent = jsonData.data;
                } 
                else if (jsonData.data && typeof jsonData.data === 'string') {
                  tokenContent = jsonData.data;
                }
                else if (jsonData.message && typeof jsonData.message === 'string') {
                  tokenContent = jsonData.message;
                }
                else if (jsonData.content && typeof jsonData.content === 'string') {
                  tokenContent = jsonData.content;
                }
                else if (jsonData.text && typeof jsonData.text === 'string') {
                  tokenContent = jsonData.text;
                }
                
                if (tokenContent) {
                  // Entferne HTML-Tags am Anfang der Nachricht (nur beim ersten Chunk)
                  if (isFirstChunk && tokenContent.match(/^<[^>]*>/)) {
                    tokenContent = tokenContent.replace(/^<[^>]*>(<[^>]*>)*/g, '');
                    console.log("useChat-DEBUG: HTML-Tags am Anfang entfernt");
                  }
                  
                  isFirstChunk = false;
                  streamContent += tokenContent;
                  setStreamingBuffer(streamContent);
                  
                  // Aktualisiere die letzte Nachricht mit dem aktuellen Streaming-Inhalt
                  updateLastMessage(streamContent);
                  
                  // Setze Loading nur beim ersten tatsächlichen Inhalt auf false
                  if (isLoading && streamContent.trim().length > 0) {
                    console.log("useChat-DEBUG: Lade-Zustand beendet, Inhalte werden gestreamt");
                    setIsLoading(false);
                  }
                }
              } catch (jsonError) {
                // Wenn es kein JSON ist, behandle es als reinen Text
                console.log("useChat-DEBUG: Textdaten empfangen:", 
                  data.length > 30 ? data.substring(0, 30) + "..." : data);
                
                // Entferne HTML-Tags am Anfang der Nachricht (nur beim ersten Chunk)
                let textContent = data;
                if (isFirstChunk && textContent.match(/^<[^>]*>/)) {
                  textContent = textContent.replace(/^<[^>]*>(<[^>]*>)*/g, '');
                  console.log("useChat-DEBUG: HTML-Tags am Anfang von Text entfernt");
                }
                
                isFirstChunk = false;
                streamContent += textContent;
                setStreamingBuffer(streamContent);
                updateLastMessage(streamContent);
                
                // Setze Loading nur beim ersten tatsächlichen Inhalt auf false
                if (isLoading && streamContent.trim().length > 0) {
                  console.log("useChat-DEBUG: Lade-Zustand beendet, Inhalte werden gestreamt");
                  setIsLoading(false);
                }
              }
            } catch (err) {
              console.error("useChat-DEBUG: Fehler bei der Verarbeitung von SSE:", err);
            }
          }
        }
      }

      // Nachdem der Stream abgeschlossen ist, stelle sicher dass die Nachrichtenliste aktuell ist
      // Dies wird bereits durch updateLastMessage erledigt, keine weitere Aktion notwendig
    } catch (err) {
      console.error("useChat-DEBUG: Fehler beim Streaming:", err);
      error = true;
      
      // Sende einen Fehler an den onError-Handler, falls vorhanden
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
      
      // Füge Fehlermeldung zu den Nachrichten hinzu
      const errorMessage: Message = {
        role: 'assistant',
        content: `Es ist ein Fehler aufgetreten: ${err instanceof Error ? err.message : String(err)}`
      };
      
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingBuffer('');
    }
    
    return;
  };

  // Fallback-Methode für Nicht-Streaming (für Abwärtskompatibilität)
  const sendMessageWithoutStreaming = useCallback(async (content: string) => {
    console.log('Sending message without streaming:', content)
    
    if (!content || content.trim() === '') {
      return
    }
    
    try {
      // Anfang des Ladevorgangs
      setIsLoading(true)
      setError(null)
      
      // Benutzer-Nachricht hinzufügen
      const userMessage: Message = { role: 'user', content }
      addMessage(userMessage)
      
      // Abbrechen wenn schon eine Anfrage läuft
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Neue AbortController-Instanz erstellen
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal
      
      // Tracking für gesendete Nachricht
      LunaryClient.track({
        eventName: 'message_sent',
        properties: { 
          content: content.slice(0, 100), // Ersten 100 Zeichen der Nachricht
          botId 
        },
        metadata: { sessionId: sessionIdRef.current }
      })
      
      // Sende Anfrage an API
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
      })
      
      if (!response.ok) {
        throw new Error(
          `Fehler beim Senden der Nachricht: ${response.status} ${response.statusText}`
        )
      }
      
      const data = await response.json()
      
      // Füge Bot-Antwort hinzu
      let botContent = ''
      
      if (data.text) {
        botContent = data.text
      } else if (data.response) {
        botContent = data.response
      } else if (data.content) {
        botContent = data.content
      } else if (data.assistant) {
        botContent = data.assistant
      } else if (data.message) {
        botContent = data.message
      } else {
        botContent = 'Entschuldigung, ich konnte keine Antwort generieren.'
      }
      
      const botMessage: Message = { role: 'assistant', content: botContent }
      addMessage(botMessage)

      // Tracking für empfangene Antwort
      LunaryClient.track({
        eventName: 'message_received',
        properties: { 
          content: botContent.slice(0, 100), // Ersten 100 Zeichen der Antwort
          botId,
          responseTime: Date.now() - performance.now() // Ungefähre Antwortzeit
        },
        metadata: { sessionId: sessionIdRef.current }
      })

    } catch (err) {
      // Prüfe, ob es sich um einen Abbruch handelt
      if ((err as Error).name === 'AbortError') {
        console.log('Anfrage wurde abgebrochen')
        return
      }
      
      console.error('Fehler beim Senden der Nachricht:', err)
      setError('Beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.')
      
      // Tracking für Fehler
      LunaryClient.track({
        eventName: 'message_error',
        properties: { 
          error: err instanceof Error ? err.message : 'Unbekannter Fehler',
          botId 
        },
        metadata: { sessionId: sessionIdRef.current }
      })
      
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
      setInput('')
    }
  }, [messages, addMessage, botId])

  // Laufende Anfrage abbrechen
  const cancelMessage = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    setIsLoading(false)
    setIsStreaming(false)
  }, [])

  // Bot-Einstellungen beim ersten Laden abrufen
  useEffect(() => {
    if (botId) {
      const fetchBotSettings = async () => {
        try {
          const res = await fetch(`/api/bots/${botId}`);
          if (res.ok) {
            const botData = await res.json();
            console.log("CHAT-DEBUG-007: Geladene Bot-Daten:", {
              id: botData.id,
              name: botData.name,
              welcomeMessage: botData.welcomeMessage
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
              
              // Bot-spezifische CSS-Variablen setzen
              document.documentElement.style.setProperty('--bot-bg-color', botData.settings.botBgColor || 'rgba(248, 250, 252, 0.8)');
              document.documentElement.style.setProperty('--bot-text-color', botData.settings.botTextColor || '#1e293b');
              document.documentElement.style.setProperty('--bot-accent-color', botData.settings.botAccentColor || '#3b82f6');
              document.documentElement.style.setProperty('--user-bg-color', botData.settings.userBgColor || 'linear-gradient(135deg, #3b82f6, #2563eb)');
              document.documentElement.style.setProperty('--user-text-color', botData.settings.userTextColor || '#ffffff');
            }
            
            // Willkommensnachricht hinzufügen, wenn eine vorhanden ist
            if (botData.welcomeMessage && messages.length === 0) {
              addMessage({
                role: 'assistant',
                content: botData.welcomeMessage
              });
              
              console.log("CHAT-DEBUG-007: Willkommensnachricht hinzugefügt:", botData.welcomeMessage);
            }
          }
        } catch (error) {
          console.error("CHAT-DEBUG-007: Fehler beim Laden der Bot-Einstellungen:", error);
        }
      };
      
      fetchBotSettings();
    }
  }, [botId, addMessage, messages.length]);
  
  // Clean up EventSource beim Unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Modifiziere die sendMessage-Funktion, um den content direkt an sendMessageWithStreaming zu übergeben
  const sendMessage = async (content: string): Promise<void> => {
    console.log("useChat-DEBUG: sendMessage aufgerufen mit:", content);
    
    if (!content || content.trim() === '') {
      return;
    }
    
    try {
      // Anfang des Ladevorgangs
      setIsStreaming(true);
      setIsLoading(true);
      setError(null);
      
      // Benutzer-Nachricht hinzufügen
      const userMessage: Message = { role: 'user', content };
      addMessage(userMessage);
      
      // Abbrechen wenn schon eine Anfrage läuft
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Tracking für gesendete Nachricht
      LunaryClient.track({
        eventName: 'message_sent',
        properties: { 
          content: content.slice(0, 100), // Ersten 100 Zeichen der Nachricht
          botId,
          streaming: true
        },
        metadata: { sessionId: sessionIdRef.current }
      });
      
      // Leere Assistenten-Nachricht hinzufügen, die später aktualisiert wird
      const assistantMessage: Message = { role: 'assistant', content: '' };
      addMessage(assistantMessage);
      
      // Aktualisierte Nachrichten für den Stream-Request
      const currentMessages = [...messages, userMessage];
      
      console.log("useChat-DEBUG: Aktualisierte Nachrichten für Stream-Request:", 
        currentMessages.map(m => `${m.role}: ${m.content.substring(0, 30)}...`));
      
      // Stelle sicher, dass der Benutzer-Content direkt an die API gesendet wird
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content, // Direkt den content als message senden
          messages: currentMessages, // Die aktualisierten Nachrichten inkl. Benutzernachricht
          botId
        })
      });
      
      if (!response.ok) {
        console.error("useChat-DEBUG: Fehler bei der Streaming-Anfrage:", response.status);
        let errorText = "Verbindungsfehler";
        try {
          errorText = await response.text();
        } catch (e) {
          console.error("useChat-DEBUG: Fehler beim Lesen des Fehlertexts:", e);
        }
        throw new Error(`Fehler bei der Streaming-Anfrage: ${response.status} - ${errorText}`);
      }
      
      console.log("useChat-DEBUG: Streaming-Antwort empfangen, Reader wird initialisiert");
      
      // Stream-Verarbeitung hier, statt separater Funktion
      // Diese ersetzte den Aufruf von sendMessageWithStreaming
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Kein Stream-Reader verfügbar");
      }
      
      const decoder = new TextDecoder();
      let streamingContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("useChat-DEBUG: Stream beendet");
          break;
        }
        
        // Decodiere den Chunk
        const chunk = decoder.decode(value, { stream: true });
        console.log("useChat-DEBUG: Chunk empfangen (Länge):", chunk.length);

        // KRITISCHE DEBUG-AUSGABE
        if (chunk.length > 0) {
          console.log("useChat-CRITICAL: Chunk-Inhalt:", chunk);
        }

        // Teile den Text in einzelne Server-Sent Events
        const events = chunk.split('\n\n');
        
        for (const event of events) {
          if (!event.trim()) continue;
          
          try {
            console.log("useChat-DEBUG: Event verarbeiten:", event);
            
            // Extrahiere ALLES nach "data:" als gültigen Inhalt
            if (event.includes('data:')) {
              try {
                const dataMatch = event.match(/data:(.*)/m);
                if (dataMatch && dataMatch[1]) {
                  const rawData = dataMatch[1].trim();
                  
                  // VEREINFACHTE VERARBEITUNG: Versuche JSON zu parsen
                  try {
                    const jsonData = JSON.parse(rawData);
                    console.log("useChat-DEBUG: Gültiges JSON gefunden:", JSON.stringify(jsonData).slice(0, 100));
                    
                    // Ignoriere sourceDocuments, metadata und end Events
                    if (jsonData.event === "sourceDocuments" || 
                        jsonData.event === "metadata" || 
                        jsonData.event === "end") {
                      console.log("useChat-DEBUG: Ignoriere Event vom Typ:", jsonData.event);
                      // Diese Events nicht zum Stream-Content hinzufügen
                      continue;
                    }
                    
                    // Extrahiere jeglichen Inhalt, der gefunden werden kann
                    let actualContent = null;
                    
                    // Prüfe in dieser Reihenfolge auf mögliche Inhalte
                    if (jsonData.event === "token" && jsonData.data) {
                      actualContent = jsonData.data;
                      console.log("useChat-DEBUG: Token-Event-Daten gefunden:", actualContent.slice(0, 30));
                    } 
                    else if (jsonData.data && typeof jsonData.data === 'string') {
                      actualContent = jsonData.data;
                      console.log("useChat-DEBUG: Allgemeine Daten gefunden:", actualContent.slice(0, 30));
                    }
                    else if (jsonData.message && typeof jsonData.message === 'string') {
                      actualContent = jsonData.message;
                      console.log("useChat-DEBUG: Message-Feld gefunden:", actualContent.slice(0, 30));
                    }
                    else if (jsonData.content && typeof jsonData.content === 'string') {
                      actualContent = jsonData.content;
                      console.log("useChat-DEBUG: Content-Feld gefunden:", actualContent.slice(0, 30));
                    }
                    else if (jsonData.text && typeof jsonData.text === 'string') {
                      actualContent = jsonData.text;
                      console.log("useChat-DEBUG: Text-Feld gefunden:", actualContent.slice(0, 30));
                    }
                    else if (typeof jsonData === 'string') {
                      actualContent = jsonData;
                      console.log("useChat-DEBUG: String-JSON gefunden:", actualContent.slice(0, 30));
                    }
                    
                    // Wenn Inhalt gefunden wurde, füge ihn zur Nachricht hinzu
                    if (actualContent !== null && actualContent.trim() !== "") {
                      // Erste echte Nachricht erhalten, im Streaming-Modus bleiben aber isLoading deaktivieren
                      setIsLoading(false);
                      
                      streamingContent += actualContent;
                      console.log("useChat-DEBUG: Aktualisierter streamingContent:", streamingContent.slice(0, 50));
                      setStreamingBuffer(streamingContent);
                      updateLastMessage(streamingContent);
                    } else {
                      console.log("useChat-DEBUG: Kein verwertbarer Inhalt in JSON gefunden:", JSON.stringify(jsonData).slice(0, 100));
                    }
                  } catch (jsonError) {
                    // Kein JSON, verwende den Rohtext
                    console.log("useChat-DEBUG: Kein JSON, verwende Rohtext:", rawData.slice(0, 50));
                    
                    // Wenn es mit "<p>" beginnt, ist es wahrscheinlich HTML-Inhalt
                    if (rawData.startsWith("<p>") || rawData.includes("<p>")) {
                      streamingContent += rawData;
                      setStreamingBuffer(streamingContent);
                      updateLastMessage(streamingContent);
                    }
                    // Ansonsten, wenn es nicht leer ist, als Text hinzufügen
                    else if (rawData.trim() !== "") {
                      streamingContent += rawData;
                      setStreamingBuffer(streamingContent);
                      updateLastMessage(streamingContent);
                    }
                  }
                } else {
                  console.log("useChat-DEBUG: Kein Data-Match gefunden in:", event);
                }
              } catch (e) {
                console.error("useChat-DEBUG: Fehler bei Event-Verarbeitung:", e);
              }
            } else {
              console.log("useChat-DEBUG: Kein data: gefunden in:", event);
            }
          } catch (parseError) {
            console.error("useChat-DEBUG: Fehler beim Parsen des Events:", parseError);
          }
        }
      }
    } catch (err) {
      console.error("useChat-DEBUG: Fehler beim Senden der Nachricht:", err);
      
      // Füge eine Fehlernachricht als Assistenten-Antwort hinzu
      setMessages((prevMessages) => {
        // Finde den letzten Eintrag und prüfe, ob er vom Assistenten ist und leer
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && (!lastMessage.content || lastMessage.content.trim() === '')) {
          // Ersetze die leere Nachricht durch eine Fehlermeldung
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: 'Entschuldigung, ich konnte keine Antwort generieren. Bitte versuchen Sie es später noch einmal.'
          };
          return newMessages;
        }
        return prevMessages;
      });
      
      setError(err instanceof Error ? err.message : 'Beim Senden der Nachricht ist ein Fehler aufgetreten.');
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
      setStreamingBuffer('');
      setInput('');
      
      // Prüfe, ob die letzte Nachricht leer ist und füge einen Fallback ein
      setMessages((prevMessages) => {
        // Finde den letzten Eintrag und prüfe, ob er vom Assistenten ist und leer
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && (!lastMessage.content || lastMessage.content.trim() === '')) {
          // Ersetze die leere Nachricht durch einen Fallback
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: '<p>Ich konnte leider keine Antwort generieren. Bitte versuchen Sie es später noch einmal.</p>'
          };
          return newMessages;
        }
        return prevMessages;
      });
    }
  };

  return {
    messages,
    isLoading,
    isStreaming,
    streamingBuffer,
    error,
    isOpen,
    mode,
    input,
    setInput,
    messagesEndRef,
    toggleChat,
    cycleMode,
    setCurrentMode,
    addMessage,
    sendMessage, // Exportiere die neue sendMessage-Funktion
    sendMessageWithStreaming,
    sendMessageWithoutStreaming,
    cancelMessage,
    botSettings,
    setMode
  }
} 