'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MallSection } from '../utils/contentParser';
import { logData } from '../utils/dataLogger';

/**
 * Hook für progressives Streaming von Mall-Inhalten im Chunk-Format
 * 
 * Dieser Hook verarbeitet Inhalte im Format <chunk type="TYPE">CONTENT</chunk>
 * und ermöglicht ein echtes progressives Rendering während des Streamings.
 */
export function useChunkProgressiveStreaming(
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
  const processedChunksRef = useRef<Set<string>>(new Set());

  // Sehr kurze Debounce-Zeit für flüssiges Streaming
  const DEBOUNCE_MS = 50;
  // Minimale Zeit zwischen partiellen Updates (in ms)
  const MIN_PARTIAL_UPDATE_INTERVAL = 100;
  // Maximale Anzahl von Fehlern, bevor wir aufgeben
  const MAX_ERROR_COUNT = 5;

  /**
   * Funktion zum Parsen eines einzelnen Chunks in eine MallSection
   */
  const parseChunkToSection = useCallback((type: string, content: string, isPartial: boolean = false): MallSection | null => {
    try {
      switch (type) {
        case 'intro':
          return {
            type: 'intro',
            title: '',
            content: content.trim(),
            query,
            isPartial
          };
        
        case 'shop':
          try {
            const shopData = JSON.parse(content.trim());
            return {
              type: 'shops',
              title: 'Shops',
              items: [shopData],
              query,
              isPartial
            };
          } catch (e) {
            console.error('Fehler beim Parsen des Shop-Chunks:', e);
            return null;
          }
        
        case 'restaurant':
          try {
            const restaurantData = JSON.parse(content.trim());
            return {
              type: 'restaurants',
              title: 'Gastronomie',
              items: [restaurantData],
              query,
              isPartial
            };
          } catch (e) {
            console.error('Fehler beim Parsen des Restaurant-Chunks:', e);
            return null;
          }
        
        case 'event':
          try {
            const eventData = JSON.parse(content.trim());
            return {
              type: 'events',
              title: 'Veranstaltungen',
              items: [eventData],
              query,
              isPartial
            };
          } catch (e) {
            console.error('Fehler beim Parsen des Event-Chunks:', e);
            return null;
          }
        
        case 'parking':
          try {
            const parkingData = JSON.parse(content.trim());
            return {
              type: 'parking',
              title: 'Parkgebühren',
              data: parkingData,
              query,
              isPartial
            };
          } catch (e) {
            console.error('Fehler beim Parsen des Parking-Chunks:', e);
            return null;
          }
        
        case 'openingHours':
          try {
            const openingHoursData = JSON.parse(content.trim());
            return {
              type: 'openingHours',
              title: 'Öffnungszeiten',
              data: openingHoursData,
              query,
              isPartial
            };
          } catch (e) {
            console.error('Fehler beim Parsen des OpeningHours-Chunks:', e);
            return null;
          }
        
        case 'tip':
          return {
            type: 'tip',
            title: '',
            content: content.trim(),
            query,
            isPartial
          };
        
        case 'followUp':
          return {
            type: 'followUp',
            title: 'Weitere Fragen',
            content: content.trim(),
            query,
            isPartial
          };
        
        default:
          console.warn('Unbekannter Chunk-Typ:', type);
          return null;
      }
    } catch (error) {
      console.error('Fehler beim Parsen des Chunks:', error);
      return null;
    }
  }, [query]);

  /**
   * Funktion zum Extrahieren und Parsen aller Chunks aus dem Content
   */
  const parseChunksFromContent = useCallback((content: string, isPartial: boolean = false): MallSection[] => {
    try {
      const newSections: MallSection[] = [];
      
      // Suche nach Chunks mit dem Format <chunk type="TYPE">CONTENT</chunk>
      const chunkRegex = /<chunk type="([^"]+)">([\s\S]*?)<\/chunk>/g;
      let match;
      
      // Verarbeite alle gefundenen Chunks
      while ((match = chunkRegex.exec(content)) !== null) {
        const [fullMatch, type, chunkContent] = match;
        
        // Überspringe bereits verarbeitete Chunks
        if (processedChunksRef.current.has(fullMatch)) {
          continue;
        }
        
        // Markiere diesen Chunk als verarbeitet
        processedChunksRef.current.add(fullMatch);
        
        // Parse den Chunk in eine Sektion
        const section = parseChunkToSection(type, chunkContent, isPartial);
        
        if (section) {
          // Spezielle Behandlung für Shops, Restaurants und Events
          if (['shops', 'restaurants', 'events'].includes(section.type)) {
            // Suche nach einer existierenden Sektion dieses Typs
            const existingSection = newSections.find(s => s.type === section.type);
            
            if (existingSection && existingSection.items && section.items) {
              // Füge das neue Item zur existierenden Sektion hinzu
              existingSection.items.push(...section.items);
            } else {
              // Füge die neue Sektion hinzu
              newSections.push(section);
            }
          } else {
            // Für andere Sektionstypen, füge sie einfach hinzu
            newSections.push(section);
          }
        }
      }
      
      return newSections;
    } catch (error) {
      console.error('Fehler beim Extrahieren der Chunks:', error);
      logData('Fehler beim Extrahieren der Chunks', String(error));
      return [];
    }
  }, [parseChunkToSection]);

  /**
   * Callback für die Verarbeitung des Chunk-Inhalts
   */
  const processChunkContent = useCallback(() => {
    // Überspringe Verarbeitung, wenn bereits eine Verarbeitung läuft
    if (isProcessingRef.current || !content) {
      return;
    }

    isProcessingRef.current = true;

    try {
      // Extrahiere und parse alle Chunks aus dem Content
      const newSections = parseChunksFromContent(content, true);
      
      if (newSections.length > 0) {
        // Setze Fehlerzähler zurück
        errorCountRef.current = 0;
        
        // Prüfe, ob genügend Zeit seit dem letzten Update vergangen ist
        const now = Date.now();
        if (now - lastPartialUpdateRef.current >= MIN_PARTIAL_UPDATE_INTERVAL) {
          // Aktualisiere die partiellen Sektionen
          setPartialSections(prevSections => {
            // Kombiniere die vorherigen Sektionen mit den neuen
            const combinedSections = [...prevSections];
            
            // Füge neue Sektionen hinzu oder aktualisiere bestehende
            for (const newSection of newSections) {
              const existingIndex = combinedSections.findIndex(s => s.type === newSection.type);
              
              if (existingIndex >= 0) {
                // Wenn es sich um einen Sektionstyp mit Items handelt
                if (['shops', 'restaurants', 'events'].includes(newSection.type) && 
                    combinedSections[existingIndex].items && newSection.items) {
                  // Kombiniere die Items
                  const existingItems = combinedSections[existingIndex].items || [];
                  const newItems = newSection.items;
                  
                  // Entferne Duplikate basierend auf dem Namen
                  const uniqueItems = [...existingItems];
                  for (const newItem of newItems) {
                    if (!uniqueItems.some(item => item.name === newItem.name)) {
                      uniqueItems.push(newItem);
                    }
                  }
                  
                  // Aktualisiere die Sektion
                  combinedSections[existingIndex] = {
                    ...combinedSections[existingIndex],
                    items: uniqueItems
                  };
                } else {
                  // Für andere Sektionstypen, ersetze die bestehende Sektion
                  combinedSections[existingIndex] = newSection;
                }
              } else {
                // Füge die neue Sektion hinzu
                combinedSections.push(newSection);
              }
            }
            
            return combinedSections;
          });
          
          lastPartialUpdateRef.current = now;
          
          // Berechne Fortschritt basierend auf Textlänge und erwarteter Gesamtlänge
          const estimatedTotalLength = 2000; // Geschätzte durchschnittliche Antwortlänge
          const currentLength = content.length;
          const estimatedProgress = Math.min(
            90, // Maximal 90% für teilweise Inhalte
            (currentLength / estimatedTotalLength) * 100
          );
          setProgress(estimatedProgress);
          
          // Log für Debugging
          console.log(`Progressives Rendering: ${newSections.length} neue Sektionen, Fortschritt: ${estimatedProgress.toFixed(1)}%`);
        }
      } else {
        // Wenn keine Sektionen gefunden wurden, aber Content vorhanden ist
        if (content.length > 20) {
          console.log('Keine Chunks gefunden, aber Content vorhanden:', content.substring(0, 50) + '...');
          
          // Erhöhe Fehlerzähler
          errorCountRef.current++;
          
          // Wenn zu viele Fehler aufgetreten sind, setze Fehler-Flag
          if (errorCountRef.current > MAX_ERROR_COUNT) {
            console.error('Zu viele Fehler beim Parsen der Chunks, gebe auf');
            setHasError(true);
          } else {
            // Setze einen minimalen Fortschritt basierend auf der Textlänge
            const minProgress = Math.min(50, (content.length / 500) * 100);
            setProgress(minProgress);
          }
        }
      }
    } catch (error) {
      console.error('Fehler bei der Chunk-Verarbeitung:', error);
      logData('Fehler bei der Chunk-Verarbeitung', String(error) + ' - Content: ' + content.substring(0, 200));
      
      // Erhöhe Fehlerzähler
      errorCountRef.current++;
      
      // Wenn zu viele Fehler aufgetreten sind, setze Fehler-Flag
      if (errorCountRef.current > MAX_ERROR_COUNT) {
        setHasError(true);
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [content, parseChunksFromContent]);

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
      processChunkContent();
    }, DEBOUNCE_MS);

    // Cleanup-Funktion
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [content, processChunkContent]);

  // Effekt für abschließende Verarbeitung nach Streaming
  useEffect(() => {
    if (!isStreaming && content) {
      // Wenn das Streaming abgeschlossen ist, führe eine finale Verarbeitung durch
      try {
        // Extrahiere und parse alle Chunks aus dem Content
        const finalSections = parseChunksFromContent(content, false);
        
        if (finalSections.length > 0) {
          setSections(finalSections);
          setPartialSections([]);
          setProgress(100);
          console.log('Finale Verarbeitung abgeschlossen mit', finalSections.length, 'Sektionen');
        } else {
          // Wenn keine Chunks gefunden wurden, versuche, zumindest den Text anzuzeigen
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
  }, [isStreaming, content, parseChunksFromContent, query]);

  return {
    sections,
    partialSections,
    progress,
    hasError
  };
}
