'use client';

import { useState, useEffect, useRef } from 'react';
import { MallSection, parseMallContent, incrementalParseMallContent } from '../utils/contentParser';
import { parseXmlContent } from '../utils/xmlParser';

/**
 * Optimierter Hook für stabile Mall-Template Streaming-Anzeige
 *
 * Unterstützt die dreistufige Struktur:
 * 1. Intro: Direkte Antwort
 * 2. Data: Strukturierte Daten (Shops, Restaurants, Events)
 * 3. Tip: Mehrwert-Tipp
 */
export function useMallContentStreaming(content: string, isStreaming: boolean, query: string = '') {
  // Einziger State für alle Sektionen
  const [sections, setSections] = useState<MallSection[]>([]);

  // Refs für interne Zustandsverwaltung ohne Re-Renders
  const isCompleteRef = useRef<boolean>(!isStreaming);
  const previousContentRef = useRef<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const parsedContentCacheRef = useRef<{[key: string]: MallSection[]}>({});

  // Hohe Debounce-Zeit für stabile Darstellung ohne Flackern
  const DEBOUNCE_MS = 600;

  // Effekt für Content-Verarbeitung mit minimalem UI-Update
  useEffect(() => {
    // Überspringe Verarbeitung, wenn identischer Content oder bereits in Bearbeitung
    if (isProcessingRef.current || content === previousContentRef.current) {
      return;
    }

    // Content-Verarbeitung als aktiv markieren
    isProcessingRef.current = true;

    // Content für Vergleiche speichern
    previousContentRef.current = content;

    // Bestehende Timeouts abbrechen
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Verzögerung für stabile Darstellung und Batch-Updates
    timeoutRef.current = setTimeout(async () => {
      try {
        // Prüfe, ob der Content sich inzwischen geändert hat
        if (content === previousContentRef.current) {
          // Prüfe Cache für wiederholte Anfragen
          if (parsedContentCacheRef.current[content]) {
            setSections(parsedContentCacheRef.current[content]);
          } else {
            // Versuche zuerst, XML-Tags zu parsen
            let newSections: MallSection[] = [];

            // Prüfe, ob der Content XML-Tags enthält
            if (content.includes('<shop>') || content.includes('<restaurant>') ||
                content.includes('<intro>') || content.includes('<tip>')) {
              console.log('XML-Tags erkannt, verwende XML-Parser');
              newSections = parseXmlContent(content, query);
            } else {
              // Fallback auf den regulären Parser
              console.log('Keine XML-Tags erkannt, verwende regulären Parser');
              newSections = isStreaming
                ? incrementalParseMallContent(content, query)
                : parseMallContent(content, query);
            }

            // Überprüfe auf tatsächliche Änderungen und Mindestqualität
            if (newSections.length > 0) {
              // Deep equality check durch Stringifizierung vermeidet unnötige Re-Renders
              const newSectionsStr = JSON.stringify(newSections);
              const currentSectionsStr = JSON.stringify(sections);

              if (newSectionsStr !== currentSectionsStr) {
                // Priorisiere wichtige Sektionen (Intro, Shops, Tip)
                const prioritySections = sortSectionsByPriority(newSections);
                setSections(prioritySections);

                // Cache für wiederholte Anfragen
                parsedContentCacheRef.current[content] = prioritySections;
              }
            }
          }

          // Verarbeitung als abgeschlossen markieren
          isCompleteRef.current = !isStreaming;
        }
      } catch (error) {
        console.error('Fehler bei Mall-Content-Parsing:', error);
      } finally {
        // Verarbeitung als abgeschlossen markieren, auch bei Fehlern
        isProcessingRef.current = false;
      }
    }, DEBOUNCE_MS);

    // Cleanup-Funktion
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, isStreaming, query, sections]);

  /**
   * Sortiert Sektionen nach Priorität für ein konsistentes Layout
   */
  function sortSectionsByPriority(sections: MallSection[]): MallSection[] {
    // Extrahiere Sektionen nach Typ
    const introSection = sections.find(s => s.type === 'intro');
    const tipSection = sections.find(s => s.type === 'tip');
    const shopSections = sections.filter(s => s.type === 'shops');
    const restaurantSections = sections.filter(s => s.type === 'restaurants');
    const eventSections = sections.filter(s => s.type === 'events');
    const otherSections = sections.filter(s =>
      !['intro', 'shops', 'restaurants', 'events', 'tip'].includes(s.type));

    // Sortierte Reihenfolge für stabile Darstellung
    const sortedSections: MallSection[] = [];

    // 1. Intro-Sektion (sollte immer zuerst kommen)
    if (introSection) sortedSections.push(introSection);

    // 2. Informative Sektionen in sinnvoller Reihenfolge
    sortedSections.push(...shopSections);
    sortedSections.push(...restaurantSections);
    sortedSections.push(...eventSections);
    sortedSections.push(...otherSections);

    // 3. Tipp-Sektion (sollte immer zuletzt kommen)
    if (tipSection) sortedSections.push(tipSection);

    return sortedSections;
  }

  // Einfache API mit sections für minimalen Footprint
  return { sections };
}