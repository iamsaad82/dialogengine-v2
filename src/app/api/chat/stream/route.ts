import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { BotSettings } from '@/types/bot'

const FLOWISE_URL = process.env.NEXT_PUBLIC_FLOWISE_URL || 'http://localhost:3000'
const DEFAULT_FLOWISE_CHATFLOW_ID = process.env.FLOWISE_CHATFLOW_ID
const FLOWISE_API_KEY = process.env.FLOWISE_API_KEY

// API DEBUG VERSION
console.log("CHAT-STREAM-API: API Route geladen");
console.log("CHAT-STREAM-API: FLOWISE_URL:", FLOWISE_URL);
console.log("CHAT-STREAM-API: DEFAULT_FLOWISE_CHATFLOW_ID:", DEFAULT_FLOWISE_CHATFLOW_ID ? "vorhanden" : "FEHLT");

// Definiere die Typen für Nachrichten
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Definiere die Typen für Flowise-spezifische Nachrichten
interface FlowiseMessage {
  role: 'apiMessage' | 'userMessage';
  content: string;
}

// Definiere den Typ für die Flowise-Anfrage
interface FlowiseRequestBody {
  question: string;
  history?: FlowiseMessage[];
  streaming: boolean;
  overrideConfig?: {
    botPersonality?: string;
    botContext?: string;
    botScope?: string;
    offerTip?: string;
    closedDays?: string;
    [key: string]: any;
  };
}

// Erweitere BotSettings für die API
interface BotSettingsWithPrompt {
  // Standard BotSettings Felder
  primaryColor: string;
  botBgColor: string;
  botTextColor: string;
  botAccentColor: string;
  userBgColor?: string;
  userTextColor: string;
  enableFeedback: boolean;
  enableAnalytics: boolean;
  showSuggestions: boolean;
  showCopyButton: boolean;
  
  // Erweiterte Felder für Prompt-Anpassungen
  botPersonality?: string;
  botContext?: string;
  botScope?: string;
  offerTip?: string;
  closedDays?: string;
}

