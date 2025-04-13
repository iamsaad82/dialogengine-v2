'use client';

import React, { useState, useEffect, useRef } from 'react';
import ShoppingMallMessage from '../ShoppingMallMessage';

/**
 * Direkter Test für das Mall-Template mit echten Daten
 * Verwendet direkt die XML-Tags, die vom Parser erwartet werden
 */
const DirectMallTest: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [selectedTest, setSelectedTest] = useState<string>('eis');
  const [streamingSpeed, setStreamingSpeed] = useState<number>(50); // Zeichen pro Intervall
  const [streamingInterval, setStreamingInterval] = useState<number>(30); // ms
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Testdaten für Eis-Shops
  const eisContent = `
<intro>
Klar, ich beantworte deine Frage sehr gern! Im Shopping Center gibt es gleich mehrere tolle Eisläden, die dir ein leckeres Eis servieren werden.
</intro>

<shops title="Unsere Eis-Shops">
<shop>
<name>Eislab</name>
<category>Umweltfreundliches Eis</category>
<floor>1. OG</floor>
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Baskin-Robbins_logo.svg/1200px-Baskin-Robbins_logo.svg.png</image>
<description>Umweltfreundliches Eis aus biologischem Anbau</description>
<opening>Mo-Sa: 10:00-20:00 Uhr</opening>
</shop>

<shop>
<name>Langnese Happiness Station</name>
<category>Softeis</category>
<floor>Untergeschoss</floor>
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Haagen-Dazs_Logo.svg/1200px-Haagen-Dazs_Logo.svg.png</image>
<description>Softeis zum Selbstgestalten</description>
<opening>Mo-Sa: 9:00-21:00 Uhr</opening>
</shop>

<shop>
<name>Eiscafé Venezia</name>
<category>Traditionelles Eiscafé</category>
<floor>1. OG</floor>
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Ben_%26_Jerry%27s_logo.svg/1200px-Ben_%26_Jerry%27s_logo.svg.png</image>
<description>Traditionelles Eiscafé mit italienischen Spezialitäten</description>
<opening>Mo-So: 9:00-22:00 Uhr</opening>
</shop>

<shop>
<name>Frooters</name>
<category>Frozen Yogurt</category>
<floor>Erdgeschoss</floor>
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Magnum_ice_cream_logo.svg/1200px-Magnum_ice_cream_logo.svg.png</image>
<description>Frozen Yogurt und Eiskreationen</description>
<opening>Mo-Sa: 10:00-20:00 Uhr</opening>
</shop>
</shops>

<tip>
Tipp: Bei der Langnese Happiness Station kannst du dein Eis selbst zusammenstellen - von Toppings bis Saucen ist alles möglich!
</tip>
`;

  // Testdaten für Restaurants
  const restaurantContent = `
<intro>
Im Shopping Center findest du eine große Auswahl an Restaurants und Cafés für jeden Geschmack. Hier ist eine Übersicht der beliebtesten Gastronomiebetriebe:
</intro>

<restaurants title="Unsere Restaurants">
<restaurant>
<name>Vapiano</name>
<category>Italienisch</category>
<floor>2. OG</floor>
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Logo_Vapiano.svg/1200px-Logo_Vapiano.svg.png</image>
<description>Frische italienische Küche mit Pasta, Pizza und Salaten</description>
<opening>Mo-Sa: 11:00-22:00 Uhr, So: 12:00-21:00 Uhr</opening>
</restaurant>

<restaurant>
<name>Asia Wok</name>
<category>Asiatisch</category>
<floor>Erdgeschoss</floor>
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Panda_Express_logo.svg/1200px-Panda_Express_logo.svg.png</image>
<description>Authentische asiatische Gerichte frisch zubereitet</description>
<opening>Mo-Sa: 11:00-21:00 Uhr</opening>
</restaurant>

<restaurant>
<name>Burger King</name>
<category>Fast Food</category>
<floor>Untergeschoss</floor>
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/1200px-Burger_King_logo_%281999%29.svg.png</image>
<description>Klassische Burger und Snacks</description>
<opening>Mo-Sa: 9:00-22:00 Uhr, So: 10:00-21:00 Uhr</opening>
</restaurant>

<restaurant>
<name>Café Central</name>
<category>Café & Konditorei</category>
<floor>1. OG</floor>
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png</image>
<description>Kaffee, Kuchen und kleine Snacks in gemütlicher Atmosphäre</description>
<opening>Mo-Sa: 9:00-20:00 Uhr, So: 10:00-18:00 Uhr</opening>
</restaurant>

<restaurant>
<name>Sushi Bar</name>
<category>Japanisch</category>
<floor>2. OG</floor>
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Yoshinoya_logo.svg/1200px-Yoshinoya_logo.svg.png</image>
<description>Frisches Sushi und japanische Spezialitäten</description>
<opening>Mo-Sa: 11:00-21:00 Uhr</opening>
</restaurant>
</restaurants>

<tip>
Tipp: Im 2. OG findest du unsere Food-Court-Area mit vielen weiteren Gastronomieangeboten und gemeinsamen Sitzplätzen.
</tip>
`;

  // Testdaten für Öffnungszeiten
  const openingHoursContent = `
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
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Rewe_Logo.svg/1200px-Rewe_Logo.svg.png</image>
<description>Supermarkt mit verlängerten Öffnungszeiten</description>
<opening>Mo-Sa: 7:00-22:00 Uhr</opening>
</shop>

<shop>
<name>Fitness First</name>
<category>Fitness & Sport</category>
<floor>3. OG</floor>
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/McFIT_Logo.svg/1200px-McFIT_Logo.svg.png</image>
<description>Modernes Fitnessstudio mit Kursangeboten</description>
<opening>Mo-Fr: 6:00-23:00 Uhr, Sa-So: 9:00-21:00 Uhr</opening>
</shop>

<shop>
<name>Cineplex Kino</name>
<category>Entertainment</category>
<floor>4. OG</floor>
<image>https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/UCI_Kinowelt.svg/1200px-UCI_Kinowelt.svg.png</image>
<description>Modernes Multiplex-Kino</description>
<opening>Mo-So: 14:00-23:00 Uhr</opening>
</shop>
</shops>

<tip>
Tipp: An Feiertagen können abweichende Öffnungszeiten gelten. Bitte informiere dich vor deinem Besuch auf unserer Website oder telefonisch.
</tip>
`;

  // Simuliere Streaming-Verhalten mit zeichenweisem Hinzufügen
  const startStreaming = (fullContent: string) => {
    // Zurücksetzen des Inhalts und Status
    setContent('');
    setIsStreaming(true);
    setIsComplete(false);
    
    // Bestehende Intervalle löschen
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
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

  // Starte Streaming beim ersten Laden oder wenn sich der ausgewählte Test ändert
  useEffect(() => {
    let contentToStream = '';
    
    // Wähle den richtigen Inhalt basierend auf dem ausgewählten Test
    switch (selectedTest) {
      case 'eis':
        contentToStream = eisContent;
        break;
      case 'restaurant':
        contentToStream = restaurantContent;
        break;
      case 'opening':
        contentToStream = openingHoursContent;
        break;
      default:
        contentToStream = eisContent;
    }
    
    // Starte Streaming mit dem ausgewählten Inhalt
    startStreaming(contentToStream);
    
    // Cleanup beim Unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedTest]);

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

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
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

  // Button-Stil mit aktivem Zustand
  const getButtonStyle = (testType: string): React.CSSProperties => ({
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: selectedTest === testType ? '#3b1c60' : '#e0e0e0',
    color: selectedTest === testType ? 'white' : 'black',
    fontWeight: selectedTest === testType ? 'bold' : 'normal',
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Direkter Mall-Template Test</h1>
        <p>Dieser Test verwendet direkt die XML-Tags, die vom Parser erwartet werden</p>
      </div>
      
      <div style={controlsStyle}>
        <div>
          <strong>Testdaten auswählen:</strong>
        </div>
        
        <div style={buttonGroupStyle}>
          <button 
            style={getButtonStyle('eis')}
            onClick={() => setSelectedTest('eis')}
          >
            Eis-Shops
          </button>
          
          <button 
            style={getButtonStyle('restaurant')}
            onClick={() => setSelectedTest('restaurant')}
          >
            Restaurants
          </button>
          
          <button 
            style={getButtonStyle('opening')}
            onClick={() => setSelectedTest('opening')}
          >
            Öffnungszeiten
          </button>
        </div>
        
        <div>
          <strong>Status:</strong> {isStreaming ? 'Streaming...' : 'Abgeschlossen'}
          <br />
          <strong>Fortschritt:</strong> {
            selectedTest === 'eis' 
              ? Math.round((content.length / eisContent.length) * 100)
              : selectedTest === 'restaurant'
                ? Math.round((content.length / restaurantContent.length) * 100)
                : Math.round((content.length / openingHoursContent.length) * 100)
          }%
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
            max="200" 
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
            // Starte Streaming mit dem aktuell ausgewählten Inhalt neu
            let contentToStream = '';
            switch (selectedTest) {
              case 'eis':
                contentToStream = eisContent;
                break;
              case 'restaurant':
                contentToStream = restaurantContent;
                break;
              case 'opening':
                contentToStream = openingHoursContent;
                break;
              default:
                contentToStream = eisContent;
            }
            startStreaming(contentToStream);
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
          Neu starten
        </button>
      </div>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
        <ShoppingMallMessage 
          content={content}
          isStreaming={isStreaming}
          isComplete={isComplete}
          query={
            selectedTest === 'eis' 
              ? 'Wo gibt es Eis im Shopping Center?'
              : selectedTest === 'restaurant'
                ? 'Welche Restaurants gibt es im Shopping Center?'
                : 'Wann hat das Shopping Center geöffnet?'
          }
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
        <p>Öffnungszeiten-Sektion vorhanden: {content.includes('<openingHours') ? 'Ja' : 'Nein'}</p>
      </div>
    </div>
  );
};

export default DirectMallTest;
