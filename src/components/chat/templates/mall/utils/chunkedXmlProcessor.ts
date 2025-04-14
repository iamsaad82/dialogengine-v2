'use client';

import { repairXmlContent } from './safeXmlParser';
import { isValidXml } from './xmlValidator';
import { logData } from './dataLogger';

/**
 * Chunk-basierter XML-Prozessor
 * 
 * Diese Utility-Klasse verarbeitet XML-Inhalte in Chunks, validiert und repariert sie.
 */

/**
 * Parst XML-Inhalte in Chunks basierend auf End-Tags
 */
export function parseXmlChunks(content: string): { 
  chunks: string[]; 
  remainingContent: string;
  invalidChunks: string[];
} {
  const chunks: string[] = [];
  const invalidChunks: string[] = [];
  let remainingContent = content;
  
  // Definiere die End-Tags, die einen vollständigen Chunk markieren
  const chunkEndTags = [
    '</intro>',
    '</shop>',
    '</restaurant>',
    '</event>',
    '</service>',
    '</shops>',
    '</restaurants>',
    '</events>',
    '</services>',
    '</openingHours>',
    '</parking>',
    '</tip>',
    '</followUp>'
  ];
  
  // Suche nach vollständigen Chunks
  let foundChunk = true;
  while (foundChunk) {
    foundChunk = false;
    
    for (const endTag of chunkEndTags) {
      const endTagIndex = remainingContent.indexOf(endTag);
      
      if (endTagIndex !== -1) {
        // Vollständigen Chunk gefunden
        const chunkEnd = endTagIndex + endTag.length;
        const chunk = remainingContent.substring(0, chunkEnd);
        
        // Validiere und repariere den Chunk
        const { isValid, repairedChunk } = validateAndRepairChunk(chunk);
        
        if (isValid) {
          // Chunk zur Liste hinzufügen
          chunks.push(repairedChunk);
        } else {
          // Ungültigen Chunk protokollieren
          invalidChunks.push(chunk);
          logData('Ungültiger XML-Chunk', chunk);
        }
        
        // Verbleibenden Content aktualisieren
        remainingContent = remainingContent.substring(chunkEnd);
        
        foundChunk = true;
        break;
      }
    }
  }
  
  return { chunks, remainingContent, invalidChunks };
}

/**
 * Validiert und repariert einen XML-Chunk
 */
function validateAndRepairChunk(chunk: string): { isValid: boolean; repairedChunk: string } {
  // Repariere den XML-Inhalt
  const repairedChunk = repairXmlContent(chunk);
  
  // Validiere den reparierten Chunk
  const isValid = isValidXml(`<root>${repairedChunk}</root>`);
  
  return { isValid, repairedChunk };
}

/**
 * Verarbeitet XML-Inhalte in Chunks
 */
export function processXmlContent(content: string, previousContent: string = ''): {
  validContent: string;
  remainingContent: string;
  hasInvalidChunks: boolean;
} {
  // Kombiniere vorherigen und neuen Content
  const combinedContent = previousContent + content;
  
  // Parse Chunks
  const { chunks, remainingContent, invalidChunks } = parseXmlChunks(combinedContent);
  
  // Kombiniere gültige Chunks
  const validContent = chunks.join('');
  
  return {
    validContent,
    remainingContent,
    hasInvalidChunks: invalidChunks.length > 0
  };
}
