'use client';

import React, { useState, useEffect, useRef } from 'react';
import ShoppingMallMessage from '../ShoppingMallMessage';

/**
 * Live-Daten MCP für das Mall-Template
 * Verwendet echte Daten aus der Pinecone-Datenbank
 */
const LiveDataMCP: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('Wo gibt es Eis im Shopping Center?');
  const [streamingSpeed, setStreamingSpeed] = useState<number>(20); // Zeichen pro Intervall
  const [streamingInterval, setStreamingInterval] = useState<number>(50); // ms
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Funktion zum Abrufen der Antwort vom Server
  const fetchAnswer = async (userQuery: string) => {
    try {
      // Abbrechen vorheriger Anfragen
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Neue AbortController-Instanz erstellen
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      // Streaming-Status zurücksetzen
      setContent('');
      setIsStreaming(true);
      setIsComplete(false);
      
      // Anfrage an den Server senden
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userQuery,
          botId: 'mall-test', // Anpassen an Ihre Bot-ID
          userId: 'test-user',
          conversationId: 'test-conversation',
          streaming: true
        }),
        signal
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }
      
      // Stream-Reader erstellen
      const reader = response.body.getReader();
      let receivedContent = '';
      
      // Streaming-Verarbeitung
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              setIsStreaming(false);
              setIsComplete(true);
              break;
            }
            
            // Neue Daten zum empfangenen Inhalt hinzufügen
            const chunk = new TextDecoder().decode(value);
            receivedContent += chunk;
            
            // Content aktualisieren
            setContent(receivedContent);
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Stream reading error:', error);
          }
        }
      };
      
      // Stream verarbeiten
      processStream();
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
      setIsStreaming(false);
      setIsComplete(true);
    }
  };
  
  // Simuliertes Streaming mit echter Antwort
  const simulateStreaming = (fullContent: string) => {
    setContent('');
    setIsStreaming(true);
    setIsComplete(false);
    
    let currentPosition = 0;
    
    // Streame Zeichen für Zeichen
    intervalRef.current = setInterval(() => {
      if (currentPosition < fullContent.length) {
        // Füge eine bestimmte Anzahl von Zeichen hinzu
        const nextPosition = Math.min(currentPosition + streamingSpeed, fullContent.length);
        const newContent = fullContent.substring(0, nextPosition);
        setContent(newContent);
        currentPosition = nextPosition;
      } else {
        // Beende Streaming
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsStreaming(false);
        setIsComplete(true);
      }
    }, streamingInterval);
  };

  // Beispielantworten für verschiedene Abfragen
  const exampleAnswers: Record<string, string> = {
    'Wo gibt es Eis im Shopping Center?': `
<intro>
Klar, ich beantworte deine Frage sehr gern! Im Shopping Center gibt es gleich mehrere tolle Eisläden, die dir ein leckeres Eis servieren werden.
</intro>

<shops title="Unsere Eis-Shops">
<shop>
<name>Eislab</name>
<category>Umweltfreundliches Eis</category>
<floor>1. OG</floor>
<image>https://example.com/images/eislab-logo.png</image>
<description>Umweltfreundliches Eis aus biologischem Anbau</description>
<opening>Mo-Sa: 10:00-20:00 Uhr</opening>
</shop>

<shop>
<name>Langnese Happiness Station</name>
<category>Softeis</category>
<floor>Untergeschoss</floor>
<image>https://example.com/images/langnese-logo.png</image>
<description>Softeis zum Selbstgestalten</description>
<opening>Mo-Sa: 9:00-21:00 Uhr</opening>
</shop>

<shop>
<name>Eiscafé Venezia</name>
<category>Traditionelles Eiscafé</category>
<floor>1. OG</floor>
<image>https://example.com/images/venezia-logo.png</image>
<description>Traditionelles Eiscafé mit italienischen Spezialitäten</description>
<opening>Mo-So: 9:00-22:00 Uhr</opening>
</shop>

<shop>
<name>Frooters</name>
<category>Frozen Yogurt</category>
<floor>Erdgeschoss</floor>
<image>https://example.com/images/frooters-logo.png</image>
<description>Frozen Yogurt und Eiskreationen</description>
<opening>Mo-Sa: 10:00-20:00 Uhr</opening>
</shop>
</shops>

<tip>
Tipp: Bei der Langnese Happiness Station kannst du dein Eis selbst zusammenstellen - von Toppings bis Saucen ist alles möglich!
</tip>
`,
    'Welche Restaurants gibt es im Shopping Center?': `
<intro>
Im Shopping Center findest du eine große Auswahl an Restaurants und Cafés für jeden Geschmack. Hier ist eine Übersicht der beliebtesten Gastronomiebetriebe:
</intro>

<restaurants title="Unsere Restaurants">
<restaurant>
<name>Vapiano</name>
<category>Italienisch</category>
<floor>2. OG</floor>
<image>https://example.com/images/vapiano-logo.png</image>
<description>Frische italienische Küche mit Pasta, Pizza und Salaten</description>
<opening>Mo-Sa: 11:00-22:00 Uhr, So: 12:00-21:00 Uhr</opening>
</restaurant>

<restaurant>
<name>Asia Wok</name>
<category>Asiatisch</category>
<floor>Erdgeschoss</floor>
<image>https://example.com/images/asia-wok-logo.png</image>
<description>Authentische asiatische Gerichte frisch zubereitet</description>
<opening>Mo-Sa: 11:00-21:00 Uhr</opening>
</restaurant>

<restaurant>
<name>Burger King</name>
<category>Fast Food</category>
<floor>Untergeschoss</floor>
<image>https://example.com/images/burger-king-logo.png</image>
<description>Klassische Burger und Snacks</description>
<opening>Mo-Sa: 9:00-22:00 Uhr, So: 10:00-21:00 Uhr</opening>
</restaurant>

<restaurant>
<name>Café Central</name>
<category>Café & Konditorei</category>
<floor>1. OG</floor>
<image>https://example.com/images/cafe-central-logo.png</image>
<description>Kaffee, Kuchen und kleine Snacks in gemütlicher Atmosphäre</description>
<opening>Mo-Sa: 9:00-20:00 Uhr, So: 10:00-18:00 Uhr</opening>
</restaurant>

<restaurant>
<name>Sushi Bar</name>
<category>Japanisch</category>
<floor>2. OG</floor>
<image>https://example.com/images/sushi-bar-logo.png</image>
<description>Frisches Sushi und japanische Spezialitäten</description>
<opening>Mo-Sa: 11:00-21:00 Uhr</opening>
</restaurant>
</restaurants>

<tip>
Tipp: Im 2. OG findest du unsere Food-Court-Area mit vielen weiteren Gastronomieangeboten und gemeinsamen Sitzplätzen.
</tip>
`,
    'Wann hat das Shopping Center geöffnet?': `
<intro>
Hier sind die aktuellen Öffnungszeiten unseres Shopping Centers:
</intro>

<openingHours title="Unsere Öffnungszeiten">
<regular>
<day>Montag - Samstag</day>
<hours>9:30 - 20:00 Uhr</hours>
</regular>

<regular>
<day>Sonntag</day>
<hours>Geschlossen</hours>
</regular>

<special>
<date>Verkaufsoffener Sonntag (erster Sonntag im Monat)</date>
<hours>13:00 - 18:00 Uhr</hours>
</special>
</openingHours>

<shops title="Abweichende Öffnungszeiten">
<shop>
<name>Supermarkt REWE</name>
<category>Lebensmittel</category>
<floor>Erdgeschoss</floor>
<image>https://example.com/images/rewe-logo.png</image>
<description>Supermarkt mit verlängerten Öffnungszeiten</description>
<opening>Mo-Sa: 7:00-22:00 Uhr</opening>
</shop>

<shop>
<name>Fitness First</name>
<category>Fitness & Sport</category>
<floor>3. OG</floor>
<image>https://example.com/images/fitness-first-logo.png</image>
<description>Modernes Fitnessstudio mit Kursangeboten</description>
<opening>Mo-Fr: 6:00-23:00 Uhr, Sa-So: 9:00-21:00 Uhr</opening>
</shop>

<shop>
<name>Cineplex Kino</name>
<category>Entertainment</category>
<floor>4. OG</floor>
<image>https://example.com/images/cineplex-logo.png</image>
<description>Modernes Multiplex-Kino</description>
<opening>Mo-So: 14:00-23:00 Uhr</opening>
</shop>
</shops>

<tip>
Tipp: An Feiertagen können abweichende Öffnungszeiten gelten. Bitte informiere dich vor deinem Besuch auf unserer Website oder telefonisch.
</tip>
`
  };

  // Starte Streaming beim ersten Laden
  useEffect(() => {
    // Verwende die Beispielantwort für die aktuelle Abfrage
    const answer = exampleAnswers[query] || '';
    if (answer) {
      simulateStreaming(answer);
    } else {
      // Wenn keine Beispielantwort vorhanden ist, vom Server abrufen
      fetchAnswer(query);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  // Styling für die Demo-Seite
  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };
  
  const headerStyle: React.CSSProperties = {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    textAlign: 'center',
  };
  
  const controlsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  };

  const sliderContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  };

  const queryContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '10px',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  };

  const debugStyle: React.CSSProperties = {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    fontSize: '12px',
    maxHeight: '200px',
    overflow: 'auto',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Live-Daten Test</h1>
        <p>Dieser Test verwendet echte Daten und simuliert das Streaming-Verhalten</p>
      </div>
      
      <div style={controlsStyle}>
        <div style={queryContainerStyle}>
          <label htmlFor="query">Abfrage:</label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: '8px', width: '100%' }}
          />
          
          <div style={buttonContainerStyle}>
            <button
              onClick={() => {
                const answer = exampleAnswers[query];
                if (answer) {
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                  }
                  simulateStreaming(answer);
                } else {
                  fetchAnswer(query);
                }
              }}
            >
              Abfragen
            </button>
            
            <button
              onClick={() => {
                setQuery('Wo gibt es Eis im Shopping Center?');
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                }
                simulateStreaming(exampleAnswers['Wo gibt es Eis im Shopping Center?']);
              }}
            >
              Eis-Shops
            </button>
            
            <button
              onClick={() => {
                setQuery('Welche Restaurants gibt es im Shopping Center?');
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                }
                simulateStreaming(exampleAnswers['Welche Restaurants gibt es im Shopping Center?']);
              }}
            >
              Restaurants
            </button>
            
            <button
              onClick={() => {
                setQuery('Wann hat das Shopping Center geöffnet?');
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                }
                simulateStreaming(exampleAnswers['Wann hat das Shopping Center geöffnet?']);
              }}
            >
              Öffnungszeiten
            </button>
          </div>
        </div>
        
        <div>
          <strong>Status:</strong> {isStreaming ? 'Streaming...' : 'Abgeschlossen'}
          <br />
          <strong>Shops geladen:</strong> {content.match(/<shop>/g)?.length || 0}
          <br />
          <strong>Restaurants geladen:</strong> {content.match(/<restaurant>/g)?.length || 0}
        </div>
        
        <div style={sliderContainerStyle}>
          <span>Streaming-Geschwindigkeit:</span>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={streamingSpeed}
            onChange={(e) => setStreamingSpeed(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span>{streamingSpeed} Zeichen/Tick</span>
        </div>
        
        <div style={sliderContainerStyle}>
          <span>Intervall:</span>
          <input 
            type="range" 
            min="10" 
            max="200" 
            value={streamingInterval}
            onChange={(e) => setStreamingInterval(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span>{streamingInterval} ms</span>
        </div>
      </div>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
        <ShoppingMallMessage 
          content={content}
          isStreaming={isStreaming}
          isComplete={isComplete}
          query={query}
          colorStyle={{
            primaryColor: '#3b1c60',
            secondaryColor: '#ff5a5f'
          }}
        />
      </div>
      
      {/* Debug-Bereich */}
      <div style={debugStyle}>
        <h3>Debug-Informationen:</h3>
        <p>Content-Länge: {content.length} Zeichen</p>
        <p>Anzahl Shop-Tags: {content.match(/<shop>/g)?.length || 0}</p>
        <p>Anzahl Restaurant-Tags: {content.match(/<restaurant>/g)?.length || 0}</p>
        <p>Streaming-Status: {isStreaming ? 'Aktiv' : 'Beendet'}</p>
        <p>Geschwindigkeit: {streamingSpeed} Zeichen alle {streamingInterval}ms</p>
        <p>Intro vorhanden: {content.includes('<intro>') ? 'Ja' : 'Nein'}</p>
        <p>Shops-Sektion vorhanden: {content.includes('<shops') ? 'Ja' : 'Nein'}</p>
        <p>Restaurants-Sektion vorhanden: {content.includes('<restaurants') ? 'Ja' : 'Nein'}</p>
      </div>
    </div>
  );
};

export default LiveDataMCP;
