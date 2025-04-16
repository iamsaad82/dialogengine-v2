'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { processXmlContent } from '../utils/chunkedXmlProcessor';
import { MallSection } from '../utils/contentParser';
import { safeParseXmlContent } from '../utils/safeXmlParser';
import { logData } from '../utils/dataLogger';

/**
 * Hook für die Verarbeitung von Mall-Content in Chunks
 *
 * Dieser Hook verarbeitet XML-Inhalte in Chunks, validiert und repariert sie,
 * und parst sie dann in MallSection-Objekte.
 *
 * Optimiert für Stabilität und Flicker-Vermeidung während des Streamings.
 */
export function useChunkedMallContent(
  content: string,
  isStreaming: boolean,
  query: string = ''
): {
  sections: MallSection[];
  validContent: string;
  hasError: boolean;
  errorMessage: string | null;
} {
  // State für verarbeiteten Content
  const [validContent, setValidContent] = useState<string>('');
  const [sections, setSections] = useState<MallSection[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs für interne Zustandsverwaltung
  const remainingContentRef = useRef<string>('');
  const previousContentRef = useRef<string>('');
  const hasInvalidChunksRef = useRef<boolean>(false);
  const processedChunksRef = useRef<string[]>([]);
  const pendingUpdatesRef = useRef<{sections: MallSection[], validContent: string} | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const batchUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized Update-Funktion für Batch-Updates
  const updateSections = useCallback((newSections: MallSection[], newValidContent: string) => {
    // Batch-Update für Sektionen und validContent
    if (newSections.length > 0) {
      setSections(prevSections => {
        // Wenn keine vorherigen Sektionen vorhanden sind, verwende einfach die neuen
        if (prevSections.length === 0) {
          return newSections;
        }

        // Erstelle eine Map der vorhandenen Sektionen nach Typ für schnelleren Zugriff
        const existingSectionsMap = new Map(
          prevSections.map(section => [section.type, section])
        );

        // Aktualisiere die Map mit neuen Sektionen
        let hasChanges = false;

        newSections.forEach(newSection => {
          // Spezialbehandlung für Sektionen mit Items (Shops, Restaurants, etc.)
          if (newSection.items && existingSectionsMap.has(newSection.type)) {
            const existingSection = existingSectionsMap.get(newSection.type);
            if (existingSection && existingSection.items) {
              // Prüfe, ob die neuen Items tatsächlich neue Informationen enthalten
              const existingItemNames = new Set(
                existingSection.items.map((item: any) => item.name)
              );

              // Filtere nur neue Items, die noch nicht vorhanden sind
              const newItems = newSection.items.filter(
                (item: any) => !existingItemNames.has(item.name)
              );

              // Nur aktualisieren, wenn es tatsächlich neue Items gibt
              if (newItems.length > 0) {
                const updatedSection = {
                  ...existingSection,
                  items: [...existingSection.items, ...newItems]
                };
                existingSectionsMap.set(newSection.type, updatedSection);
                hasChanges = true;
              }
            } else {
              // Wenn die vorhandene Sektion keine Items hat, ersetze sie
              existingSectionsMap.set(newSection.type, newSection);
              hasChanges = true;
            }
          } else if (!existingSectionsMap.has(newSection.type)) {
            // Neue Sektion hinzufügen
            existingSectionsMap.set(newSection.type, newSection);
            hasChanges = true;
          } else {
            // Vorhandene Sektion aktualisieren, wenn sie keine Items hat
            const existingSection = existingSectionsMap.get(newSection.type);
            if (JSON.stringify(existingSection) !== JSON.stringify(newSection)) {
              existingSectionsMap.set(newSection.type, newSection);
              hasChanges = true;
            }
          }
        });

        // Nur ein neues Array erstellen, wenn es tatsächlich Änderungen gab
        return hasChanges ? Array.from(existingSectionsMap.values()) : prevSections;
      });

      // Setze validContent nur, wenn es sich geändert hat
      if (newValidContent !== validContent) {
        setValidContent(newValidContent);
      }

      setHasError(false);
      setErrorMessage(null);
    }
  }, [validContent]);

  // Batch-Update-Funktion
  const processPendingUpdates = useCallback(() => {
    if (pendingUpdatesRef.current) {
      const { sections: newSections, validContent: newValidContent } = pendingUpdatesRef.current;
      updateSections(newSections, newValidContent);
      pendingUpdatesRef.current = null;
    }
  }, [updateSections]);

  // Effekt für Content-Verarbeitung mit verbessertem Debouncing
  useEffect(() => {
    // Wenn der Content identisch ist, nichts tun
    if (content === previousContentRef.current) {
      return;
    }

    // Aktualisiere den vorherigen Content sofort
    previousContentRef.current = content;

    // Wenn ein Debounce-Timer läuft, lösche ihn
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Setze einen neuen Debounce-Timer mit längerer Verzögerung während des Streamings
    // Dies reduziert die Anzahl der Updates und verhindert Flackern
    debounceTimerRef.current = setTimeout(() => {
      try {
        // Verarbeite Content in Chunks
        const { validContent: newValidContent, remainingContent, hasInvalidChunks, processedChunks } = processXmlContent(
          content,
          remainingContentRef.current
        );

        // Speichere die verarbeiteten Chunks
        processedChunksRef.current = [...processedChunksRef.current, ...processedChunks];

        // Aktualisiere Refs
        remainingContentRef.current = remainingContent;

        if (hasInvalidChunks) {
          hasInvalidChunksRef.current = true;
        }

        // Aktualisiere State nur, wenn sich der gültige Content geändert hat
        // und wenn wir tatsächlich neuen Content haben
        if (newValidContent && newValidContent !== validContent && newValidContent.length > 0) {
          // Parse den gültigen Content in Sektionen
          const newSections = safeParseXmlContent(newValidContent, query);

          if (newSections.length > 0) {
            // Während des Streamings: Sammle Updates und führe sie gebündelt aus
            if (isStreaming) {
              // Speichere die neuen Daten für das nächste Batch-Update
              pendingUpdatesRef.current = {
                sections: newSections,
                validContent: newValidContent
              };

              // Wenn ein Batch-Update-Timer läuft, nichts tun
              // Andernfalls setze einen neuen Timer
              if (!batchUpdateTimerRef.current) {
                batchUpdateTimerRef.current = setTimeout(() => {
                  processPendingUpdates();
                  batchUpdateTimerRef.current = null;
                }, 100); // Reduzierte Verzögerung für schnellere Anzeige
              }
            } else {
              // Wenn nicht streaming, sofort aktualisieren
              updateSections(newSections, newValidContent);
            }
          }
        }
      } catch (error) {
        console.error('Fehler bei der Chunk-Verarbeitung:', error);
        logData('Fehler bei der Chunk-Verarbeitung', content);
      }
    }, isStreaming ? 100 : 0); // Reduzierte Debounce-Zeit für schnellere Anzeige

    // Cleanup-Funktion
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (batchUpdateTimerRef.current) {
        clearTimeout(batchUpdateTimerRef.current);
      }
    };
  }, [content, query, validContent, isStreaming, processPendingUpdates, updateSections]);

  // Effekt für Fehlerbehandlung nach Streaming
  useEffect(() => {
    if (!isStreaming && content) {
      // Wenn das Streaming abgeschlossen ist und keine Sektionen gefunden wurden
      if (sections.length === 0) {
        // Versuche einen letzten Parsing-Versuch mit dem gesamten Content
        try {
          // Entferne überschüssige schließende Tags am Ende
          const cleanedContent = content.replace(/(<\/[^>]+>)+$/, '');
          const parsedSections = safeParseXmlContent(cleanedContent, query);

          if (parsedSections.length > 0) {
            setSections(parsedSections);
            setValidContent(cleanedContent);
            return; // Erfolgreich geparst, keine Fehler setzen
          }

          // Wenn immer noch keine Sektionen gefunden wurden
          setHasError(true);
          setErrorMessage('Der Inhalt konnte nicht korrekt verarbeitet werden.');
          logData('Keine Sektionen nach Streaming und Nachbearbeitung', content);
        } catch (error) {
          setHasError(true);
          setErrorMessage('Der Inhalt konnte nicht korrekt verarbeitet werden.');
          logData('Fehler bei der Nachbearbeitung', content);
        }
      }
      // Wenn ungültige Chunks gefunden wurden, aber wir trotzdem Sektionen haben
      else if (hasInvalidChunksRef.current) {
        // Wir haben Sektionen trotz ungültiger Chunks, also zeigen wir diese an
        // ohne einen Fehler zu setzen
        console.log('Trotz ungültiger Chunks wurden', sections.length, 'Sektionen gefunden');
      }
    }
  }, [isStreaming, content, sections.length, query]);

  return {
    sections,
    validContent,
    hasError,
    errorMessage
  };
}
