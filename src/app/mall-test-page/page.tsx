'use client';

import React, { useState } from 'react';
import ShoppingMallMessage from '../../components/chat/templates/mall/ShoppingMallMessage';

/**
 * Test-Seite für das Mall-Template
 * 
 * Diese Seite ermöglicht es, das Mall-Template mit verschiedenen XML-Inhalten zu testen.
 */
export default function MallTestPage() {
  const [content, setContent] = useState<string>(`
<intro>
Im Limbecker Platz gibt es zahlreiche Shops, die eine große Auswahl an Hosen für verschiedene Anlässe und Geschmäcker anbieten. Von Jeans über Chinos bis hin zu eleganten Stoffhosen finden Sie hier garantiert das passende Modell.
</intro>

<shops title="Hosen-Shops im Limbecker Platz">
<shop>
<name>Levi's</name>
<category>Jeans & Hosen</category>
<floor>EG</floor>
<image>https://www.limbecker-platz.de/fileadmin/user_upload/GLOBAL/brand_stores/logos/levis.jpg</image>
<description>Klassische und moderne Jeans für Damen und Herren</description>
<opening>Mo-Sa 10:00-20:00 Uhr</opening>
</shop>

<shop>
<name>Jack & Jones</name>
<category>Herren Hosen</category>
<floor>UG</floor>
<image>https://www.limbecker-platz.de/fileadmin/user_upload/GLOBAL/brand_stores/logos/jackandjones.jpeg</image>
<description>Vielfältige Auswahl an Jeans und Chinos</description>
<opening>Mo-Sa 10:00-20:00 Uhr</opening>
</shop>

<shop>
<name>Tommy Hilfiger</name>
<category>Designer Hosen</category>
<floor>EG</floor>
<image>https://www.limbecker-platz.de/fileadmin/user_upload/GLOBAL/brand_stores/logos/tommyhilfiger.png</image>
<description>Hochwertige Hosen im amerikanischen Stil</description>
<opening>Mo-Sa 10:00-20:00 Uhr</opening>
</shop>

<shop>
<name>C&A</name>
<category>Hosen für alle</category>
<floor>EG</floor>
<image>https://www.limbecker-platz.de/fileadmin/user_upload/GLOBAL/brand_stores/logos/cunda.png</image>
<description>Große Auswahl an Hosen für Damen, Herren und Kinder</description>
<opening>Mo-Sa 10:00-20:00 Uhr</opening>
</shop>
</shops>

<tip>
Tipp: Besuchen Sie mehrere Shops, um die perfekte Hose zu finden. Viele Geschäfte bieten kostenlose Anproben und Größenberatung an!
</tip>
  `);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(true);
  
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Mall-Template Test</h1>
      <p>Diese Seite ermöglicht es, das Mall-Template mit verschiedenen XML-Inhalten zu testen.</p>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px' 
      }}>
        <button 
          onClick={() => {
            setIsStreaming(true);
            setTimeout(() => setIsStreaming(false), 1000);
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b1c60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Streaming simulieren
        </button>
        
        <button 
          onClick={() => {
            setIsComplete(!isComplete);
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: isComplete ? '#3b1c60' : '#ff5a5f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {isComplete ? 'Als unvollständig markieren' : 'Als vollständig markieren'}
        </button>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px' 
      }}>
        <div style={{ 
          flex: '1', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <h2>XML-Inhalt</h2>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              height: '500px',
              fontFamily: 'monospace',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>
        
        <div style={{ 
          flex: '1', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <h2>Vorschau</h2>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: '#fff',
            minHeight: '500px'
          }}>
            <ShoppingMallMessage
              content={content}
              isStreaming={isStreaming}
              isComplete={isComplete}
              query="Wo finde ich Hosen?"
              colorStyle={{
                primaryColor: '#3b1c60',
                secondaryColor: '#ff5a5f'
              }}
            />
          </div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '8px' 
      }}>
        <h3>Debugging-Informationen:</h3>
        <ul>
          <li><strong>Streaming:</strong> {isStreaming ? 'Aktiv' : 'Inaktiv'}</li>
          <li><strong>Vollständig:</strong> {isComplete ? 'Ja' : 'Nein'}</li>
          <li><strong>Content-Länge:</strong> {content.length} Zeichen</li>
        </ul>
      </div>
    </div>
  );
}
