'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MallSection } from '../utils/contentParser';
import { logData } from '../utils/dataLogger';

/**
 * Hook für progressives Streaming von Mall-Inhalten im JSON-Format
 * 
 * Diese verbesserte Version ist robuster gegenüber unvollständigen JSON-Daten
 * und kann besser mit Streaming-Fehlern umgehen.
 */
export function useJsonProgressiveStreaming(
  content: string,
  isStreaming: boolean,
  query: string = ''
): {
  sections: MallSection[];
  partialSections: MallSection[];
  progress: number;
  hasError: boolean;
} {
  // State für verarbeitete Sektionen
  const [sections, setSections] = useState<MallSection[]>([]);
  // State für teilweise verarbeitete Sektionen (für progressives Rendering)
  const [partialSections, setPartialSections] = useState<MallSection[]>([]);
  // State für Fortschritt (0-100%)
  const [progress, setProgress] = useState<number>(0);
  // State für Fehler
  const [hasError, setHasError] = useState<boolean>(false);

  // Refs für interne Zustandsverwaltung
  const lastContentRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPartialUpdateRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);

  // Sehr kurze Debounce-Zeit für flüssiges Streaming
  const DEBOUNCE_MS = 50;
  // Minimale Zeit zwischen partiellen Updates (in ms)
  const MIN_PARTIAL_UPDATE_INTERVAL = 100;
  // Maximale Anzahl von Fehlern, bevor wir aufgeben
  const MAX_ERROR_COUNT = 5;

  /**
   * Verbesserte Funktion zum Parsen von JSON in MallSections
   * mit zusätzlicher Fehlerbehandlung
   */
  const parseJsonToSections = useCallback((jsonContent: string, isPartial: boolean = false): MallSection[] => {
    try {
      // Versuche, den JSON-String zu parsen
      let data;
      try {
        data = JSON.parse(jsonContent);
      } catch (e) {
        // Wenn das Parsen fehlschlägt, versuche es mit einer Fallback-Methode
        console.warn("Standard JSON.parse fehlgeschlagen, versuche Fallback-Methode");
        return [];
      }

      // Wenn data kein Objekt ist oder null ist, gib leeres Array zurück
      if (!data || typeof data !== 'object') {
        return [];
      }

      const newSections: MallSection[] = [];

      // Intro-Sektion
      if (data.intro) {
        newSections.push({
          type: 'intro',
          title: '',
          content: data.intro,
          query,
          isPartial
        });
      }

      // Shops-Sektion
      if (data.shops && Array.isArray(data.shops) && data.shops.length > 0) {
        // Filtere ungültige Shop-Einträge
        const validShops = data.shops.filter((shop: any) => shop && typeof shop === 'object' && shop.name);
        
        if (validShops.length > 0) {
          newSections.push({
            type: 'shops',
            title: 'Shops im Center',
            items: validShops.map((shop: any) => ({
              name: shop.name || 'Unbekannter Shop',
              category: shop.category || '',
              floor: shop.floor || '',
              image: shop.logo || shop.image || '',
              description: shop.description || '',
              opening: shop.opening || '',
              link: shop.link || ''
            })),
            query,
            isPartial
          });
        }
      }

      // Restaurants-Sektion
      if (data.restaurants && Array.isArray(data.restaurants) && data.restaurants.length > 0) {
        // Filtere ungültige Restaurant-Einträge
        const validRestaurants = data.restaurants.filter((restaurant: any) => 
          restaurant && typeof restaurant === 'object' && restaurant.name);
        
        if (validRestaurants.length > 0) {
          newSections.push({
            type: 'restaurants',
            title: 'Gastronomie im Center',
            items: validRestaurants.map((restaurant: any) => ({
              name: restaurant.name || 'Unbekanntes Restaurant',
              category: restaurant.category || '',
              floor: restaurant.floor || '',
              image: restaurant.logo || restaurant.image || '',
              description: restaurant.description || '',
              opening: restaurant.opening || '',
              link: restaurant.link || ''
            })),
            query,
            isPartial
          });
        }
      }

      // Events-Sektion
      if (data.events && Array.isArray(data.events) && data.events.length > 0) {
        // Filtere ungültige Event-Einträge
        const validEvents = data.events.filter((event: any) => 
          event && typeof event === 'object' && event.name);
        
        if (validEvents.length > 0) {
          newSections.push({
            type: 'events',
            title: 'Veranstaltungen',
            items: validEvents.map((event: any) => ({
              name: event.name || 'Unbekannte Veranstaltung',
              date: event.date || '',
              image: event.logo || event.image || '',
              description: event.description || ''
            })),
            query,
            isPartial
          });
        }
      }

      // Parking-Sektion
      if (data.parking && typeof data.parking === 'object') {
        const parkingData = {
          fees: Array.isArray(data.parking.fees) ? data.parking.fees : [],
          notes: Array.isArray(data.parking.notes) ? data.parking.notes : []
        };
        
        newSections.push({
          type: 'parking',
          title: 'Parkgebühren',
          data: parkingData,
          content: '', // Wird automatisch generiert
          query,
          isPartial
        });
      }

      // OpeningHours-Sektion
      if (data.openingHours && typeof data.openingHours === 'object') {
        newSections.push({
          type: 'openingHours',
          title: 'Öffnungszeiten',
          data: data.openingHours,
          query,
          isPartial
        });
      }

      // Tip-Sektion
      if (data.tip) {
        newSections.push({
          type: 'tip',
          title: '',
          content: data.tip,
          query,
          isPartial
        });
      }

      // FollowUp-Sektion
      if (data.followUp) {
        newSections.push({
          type: 'followUp',
          title: 'Weitere Fragen',
          content: data.followUp,
          query,
          isPartial
        });
      }

      return newSections;
    } catch (error) {
      console.error('Fehler beim Parsen des JSON:', error);
      logData('Fehler beim Parsen des JSON', String(error));
      return [];
    }
  }, [query]);

  /**
   * Verbesserte Funktion zum Reparieren und Parsen von unvollständigem JSON
   * mit zusätzlichen Reparaturmethoden
   */
  const tryRepairAndParseJson = useCallback((jsonContent: string): MallSection[] => {
    try {
      // Entferne Markdown-Codeblöcke, falls vorhanden
      let cleanedContent = jsonContent
        .replace(/^```json\s*/g, '')
        .replace(/^```\s*/g, '')
        .replace(/\s*```$/g, '');

      // Entferne alle Zeichen vor dem ersten '{'
      const firstBraceIndex = cleanedContent.indexOf('{');
      if (firstBraceIndex > 0) {
        cleanedContent = cleanedContent.substring(firstBraceIndex);
      }

      // Entferne alle Zeichen nach dem letzten '}'
      const lastBraceIndex = cleanedContent.lastIndexOf('}');
      if (lastBraceIndex !== -1 && lastBraceIndex < cleanedContent.length - 1) {
        cleanedContent = cleanedContent.substring(0, lastBraceIndex + 1);
      }
      
      // Versuche, unvollständiges JSON zu reparieren
      let repairedJson = cleanedContent;
      
      // Repariere unvollständige Strings
      repairedJson = repairedJson.replace(/("(?:\\.|[^"\\])*?)(?:\n|$)/g, '$1"');
      
      // Füge fehlende schließende Klammern hinzu
      const openBraces = (cleanedContent.match(/{/g) || []).length;
      const closeBraces = (cleanedContent.match(/}/g) || []).length;
      if (openBraces > closeBraces) {
        repairedJson += '}'.repeat(openBraces - closeBraces);
      }
      
      // Füge fehlende schließende eckige Klammern hinzu
      const openBrackets = (cleanedContent.match(/\[/g) || []).length;
      const closeBrackets = (cleanedContent.match(/]/g) || []).length;
      if (openBrackets > closeBrackets) {
        repairedJson += ']'.repeat(openBrackets - closeBrackets);
      }

      // Repariere fehlende Anführungszeichen bei Schlüsseln
      repairedJson = repairedJson.replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":');
      
      // Repariere fehlende Kommas in Arrays
      repairedJson = repairedJson.replace(/}\s*{/g, '},{');
      repairedJson = repairedJson.replace(/]\s*\[/g, '],[');
      repairedJson = repairedJson.replace(/"\s*"/g, '","');
      
      // Repariere unvollständige Arrays
      repairedJson = repairedJson.replace(/\[\s*,/g, '[');
      repairedJson = repairedJson.replace(/,\s*]/g, ']');
      
      // Versuche, das reparierte JSON zu parsen
      try {
        return parseJsonToSections(repairedJson, true);
      } catch (parseError) {
        // Wenn das Parsen immer noch fehlschlägt, versuche eine aggressivere Reparatur
        console.warn("Erste Reparatur fehlgeschlagen, versuche aggressivere Methode");
        
        // Extrahiere nur die Intro-Sektion, wenn vorhanden
        const introMatch = repairedJson.match(/"intro"\s*:\s*"([^"]*?)"/);
        if (introMatch && introMatch[1]) {
          const introContent = introMatch[1];
          return [{
            type: 'intro',
            title: '',
            content: introContent,
            query,
            isPartial: true
          }];
        }
        
        // Wenn keine Intro-Sektion gefunden wurde, gib leeres Array zurück
        return [];
      }
    } catch (error) {
      console.error('Fehler beim Reparieren des JSON:', error);
      logData('Fehler beim Reparieren des JSON', String(error));
      return [];
    }
  }, [parseJsonToSections, query]);

  /**
   * Verbesserte Callback-Funktion für die Verarbeitung des JSON-Inhalts
   * mit besserer Fehlerbehandlung und progressivem Rendering
   */
  const processJsonContent = useCallback(() => {
    // Überspringe Verarbeitung, wenn bereits eine Verarbeitung läuft
    if (isProcessingRef.current || !content) {
      return;
    }

    isProcessingRef.current = true;

    try {
      // Versuche, den vollständigen JSON-Inhalt zu parsen
      let newSections: MallSection[] = [];
      
      try {
        // Versuche zuerst, den Inhalt als vollständiges JSON zu parsen
        newSections = parseJsonToSections(content);
      } catch (error) {
        console.log('Vollständiges JSON-Parsing fehlgeschlagen, versuche Teilparsing');
      }
      
      // Wenn vollständiges Parsing erfolgreich war
      if (newSections.length > 0) {
        // Setze Fehlerzähler zurück
        errorCountRef.current = 0;
        
        setSections(newSections);
        setPartialSections([]); // Lösche partielle Sektionen, wenn vollständiges Parsing erfolgreich war
        
        // Berechne den Fortschritt basierend auf den gefundenen Sektionen
        const expectedSections = 4; // Intro, Shops/Restaurants, Tip, FollowUp
        const completedSections = Math.min(newSections.length, expectedSections);
        const estimatedProgress = Math.min(
          95, // Maximal 95%, um Platz für abschließende Verarbeitung zu lassen
          (completedSections / expectedSections) * 100
        );
        setProgress(estimatedProgress);
      } else {
        // Versuche, teilweise JSON zu parsen für progressives Rendering
        const partialSections = tryRepairAndParseJson(content);
        
        if (partialSections.length > 0) {
          // Setze Fehlerzähler zurück
          errorCountRef.current = 0;
          
          // Prüfe, ob genügend Zeit seit dem letzten Update vergangen ist
          const now = Date.now();
          if (now - lastPartialUpdateRef.current >= MIN_PARTIAL_UPDATE_INTERVAL) {
            setPartialSections(partialSections);
            lastPartialUpdateRef.current = now;
            
            // Berechne Fortschritt basierend auf Textlänge und erwarteter Gesamtlänge
            const estimatedTotalLength = 1500; // Geschätzte durchschnittliche Antwortlänge
            const currentLength = content.length;
            const estimatedProgress = Math.min(
              90, // Maximal 90% für teilweise Inhalte
              (currentLength / estimatedTotalLength) * 100
            );
            setProgress(estimatedProgress);
            
            // Log für Debugging
            console.log(`Progressives Rendering: ${partialSections.length} Sektionen, Fortschritt: ${estimatedProgress.toFixed(1)}%`);
          }
        } else {
          // Wenn keine Sektionen gefunden wurden, aber Content vorhanden ist
          if (content.length > 20) {
            console.log('Kein JSON gefunden, aber Content vorhanden:', content.substring(0, 50) + '...');
            
            // Erhöhe Fehlerzähler
            errorCountRef.current++;
            
            // Wenn zu viele Fehler aufgetreten sind, setze Fehler-Flag
            if (errorCountRef.current > MAX_ERROR_COUNT) {
              console.error('Zu viele Fehler beim Parsen des JSON, gebe auf');
              setHasError(true);
            } else {
              // Setze einen minimalen Fortschritt basierend auf der Textlänge
              const minProgress = Math.min(50, (content.length / 500) * 100);
              setProgress(minProgress);
            }
          }
        }
      }
    } catch (error) {
      console.error('Fehler bei der JSON-Verarbeitung:', error);
      logData('Fehler bei der JSON-Verarbeitung', String(error) + ' - Content: ' + content.substring(0, 200));
      
      // Erhöhe Fehlerzähler
      errorCountRef.current++;
      
      // Wenn zu viele Fehler aufgetreten sind, setze Fehler-Flag
      if (errorCountRef.current > MAX_ERROR_COUNT) {
        setHasError(true);
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [content, parseJsonToSections, tryRepairAndParseJson]);

  // Effekt für Content-Verarbeitung
  useEffect(() => {
    // Überspringe Verarbeitung, wenn kein Content vorhanden ist
    if (!content) return;

    // Abbrechen des vorherigen Timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Setze einen neuen Debounce-Timer mit sehr kurzer Verzögerung
    debounceTimerRef.current = setTimeout(() => {
      processJsonContent();
    }, DEBOUNCE_MS);

    // Cleanup-Funktion
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [content, processJsonContent]);

  // Effekt für abschließende Verarbeitung nach Streaming
  useEffect(() => {
    if (!isStreaming && content) {
      // Wenn das Streaming abgeschlossen ist, führe eine finale Verarbeitung durch
      try {
        // Versuche einen letzten Parsing-Versuch mit dem gesamten Content
        let finalSections: MallSection[] = [];
        
        try {
          // Versuche zuerst direktes Parsen
          finalSections = parseJsonToSections(content);
        } catch (error) {
          console.log('Finales direktes Parsing fehlgeschlagen, versuche Reparatur');
          // Wenn direktes Parsen fehlschlägt, versuche Reparatur
          finalSections = tryRepairAndParseJson(content);
        }
        
        if (finalSections.length > 0) {
          setSections(finalSections);
          setPartialSections([]);
          setProgress(100);
          console.log('Finale Verarbeitung abgeschlossen mit', finalSections.length, 'Sektionen');
        } else {
          // Wenn immer noch keine Sektionen gefunden wurden, versuche einen letzten Rettungsversuch
          // Extrahiere alles zwischen dem ersten { und dem letzten }
          const firstBrace = content.indexOf('{');
          const lastBrace = content.lastIndexOf('}');
          
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonSubstring = content.substring(firstBrace, lastBrace + 1);
            try {
              const rescueSections = tryRepairAndParseJson(jsonSubstring);
              if (rescueSections.length > 0) {
                setSections(rescueSections);
                setPartialSections([]);
                setProgress(100);
                console.log('Rettungsversuch erfolgreich mit', rescueSections.length, 'Sektionen');
                return;
              }
            } catch (e) {
              console.error('Rettungsversuch fehlgeschlagen:', e);
            }
          }
          
          // Wenn alle Versuche fehlgeschlagen sind, versuche, zumindest den Text anzuzeigen
          if (content.length > 50) {
            // Erstelle eine einfache Intro-Sektion mit dem Text
            const textOnlySection: MallSection = {
              type: 'intro',
              title: '',
              content: content.replace(/\n/g, '<br>'),
              query,
              isPartial: false
            };
            
            setSections([textOnlySection]);
            setPartialSections([]);
            setProgress(100);
            console.log('Fallback auf reinen Text');
          } else {
            console.error('Keine Sektionen gefunden nach finaler Verarbeitung');
            logData('Keine Sektionen gefunden', content);
            setHasError(true);
          }
        }
      } catch (error) {
        console.error('Fehler bei der finalen Verarbeitung:', error);
        logData('Fehler bei der finalen Verarbeitung', String(error) + ' - Content: ' + content.substring(0, 200));
        setHasError(true);
      }
    }
  }, [isStreaming, content, parseJsonToSections, tryRepairAndParseJson, query]);

  return {
    sections,
    partialSections,
    progress,
    hasError
  };
}
