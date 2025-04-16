'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MallSection } from '../utils/contentParser';
import { logData } from '../utils/dataLogger';

/**
 * Hook für progressives Streaming von Mall-Inhalten im Chunk-Format mit Key-Value-Paaren
 * 
 * Dieser Hook verarbeitet Inhalte im Format <chunk type="TYPE">KEY: Value</chunk>
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
   * Funktion zum Parsen eines einzelnen Chunks im Key-Value-Format in eine MallSection
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
            const lines = content.trim().split('\n');
            const shopData: any = {};
            
            lines.forEach(line => {
              const [key, ...valueParts] = line.split(':');
              if (key && valueParts.length > 0) {
                const keyLower = key.trim().toLowerCase();
                const valueClean = valueParts.join(':').trim();
                
                if (keyLower === 'name') shopData.name = valueClean;
                else if (keyLower === 'category') shopData.category = valueClean;
                else if (keyLower === 'floor') shopData.floor = valueClean;
                else if (keyLower === 'logo') shopData.logo = valueClean || shopData.image;
                else if (keyLower === 'image') shopData.image = valueClean || shopData.logo;
                else if (keyLower === 'description') shopData.description = valueClean;
                else if (keyLower === 'opening') shopData.opening = valueClean;
              }
            });
            
            // Stelle sicher, dass mindestens ein Name vorhanden ist
            if (!shopData.name) {
              console.warn('Shop ohne Namen gefunden, überspringe');
              return null;
            }
            
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
            const lines = content.trim().split('\n');
            const restaurantData: any = {};
            
            lines.forEach(line => {
              const [key, ...valueParts] = line.split(':');
              if (key && valueParts.length > 0) {
                const keyLower = key.trim().toLowerCase();
                const valueClean = valueParts.join(':').trim();
                
                if (keyLower === 'name') restaurantData.name = valueClean;
                else if (keyLower === 'category') restaurantData.category = valueClean;
                else if (keyLower === 'floor') restaurantData.floor = valueClean;
                else if (keyLower === 'logo') restaurantData.logo = valueClean || restaurantData.image;
                else if (keyLower === 'image') restaurantData.image = valueClean || restaurantData.logo;
                else if (keyLower === 'description') restaurantData.description = valueClean;
                else if (keyLower === 'opening') restaurantData.opening = valueClean;
              }
            });
            
            // Stelle sicher, dass mindestens ein Name vorhanden ist
            if (!restaurantData.name) {
              console.warn('Restaurant ohne Namen gefunden, überspringe');
              return null;
            }
            
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
            const lines = content.trim().split('\n');
            const eventData: any = {};
            
            lines.forEach(line => {
              const [key, ...valueParts] = line.split(':');
              if (key && valueParts.length > 0) {
                const keyLower = key.trim().toLowerCase();
                const valueClean = valueParts.join(':').trim();
                
                if (keyLower === 'name') eventData.name = valueClean;
                else if (keyLower === 'date') eventData.date = valueClean;
                else if (keyLower === 'logo') eventData.logo = valueClean || eventData.image;
                else if (keyLower === 'image') eventData.image = valueClean || eventData.logo;
                else if (keyLower === 'description') eventData.description = valueClean;
              }
            });
            
            // Stelle sicher, dass mindestens ein Name vorhanden ist
            if (!eventData.name) {
              console.warn('Event ohne Namen gefunden, überspringe');
              return null;
            }
            
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
            const content_lines = content.trim().split('\n');
            const parkingData: any = {
              fees: [],
              notes: []
            };
            
            let currentSection = '';
            
            content_lines.forEach(line => {
              const trimmedLine = line.trim();
              
              // Erkenne Abschnitte
              if (trimmedLine === 'FEES:') {
                currentSection = 'fees';
                return;
              } else if (trimmedLine === 'NOTES:') {
                currentSection = 'notes';
                return;
              }
              
              // Verarbeite Einträge basierend auf dem aktuellen Abschnitt
              if (currentSection === 'fees' && trimmedLine.startsWith('-')) {
                const feeContent = trimmedLine.substring(1).trim();
                const parts = feeContent.split('|');
                
                if (parts.length >= 2) {
                  const durationPart = parts[0].trim();
                  const pricePart = parts[1].trim();
                  
                  const duration = durationPart.replace('DURATION:', '').trim();
                  const price = pricePart.replace('PRICE:', '').trim();
                  
                  if (duration && price) {
                    parkingData.fees.push({ duration, price });
                  }
                }
              } else if (currentSection === 'notes' && trimmedLine.startsWith('-')) {
                const noteContent = trimmedLine.substring(1).trim();
                if (noteContent) {
                  parkingData.notes.push(noteContent);
                }
              }
            });
            
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
            const content_lines = content.trim().split('\n');
            const openingHoursData: any = {
              regular: [],
              special: []
            };
            
            let currentSection = '';
            
            content_lines.forEach(line => {
              const trimmedLine = line.trim();
              
              // Erkenne Abschnitte
              if (trimmedLine === 'REGULAR:') {
                currentSection = 'regular';
                return;
              } else if (trimmedLine === 'SPECIAL:') {
                currentSection = 'special';
                return;
              }
              
              // Verarbeite Einträge basierend auf dem aktuellen Abschnitt
              if (currentSection === 'regular' && trimmedLine.startsWith('-')) {
                const hourContent = trimmedLine.substring(1).trim();
                const parts = hourContent.split('|');
                
                if (parts.length >= 2) {
                  const dayPart = parts[0].trim();
                  const hoursPart = parts[1].trim();
                  
                  const day = dayPart.replace('DAY:', '').trim();
                  const hours = hoursPart.replace('HOURS:', '').trim();
                  
                  if (day && hours) {
                    openingHoursData.regular.push({ day, hours });
                  }
                }
              } else if (currentSection === 'special' && trimmedLine.startsWith('-')) {
                const specialContent = trimmedLine.substring(1).trim();
                const parts = specialContent.split('|');
                
                if (parts.length >= 2) {
                  const datePart = parts[0].trim();
                  const hoursPart = parts[1].trim();
                  let note = '';
                  
                  if (parts.length >= 3) {
                    const notePart = parts[2].trim();
                    note = notePart.replace('NOTE:', '').trim();
                  }
                  
                  const date = datePart.replace('DATE:', '').trim();
                  const hours = hoursPart.replace('HOURS:', '').trim();
                  
                  if (date && hours) {
                    openingHoursData.special.push({ date, hours, note });
                  }
                }
              }
            });
            
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
