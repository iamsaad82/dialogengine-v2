import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// TextEncoder für die Streaming-Antwort definieren
const encoder = new TextEncoder();

// Definiere die Typen für Streams und Antworten
interface SectionChunk {
  type: string;
  content: string;
  complete: boolean;
}

export async function POST(request: Request) {
  console.log('CHAT-STREAM-API-DEBUG-001: Streaming API Route gestartet');

  try {
    const body = await request.json();
    const { message, history, botId, sessionId = uuidv4() } = body;

    console.log('CHAT-STREAM-API-DEBUG-001: Request-Body erhalten:', { message, historyLength: history?.length, botId, sessionId });

    // Prüfe ob die Nachricht existiert
    if (!message || message.trim() === '') {
      console.error('CHAT-STREAM-API-DEBUG-001: Keine Nachricht gefunden');
      return NextResponse.json({ error: 'Keine Nachricht gefunden' }, { status: 400 });
    }

    // Bot-Informationen abrufen
    const bot = await prisma.bot.findUnique({
      where: { id: botId }
    });

    if (!bot) {
      console.log('CHAT-STREAM-API-DEBUG-001: Bot nicht gefunden');
      return NextResponse.json({ error: 'Bot nicht gefunden' }, { status: 404 });
    }

    // Chatflow-ID des Bots verwenden
    const chatflowId = bot.flowiseId;
    console.log(`CHAT-STREAM-API-DEBUG-001: Verwende Chatflow-ID von Bot "${bot.name}": ${chatflowId}`);

    // Konversation speichern oder existierende finden
    let conversation = await prisma.conversation.findFirst({
      where: { sessionId: sessionId }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          sessionId: sessionId,
          botId: botId
        }
      });
      console.log('CHAT-STREAM-API-DEBUG-001: Neue Konversation erstellt:', conversation.id);
    } else {
      console.log('CHAT-STREAM-API-DEBUG-001: Bestehende Konversation gefunden:', conversation.id);
    }

    // Benutzernachricht speichern
    await prisma.message.create({
      data: {
        role: 'user',
        content: message,
        conversationId: conversation.id
      }
    });
    console.log('CHAT-STREAM-API-DEBUG-001: Nachricht gespeichert');

    // URL für die Flowise API
    const FLOWISE_URL = process.env.NEXT_PUBLIC_FLOWISE_URL || 'https://flowise-smg.onrender.com';
    const apiUrl = `${FLOWISE_URL}/api/v1/prediction/${chatflowId}`;
    console.log('CHAT-STREAM-API-DEBUG-001: Flowise API URL:', apiUrl);

    // Bereite den Payload für die Flowise API vor
    const messagePayload = {
      question: message,
      history: history?.slice(-20) || [], // Nur die letzten 20 Nachrichten senden
      streaming: true,
      overrideConfig: {
        botName: bot?.name || 'Brandenburg Dialog'
      }
    };

    console.log('CHAT-STREAM-API-DEBUG-001: Nachrichtenpayload erstellt');

    // Transformable Stream erstellen
    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();

    // Aktuelle Sektionen für HTML/Layout-Unterteilung
    let currentSections: SectionChunk[] = [];
    let completeContent = '';

    // Fetch-Anfrage an Flowise im Hintergrund starten
    (async () => {
      try {
        console.log('CHAT-STREAM-API-DEBUG-001: Starte Fetch-Anfrage an Flowise');

        // Timeout für die Anfrage setzen (60 Sekunden)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.error('CHAT-STREAM-API-DEBUG-001: Timeout bei Flowise-Anfrage - 60 Sekunden überschritten');
        }, 60000);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify(messagePayload),
          signal: controller.signal
        });

        // Timeout löschen, da die Antwort eingegangen ist
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error('CHAT-STREAM-API-DEBUG-001: Flowise API Fehler:', response.status, response.statusText);

          // Fehler an den Client senden
          await writer.write(encoder.encode(`event: error\ndata: {"error":"Fehler bei der Anfrage an die KI: ${response.status} ${response.statusText}"}\n\n`));
          await writer.close();
          return;
        }

        if (!response.body) {
          console.error('CHAT-STREAM-API-DEBUG-001: Keine Antwort vom Flowise API Stream');

          // Fehler an den Client senden
          await writer.write(encoder.encode(`event: error\ndata: {"error":"Keine Antwort vom KI-Service erhalten"}\n\n`));
          await writer.close();
          return;
        }

        console.log('CHAT-STREAM-API-DEBUG-001: Flowise API Stream gestartet');

        // Stream-Reader erstellen
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Variablen für die Stream-Verarbeitung
        let buffer = '';
        let receivedAnyData = false;

        // Stream lesen und verarbeiten
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('CHAT-STREAM-API-DEBUG-001: Flowise API Stream beendet');
            break;
          }

          receivedAnyData = true;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          console.log(`CHAT-STREAM-API-DEBUG-001: Chunk empfangen, Länge: ${value?.length || 0}`);

          // Nachrichtenblöcke verarbeiten
          // Flowise sendet im Format: message:\ndata:{"event":"token","data":"Inhalt"}
          const messages = buffer.split('message:');

          // Der erste Block ist möglicherweise leer oder unvollständig
          if (messages.length > 1) {
            // Behalte den letzten Teil im Buffer für die nächste Iteration
            buffer = messages.pop() || '';

            for (const msg of messages) {
              if (!msg.trim()) continue;

              // Extrahiere die Daten aus dem Message-Block
              const dataMatch = msg.match(/\ndata:(.*?)(\n|$)/);

              if (dataMatch && dataMatch[1]) {
                try {
                  // Parse die JSON-Daten
                  const data = JSON.parse(dataMatch[1].trim());

                  if (data.event === 'token' && data.data) {
                    // Token-Daten verarbeiten
                    console.log('CHAT-STREAM-API-DEBUG-001: Token empfangen');

                    // Zum Gesamtinhalt hinzufügen für spätere Speicherung
                    completeContent += data.data;

                    // Sofort den Token an den Client senden ohne Verzögerung
                    // Verwende 'progressive-token' als Event-Typ für inkrementelles Rendering
                    const tokenEvent = `event: progressive-token\ndata: ${JSON.stringify({
                      type: 'token',
                      content: data.data,
                      complete: false,
                      timestamp: Date.now() // Timestamp für Sortierung
                    })}\n\n`;

                    await writer.write(encoder.encode(tokenEvent));
                  }
                } catch (e) {
                  console.error('CHAT-STREAM-API-DEBUG-001: Fehler beim Parsen der Daten:', e);
                }
              }
            }
          }
        }

        // Wenn keine Daten empfangen wurden, sende Fehlermeldung
        if (!receivedAnyData) {
          console.error('CHAT-STREAM-API-DEBUG-001: Keine Daten vom Flowise-Stream empfangen');
          await writer.write(encoder.encode(`event: error\ndata: {"error":"Keine Daten vom KI-Service empfangen"}\n\n`));
        } else {
          // Speichere die Botantwort in der Datenbank
          if (completeContent) {
            await prisma.message.create({
              data: {
                role: 'assistant',
                content: completeContent,
                conversationId: conversation.id
              }
            });

            console.log('CHAT-STREAM-API-DEBUG-001: Bot-Antwort in DB gespeichert, Länge:', completeContent.length);
          }

          // Metadata-Event mit der Session-ID
          await writer.write(encoder.encode(`event: meta\ndata: ${JSON.stringify({
            sessionId
          })}\n\n`));

          // Sende End-Event
          await writer.write(encoder.encode('event: end\ndata: ""\n\n'));
        }

        // Writer schließen
        await writer.close();

      } catch (error) {
        console.error('CHAT-STREAM-API-DEBUG-001: Fehler bei der Stream-Verarbeitung:', error);

        try {
          // Fehler an den Client senden
          await writer.write(encoder.encode(`event: error\ndata: {"error":"Ein Fehler ist bei der Verarbeitung aufgetreten"}\n\n`));

          // End-Event senden, um den Client-Stream zu beenden
          await writer.write(encoder.encode('event: end\ndata: ""\n\n'));
        } catch (e) {
          console.error('CHAT-STREAM-API-DEBUG-001: Fehler beim Senden der Fehlermeldung:', e);
        } finally {
          await writer.close();
        }
      }
    })();

    // Stream als Antwort zurückgeben
    console.log('CHAT-STREAM-API-DEBUG-001: Gebe Stream an Client zurück');

    return new Response(transformStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('CHAT-STREAM-API-DEBUG-001: Allgemeiner Fehler:', error);

    return new Response(
      encoder.encode(`event: error\ndata: ${JSON.stringify({
        error: error instanceof Error ? error.message : "Unbekannter Fehler"
      })}\n\n`),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      }
    );
  }
}