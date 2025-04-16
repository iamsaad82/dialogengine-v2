'use client';

import React, { useState, useEffect } from 'react';
import SmartMallMessage from '../../components/chat/templates/smartmall/SmartMallMessage';

// Simulierte Beispiel-Chunks für Tests
const exampleChunks = [
  '<chunk type="intro">Im Limbecker Platz findest du zahlreiche Geschäfte, die Schuhe anbieten. Hier sind einige Top-Shops für dich.</chunk>',
  
  '<chunk type="shop">NAME: Tamaris\nCATEGORY: Damenschuhe\nFLOOR: 1. OG\nLOGO: https://www.limbecker-platz.de/fileadmin/user_upload/GLOBAL/brand_stores/logos/tamaris.png\nDESCRIPTION: Europas bekannteste Schuhmarke mit einer großen Auswahl an modischen Damenschuhen\nOPENING: Mo-Sa 10:00-20:00 Uhr</chunk>',
  
  '<chunk type="shop">NAME: ONYGO\nCATEGORY: Sneaker & Streetwear\nFLOOR: UG\nLOGO: https://www.limbecker-platz.de/fileadmin/user_upload/GLOBAL/brand_stores/logos/onygo.png\nDESCRIPTION: Große Auswahl an Sneakern und Schuhen von Marken wie Nike, adidas, Dr. Martens und Vans\nOPENING: Mo-Sa 10:00-20:00 Uhr</chunk>',
  
  '<chunk type="shop">NAME: Snipes\nCATEGORY: Streetwear & Sneaker\nFLOOR: UG\nLOGO: https://www.limbecker-platz.de/fileadmin/user_upload/GLOBAL/brand_stores/logos/snipes.png\nDESCRIPTION: Streetwear-Outfitter mit einer großen Auswahl an Sneakern von Marken wie Nike, Jordan und adidas\nOPENING: Mo-Sa 10:00-20:00 Uhr</chunk>',

  '<chunk type="tip">Tipp: Vergleiche die Preise und Modelle in verschiedenen Shops, um das perfekte Paar zu finden!</chunk>',
  
  '<chunk type="followUp">Suchst du Sneaker, Damenschuhe oder hast du eine bestimmte Marke im Sinn?</chunk>'
];

/**
 * Testseite für das SmartMall-Template
 * 
 * Diese Seite simuliert das Streaming von Chunk-Daten und zeigt das
 * SmartMall-Template mit den progressiven Rendering-Funktionen.
 */
export default function SmartMallTestPage() {
  const [content, setContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(true);

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

      // Simulate realistic streaming with variable delays
      const delay = 300 + Math.random() * 700; // 300-1000ms delay
      setTimeout(addNextChunk, delay);
    };

    // Starte das simulierte Streaming
    setTimeout(addNextChunk, 500);
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
      <h1>SmartMall Template Test</h1>
      <p>
        Diese Seite demonstriert das neue SmartMall-Template mit einem verbesserten
        progressiven Rendering-Ansatz für das Flowise-Chunk-Format.
      </p>

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
        <SmartMallMessage
          content={content}
          isStreaming={isStreaming}
          isComplete={isComplete}
          query="Wo finde ich Schuhe im Limbecker Platz?"
          colorStyle={{
            primaryColor: '#3b1c60',
            secondaryColor: '#ff5a5f'
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