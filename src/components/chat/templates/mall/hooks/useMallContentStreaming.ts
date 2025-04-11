'use client';

import { useState, useEffect, useRef } from 'react';
import { MallSection, parseMallContent, incrementalParseMallContent } from '../utils/contentParser';

/**
 * Hook für die Verarbeitung von Streaming-Inhalten für das Mall-Template
 * Mit verbesserter Streaming-Unterstützung und Berücksichtigung der Nutzeranfrage
 */
export function useMallContentStreaming(content: string, isStreaming: boolean, query: string = '') {
  const [sections, setSections] = useState<MallSection[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(!isStreaming);
  const [processedHtml, setProcessedHtml] = useState<string>('');
  const previousContentRef = useRef<string>('');
  const streamingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Verarbeite den Content bei Änderungen
  useEffect(() => {
    // Wenn sich der Content nicht geändert hat, überspringe
    if (content === previousContentRef.current) return;

    // Aktualisiere den gespeicherten Content
    previousContentRef.current = content;

    try {
      // Wenn Streaming aktiv ist, verwende inkrementelles Parsen
      if (isStreaming) {
        // Inkrementelles Parsen für bessere Streaming-Erfahrung
        const newSections = incrementalParseMallContent(content, query);

        // Setze die Sektionen und den Original-Content
        // Nur aktualisieren, wenn wir neue Sektionen haben
        if (newSections.length > 0) {
          setSections(newSections);
        }
        setProcessedHtml(content);
      } else {
        // Wenn kein Streaming aktiv ist, verwende normales Parsen
        const newSections = parseMallContent(content, query);

        // Setze die Sektionen und den Original-Content
        setSections(newSections);
        setProcessedHtml(content);
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
        }, 500); // Reduziert auf 0,5 Sekunden Verzögerung
      } else {
        // Wenn kein Streaming aktiv ist, setze isComplete sofort auf true
        setIsComplete(true);
      }
    } catch (error) {
      console.error('Fehler bei der Mall-Content-Verarbeitung:', error);
      setProcessedHtml(content);
      setIsComplete(true); // Bei Fehlern immer als abgeschlossen markieren
    }
  }, [content, isStreaming]);

  // Zusätzlicher Effekt, um sicherzustellen, dass isComplete nach einer bestimmten Zeit auf true gesetzt wird
  useEffect(() => {
    // Sicherheits-Timeout: Setze isComplete nach 2 Sekunden auf true, falls es noch nicht geschehen ist
    const safetyTimer = setTimeout(() => {
      setIsComplete(true);
    }, 2000);

    return () => clearTimeout(safetyTimer);
  }, [content]);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
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