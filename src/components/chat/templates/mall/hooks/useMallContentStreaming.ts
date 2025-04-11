'use client';

import { useState, useEffect, useRef } from 'react';
import { MallSection, parseMallContent, incrementalParseMallContent } from '../utils/contentParser';

/**
 * Verbesserte Hook für die Verarbeitung von Streaming-Inhalten für das Mall-Template
 * Mit optimierter Performance und flackerfreiem Streaming
 */
export function useMallContentStreaming(content: string, isStreaming: boolean, query: string = '') {
  const [sections, setSections] = useState<MallSection[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(!isStreaming);
  const [processedHtml, setProcessedHtml] = useState<string>('');
  const previousContentRef = useRef<string>('');
  const streamingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentChunksRef = useRef<string[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Verarbeite den Content bei Änderungen mit Debouncing für flackerfreies Streaming
  useEffect(() => {
    // Wenn sich der Content nicht geändert hat, überspringe
    if (content === previousContentRef.current) return;

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

    // Verwende ein kürzeres Debounce für schnellere Anzeige
    debounceTimerRef.current = setTimeout(() => {
      try {
        // Wenn Streaming aktiv ist, verwende inkrementelles Parsen
        if (isStreaming) {
          // Inkrementelles Parsen für bessere Streaming-Erfahrung
          const newSections = incrementalParseMallContent(content, query);
          console.log('Parsed sections during streaming:', newSections);

          // Setze die Sektionen immer, auch wenn wir nur wenige haben
          if (newSections.length > 0) {
            setSections(newSections);
          }
        } else {
          // Wenn kein Streaming aktiv ist, verwende normales Parsen
          const newSections = parseMallContent(content, query);
          console.log('Parsed sections after streaming:', newSections);

          // Setze die Sektionen und den Original-Content
          setSections(newSections);
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
            setIsComplete(true);
          }, 200); // Reduziert auf 0,2 Sekunden Verzögerung für schnellere Anzeige
        } else {
          // Wenn kein Streaming aktiv ist, setze isComplete sofort auf true
          setIsComplete(true);
        }
      } catch (error) {
        console.error('Fehler bei der Mall-Content-Verarbeitung:', error);
        setIsComplete(true); // Bei Fehlern immer als abgeschlossen markieren
      }
    }, 10); // 10ms Debounce-Zeit für sofortige Anzeige
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