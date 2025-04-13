'use client';

import React, { useState, useEffect } from 'react';
import ShoppingMallMessage from '../ShoppingMallMessage';

/**
 * Mock Content Provider für das Mall-Template
 * Simuliert Streaming-Verhalten und stellt Test-Daten bereit
 */
const MallTemplateMCP: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  
  // Simulierte Streaming-Daten
  const mockContent = `
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

<events title="Eis-Events">
<event>
<name>Eis-Festival</name>
<date>15.07.2023 - 16.07.2023</date>
<description>Großes Eis-Festival mit Verkostungen und Workshops</description>
<image>https://example.com/images/ice-festival.jpg</image>
</event>
</events>

<tip>
Tipp: Bei der Langnese Happiness Station kannst du dein Eis selbst zusammenstellen - von Toppings bis Saucen ist alles möglich!
</tip>
</html>
  `;

  // Simuliere Streaming-Verhalten
  useEffect(() => {
    let currentContent = '';
    const contentChunks = mockContent.split('\n');
    let chunkIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (chunkIndex < contentChunks.length) {
        currentContent += contentChunks[chunkIndex] + '\n';
        setContent(currentContent);
        chunkIndex++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
        setIsComplete(true);
      }
    }, 100); // Simuliere Streaming mit 100ms Intervall
    
    return () => clearInterval(streamInterval);
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
    justifyContent: 'space-between',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Mall Template Test</h1>
        <p>Dieser Test simuliert das Streaming-Verhalten des Mall-Templates</p>
      </div>
      
      <div style={controlsStyle}>
        <div>
          <strong>Status:</strong> {isStreaming ? 'Streaming...' : 'Abgeschlossen'}
        </div>
        <button 
          onClick={() => {
            setIsStreaming(true);
            setIsComplete(false);
            setContent('');
            // Starte Streaming neu
            let currentContent = '';
            const contentChunks = mockContent.split('\n');
            let chunkIndex = 0;
            
            const streamInterval = setInterval(() => {
              if (chunkIndex < contentChunks.length) {
                currentContent += contentChunks[chunkIndex] + '\n';
                setContent(currentContent);
                chunkIndex++;
              } else {
                clearInterval(streamInterval);
                setIsStreaming(false);
                setIsComplete(true);
              }
            }, 100);
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
    </div>
  );
};

export default MallTemplateMCP;
