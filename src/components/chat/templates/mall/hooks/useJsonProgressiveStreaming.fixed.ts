'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MallSection } from '../utils/contentParser';
import { logData } from '../utils/dataLogger';

/**
 * Hook für progressives Streaming von Mall-Inhalten im JSON-Format
 * 
 * Dieser Hook verarbeitet JSON-Inhalte in Echtzeit und ermöglicht
 * ein flüssiges, inkrementelles Rendering während des Streamings.
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

  // Sehr kurze Debounce-Zeit für flüssiges Streaming
  const DEBOUNCE_MS = 50;
  // Minimale Zeit zwischen partiellen Updates (in ms)
  const MIN_PARTIAL_UPDATE_INTERVAL = 100;

  // Funktion zum Parsen von JSON in MallSections
  const parseJsonToSections = useCallback((jsonContent: string, isPartial: boolean = false): MallSection[] => {
    try {
      // Versuche, den JSON-String zu parsen
      const data = JSON.parse(jsonContent);
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
        newSections.push({
          type: 'shops',
          title: 'Shops im Center',
          items: data.shops.map((shop: any) => ({
            name: shop.name,
            category: shop.category,
            floor: shop.floor,
            image: shop.logo,
            description: shop.description,
            opening: shop.opening,
            link: shop.link
          })),
          query,
          isPartial
        });
      }

      // Restaurants-Sektion
      if (data.restaurants && Array.isArray(data.restaurants) && data.restaurants.length > 0) {
        newSections.push({
          type: 'restaurants',
          title: 'Gastronomie im Center',
          items: data.restaurants.map((restaurant: any) => ({
            name: restaurant.name,
            category: restaurant.category,
            floor: restaurant.floor,
            image: restaurant.logo,
            description: restaurant.description,
            opening: restaurant.opening,
            link: restaurant.link
          })),
          query,
          isPartial
        });
      }

      // Events-Sektion
      if (data.events && Array.isArray(data.events) && data.events.length > 0) {
        newSections.push({
          type: 'events',
          title: 'Veranstaltungen',
          items: data.events.map((event: any) => ({
            name: event.name,
            date: event.date,
            image: event.logo,
            description: event.description
          })),
          query,
          isPartial
        });
      }

      // Parking-Sektion
      if (data.parking) {
        const parkingData = {
          fees: data.parking.fees || [],
          notes: data.parking.notes || []
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
      if (data.openingHours) {
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
      logData('Fehler beim Parsen des JSON', jsonContent);
      return [];
    }
  }, [query]);

  // Versuche, teilweise JSON zu reparieren und zu parsen
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

      // Versuche, fehlende Anführungszeichen zu reparieren
      repairedJson = repairedJson.replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":');
      
      // Versuche, das reparierte JSON zu parsen
      return parseJsonToSections(repairedJson, true);
    } catch (error) {
      console.error('Fehler beim Reparieren des JSON:', error);
      logData('Fehler beim Reparieren des JSON', String(error));
      return [];
    }
  }, [parseJsonToSections]);

  // Callback für die Verarbeitung des JSON-Inhalts
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
            // Setze einen minimalen Fortschritt basierend auf der Textlänge
            const minProgress = Math.min(50, (content.length / 500) * 100);
            setProgress(minProgress);
          }
        }
      }
    } catch (error) {
      console.error('Fehler bei der JSON-Verarbeitung:', error);
      logData('Fehler bei der JSON-Verarbeitung', String(error) + ' - Content: ' + content.substring(0, 200));
      setHasError(true);
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
          
          console.error('Keine Sektionen gefunden nach finaler Verarbeitung');
          logData('Keine Sektionen gefunden', content);
          setHasError(true);
        }
      } catch (error) {
        console.error('Fehler bei der finalen Verarbeitung:', error);
        logData('Fehler bei der finalen Verarbeitung', String(error) + ' - Content: ' + content.substring(0, 200));
        setHasError(true);
      }
    }
  }, [isStreaming, content, parseJsonToSections, tryRepairAndParseJson]);

  return {
    sections,
    partialSections,
    progress,
    hasError
  };
}
