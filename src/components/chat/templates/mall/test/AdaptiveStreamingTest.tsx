'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdaptiveShopSlider from '../components/AdaptiveShopSlider';
import { ShopData } from '../components/ShopCard';

/**
 * Test-Komponente für den adaptiven Shop-Slider
 * 
 * Diese Komponente simuliert das Streaming von Shop-Daten und zeigt,
 * wie der adaptive Shop-Slider Layout-Sprünge vermeidet.
 */
const AdaptiveStreamingTest: React.FC = () => {
  const [shops, setShops] = useState<ShopData[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamingSpeed, setStreamingSpeed] = useState<number>(1000); // ms pro Shop
  const [maxShops, setMaxShops] = useState<number>(3);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Beispiel-Shops
  const allShops: ShopData[] = [
    {
      name: 'Zara',
      category: 'Mode & Bekleidung',
      floor: 'EG',
      opening: 'Mo-Sa: 10:00-20:00 Uhr',
      description: 'Trendige Mode für Damen, Herren und Kinder',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/1200px-Zara_Logo.svg.png'
    },
    {
      name: 'MediaMarkt',
      category: 'Elektronik',
      floor: '1. OG',
      opening: 'Mo-Sa: 9:30-20:00 Uhr',
      description: 'Große Auswahl an Elektronik und Haushaltsgeräten',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Mediamarkt_logo.svg/1200px-Mediamarkt_logo.svg.png'
    },
    {
      name: 'H&M',
      category: 'Mode & Bekleidung',
      floor: 'EG',
      opening: 'Mo-Sa: 10:00-20:00 Uhr',
      description: 'Mode und Accessoires für die ganze Familie',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1200px-H%26M-Logo.svg.png'
    },
    {
      name: 'Douglas',
      category: 'Parfümerie & Kosmetik',
      floor: '2. OG',
      opening: 'Mo-Sa: 10:00-19:00 Uhr',
      description: 'Parfüm, Make-up und Hautpflege',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Douglas-Logo.svg/1200px-Douglas-Logo.svg.png'
    },
    {
      name: 'Thalia',
      category: 'Bücher & Medien',
      floor: '1. OG',
      opening: 'Mo-Sa: 9:00-20:00 Uhr',
      description: 'Große Auswahl an Büchern, Spielen und Geschenkartikeln',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Thalia_Logo.svg/1200px-Thalia_Logo.svg.png'
    }
  ];
  
  // Starte das Streaming
  const startStreaming = () => {
    setShops([]);
    setIsStreaming(true);
    
    let currentIndex = 0;
    
    // Füge nach und nach Shops hinzu
    intervalRef.current = setInterval(() => {
      if (currentIndex < allShops.length) {
        setShops(prevShops => [...prevShops, allShops[currentIndex]]);
        currentIndex++;
      } else {
        // Beende das Streaming
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsStreaming(false);
      }
    }, streamingSpeed);
  };
  
  // Starte das Streaming beim ersten Laden
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
  
  const demoContainerStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  };
  
  const infoStyle: React.CSSProperties = {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  };
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Adaptiver Shop-Slider Test</h1>
        <p>Dieser Test zeigt, wie der adaptive Shop-Slider Layout-Sprünge vermeidet</p>
      </div>
      
      <div style={infoStyle}>
        <h3>Wie es funktioniert:</h3>
        <p>
          Der adaptive Shop-Slider zeigt sofort eine feste Anzahl von Platzhalter-Karten an und füllt sie
          dann nach und nach mit Daten, während diese gestreamt werden. Dadurch werden Layout-Sprünge vermieden.
        </p>
        <p>
          <strong>Vorteile:</strong>
        </p>
        <ul>
          <li>Keine Layout-Sprünge während des Streamings</li>
          <li>Sofortige visuelle Rückmeldung für den Benutzer</li>
          <li>Konsistentes Layout unabhängig von der Datenmenge</li>
        </ul>
      </div>
      
      <div style={controlsStyle}>
        <div>
          <strong>Status:</strong> {isStreaming ? 'Streaming...' : 'Abgeschlossen'}
          <br />
          <strong>Shops geladen:</strong> {shops.length} von {allShops.length}
        </div>
        
        <div style={sliderContainerStyle}>
          <span>Streaming-Geschwindigkeit:</span>
          <input 
            type="range" 
            min="500" 
            max="3000" 
            step="500"
            value={streamingSpeed}
            onChange={(e) => setStreamingSpeed(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span>{streamingSpeed} ms/Shop</span>
        </div>
        
        <div style={sliderContainerStyle}>
          <span>Max. Shops:</span>
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={maxShops}
            onChange={(e) => setMaxShops(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span>{maxShops}</span>
        </div>
        
        <button 
          onClick={() => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            startStreaming();
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
      
      <div style={demoContainerStyle}>
        <h2>Adaptiver Shop-Slider</h2>
        <AdaptiveShopSlider 
          title="Unsere Top-Shops"
          shops={shops}
          isStreaming={isStreaming}
          maxShops={maxShops}
          colorStyle={{
            primaryColor: '#3b1c60',
            secondaryColor: '#ff5a5f'
          }}
        />
      </div>
      
      <div style={infoStyle}>
        <h3>Technische Details:</h3>
        <p>
          Der adaptive Shop-Slider verwendet einen "Skeleton Loading" Ansatz mit vordefinierter Struktur:
        </p>
        <ol>
          <li>Wir kennen die Struktur des Sliders im Voraus (Shop-Logo, Meta-Infos, Text, Button)</li>
          <li>Wir erstellen diese Struktur sofort mit Platzhaltern</li>
          <li>Während des Streamings füllen wir nur die Inhalte der Platzhalter aus</li>
          <li>Die Gesamtstruktur bleibt stabil, nur die Inhalte ändern sich</li>
        </ol>
      </div>
    </div>
  );
};

export default AdaptiveStreamingTest;
