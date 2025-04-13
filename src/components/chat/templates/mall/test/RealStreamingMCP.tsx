'use client';

import React, { useState, useEffect, useRef } from 'react';
import ShoppingMallMessage from '../ShoppingMallMessage';

/**
 * Realistischer Streaming-MCP für das Mall-Template
 * Simuliert echtes Streaming-Verhalten mit zeichenweisem Hinzufügen von Inhalten
 */
const RealStreamingMCP: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [streamingSpeed, setStreamingSpeed] = useState<number>(20); // Zeichen pro Intervall
  const [streamingInterval, setStreamingInterval] = useState<number>(50); // ms
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Vollständiger Content, der gestreamt werden soll
  const fullContent = `
<html>
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

<restaurants title="Cafés mit Eisangebot">
<restaurant>
<name>Café Central</name>
<category>Café & Konditorei</category>
<floor>2. OG</floor>
<image>https://example.com/images/cafe-central-logo.png</image>
<description>Café mit hausgemachten Kuchen und Eisspezialitäten</description>
<opening>Mo-Sa: 9:00-20:00 Uhr, So: 10:00-18:00 Uhr</opening>
</restaurant>

<restaurant>
<name>Milchbar</name>
<category>Milchshakes & Eis</category>
<floor>Erdgeschoss</floor>
<image>https://example.com/images/milchbar-logo.png</image>
<description>Spezialität: Milchshakes und Eisbecher</description>
<opening>Mo-Sa: 10:00-21:00 Uhr</opening>
</restaurant>
</restaurants>

<tip>
Tipp: Bei der Langnese Happiness Station kannst du dein Eis selbst zusammenstellen - von Toppings bis Saucen ist alles möglich!
</tip>
</html>
`;

  // Simuliere echtes Streaming-Verhalten mit zeichenweisem Hinzufügen
  const startStreaming = () => {
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

  // Starte Streaming beim ersten Laden
  useEffect(() => {
    startStreaming();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
        <h1>Realistischer Streaming-Test</h1>
        <p>Dieser Test simuliert echtes Streaming-Verhalten mit zeichenweisem Hinzufügen von Inhalten</p>
      </div>
      
      <div style={controlsStyle}>
        <div>
          <strong>Status:</strong> {isStreaming ? 'Streaming...' : 'Abgeschlossen'}
          <br />
          <strong>Fortschritt:</strong> {Math.round((content.length / fullContent.length) * 100)}%
          <br />
          <strong>Shops geladen:</strong> {content.match(/<shop>/g)?.length || 0} von 4
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
        
        <button 
          onClick={() => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            startStreaming();
          }}
        >
          Neu starten
        </button>
      </div>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
        <ShoppingMallMessage 
          content={content}
          isStreaming={isStreaming}
          isComplete={isComplete}
          query="Wo gibt es Eis im Shopping Center?"
          colorStyle={{
            primaryColor: '#3b1c60',
            secondaryColor: '#ff5a5f'
          }}
        />
      </div>
      
      {/* Debug-Bereich */}
      <div style={debugStyle}>
        <h3>Debug-Informationen:</h3>
        <p>Content-Länge: {content.length} von {fullContent.length} Zeichen</p>
        <p>Anzahl Shop-Tags: {content.match(/<shop>/g)?.length || 0}</p>
        <p>Anzahl geschlossener Shop-Tags: {content.match(/<\/shop>/g)?.length || 0}</p>
        <p>Streaming-Status: {isStreaming ? 'Aktiv' : 'Beendet'}</p>
        <p>Geschwindigkeit: {streamingSpeed} Zeichen alle {streamingInterval}ms</p>
      </div>
    </div>
  );
};

export default RealStreamingMCP;
