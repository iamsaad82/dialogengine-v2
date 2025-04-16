'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export type ShopData = {
  name: string;
  description: string;
  details?: string; // Zusätzliche Details (optional)
  location?: string; // Standort im Mall (optional)
  level?: string; // Etage (optional)
  openingHours?: string; // Öffnungszeiten (optional)
  specialOffer?: string; // Spezialangebot (optional)
  imageUrl?: string; // URL für ein Bild (optional)
};

export type EventData = {
  name: string;
  description: string;
  date?: string; // Datum des Events (optional)
  time?: string; // Uhrzeit des Events (optional)
  location?: string; // Ort des Events (optional)
  imageUrl?: string; // URL für ein Bild (optional)
};

// Interface für Parkgebühren
export interface ParkingFeeItem {
  duration: string;
  price: string;
}

// Interface für Parkinformationen
export interface ParkingData {
  fees: ParkingFeeItem[];
  notes: string[];
}

// Interface für reguläre Öffnungszeiten
export interface OpeningHoursItem {
  day: string;
  hours: string;
}

// Interface für Sonderöffnungszeiten
export interface SpecialOpeningHoursItem {
  date: string;
  hours: string;
  note?: string;
}

// Interface für Öffnungszeiten-Daten
export interface OpeningHoursData {
  regular: OpeningHoursItem[];
  special: SpecialOpeningHoursItem[];
}

export interface SmartChunkProcessorResult {
  intro: string;
  shops: ShopData[];
  restaurants: ShopData[];
  events: EventData[];
  tip: string;
  followUp: string;
  parking: ParkingData | null;
  openingHours: OpeningHoursData | null;
  progress: number;
  hasError: boolean;
  rawContent: string;
}

/**
 * Smart Chunk Processor Hook
 * 
 * Optimiert für das Flowise-Chunk-Format <chunk type="TYPE">CONTENT</chunk>
 * mit optimaler Performance und flüssigem Rendering während des Streamings.
 */
