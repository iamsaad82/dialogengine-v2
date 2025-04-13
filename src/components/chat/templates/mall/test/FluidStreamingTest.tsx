'use client';

import React, { useState, useEffect, useRef } from 'react';
import FluidShopSlider from '../components/FluidShopSlider';
import { ShopData } from '../components/ShopCard';

/**
 * Test-Komponente für den flüssigen Shop-Slider
 * 
 * Diese Komponente demonstriert das optimierte Streaming-Verhalten
 * des FluidShopSlider mit fortschrittlichen Animationstechniken.
 */
const FluidStreamingTest: React.FC = () => {
  const [shops, setShops] = useState<ShopData[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamingSpeed, setStreamingSpeed] = useState<number>(800); // ms pro Shop
  const [streamingMode, setStreamingMode] = useState<'sequential' | 'batch'>('sequential');
  const [maxShops, setMaxShops] = useState<number>(3);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Beispiel-Shops mit echten Logos
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
  
  // Starte das Streaming im sequentiellen Modus
  const startSequentialStreaming = () => {
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
  
  // Starte das Streaming im Batch-Modus
  const startBatchStreaming = () => {
    setShops([]);
    setIsStreaming(true);
    
    // Simuliere Batch-Streaming mit mehreren Phasen
    setTimeout(() => {
      // Erste Phase: Erste 2 Shops
      setShops(allShops.slice(0, 2));
      
      // Zweite Phase: Alle Shops
      setTimeout(() => {
        setShops(allShops);
        setIsStreaming(false);
      }, streamingSpeed * 1.5);
    }, streamingSpeed);
  };
  
  // Starte das Streaming basierend auf dem ausgewählten Modus
  const startStreaming = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (streamingMode === 'sequential') {
      startSequentialStreaming();
    } else {
      startBatchStreaming();
    }
  };
  
  // Starte das Streaming beim ersten Laden
  useEffect(() => {
    startStreaming();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [streamingMode, streamingSpeed]);
  
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
  
  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
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
  
  // Button-Stil mit aktivem Zustand
  const getButtonStyle = (mode: string): React.CSSProperties => ({
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: streamingMode === mode ? '#3b1c60' : '#e0e0e0',
    color: streamingMode === mode ? 'white' : 'black',
    fontWeight: streamingMode === mode ? 'bold' : 'normal',
  });
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Flüssiger Shop-Slider Test</h1>
        <p>Dieser Test demonstriert das optimierte Streaming-Verhalten mit fortschrittlichen Animationstechniken</p>
      </div>
      
      <div style={infoStyle}>
        <h3>Verbesserungen gegenüber dem adaptiven Slider:</h3>
        <ul>
          <li><strong>Sanftere Übergänge:</strong> Gestaffelte CSS-Transitions für flüssigere Animationen</li>
          <li><strong>Shimmer-Effekt:</strong> Animierte Platzhalter für besseres visuelles Feedback</li>
          <li><strong>Optimierte Performance:</strong> Verwendung von will-change und CSS-Variablen</li>
          <li><strong>Intelligente Bildladung:</strong> Vorladung und sanftes Einblenden von Bildern</li>
          <li><strong>Verschiedene Streaming-Modi:</strong> Sequentiell oder in Batches</li>
        </ul>
      </div>
      
      <div style={controlsStyle}>
        <div>
          <strong>Status:</strong> {isStreaming ? 'Streaming...' : 'Abgeschlossen'}
          <br />
          <strong>Shops geladen:</strong> {shops.length} von {allShops.length}
        </div>
        
        <div style={buttonGroupStyle}>
          <strong>Streaming-Modus:</strong>
          <button 
            style={getButtonStyle('sequential')}
            onClick={() => {
              setStreamingMode('sequential');
              startSequentialStreaming();
            }}
          >
            Sequentiell
          </button>
          
          <button 
            style={getButtonStyle('batch')}
            onClick={() => {
              setStreamingMode('batch');
              startBatchStreaming();
            }}
          >
            Batch
          </button>
        </div>
        
        <div style={sliderContainerStyle}>
          <span>Streaming-Geschwindigkeit:</span>
          <input 
            type="range" 
            min="300" 
            max="2000" 
            step="100"
            value={streamingSpeed}
            onChange={(e) => setStreamingSpeed(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span>{streamingSpeed} ms</span>
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
          onClick={startStreaming}
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
        <h2>Flüssiger Shop-Slider</h2>
        <FluidShopSlider 
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
          Der flüssige Shop-Slider verwendet fortschrittliche Techniken für ein optimales Streaming-Erlebnis:
        </p>
        <ol>
          <li><strong>Gestaffelte Animationen:</strong> Jede Karte wird mit einer leichten Verzögerung animiert</li>
          <li><strong>CSS-Transitions:</strong> Sanfte Übergänge werden durch CSS statt JavaScript gesteuert</li>
          <li><strong>Shimmer-Effekt:</strong> Animierte Platzhalter geben visuelles Feedback während des Ladens</li>
          <li><strong>Optimierte Rendering-Performance:</strong> Verwendung von will-change und CSS-Variablen</li>
          <li><strong>Intelligente Bildladung:</strong> Bilder werden vorgeladen und sanft eingeblendet</li>
        </ol>
        <p>
          <strong>Streaming-Modi:</strong>
        </p>
        <ul>
          <li><strong>Sequentiell:</strong> Shops werden nacheinander hinzugefügt (wie in einer echten Streaming-Umgebung)</li>
          <li><strong>Batch:</strong> Shops werden in Gruppen hinzugefügt (simuliert Batch-Verarbeitung vom Server)</li>
        </ul>
      </div>
    </div>
  );
};

export default FluidStreamingTest;
