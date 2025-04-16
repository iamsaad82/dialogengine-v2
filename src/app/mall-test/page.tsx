'use client';

import React, { useState } from 'react';
import SmartMallAdapter from '../../components/chat/templates/smartmall/SmartMallAdapter';

// Simulierte Beispiel-Chunks für Tests
const exampleChunks = [
  '<chunk type="intro">Im Einkaufszentrum Brandenburg findest du zahlreiche Geschäfte für deine Bedürfnisse. Hier sind einige Vorschläge.</chunk>',
  
  '<chunk type="shop">NAME: Elektronik Plus\nCATEGORY: Elektronik\nFLOOR: EG\nLOGO: https://via.placeholder.com/80x80?text=EP\nDESCRIPTION: Große Auswahl an Elektronikartikeln, von Smartphones bis zu Haushaltsgeräten\nOPENING: Mo-Sa 10:00-20:00 Uhr</chunk>',
  
  '<chunk type="shop">NAME: Mode & Style\nCATEGORY: Bekleidung\nFLOOR: 1. OG\nLOGO: https://via.placeholder.com/80x80?text=MS\nDESCRIPTION: Aktuelle Mode für Damen, Herren und Kinder zu günstigen Preisen\nOPENING: Mo-Sa 09:00-20:00 Uhr</chunk>',
  
  '<chunk type="restaurant">NAME: Café Brandenburg\nCATEGORY: Café & Konditorei\nFLOOR: 2. OG\nLOGO: https://via.placeholder.com/80x80?text=CB\nDESCRIPTION: Gemütliches Café mit einer großen Auswahl an Kuchen und Kaffeespezialitäten\nOPENING: Mo-Sa 09:00-19:00 Uhr</chunk>',

  '<chunk type="event">NAME: Verkaufsoffener Sonntag\nDATE: 5. Mai 2024\nLOGO: https://via.placeholder.com/80x80?text=VS\nDESCRIPTION: Erleben Sie einen besonderen Einkaufstag mit vielen Aktionen und Angeboten in allen Geschäften.</chunk>',

  '<chunk type="tip">Tipp: Nutzen Sie unser kostenloses WLAN während Ihres Einkaufs!</chunk>',
  
  '<chunk type="followUp">Haben Sie Interesse an bestimmten Geschäften oder suchen Sie nach speziellen Produkten?</chunk>'
];

/**
 * Testseite für das SmartMall-Template
 * 
 * Diese Seite simuliert das Streaming von Chunk-Daten und zeigt das
 * SmartMall-Template mit den progressiven Rendering-Funktionen.
 */
export default function MallTestPage() {
  const [content, setContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(true);
  const [streamingSpeed, setStreamingSpeed] = useState<number>(500); // ms Basisverzögerung

  // Simuliert das Streaming von Chunks mit Verzögerungen
  const simulateStreaming = () => {
    setContent('');
    setIsStreaming(true);
    setIsComplete(false);

    let currentContent = '';
    let currentChunk = 0;

    // Funktion zum Hinzufügen von Chunks mit Verzögerung
    const addNextChunk = () => {
      if (currentChunk >= exampleChunks.length) {
        setIsStreaming(false);
        setIsComplete(true);
        return;
      }

      currentContent += exampleChunks[currentChunk];
      setContent(currentContent);
      currentChunk++;

      // Simulate realistic streaming with variable delays based on streamingSpeed
      const variability = streamingSpeed * 0.5; // 50% Variabilität
      const delay = streamingSpeed + (Math.random() * variability); 
      setTimeout(addNextChunk, delay);
    };

    // Starte das simulierte Streaming
    setTimeout(addNextChunk, streamingSpeed / 2);
  };

  // Zeige alle Chunks auf einmal an
  const showAll = () => {
    setIsStreaming(false);
    setIsComplete(true);
    setContent(exampleChunks.join(''));
  };

  // Zurücksetzen
  const reset = () => {
    setIsStreaming(false);
    setIsComplete(true);
    setContent('');
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Mall Template Test</h1>
      <p>
        Diese Seite demonstriert das SmartMall-Template mit einem verbesserten
        progressiven Rendering-Ansatz für das Flowise-Chunk-Format.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="speed" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Streaming-Geschwindigkeit: {streamingSpeed}ms
        </label>
        <input 
          id="speed"
          type="range" 
          min="100" 
          max="2000" 
          step="100" 
          value={streamingSpeed}
          onChange={(e) => setStreamingSpeed(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
          <span>Schnell (100ms)</span>
          <span>Mittel (1000ms)</span>
          <span>Langsam (2000ms)</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={simulateStreaming}
          disabled={isStreaming}
          style={{
            padding: '8px 16px',
            backgroundColor: isStreaming ? '#ccc' : '#3b1c60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isStreaming ? 'not-allowed' : 'pointer'
          }}
        >
          Streaming simulieren
        </button>

        <button 
          onClick={showAll}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Alles anzeigen
        </button>

        <button 
          onClick={reset}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Zurücksetzen
        </button>
      </div>

      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: 'white',
        minHeight: '600px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <SmartMallAdapter
          content={content}
          isStreaming={isStreaming}
          isComplete={isComplete}
          query="Was gibt es im Einkaufszentrum Brandenburg?"
          colorStyle={{
            primary: '#3b1c60',
            secondary: '#ff5a5f'
          }}
        />
      </div>

      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>Chunk-Daten</h3>
        <pre style={{
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          overflowX: 'auto',
          fontSize: '12px'
        }}>
          {content || 'Noch keine Daten'}
        </pre>
      </div>
    </div>
  );
}
