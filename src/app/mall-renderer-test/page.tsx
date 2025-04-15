'use client';

import React, { useState, useEffect } from 'react';
import MallTemplateRenderer from '../../components/chat/templates/mall/MallTemplateRenderer';

// Beispiel-JSON für Tests
const exampleJson = `{
  "intro": "Im Limbecker Platz findest du 3 Sportgeschäfte im Erdgeschoss und 1. OG.",
  "shops": [
    {
      "name": "Foot Locker",
      "category": "Sport & Fitness",
      "floor": "EG",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Foot_Locker_logo.svg/2560px-Foot_Locker_logo.svg.png",
      "description": "Sneaker und Sportbekleidung für Damen, Herren und Kinder",
      "opening": "Mo-Sa 10:00-20:00 Uhr"
    },
    {
      "name": "SportScheck",
      "category": "Sport & Fitness",
      "floor": "1. OG",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/SportScheck_201x_logo.svg/2560px-SportScheck_201x_logo.svg.png",
      "description": "Große Auswahl an Sportartikeln und Outdoor-Ausrüstung",
      "opening": "Mo-Sa 10:00-20:00 Uhr"
    },
    {
      "name": "JD Sports",
      "category": "Sport & Fitness",
      "floor": "EG",
      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d8/JD_Sports_logo.svg/1200px-JD_Sports_logo.svg.png",
      "description": "Sportmode und Sneaker für Streetwear-Fans",
      "opening": "Mo-Sa 10:00-20:00 Uhr"
    }
  ],
  "tip": "Aktuell gibt es bei Foot Locker 20% Rabatt auf ausgewählte Sneaker!",
  "followUp": "Suchst du nach einer bestimmten Sportart oder Marke?"
}`;

// Simuliertes progressives Streaming mit kleineren Chunks für bessere Demonstration
const simulateStreaming = (fullContent: string, callback: (content: string, isComplete: boolean) => void) => {
  const chunks = [
    // Intro
    '{"intro": "Im Limbecker Platz findest du 3 Sportgeschäfte im Erdgeschoss und 1. OG."',

    // Beginn der Shops-Sektion
    ',\n  "shops": [',

    // Erster Shop - Teil 1
    '\n    {\n      "name": "Foot Locker",',
    '\n      "category": "Sport & Fitness",',
    '\n      "floor": "EG",',
    '\n      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Foot_Locker_logo.svg/2560px-Foot_Locker_logo.svg.png",',
    '\n      "description": "Sneaker und Sportbekleidung für Damen, Herren und Kinder",',
    '\n      "opening": "Mo-Sa 10:00-20:00 Uhr"\n    }',

    // Zweiter Shop
    ',\n    {\n      "name": "SportScheck",\n      "category": "Sport & Fitness",\n      "floor": "1. OG",\n      "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/SportScheck_201x_logo.svg/2560px-SportScheck_201x_logo.svg.png",\n      "description": "Große Auswahl an Sportartikeln und Outdoor-Ausrüstung",\n      "opening": "Mo-Sa 10:00-20:00 Uhr"\n    }',

    // Dritter Shop
    ',\n    {\n      "name": "JD Sports",\n      "category": "Sport & Fitness",\n      "floor": "EG",\n      "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d8/JD_Sports_logo.svg/1200px-JD_Sports_logo.svg.png",\n      "description": "Sportmode und Sneaker für Streetwear-Fans",\n      "opening": "Mo-Sa 10:00-20:00 Uhr"\n    }\n  ]',

    // Tipp
    ',\n  "tip": "Aktuell gibt es bei Foot Locker 20% Rabatt auf ausgewählte Sneaker!"',

    // Follow-up
    ',\n  "followUp": "Suchst du nach einer bestimmten Sportart oder Marke?"\n}'
  ];

  let currentContent = '';
  let chunkIndex = 0;

  const streamNextChunk = () => {
    if (chunkIndex < chunks.length) {
      currentContent += chunks[chunkIndex];
      callback(currentContent, false);
      chunkIndex++;
      setTimeout(streamNextChunk, 400); // Kürzere Verzögerung für flüssigeres Streaming
    } else {
      callback(fullContent, true); // Streaming abgeschlossen
    }
  };

  streamNextChunk();
};

const MallRendererTest = () => {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(true);

  // Streaming starten
  const startStreaming = () => {
    setContent('');
    setIsStreaming(true);
    setIsComplete(false);

    simulateStreaming(exampleJson, (updatedContent, complete) => {
      setContent(updatedContent);
      if (complete) {
        setIsStreaming(false);
        setIsComplete(true);
      }
    });
  };

  // Streaming stoppen
  const stopStreaming = () => {
    setIsStreaming(false);
    setIsComplete(true);
  };

  // Statischen Inhalt anzeigen
  const showStaticContent = () => {
    setContent(exampleJson);
    setIsStreaming(false);
    setIsComplete(true);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Mall Template Renderer Test</h1>
      <p>Diese Seite testet die optimierte MallTemplateRenderer-Komponente mit progressivem Streaming.</p>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={startStreaming}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b1c60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Streaming starten
        </button>

        <button
          onClick={stopStreaming}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff5a5f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Streaming stoppen
        </button>

        <button
          onClick={showStaticContent}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4a4a4a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Statischen Inhalt anzeigen
        </button>
      </div>

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#fff',
        minHeight: '500px'
      }}>
        <MallTemplateRenderer
          content={content}
          isStreaming={isStreaming}
          isComplete={isComplete}
          query="Wo finde ich Sportgeschäfte?"
          colorStyle={{
            primaryColor: '#3b1c60',
            secondaryColor: '#ff5a5f'
          }}
        />
      </div>

      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        <h3>Aktueller Content:</h3>
        <pre style={{
          backgroundColor: '#f8f8f8',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '300px',
          fontSize: '12px'
        }}>
          {content}
        </pre>
      </div>
    </div>
  );
};

export default MallRendererTest;
