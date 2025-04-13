'use client';

import React, { useState, useEffect, useRef } from 'react';
import ShoppingMallMessage from '../ShoppingMallMessage';

/**
 * Test-Komponente für die Integration des Mall-Templates
 * 
 * Diese Komponente testet die Integration der FluidMallMessage in das ShoppingMallMessage-Template.
 */
const IntegrationTest: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('Welche Eisdielen gibt es im Center?');
  const [streamingSpeed, setStreamingSpeed] = useState<number>(50);
  const [selectedExample, setSelectedExample] = useState<string>('shops');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Beispiel-Inhalte
  const examples = {
    shops: `<intro>
Im Limbecker Platz gibt es mehrere Eisdielen und Cafés, die Eis anbieten. Die bekanntesten sind Eiscafé Cortina, San Marco Eis und Mövenpick Ice Cream. Diese befinden sich hauptsächlich im Food Court im 2. OG und im Erdgeschoss.
</intro>

<shops title="Eisdielen im Center">
<shop>
<name>Eiscafé Cortina</name>
<category>Eisdiele & Café</category>
<floor>2. OG (Food Court)</floor>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/e/8/csm_cortina_logo_a53b1d7c9f.jpg</image>
<description>Traditionelles italienisches Eiscafé mit großer Auswahl an hausgemachten Eissorten und Kaffeespezialitäten.</description>
<opening>Mo-Sa 10:00-20:00 Uhr</opening>
</shop>

<shop>
<name>San Marco Eis</name>
<category>Eisdiele</category>
<floor>EG (Haupteingang)</floor>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/3/2/csm_san_marco_logo_8b5a362df3.jpg</image>
<description>Italienische Eisspezialitäten mit über 30 verschiedenen Sorten und saisonalen Angeboten.</description>
<opening>Mo-Sa 9:30-20:00 Uhr</opening>
</shop>

<shop>
<name>Mövenpick Ice Cream</name>
<category>Premium Eisdiele</category>
<floor>1. OG</floor>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/a/7/csm_moevenpick_logo_d967267891.jpg</image>
<description>Premium-Eismarke mit exklusiven Sorten und Eisbechern in Schweizer Qualität.</description>
<opening>Mo-Sa 10:00-20:00 Uhr</opening>
</shop>
</shops>

<tip>
Tipp: Bei Eiscafé Cortina gibt es jeden Montag ein 2-für-1 Angebot auf alle Eisbecher. Perfekt für einen süßen Start in die Woche!
</tip>`,
    restaurants: `<intro>
Im Limbecker Platz finden Sie eine Vielzahl an Restaurants und Gastronomiebetrieben. Von Fast Food über asiatische Küche bis hin zu italienischen Spezialitäten ist für jeden Geschmack etwas dabei. Die meisten Restaurants befinden sich im Food Court im 2. OG.
</intro>

<restaurants title="Restaurants im Center">
<restaurant>
<name>Asia Gourmet</name>
<category>Asiatische Küche</category>
<floor>2. OG (Food Court)</floor>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/5/6/csm_asia_gourmet_logo_b9c7d8e3f1.jpg</image>
<description>Frische asiatische Gerichte wie Sushi, Wok-Gerichte und verschiedene Reisgerichte.</description>
<opening>Mo-Sa 10:00-20:00 Uhr</opening>
</restaurant>

<restaurant>
<name>L'Osteria</name>
<category>Italienisches Restaurant</category>
<floor>EG (Außenbereich)</floor>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/2/1/csm_losteria_logo_a6f3d7e9c2.jpg</image>
<description>Bekannt für riesige Pizzen mit 45 cm Durchmesser und hausgemachte Pasta-Gerichte.</description>
<opening>Mo-Sa 11:00-22:00 Uhr, So 12:00-21:00 Uhr</opening>
</restaurant>

<restaurant>
<name>McDonald's</name>
<category>Fast Food</category>
<floor>2. OG (Food Court)</floor>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/4/3/csm_mcdonalds_logo_f4e195a6d2.jpg</image>
<description>Klassisches Fast-Food-Restaurant mit Burgern, Pommes und mehr.</description>
<opening>Mo-Sa 9:00-20:00 Uhr</opening>
</restaurant>
</restaurants>

<tip>
Tipp: Im Food Court im 2. OG finden Sie alle Restaurants auf einer Ebene mit einer gemeinsamen Sitzfläche in der Mitte. Ideal für Gruppen, bei denen jeder etwas anderes essen möchte!
</tip>`,
    events: `<intro>
Im Limbecker Platz finden regelmäßig verschiedene Events und Veranstaltungen statt. Aktuell sind mehrere interessante Events geplant, darunter ein Modenschau-Wochenende, ein Kinderfest und eine Autogrammstunde mit lokalen Sportlern.
</intro>

<events title="Aktuelle Events im Center">
<event>
<name>Sommer-Modenschau</name>
<date>15.07.2023 - 16.07.2023</date>
<time>Jeweils 13:00, 15:00 und 17:00 Uhr</time>
<location>Hauptplatz (EG)</location>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/7/9/csm_modenschau_event_3a5b2c7e91.jpg</image>
<description>Präsentation der neuesten Sommertrends unserer Modehäuser mit professionellen Models und Styling-Tipps.</description>
</event>

<event>
<name>Kinderfest mit Clown Pippo</name>
<date>22.07.2023</date>
<time>11:00 - 18:00 Uhr</time>
<location>Kinderbereich (1. OG)</location>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/8/4/csm_kinderfest_event_d7e9a5f2c3.jpg</image>
<description>Ein Tag voller Spaß mit Clown Pippo, Kinderschminken, Bastelaktionen und einer Hüpfburg.</description>
</event>

<event>
<name>Autogrammstunde RWE</name>
<date>29.07.2023</date>
<time>14:00 - 16:00 Uhr</time>
<location>Sportbereich (1. OG)</location>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/1/2/csm_rwe_event_f8e3d9a7b2.jpg</image>
<description>Treffen Sie die Spieler von Rot-Weiss Essen und erhalten Sie Autogramme und Fotos mit Ihren Lieblingsspielern.</description>
</event>
</events>

<tip>
Tipp: Für das Kinderfest können Sie sich vorab an der Information im EG anmelden, um einen garantierten Platz für Ihr Kind bei den beliebten Bastelaktionen zu sichern!
</tip>`,
    openingHours: `<intro>
Das Einkaufszentrum Limbecker Platz hat reguläre Öffnungszeiten von Montag bis Samstag von 10:00 bis 20:00 Uhr. An Sonntagen ist das Center grundsätzlich geschlossen, mit Ausnahme von verkaufsoffenen Sonntagen, die etwa 2-4 Mal im Jahr stattfinden.
</intro>

<openingHours title="Öffnungszeiten">
<regular>
<day>Montag - Freitag</day>
<hours>10:00 - 20:00 Uhr</hours>
</regular>

<regular>
<day>Samstag</day>
<hours>10:00 - 20:00 Uhr</hours>
</regular>

<regular>
<day>Sonntag</day>
<hours>Geschlossen</hours>
</regular>

<special>
<date>Verkaufsoffener Sonntag (03.09.2023)</date>
<hours>13:00 - 18:00 Uhr</hours>
</special>

<special>
<date>Tag der Deutschen Einheit (03.10.2023)</date>
<hours>Geschlossen</hours>
</special>

<note>Einzelne Geschäfte wie Restaurants oder Cafés können abweichende Öffnungszeiten haben.</note>
<note>Der Zugang zu den Parkhäusern ist täglich von 6:00 bis 23:00 Uhr möglich.</note>
</openingHours>

<tip>
Tipp: An verkaufsoffenen Sonntagen ist das Parken im Parkhaus des Limbecker Platzes für die ersten 4 Stunden kostenlos!
</tip>`,
    parking: `<intro>
Das Limbecker Platz Einkaufszentrum verfügt über ein großes Parkhaus mit über 2.000 Stellplätzen auf mehreren Ebenen. Die Parkgebühren sind gestaffelt und richten sich nach der Parkdauer.
</intro>

<parking title="Parkgebühren">
<fee>
<duration>Erste Stunde</duration>
<price>1,50 €</price>
</fee>

<fee>
<duration>Zweite Stunde</duration>
<price>1,50 €</price>
</fee>

<fee>
<duration>Dritte Stunde</duration>
<price>2,00 €</price>
</fee>

<fee>
<duration>Jede weitere Stunde</duration>
<price>2,00 €</price>
</fee>

<fee>
<duration>Tageshöchstsatz</duration>
<price>15,00 €</price>
</fee>

<note>Mit der Limbecker Platz Kundenkarte erhalten Sie 10% Rabatt auf die Parkgebühren.</note>
<note>Bei einem Einkauf ab 50€ können Sie an der Information im EG einen Parkgutschein für 1 Stunde kostenloses Parken erhalten.</note>
<note>Das Parkhaus ist täglich von 6:00 bis 23:00 Uhr geöffnet.</note>
</parking>

<tip>
Tipp: Nutzen Sie die Parkleitsystem-App "Limbecker Parken", um in Echtzeit freie Parkplätze zu finden und Ihre Parkgebühren bequem per App zu bezahlen!
</tip>`,
    services: `<intro>
Das Limbecker Platz Einkaufszentrum bietet seinen Besuchern zahlreiche Services und Annehmlichkeiten, um den Einkauf so angenehm wie möglich zu gestalten. Von Kundeninformation über WLAN bis hin zu Schließfächern ist alles vorhanden.
</intro>

<services title="Services im Center">
<service>
<name>Kundeninformation</name>
<category>Information</category>
<location>Erdgeschoss (Haupteingang)</location>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/9/0/csm_info_service_a7d9e3f2c1.jpg</image>
<description>Zentrale Anlaufstelle für alle Fragen rund um das Center, Geschenkkarten, Parkgutscheine und mehr.</description>
</service>

<service>
<name>Kostenloses WLAN</name>
<category>Konnektivität</category>
<location>Im gesamten Center</location>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/2/3/csm_wifi_service_b8e7d9f3a2.jpg</image>
<description>Gratis WLAN-Zugang im gesamten Einkaufszentrum ohne Zeitlimit.</description>
</service>

<service>
<name>Schließfächer</name>
<category>Aufbewahrung</category>
<location>Untergeschoss (nahe Parkhaus-Eingang)</location>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/5/7/csm_locker_service_c9f8e2d4b3.jpg</image>
<description>Sichere Aufbewahrungsmöglichkeit für Einkäufe und persönliche Gegenstände in verschiedenen Größen.</description>
</service>

<service>
<name>Wickelräume</name>
<category>Familie</category>
<location>1. OG und 2. OG (nahe Toiletten)</location>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/6/8/csm_baby_service_d0e9f3e5c4.jpg</image>
<description>Komfortable Wickelräume mit Stillmöglichkeit, Mikrowelle zum Erwärmen von Babynahrung und Wickeltischen.</description>
</service>
</services>

<tip>
Tipp: An der Kundeninformation können Sie kostenlos einen Kinderwagen ausleihen - ideal, wenn Sie mit kleinen Kindern unterwegs sind und die Hände für Einkäufe frei haben möchten!
</tip>`,
    mixed: `<intro>
Im Limbecker Platz finden Sie alles für einen gelungenen Shopping-Tag. Das Center bietet eine große Auswahl an Modegeschäften, Restaurants und Services. Hier sind die wichtigsten Informationen zu Öffnungszeiten, Parkmöglichkeiten und aktuellen Angeboten.
</intro>

<shops title="Top-Shops im Center">
<shop>
<name>Zara</name>
<category>Mode & Bekleidung</category>
<floor>EG & 1. OG</floor>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/3/4/csm_zara_logo_e7f9d2a6b3.jpg</image>
<description>Internationale Modekette mit aktuellen Trends für Damen, Herren und Kinder.</description>
<opening>Mo-Sa 10:00-20:00 Uhr</opening>
</shop>

<shop>
<name>Saturn</name>
<category>Elektronik</category>
<floor>1. OG</floor>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/7/5/csm_saturn_logo_f8e3d9a7b2.jpg</image>
<description>Große Auswahl an Elektronik, Computern, Haushaltsgeräten und Unterhaltungselektronik.</description>
<opening>Mo-Sa 10:00-20:00 Uhr</opening>
</shop>
</shops>

<restaurants title="Gastronomie-Highlights">
<restaurant>
<name>L'Osteria</name>
<category>Italienisches Restaurant</category>
<floor>EG (Außenbereich)</floor>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/2/1/csm_losteria_logo_a6f3d7e9c2.jpg</image>
<description>Bekannt für riesige Pizzen mit 45 cm Durchmesser und hausgemachte Pasta-Gerichte.</description>
<opening>Mo-Sa 11:00-22:00 Uhr, So 12:00-21:00 Uhr</opening>
</restaurant>
</restaurants>

<events title="Aktuelle Events">
<event>
<name>Sommer-Modenschau</name>
<date>15.07.2023 - 16.07.2023</date>
<time>Jeweils 13:00, 15:00 und 17:00 Uhr</time>
<location>Hauptplatz (EG)</location>
<image>https://www.limbecker-platz.de/fileadmin/_processed_/7/9/csm_modenschau_event_3a5b2c7e91.jpg</image>
<description>Präsentation der neuesten Sommertrends unserer Modehäuser.</description>
</event>
</events>

<openingHours title="Öffnungszeiten">
<regular>
<day>Montag - Samstag</day>
<hours>10:00 - 20:00 Uhr</hours>
</regular>

<regular>
<day>Sonntag</day>
<hours>Geschlossen</hours>
</regular>
</openingHours>

<parking title="Parkgebühren">
<fee>
<duration>Erste Stunde</duration>
<price>1,50 €</price>
</fee>

<fee>
<duration>Jede weitere Stunde</duration>
<price>1,50 €</price>
</fee>
</parking>

<tip>
Tipp: Besuchen Sie unsere Kundeninformation im Erdgeschoss für Centerplan, Geschenkgutscheine und aktuelle Angebote. Bei einem Einkauf ab 50€ erhalten Sie dort auch einen Parkgutschein für 1 Stunde kostenloses Parken!
</tip>`
  };
  
  // Starte das Streaming
  const startStreaming = () => {
    setContent('');
    setIsStreaming(true);
    setIsComplete(false);
    
    const selectedContent = examples[selectedExample as keyof typeof examples];
    let currentIndex = 0;
    
    // Füge nach und nach Zeichen hinzu
    intervalRef.current = setInterval(() => {
      if (currentIndex < selectedContent.length) {
        const charsToAdd = Math.min(
          Math.max(1, Math.floor(Math.random() * streamingSpeed)), 
          selectedContent.length - currentIndex
        );
        
        setContent(prevContent => prevContent + selectedContent.substring(currentIndex, currentIndex + charsToAdd));
        currentIndex += charsToAdd;
      } else {
        // Beende das Streaming
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsStreaming(false);
        setIsComplete(true);
      }
    }, 10);
  };
  
  // Stoppe das Streaming beim Unmount
  useEffect(() => {
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
  
  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
    flexWrap: 'wrap',
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
  const getButtonStyle = (example: string): React.CSSProperties => ({
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: selectedExample === example ? '#3b1c60' : '#e0e0e0',
    color: selectedExample === example ? 'white' : 'black',
    fontWeight: selectedExample === example ? 'bold' : 'normal',
  });
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Mall-Template Integrationstest</h1>
        <p>Dieser Test zeigt die Integration der FluidMallMessage in das ShoppingMallMessage-Template</p>
      </div>
      
      <div style={infoStyle}>
        <h3>Wie es funktioniert:</h3>
        <p>
          Die ShoppingMallMessage-Komponente verwendet jetzt die FluidMallMessage-Komponente für ein optimiertes
          Streaming-Erlebnis ohne Flackern oder Layout-Sprünge.
        </p>
        <p>
          <strong>Vorteile:</strong>
        </p>
        <ul>
          <li>Keine Layout-Sprünge während des Streamings</li>
          <li>Sofortige visuelle Rückmeldung für den Benutzer</li>
          <li>Konsistentes Layout unabhängig von der Datenmenge</li>
          <li>Shimmer-Effekt für Platzhalter</li>
          <li>Gestaffelte Animationen für flüssigere Übergänge</li>
        </ul>
      </div>
      
      <div style={controlsStyle}>
        <div>
          <strong>Status:</strong> {isStreaming ? 'Streaming...' : 'Abgeschlossen'}
          <br />
          <strong>Content-Länge:</strong> {content.length} Zeichen
        </div>
        
        <div style={buttonGroupStyle}>
          <strong>Beispiel-Inhalt:</strong>
          <button 
            style={getButtonStyle('shops')}
            onClick={() => setSelectedExample('shops')}
          >
            Shops
          </button>
          
          <button 
            style={getButtonStyle('restaurants')}
            onClick={() => setSelectedExample('restaurants')}
          >
            Restaurants
          </button>
          
          <button 
            style={getButtonStyle('events')}
            onClick={() => setSelectedExample('events')}
          >
            Events
          </button>
          
          <button 
            style={getButtonStyle('openingHours')}
            onClick={() => setSelectedExample('openingHours')}
          >
            Öffnungszeiten
          </button>
          
          <button 
            style={getButtonStyle('parking')}
            onClick={() => setSelectedExample('parking')}
          >
            Parkgebühren
          </button>
          
          <button 
            style={getButtonStyle('services')}
            onClick={() => setSelectedExample('services')}
          >
            Services
          </button>
          
          <button 
            style={getButtonStyle('mixed')}
            onClick={() => setSelectedExample('mixed')}
          >
            Gemischt
          </button>
        </div>
        
        <div style={sliderContainerStyle}>
          <span>Streaming-Geschwindigkeit:</span>
          <input 
            type="range" 
            min="1" 
            max="100" 
            step="1"
            value={streamingSpeed}
            onChange={(e) => setStreamingSpeed(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span>{streamingSpeed} Zeichen/Tick</span>
        </div>
        
        <div style={sliderContainerStyle}>
          <span>Anfrage:</span>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          />
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
          Streaming starten
        </button>
      </div>
      
      <div style={demoContainerStyle}>
        <h2>Mall-Template</h2>
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
      
      <div style={infoStyle}>
        <h3>Technische Details:</h3>
        <p>
          Die Integration verwendet folgende Komponenten:
        </p>
        <ol>
          <li><strong>ShoppingMallMessage:</strong> Die Hauptkomponente, die in der Anwendung verwendet wird</li>
          <li><strong>useMallContentStreaming:</strong> Ein Hook, der den Content parst und in Sektionen aufteilt</li>
          <li><strong>FluidMallMessage:</strong> Die optimierte Komponente für flüssiges Streaming</li>
          <li><strong>Fluid*-Komponenten:</strong> Spezialisierte Komponenten für verschiedene Inhaltstypen</li>
        </ol>
      </div>
    </div>
  );
};

export default IntegrationTest;