// FALLBACK-ANTWORTEN für den Fall, dass die API nicht erreichbar ist
const FALLBACK_RESPONSES = [
  "Entschuldigung, ich kann im Moment leider nicht auf Ihre Anfrage antworten. Bitte versuchen Sie es später noch einmal.",
  "Es tut mir leid, aber ich habe momentan Probleme, eine Antwort zu generieren. Bitte versuchen Sie es später erneut.",
  "Leider kann ich Ihre Anfrage derzeit nicht bearbeiten. Bitte versuchen Sie es später noch einmal."
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log("CHAT-STREAM-API: Request-Body:", JSON.stringify(body));
  
  try {
    // Verbessere das Erkennen der letzten Benutzernachricht 
    // Extrahiere die letzte Benutzernachricht für die Weiterverarbeitung
    let userQuestion = "";
    if (body.messages && body.messages.length > 0) {
      // Wenn ein Nachrichtenverlauf vorhanden ist
      const lastUserMessage = [...body.messages].find(m => m.role === 'user');
      
      // Falls keine Benutzernachricht im Verlauf ist, prüfe direkt die message
      if (lastUserMessage) {
        userQuestion = lastUserMessage.content;
        console.log("CHAT-STREAM-API: Benutzernachricht aus Verlauf gefunden:", userQuestion);
      } else if (body.message) {
        userQuestion = body.message;
        console.log("CHAT-STREAM-API: Benutzernachricht aus message-Feld verwendet:", userQuestion);
      }
    } else if (body.message) {
      userQuestion = body.message;
      console.log("CHAT-STREAM-API: Benutzernachricht aus direktem message-Feld:", userQuestion);
    }

    // Behandle sowohl einzelne Nachrichten als auch Nachrichtenverläufe
    const message = body.message;
    const messages: Message[] = body.messages;

    if (!message && (!messages || messages.length === 0)) {
      console.error("CHAT-STREAM-API: Keine Nachricht gefunden");
      
      // FALLBACK: Sende eine freundliche Fehlermeldung zurück
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`event: error\ndata: Keine Nachricht gefunden\n\n`));
          controller.close();
        }
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // Ermittle die zu verwendende Flowise-Chatflow-ID
    let flowiseId = DEFAULT_FLOWISE_CHATFLOW_ID;
    let bot = null;
    let botSettings: BotSettingsWithPrompt | null = null;
    
    if (body.botId) {
      try {
        bot = await prisma.bot.findUnique({
          where: { id: body.botId },
          include: { settings: true }
        });
        
        if (bot) {
          flowiseId = bot.flowiseId;
          botSettings = bot.settings as BotSettingsWithPrompt;
          console.log(`CHAT-STREAM-API: Verwende Chatflow-ID von Bot "${bot.name}": ${flowiseId}`);
        } else {
          console.warn(`CHAT-STREAM-API: Bot mit ID ${body.botId} nicht gefunden, verwende Standard-Chatflow`);
        }
      } catch (dbError) {
        console.error("CHAT-STREAM-API: Datenbankfehler bei Bot-Abfrage:", dbError);
      }
    } else {
      // Wenn keine botId angegeben ist, aber ein aktiver Standard-Bot existiert
      try {
        bot = await prisma.bot.findFirst({
          where: { active: true },
          include: { settings: true },
          orderBy: { createdAt: 'asc' }
        });
        
        if (bot) {
          flowiseId = bot.flowiseId;
          botSettings = bot.settings as BotSettingsWithPrompt;
          console.log(`CHAT-STREAM-API: Verwende Chatflow-ID vom Standard-Bot "${bot.name}": ${flowiseId}`);
        }
      } catch (dbError) {
        console.error("CHAT-STREAM-API: Datenbankfehler bei Standard-Bot-Abfrage:", dbError);
      }
    }

    // Prüfe ob eine Chatflow-ID verfügbar ist
    if (!flowiseId) {
      console.error("CHAT-STREAM-API: Keine Flowise-Chatflow-ID verfügbar");
      
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`event: error\ndata: Keine Flowise-Chatflow-ID verfügbar\n\n`));
          controller.close();
        }
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    const apiUrl = `${FLOWISE_URL}/api/v1/prediction/${flowiseId}`;
    console.log("CHAT-STREAM-API: Flowise API URL:", apiUrl);
    
    // Verbessere die requestBody-Struktur für die Message-Verarbeitung
    let requestBody: FlowiseRequestBody;

    if (messages && messages.length > 0) {
      // Wenn wir keinen lastUserMessage gefunden haben, verwenden wir die direkte Message
      if (!userQuestion && message) {
        console.log("CHAT-STREAM-API: Verwende direktes message-Feld:", message);
        userQuestion = message;
      }

      if (!userQuestion) {
        console.error("CHAT-STREAM-API: Keine Benutzernachricht gefunden");
        
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`event: error\ndata: Keine Benutzernachricht gefunden\n\n`));
            controller.close();
          }
        });
        
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      }
      
      // Erstelle die History ohne die letzte Benutzernachricht
      const history: FlowiseMessage[] = messages
        .filter((m: Message) => m.role === 'assistant') // Nehme nur Assistentennachrichten für History
        .map((m: Message) => ({
          role: 'apiMessage',
          content: m.content
        }));
        
      console.log("CHAT-STREAM-API: Nachrichtenverlauf mit", history.length, "Assistentennachrichten");
      
      // Verwende die gefundene userQuestion
      requestBody = { 
        question: userQuestion,
        history: history.length > 0 ? history : undefined,
        streaming: true // Aktiviere Streaming für Flowise
      };
        
      // Wenn Bot-Einstellungen verfügbar sind, füge overrideConfig hinzu
      if (botSettings) {
        requestBody.overrideConfig = {
          botPersonality: botSettings.botPersonality || "Du bist ein hilfreicher Assistent",
          botContext: botSettings.botContext || "Online-Dienst",
          botScope: botSettings.botScope || "alle Informationen",
          offerTip: botSettings.offerTip || "",
          closedDays: botSettings.closedDays || ""
        };
        
        console.log("CHAT-STREAM-API: overrideConfig hinzugefügt");
      }
    } else {
      // Einzelne Nachricht verwenden
      requestBody = { 
        question: message, 
        streaming: true  // Aktiviere Streaming für Flowise
      };
      
      // Wenn Bot-Einstellungen verfügbar sind, füge overrideConfig hinzu
      if (botSettings) {
        requestBody.overrideConfig = {
          botPersonality: botSettings.botPersonality || "Du bist ein hilfreicher Assistent",
          botContext: botSettings.botContext || "Online-Dienst",
          botScope: botSettings.botScope || "alle Informationen",
          offerTip: botSettings.offerTip || "",
          closedDays: botSettings.closedDays || ""
        };
        
        console.log("CHAT-STREAM-API: overrideConfig hinzugefügt:", JSON.stringify(requestBody.overrideConfig));
      }
      console.log("CHAT-STREAM-API: Einzelnachricht wird verwendet:", message);
    }
    
    console.log("CHAT-STREAM-API: Flowise API Anfrage:", apiUrl);
    console.log("CHAT-STREAM-API: Request Body:", JSON.stringify(requestBody));
    
    // Verbessere die Fetch-Optionen
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': FLOWISE_API_KEY ? `Bearer ${FLOWISE_API_KEY}` : '',
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    // Fetch mit Streaming und verbessertem Error-Handling
    console.log("CHAT-STREAM-API: Sende Anfrage an Flowise API...");
    const flowiseResponse = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      cache: 'no-store',
      keepalive: true
    });
    
    console.log("CHAT-STREAM-API: Flowise API Antwort erhalten, Status:", flowiseResponse.status);
    
    // Überprüfe den Status und protokolliere Headers
    console.log("CHAT-STREAM-API: Response Headers:", 
      [...flowiseResponse.headers.entries()].map(entry => `${entry[0]}: ${entry[1]}`).join(", ")
    );
    
    if (!flowiseResponse.ok) {
      // Versuche, den Fehlertext zu lesen
      let errorText = "Kein Fehlertext verfügbar";
      try {
        errorText = await flowiseResponse.text();
      } catch (e) {
        console.error("CHAT-STREAM-API: Fehler beim Lesen des Fehlertexts:", e);
      }
      
      console.error(`CHAT-STREAM-API: Fehler von Flowise API: ${flowiseResponse.status} - ${errorText}`);
      
      // Sende Fehlerereignis
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`event: error\ndata: API-Fehler ${flowiseResponse.status}: ${errorText}\n\n`));
          controller.close();
        }
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }
    
    // Direkte Weiterleitung des Flowise-Streams
    const reader = flowiseResponse.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Verbessere die Stream-Transformation, um sicherzustellen, dass die Token korrekt weitergegeben werden
    const transformStream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          console.error("CHAT-STREAM-API: Kein Stream-Reader verfügbar");
          controller.enqueue(encoder.encode("event: error\ndata: Kein Stream-Reader verfügbar\n\n"));
          controller.close();
          return;
        }
        
        try {
          console.log("CHAT-STREAM-API: Stream-Lesevorgang gestartet");
          let messageBuffer = '';
          let messageCount = 0;
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log(`CHAT-STREAM-API: Stream beendet, insgesamt ${messageCount} Nachrichtenteile empfangen`);
              // Sende den letzten Buffer, falls noch etwas darin ist
              if (messageBuffer.trim()) {
                controller.enqueue(encoder.encode(`data: ${messageBuffer}\n\n`));
              }
              // Stream ist zu Ende, sende end-Event
              controller.enqueue(encoder.encode("event: end\ndata: {}\n\n"));
              controller.close();
              break;
            }
            
            // Decodiere den Stream und protokolliere den Chunk
            const chunk = decoder.decode(value, { stream: true });
            console.log("CHAT-STREAM-API: Neuer Chunk (erste 100 Zeichen):", 
              chunk.substring(0, 100) + (chunk.length > 100 ? "..." : ""));
            messageBuffer += chunk;
            messageCount++;
            
            if (messageCount % 10 === 0) {
              console.log(`CHAT-STREAM-API: ${messageCount} Nachrichtenteile empfangen`);
            }

            // Prüfe, ob der Chunk ein vollständiges SSE-Event enthält
            if (chunk.includes('data:')) {
              // Extrahiere die Daten und sende sie formatiert weiter
              const dataMatch = chunk.match(/data: (.*)/);
              if (dataMatch && dataMatch[1]) {
                const eventData = dataMatch[1].trim();
                console.log("CHAT-STREAM-API: Extrahierte Daten:", eventData.substring(0, 50) + (eventData.length > 50 ? "..." : ""));
                
                // Versuche die Daten als JSON zu parsen
                try {
                  const jsonData = JSON.parse(eventData);
                  // Wenn es sich um JSON-Daten handelt, extrahiere den tatsächlichen Inhalt
                  if (jsonData && typeof jsonData === 'object') {
                    let processedData = eventData;
                    
                    // Bekannte Flowise-Formate verarbeiten
                    if (jsonData.message) {
                      if (typeof jsonData.message === 'string') {
                        processedData = jsonData.message;
                        console.log("CHAT-STREAM-API: JSON 'message' Feld gefunden (String):", 
                          processedData.substring(0, 50) + (processedData.length > 50 ? "..." : ""));
                      } else if (jsonData.message && typeof jsonData.message === 'object') {
                        processedData = JSON.stringify(jsonData.message);
                        console.log("CHAT-STREAM-API: JSON 'message' Feld gefunden (Objekt):", 
                          processedData.substring(0, 50) + (processedData.length > 50 ? "..." : ""));
                      }
                    } else if (jsonData.text) {
                      processedData = jsonData.text;
                      console.log("CHAT-STREAM-API: JSON 'text' Feld gefunden:", 
                        processedData.substring(0, 50) + (processedData.length > 50 ? "..." : ""));
                    } else if (jsonData.content) {
                      processedData = jsonData.content;
                      console.log("CHAT-STREAM-API: JSON 'content' Feld gefunden:", 
                        processedData.substring(0, 50) + (processedData.length > 50 ? "..." : ""));
                    } else {
                      // Wenn keine bekannten Felder, aber ein JSON-Objekt, sende die rohen Daten
                      console.log("CHAT-STREAM-API: Unbekanntes JSON-Format (Objekt-Struktur):", 
                        Object.keys(jsonData).join(", "));
                    }
                    
                    // Überprüfe, ob processedData leer ist oder nur "message:" enthält
                    if (processedData.trim() === "message:" || processedData.trim() === "") {
                      console.log("CHAT-STREAM-API: Leere Nachricht erkannt, wird nicht gesendet");
                      continue; // Diesen Chunk überspringen
                    }
                    
                    // Sende den formatierten Inhalt zurück
                    controller.enqueue(encoder.encode(`data: ${processedData}\n\n`));
                  } else {
                    // Einfacher String oder unbekanntes Format
                    console.log("CHAT-STREAM-API: JSON als einfachen String erkannt:", 
                      eventData.substring(0, 50) + (eventData.length > 50 ? "..." : ""));
                    controller.enqueue(encoder.encode(`data: ${eventData}\n\n`));
                  }
                } catch (jsonError) {
                  // Kein valides JSON, sende die Rohdaten
                  console.log("CHAT-STREAM-API: Kein JSON-Format erkannt (Rohtext):", 
                    eventData.substring(0, 50) + (eventData.length > 50 ? "..." : ""));
                  controller.enqueue(encoder.encode(`data: ${eventData}\n\n`));
                }
              } else {
                // Wenn kein Data-Match gefunden wurde, senden wir den Chunk direkt
                controller.enqueue(value);
              }
            } else {
              // Sende den Chunk direkt weiter, wenn kein Data-Marker gefunden wurde
              controller.enqueue(value);
            }
          }
        } catch (error) {
          console.error("CHAT-STREAM-API: Fehler beim Lesen des Streams:", error);
          // Sende einen Fehler an den Client
          controller.enqueue(encoder.encode(`event: error\ndata: Fehler beim Lesen des Streams: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}\n\n`));
          controller.close();
        }
      },
      
      cancel() {
        console.log("CHAT-STREAM-API: Stream-Lesevorgang abgebrochen");
        reader?.cancel();
      }
    });
    
    // Rückgabe des transformierten Streams
    return new Response(transformStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
    
  } catch (error) {
    console.error('CHAT-STREAM-API: Allgemeiner Fehler:', error);
    
    // Sende Fehlerereignis
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}\n\n`));
        controller.close();
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  }
} 