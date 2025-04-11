'use client';

import { useState, useEffect, useRef, useMemo, useTransition } from 'react';
import { MallSection, parseMallContent, incrementalParseMallContent } from '../utils/contentParser';

/**
 * Verbesserte Hook für die Verarbeitung von Streaming-Inhalten für das Mall-Template
 * Mit optimierter Performance und flackerfreiem Streaming
 */
export function useMallContentStreaming(content: string, isStreaming: boolean, query: string = '') {
  const [sections, setSections] = useState<MallSection[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(!isStreaming);
  const [processedHtml, setProcessedHtml] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const previousContentRef = useRef<string>('');
  const streamingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentChunksRef = useRef<string[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoize den Content für Vergleiche
  const memoizedContent = useMemo(() => content, [content]);

  // Verarbeite den Content bei Änderungen mit Debouncing für flackerfreies Streaming
  useEffect(() => {
    // Verwende memoizedContent für Vergleiche
    if (memoizedContent === previousContentRef.current) return;

    // Speichere den neuen Content-Chunk
    if (isStreaming && content.length > previousContentRef.current.length) {
      contentChunksRef.current.push(
        content.slice(previousContentRef.current.length)
      );
    }

    // Aktualisiere den gespeicherten Content
    previousContentRef.current = content;

    // Setze den HTML-Inhalt sofort, um die Anzeige zu aktualisieren
    setProcessedHtml(content);

    // Debounce die Sektionsverarbeitung, um Flackern zu reduzieren
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Verwende ein längeres Debounce für stabilere Anzeige
    debounceTimerRef.current = setTimeout(() => {
      try {
        // Wenn Streaming aktiv ist, verwende inkrementelles Parsen
        if (isStreaming) {
          // Inkrementelles Parsen für bessere Streaming-Erfahrung
          const newSections = incrementalParseMallContent(content, query);
          console.log('Parsed sections during streaming:', newSections);

          // Setze die Sektionen nur, wenn wir mehr als 0 haben und wenn sie sich geändert haben
          if (newSections.length > 0) {
            // Vergleiche die neuen Sektionen mit den alten, um unnötige Renders zu vermeiden
            // Tiefe Vergleichsfunktion für bessere Stabilität
            const sectionsChanged = JSON.stringify(newSections) !== JSON.stringify(sections);
            if (sectionsChanged) {
              // Verzögere das Setzen der Sektionen, um Flackern zu vermeiden
              startTransition(() => {
                setSections(newSections);
              });
            }
          }
        } else {
          // Wenn kein Streaming aktiv ist, verwende normales Parsen
          const newSections = parseMallContent(content, query);
          console.log('Parsed sections after streaming:', newSections);

          // Setze die Sektionen und den Original-Content
          startTransition(() => {
            setSections(newSections);
          });
        }

        // Wenn Streaming aktiv ist, setze isComplete auf false
        if (isStreaming) {
          setIsComplete(false);

          // Setze einen Timeout, um isComplete nach einer kurzen Verzögerung auf true zu setzen
          // Dies gibt dem Benutzer Zeit, den Streaming-Indikator zu sehen
          if (streamingTimeoutRef.current) {
            clearTimeout(streamingTimeoutRef.current);
          }

          streamingTimeoutRef.current = setTimeout(() => {
            startTransition(() => {
              setIsComplete(true);
            });
          }, 1000); // 1 Sekunde Verzögerung für stabilere Anzeige
        } else {
          // Wenn kein Streaming aktiv ist, setze isComplete sofort auf true
          startTransition(() => {
            setIsComplete(true);
          });
        }
      } catch (error) {
        console.error('Fehler bei der Mall-Content-Verarbeitung:', error);
        startTransition(() => {
          setIsComplete(true); // Bei Fehlern immer als abgeschlossen markieren
        });
      }
    }, 300); // 300ms Debounce-Zeit für stabilere Anzeige
  }, [content, isStreaming, query]);

  // Zusätzlicher Effekt, um sicherzustellen, dass isComplete nach einer bestimmten Zeit auf true gesetzt wird
  useEffect(() => {
    // Sicherheits-Timeout: Setze isComplete nach 1,5 Sekunden auf true, falls es noch nicht geschehen ist
    const safetyTimer = setTimeout(() => {
      setIsComplete(true);
    }, 300); // Reduziert auf 0,3 Sekunden für schnellere Anzeige

    return () => clearTimeout(safetyTimer);
  }, [content]);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    sections,
    isComplete,
    processedHtml,
    query // Gib die Anfrage zurück, damit sie in der Komponente verwendet werden kann
  };
}