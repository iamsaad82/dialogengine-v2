import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { BotSettings } from '@/types/bot'

const FLOWISE_URL = process.env.NEXT_PUBLIC_FLOWISE_URL || 'http://localhost:3000'
const DEFAULT_FLOWISE_CHATFLOW_ID = process.env.FLOWISE_CHATFLOW_ID
const FLOWISE_API_KEY = process.env.FLOWISE_API_KEY

// API DEBUG VERSION 004
console.log("CHAT-API-DEBUG-004: API Route geladen");
console.log("CHAT-API-DEBUG-004: FLOWISE_URL:", FLOWISE_URL);
console.log("CHAT-API-DEBUG-004: DEFAULT_FLOWISE_CHATFLOW_ID:", DEFAULT_FLOWISE_CHATFLOW_ID ? "vorhanden" : "FEHLT");

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
  "Leider kann ich Ihre Anfrage derzeit nicht bearbeiten. Bitte versuchen Sie es später noch einmal oder wenden Sie sich direkt an die Stadtverwaltung."
];

export async function POST(request: Request) {
  console.log("CHAT-API-DEBUG-004: POST-Anfrage erhalten");
  
  try {
    const body = await request.json()
    console.log("CHAT-API-DEBUG-004: Request-Body:", JSON.stringify(body));
    
    // Extrahiere die letzte Benutzernachricht für die Weiterverarbeitung
    let userQuestion = "";
    if (body.messages && body.messages.length > 0) {
      const lastUserMessage = [...body.messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        userQuestion = lastUserMessage.content;
      }
    } else if (body.message) {
      userQuestion = body.message;
    }

    // Behandle sowohl einzelne Nachrichten als auch Nachrichtenverläufe
    const message = body.message
    const messages: Message[] = body.messages
    // Wir ignorieren den streaming-Parameter und setzen immer streaming=false
    const streaming = false

    if (!message && (!messages || messages.length === 0)) {
      console.error("CHAT-API-DEBUG-004: Keine Nachricht gefunden");
      
      // FALLBACK: Sende eine freundliche Fehlermeldung zurück
      return NextResponse.json({
        text: "Entschuldigung, ich habe keine Frage erhalten. Wie kann ich Ihnen helfen?",
        error: "Keine Nachricht gefunden"
      });
    }

    // Ermittle die zu verwendende Flowise-Chatflow-ID
    // Wenn eine botId angegeben ist, verwende die Chatflow-ID dieses Bots
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
          console.log(`CHAT-API-DEBUG-004: Verwende Chatflow-ID von Bot "${bot.name}": ${flowiseId}`);
        } else {
          console.warn(`CHAT-API-DEBUG-004: Bot mit ID ${body.botId} nicht gefunden, verwende Standard-Chatflow`);
        }
      } catch (dbError) {
        console.error("CHAT-API-DEBUG-004: Datenbankfehler bei Bot-Abfrage:", dbError);
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
          console.log(`CHAT-API-DEBUG-004: Verwende Chatflow-ID vom Standard-Bot "${bot.name}": ${flowiseId}`);
        }
      } catch (dbError) {
        console.error("CHAT-API-DEBUG-004: Datenbankfehler bei Standard-Bot-Abfrage:", dbError);
      }
    }

    // Prüfe ob eine Chatflow-ID verfügbar ist
    if (!flowiseId) {
      console.error("CHAT-API-DEBUG-004: Keine Flowise-Chatflow-ID verfügbar");
      
      // FALLBACK: Sende eine Standardantwort zurück
      const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
      return NextResponse.json({
        text: FALLBACK_RESPONSES[randomIndex],
        error: "Keine Flowise-Chatflow-ID verfügbar"
      });
    }

    const apiUrl = `${FLOWISE_URL}/api/v1/prediction/${flowiseId}`
    console.log("CHAT-API-DEBUG-004: Flowise API URL:", apiUrl);
    
    // Verbesserte Anfrage-Struktur basierend auf der Flowise API-Dokumentation
    let requestBody: FlowiseRequestBody;
    
    if (messages && messages.length > 0) {
      // Extrahiere die letzte Benutzernachricht aus dem messages-Array
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      
      if (lastUserMessage) {
        console.log("CHAT-API-DEBUG-004: Letzte Benutzernachricht gefunden:", lastUserMessage.content);
        
        // Formatiere messages für Flowise API
        const history: FlowiseMessage[] = messages
          .filter((m: Message) => m !== lastUserMessage) // Alle Nachrichten außer der letzten Benutzernachricht
          .map((m: Message) => ({
            role: m.role === 'assistant' ? 'apiMessage' : 'userMessage', // Konvertiere in Flowise-Format
            content: m.content
          }));
          
        requestBody = { 
          question: lastUserMessage.content,
          history: history.length > 0 ? history : undefined,
          streaming: false 
        };
        
        // Wenn Bot-Einstellungen verfügbar sind, füge overrideConfig hinzu
        if (botSettings) {
          requestBody.overrideConfig = {
            botPersonality: botSettings.botPersonality || "",
            botContext: botSettings.botContext || "",
            botScope: botSettings.botScope || "",
            offerTip: botSettings.offerTip || "",
            closedDays: botSettings.closedDays || ""
          };
          
          console.log("CHAT-API-DEBUG-004: overrideConfig hinzugefügt:", JSON.stringify(requestBody.overrideConfig));
        }
        
        console.log("CHAT-API-DEBUG-004: Nachrichtenverlauf mit", history.length, "Einträgen");
      } else {
        console.error("CHAT-API-DEBUG-004: Keine Benutzernachricht im Verlauf gefunden");
        
        // FALLBACK: Sende eine Standardantwort zurück
        const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
        return NextResponse.json({
          text: FALLBACK_RESPONSES[randomIndex],
          error: "Keine Benutzernachricht im Verlauf gefunden"
        });
      }
    } else {
      // Einzelne Nachricht verwenden
      requestBody = { question: message, streaming: false };
      // Wenn Bot-Einstellungen verfügbar sind, füge overrideConfig hinzu
      if (botSettings) {
        requestBody.overrideConfig = {
          botPersonality: botSettings.botPersonality || "",
          botContext: botSettings.botContext || "",
          botScope: botSettings.botScope || "",
          offerTip: botSettings.offerTip || "",
          closedDays: botSettings.closedDays || ""
        };
        
        console.log("CHAT-API-DEBUG-004: overrideConfig hinzugefügt:", JSON.stringify(requestBody.overrideConfig));
      }
      console.log("CHAT-API-DEBUG-004: Einzelnachricht wird verwendet:", message);
    }
    
    console.log("CHAT-API-DEBUG-004: Flowise API Anfrage:", apiUrl);
    console.log("CHAT-API-DEBUG-004: Request Body:", JSON.stringify(requestBody));
    
    try {
      console.log("CHAT-API-DEBUG-004: Starte Fetch zu Flowise...");
      
      // Setze ein Timeout für die Anfrage
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Auf 15 Sekunden erhöht, da Flowise manchmal länger braucht
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': FLOWISE_API_KEY ? `Bearer ${FLOWISE_API_KEY}` : ''
      };
      
      // Füge einen speziellen Header hinzu, um die Rohformatierung in Flowise zu erhalten
      // Dies hilft, die identische Formatierung wie in der Flowise-Oberfläche zu erhalten
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      // Timeout entfernen, da die Anfrage abgeschlossen ist
      clearTimeout(timeoutId);
      
      console.log("CHAT-API-DEBUG-004: Flowise API Antwort Status:", response.status);

      if (!response.ok) {
        const errorData = await response.text()
        console.error('CHAT-API-DEBUG-004: Flowise API Fehler:', response.status, errorData)
        
        // FALLBACK: Sende eine Standardantwort zurück
        const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
        return NextResponse.json({
          text: FALLBACK_RESPONSES[randomIndex],
          error: `API-Fehler: ${response.status}`
        });
      }

      // Bei normaler Antwort das JSON zurückgeben
      const data = await response.json()
      console.log("CHAT-API-DEBUG-004: Flowise API Antwort erhalten:", 
                  typeof data, data ? Object.keys(data) : "Keine Daten");
      
      // Direkt die Antwort von Flowise zurückgeben ohne Modifikationen
      return NextResponse.json(data)
    } catch (fetchError) {
      console.error("CHAT-API-DEBUG-004: Fetch-Fehler bei Flowise-Anfrage:", fetchError);
      
      // FALLBACK: Wenn der Fetch fehlgeschlagen ist, sende eine Standardantwort zurück
      const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
      return NextResponse.json({
        text: FALLBACK_RESPONSES[randomIndex],
        question: userQuestion,
        error: fetchError instanceof Error ? fetchError.message : "Unbekannter Fetch-Fehler"
      });
    }
  } catch (error) {
    console.error('CHAT-API-DEBUG-004: Chat API Fehler:', error)
    
    // FALLBACK: Sende eine Standardantwort zurück
    const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
    return NextResponse.json({
      text: FALLBACK_RESPONSES[randomIndex],
      error: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten'
    }, { status: 200 }) // Wichtig: Status 200 zurückgeben, um Frontend-Fehler zu vermeiden
  }
} 