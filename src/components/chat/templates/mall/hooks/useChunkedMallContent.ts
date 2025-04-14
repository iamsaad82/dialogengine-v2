'use client';

import { useState, useEffect, useRef } from 'react';
import { processXmlContent } from '../utils/chunkedXmlProcessor';
import { MallSection } from '../utils/contentParser';
import { safeParseXmlContent } from '../utils/safeXmlParser';
import { logData } from '../utils/dataLogger';

/**
 * Hook für die Verarbeitung von Mall-Content in Chunks
 * 
 * Dieser Hook verarbeitet XML-Inhalte in Chunks, validiert und repariert sie,
 * und parst sie dann in MallSection-Objekte.
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
  
  // Effekt für Content-Verarbeitung
  useEffect(() => {
    if (content === previousContentRef.current) {
      return;
    }
    
    try {
      // Verarbeite Content in Chunks
      const { validContent: newValidContent, remainingContent, hasInvalidChunks } = processXmlContent(
        content,
        remainingContentRef.current
      );
      
      // Aktualisiere Refs
      remainingContentRef.current = remainingContent;
      previousContentRef.current = content;
      
      if (hasInvalidChunks) {
        hasInvalidChunksRef.current = true;
      }
      
      // Aktualisiere State nur, wenn sich der gültige Content geändert hat
      if (newValidContent && newValidContent !== validContent) {
        setValidContent(newValidContent);
        
        // Parse den gültigen Content in Sektionen
        const newSections = safeParseXmlContent(newValidContent, query);
        
        if (newSections.length > 0) {
          setSections(newSections);
          setHasError(false);
          setErrorMessage(null);
        }
      }
    } catch (error) {
      console.error('Fehler bei der Chunk-Verarbeitung:', error);
      logData('Fehler bei der Chunk-Verarbeitung', content);
    }
  }, [content, query, validContent]);
  
  // Effekt für Fehlerbehandlung nach Streaming
  useEffect(() => {
    if (!isStreaming && content) {
      // Wenn das Streaming abgeschlossen ist und keine Sektionen gefunden wurden
      if (sections.length === 0) {
        setHasError(true);
        setErrorMessage('Der Inhalt konnte nicht korrekt verarbeitet werden.');
        logData('Keine Sektionen nach Streaming', content);
      }
      // Wenn ungültige Chunks gefunden wurden
      else if (hasInvalidChunksRef.current) {
        setHasError(true);
        setErrorMessage('Teile des Inhalts konnten nicht korrekt verarbeitet werden.');
        logData('Ungültige Chunks nach Streaming', content);
      }
    }
  }, [isStreaming, content, sections.length]);
  
  return {
    sections,
    validContent,
    hasError,
    errorMessage
  };
}
