'use client'

import { useState, useRef, useCallback, RefObject, useEffect } from 'react'
import { Message, ChatMode } from '../types'
import { LunaryClient } from '@/lib/lunary-client'
import { v4 as uuidv4 } from 'uuid'

// VERSION-MARKER: Eindeutiger Debug-Code - Version 007
console.log("useChat.ts geladen - Debug-Version 007 (Streaming)");

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
    
    // Existierende Implementierung...
    
    // Setze den Streaming-Status
    setIsStreaming(true);
    
    // Bereite Streaming-Buffer vor
    let streamingContent = '';
    
    try {
      console.log("useChat-DEBUG: Streaming-Anfrage wird gesendet");
      
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          messages: messages,
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
      
      // Event Source wird verwendet, um den Stream zu lesen
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Kein Stream-Reader verfügbar");
      }
      
      const decoder = new TextDecoder();
      
      // Lese den Stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("useChat-DEBUG: Stream beendet");
          break;
        }
        
        // Decodiere den Chunk
        const chunk = decoder.decode(value, { stream: true });
        console.log("useChat-DEBUG: Chunk empfangen:", chunk.substring(0, 50) + (chunk.length > 50 ? "..." : ""));
        
        // Verarbeite SSE Events
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            // Prüfe, ob es sich um ein Fehler-Event handelt
            if (line.startsWith('event: error')) {
              const errorData = line.replace('event: error\ndata: ', '');
              console.error("useChat-DEBUG: Fehler-Event empfangen:", errorData);
              throw new Error(`Streaming-Fehler: ${errorData}`);
            }
            
            // Normales Daten-Event verarbeiten
            if (line.startsWith('data:')) {
              const eventData = line.replace('data: ', '');
              console.log("useChat-DEBUG: Daten empfangen, Länge:", eventData.length);
              
              // Aktualisiere den Streaming-Buffer
              streamingContent += eventData;
              setStreamingBuffer(streamingContent);
              updateLastMessage(streamingContent);
            }
          } catch (parseError) {
            console.error("useChat-DEBUG: Fehler beim Parsen des Chunks:", parseError);
          }
        }
      }
      
      console.log("useChat-DEBUG: Streaming abgeschlossen");
      
    } catch (error) {
      console.error("useChat-DEBUG: Fehler beim Streaming:", error);
      setError(error instanceof Error ? error.message : 'Verbindungsfehler. Fehler beim Streaming der Antwort');
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
      setStreamingBuffer('');
    }
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

  // Füge eine sendMessage-Funktion hinzu, die sendMessageWithStreaming aufruft
  const sendMessage = async (content: string): Promise<void> => {
    console.log("useChat-DEBUG: sendMessage aufgerufen, ruft sendMessageWithStreaming auf");
    
    if (!content || content.trim() === '') {
      return;
    }
    
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
      
      // Streaming-Anfrage senden
      await sendMessageWithStreaming(content);
      
    } catch (err) {
      console.error("useChat-DEBUG: Fehler beim Senden der Nachricht:", err);
      setError(err instanceof Error ? err.message : 'Beim Senden der Nachricht ist ein Fehler aufgetreten.');
    } finally {
      setInput('');
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