export function useSmartChunkProcessor(
  content: string,
  isStreaming: boolean,
  query: string = ''
): SmartChunkProcessorResult {
  // States für verschiedene Chunk-Typen
  const [intro, setIntro] = useState<string>('');
  const [shops, setShops] = useState<ShopData[]>([]);
  const [restaurants, setRestaurants] = useState<ShopData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [tip, setTip] = useState<string>('');
  const [followUp, setFollowUp] = useState<string>('');
  const [parking, setParking] = useState<ParkingData | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHoursData | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  
  // States für die Sichtbarkeit aller Komponenten - Default auf true für bessere Fehlersuche
  const [introVisible, setIntroVisible] = useState<boolean>(true);
  const [shopsVisible, setShopsVisible] = useState<boolean>(true);
  const [restaurantsVisible, setRestaurantsVisible] = useState<boolean>(true);
  const [eventsVisible, setEventsVisible] = useState<boolean>(true);
  const [tipVisible, setTipVisible] = useState<boolean>(true);
  const [followUpVisible, setFollowUpVisible] = useState<boolean>(true);
  const [parkingVisible, setParkingVisible] = useState<boolean>(true);
  
  // Roher Content für Fallback
  const [rawContent, setRawContent] = useState<string>('');

  // DEBUG-MODUS aktivieren, um zu sehen, ob überhaupt etwas geladen wird
  const DEBUG_MODE = false;

  // Refs für interne Zustandsverwaltung
  const previousContentRef = useRef<string>('');
  
  // ULTRA-EINFACHER DIREKT-SETUP EFFEKT
  useEffect(() => {
    console.log("===== SMARTHOOK DIREKT-EFFEKT =====");
    console.log("Content-Länge:", content?.length || 0);
    console.log("Content-Vorschau:", content?.substring(0, 100));
    
    // Inhalte nur aktualisieren, wenn neuer Content vorhanden ist
    if (content !== previousContentRef.current && content) {
      console.log("NEUER CONTENT ERKANNT - DIREKTES PROCESSING");
      previousContentRef.current = content;
      
      // DIREKT-PARSING VON CHUNKS
      try {
        // IMMER den Rohinhalt setzen
        setRawContent(content);
        
        // Progress setzen
        setProgress(isStreaming ? 50 : 100);
        
        // EXTREM VEREINFACHTES PARSING
        const introStart = content.indexOf('<chunk type="intro">');
        if (introStart >= 0) {
          const startPos = introStart + '<chunk type="intro">'.length;
          const endPos = content.indexOf('</chunk>', startPos);
          if (endPos > startPos) {
            const introText = content.substring(startPos, endPos).trim();
            console.log("INTRO GEFUNDEN:", introText.substring(0, 30) + "...");
            setIntro(introText);
          } else {
            console.log("WARNUNG: Intro-End-Tag nicht gefunden");
          }
        } else {
          console.log("WARNUNG: Kein Intro-Chunk gefunden");
          
          // FALLBACK: Plain Text als Intro
          const plainText = content.replace(/<\/?chunk[^>]*>/g, '')
                                  .replace(/NAME:|CATEGORY:|FLOOR:|DESCRIPTION:|LOGO:/g, '')
                                  .trim();
          if (plainText) {
            console.log("FALLBACK-TEXT:", plainText.substring(0, 30) + "...");
            setIntro(plainText);
          }
        }
        
        // OPENINGHOURS PARSING (VEREINFACHT)
        const openingHoursStart = content.indexOf('<chunk type="openingHours">');
        if (openingHoursStart >= 0) {
          const startPos = openingHoursStart + '<chunk type="openingHours">'.length;
          const endPos = content.indexOf('</chunk>', startPos);
          if (endPos > startPos) {
            const openingHoursContent = content.substring(startPos, endPos).trim();
            console.log("OPENINGHOURS GEFUNDEN:", openingHoursContent.substring(0, 30) + "...");
            
            // Parsen der Öffnungszeiten
            const regularMatch = openingHoursContent.match(/REGULAR:([\s\S]*?)(?:SPECIAL:|$)/);
            const specialMatch = openingHoursContent.match(/SPECIAL:([\s\S]*?)$/);
            
            const regularContent = regularMatch ? regularMatch[1].trim() : '';
            const specialContent = specialMatch ? specialMatch[1].trim() : '';
            
            // Reguläre Öffnungszeiten parsen
            const regularItems: OpeningHoursItem[] = [];
            if (regularContent) {
              const regularLines = regularContent.split('\n');
              regularLines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('-')) {
                  const itemParts = trimmedLine.substring(1).trim().split('|');
                  if (itemParts.length >= 2) {
                    const dayMatch = itemParts[0].match(/DAY: (.*)/);
                    const hoursMatch = itemParts[1].match(/HOURS: (.*)/);
                    
                    if (dayMatch && hoursMatch) {
                      regularItems.push({
                        day: dayMatch[1].trim(),
                        hours: hoursMatch[1].trim()
                      });
                    }
                  }
                }
              });
            }
            
            // Sonderöffnungszeiten parsen
            const specialItems: SpecialOpeningHoursItem[] = [];
            if (specialContent) {
              const specialLines = specialContent.split('\n');
              specialLines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('-')) {
                  const itemParts = trimmedLine.substring(1).trim().split('|');
                  if (itemParts.length >= 2) {
                    const dateMatch = itemParts[0].match(/DATE: (.*)/);
                    const hoursMatch = itemParts[1].match(/HOURS: (.*)/);
                    const noteMatch = itemParts.length > 2 ? itemParts[2].match(/NOTE: (.*)/) : null;
                    
                    if (dateMatch && hoursMatch) {
                      specialItems.push({
                        date: dateMatch[1].trim(),
                        hours: hoursMatch[1].trim(),
                        note: noteMatch ? noteMatch[1].trim() : undefined
                      });
                    }
                  }
                }
              });
            }
            
            // Öffnungszeiten setzen
            if (regularItems.length > 0 || specialItems.length > 0) {
              setOpeningHours({
                regular: regularItems,
                special: specialItems
              });
              console.log(`ÖFFNUNGSZEITEN GEFUNDEN: ${regularItems.length} reguläre, ${specialItems.length} spezielle`);
            }
          } else {
            console.log("WARNUNG: OpeningHours-End-Tag nicht gefunden");
          }
        }
        
        // PARKING PARSING (VEREINFACHT)
        const parkingStart = content.indexOf('<chunk type="parking">');
        if (parkingStart >= 0) {
          const startPos = parkingStart + '<chunk type="parking">'.length;
          const endPos = content.indexOf('</chunk>', startPos);
          if (endPos > startPos) {
            const parkingContent = content.substring(startPos, endPos).trim();
            console.log("PARKING GEFUNDEN:", parkingContent.substring(0, 30) + "...");
            
            // Parsen des Parking-Inhalts
            const feesMatch = parkingContent.match(/FEES:([\s\S]*?)(?:NOTES:|$)/);
            const notesMatch = parkingContent.match(/NOTES:([\s\S]*?)$/);
            
            const fees = feesMatch ? feesMatch[1].trim() : '';
            const notes = notesMatch ? notesMatch[1].trim() : '';
            
            // Strukturiertes Parsen der Gebühren
            const feeItems: ParkingFeeItem[] = [];
            if (fees) {
              const feeLines = fees.split('\n');
              feeLines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('-')) {
                  const itemParts = trimmedLine.substring(1).trim().split('|');
                  if (itemParts.length === 2) {
                    const durationMatch = itemParts[0].match(/DURATION: (.*)/);
                    const priceMatch = itemParts[1].match(/PRICE: (.*)/);
                    
                    if (durationMatch && priceMatch) {
                      feeItems.push({
                        duration: durationMatch[1].trim(),
                        price: priceMatch[1].trim()
                      });
                    }
                  }
                }
              });
            }
            
            // Strukturiertes Parsen der Hinweise
            const noteItems: string[] = [];
            if (notes) {
              const noteLines = notes.split('\n');
              noteLines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('-')) {
                  noteItems.push(trimmedLine.substring(1).trim());
                }
              });
            }
            
            setParking({
              fees: feeItems,
              notes: noteItems
            });
            setParkingVisible(true);
          } else {
            console.log("WARNUNG: Parking-End-Tag nicht gefunden");
          }
        }
        
        // TIP PARSING (VEREINFACHT)
        const tipStart = content.indexOf('<chunk type="tip">');
        if (tipStart >= 0) {
          const startPos = tipStart + '<chunk type="tip">'.length;
          const endPos = content.indexOf('</chunk>', startPos);
          if (endPos > startPos) {
            const tipText = content.substring(startPos, endPos).trim();
            console.log("TIP GEFUNDEN:", tipText.substring(0, 30) + "...");
            setTip(tipText);
          } else {
            console.log("WARNUNG: Tip-End-Tag nicht gefunden");
          }
        }
        
        // FOLLOWUP PARSING (VEREINFACHT)
        const followUpStart = content.indexOf('<chunk type="followUp">');
        if (followUpStart >= 0) {
          const startPos = followUpStart + '<chunk type="followUp">'.length;
          const endPos = content.indexOf('</chunk>', startPos);
          if (endPos > startPos) {
            const followUpText = content.substring(startPos, endPos).trim();
            console.log("FOLLOWUP GEFUNDEN:", followUpText.substring(0, 30) + "...");
            setFollowUp(followUpText);
          } else {
            console.log("WARNUNG: FollowUp-End-Tag nicht gefunden");
          }
        }
        
        // RESTAURANT PARSING (VEREINFACHT)
        const restaurantMatches = content.matchAll(/<chunk type="restaurant">([\s\S]*?)<\/chunk>/g);
        let restaurantList: ShopData[] = [];
        
        for (const match of restaurantMatches) {
          const restaurantContent = match[1];
          const name = extractSimpleValue(restaurantContent, 'NAME');
          if (name) {
            console.log("RESTAURANT GEFUNDEN:", name);
            restaurantList.push({
              name,
              description: extractSimpleValue(restaurantContent, 'DESCRIPTION'),
              details: extractSimpleValue(restaurantContent, 'CATEGORY'),
              level: extractSimpleValue(restaurantContent, 'FLOOR'),
              imageUrl: extractSimpleValue(restaurantContent, 'LOGO')
            });
          }
        }
        
        if (restaurantList.length > 0) {
          console.log(`${restaurantList.length} RESTAURANTS GEFUNDEN`);
          setRestaurants(restaurantList);
        }
        
        // SHOP PARSING (VEREINFACHT)
        const shopMatches = content.matchAll(/<chunk type="shop">([\s\S]*?)<\/chunk>/g);
        let shopList: ShopData[] = [];
        
        for (const match of shopMatches) {
          const shopContent = match[1];
          const name = extractSimpleValue(shopContent, 'NAME');
          if (name) {
            console.log("SHOP GEFUNDEN:", name);
            shopList.push({
              name,
              description: extractSimpleValue(shopContent, 'DESCRIPTION'),
              details: extractSimpleValue(shopContent, 'CATEGORY'),
              level: extractSimpleValue(shopContent, 'FLOOR'),
              imageUrl: extractSimpleValue(shopContent, 'LOGO')
            });
          }
        }
        
        if (shopList.length > 0) {
          console.log(`${shopList.length} SHOPS GEFUNDEN`);
          setShops(shopList);
        }
        
        // EVENT PARSING (VEREINFACHT)
        const eventMatches = content.matchAll(/<chunk type="event">([\s\S]*?)<\/chunk>/g);
        let eventList: EventData[] = [];
        
        for (const match of eventMatches) {
          const eventContent = match[1];
          const name = extractSimpleValue(eventContent, 'NAME');
          if (name) {
            console.log("EVENT GEFUNDEN:", name);
            eventList.push({
              name,
              description: extractSimpleValue(eventContent, 'DESCRIPTION'),
              date: extractSimpleValue(eventContent, 'DATE'),
              time: extractSimpleValue(eventContent, 'TIME'),
              location: extractSimpleValue(eventContent, 'LOCATION'),
              imageUrl: extractSimpleValue(eventContent, 'LOGO')
            });
          }
        }
        
        if (eventList.length > 0) {
          console.log(`${eventList.length} EVENTS GEFUNDEN`);
          setEvents(eventList);
        }
        
        // Setze alle Sichtbarkeiten
        setIntroVisible(true);
        setShopsVisible(true);
        setRestaurantsVisible(true);
        setEventsVisible(true);
        setTipVisible(true);
        setFollowUpVisible(true);
        setParkingVisible(true);
      
      } catch (error) {
        console.error("FEHLER BEIM DIREKTEN PARSING:", error);
        setHasError(true);
      }
    }
    
    console.log("===== SMARTHOOK DIREKT-EFFEKT ENDE =====");
  }, [content, isStreaming]);

  // Einfache Extraktion ohne Regex
  function extractSimpleValue(content: string, key: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(key + ':')) {
        return trimmed.substring((key + ':').length).trim();
      }
    }
    return '';
  }

  return useMemo(() => ({
    intro: introVisible ? intro : '',
    shops: shopsVisible ? shops : [],
    restaurants: restaurantsVisible ? restaurants : [],
    events: eventsVisible ? events : [],
    tip: tipVisible ? tip : '',
    followUp: followUpVisible ? followUp : '',
    parking: parkingVisible ? parking : null,
    openingHours: openingHours,
    progress,
    hasError,
    rawContent
  }), [intro, shops, restaurants, events, tip, followUp, parking, openingHours, progress, hasError, rawContent, 
       introVisible, shopsVisible, restaurantsVisible, eventsVisible, tipVisible, followUpVisible, parkingVisible]);
} 