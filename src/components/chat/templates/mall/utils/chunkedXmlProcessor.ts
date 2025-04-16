'use client';

import { repairXmlContent } from './safeXmlParser';
import { isValidXml } from './xmlValidator';
import { logData } from './dataLogger';
import { sanitizeXml } from './xmlSanitizer';

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
    '</chunk>', // Haupt-End-Tag für Flowise Chunk-Format
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
 * Validiert und repariert einen XML-Chunk mit verbesserter Fehlertoleranz
 */
function validateAndRepairChunk(chunk: string): { isValid: boolean; repairedChunk: string } {
  try {
    // Entferne überschüssige schließende Tags am Ende des Chunks
    // Dies ist ein häufiges Problem beim Streaming
    const cleanedChunk = chunk.replace(/(<\/[^>]+>)+$/, '');

    // Repariere den XML-Inhalt
    const repairedChunk = repairXmlContent(cleanedChunk);

    // Validiere den reparierten Chunk mit verbesserter Fehlertoleranz
    // Prüfe auf vollständige Tag-Paare für wichtige Elemente
    const hasCompleteIntro = (repairedChunk.includes('<intro>') && repairedChunk.includes('</intro>'));
    const hasCompleteTip = (repairedChunk.includes('<tip>') && repairedChunk.includes('</tip>'));
    const hasCompleteShop = (repairedChunk.includes('<shop>') && repairedChunk.includes('</shop>'));
    const hasCompleteRestaurant = (repairedChunk.includes('<restaurant>') && repairedChunk.includes('</restaurant>'));
    
    // Ein Chunk ist gültig, wenn er mindestens ein vollständiges Element enthält
    const hasCompleteElement = hasCompleteIntro || hasCompleteTip || hasCompleteShop || hasCompleteRestaurant;
    
    // Fallback-Validierung für andere Elemente
    const hasOpeningTag = /<[^/][^>]*>/.test(repairedChunk);
    const hasClosingTag = /<\/[^>]+>/.test(repairedChunk);
    const isBalanced = !hasOpeningTag && !hasClosingTag || (hasOpeningTag && hasClosingTag);
    
    // Kombinierte Validierung
    const isValid = hasCompleteElement || isBalanced;

    // Wenn der Chunk nicht gültig ist, aber trotzdem wichtige Informationen enthält,
    // betrachten wir ihn als gültig, um Datenverlust zu vermeiden
    if (!isValid && containsImportantContent(cleanedChunk)) {
      console.log('Chunk enthält wichtige Informationen trotz XML-Fehler, wird akzeptiert');
      return { isValid: true, repairedChunk };
    }

    return { isValid, repairedChunk };
  } catch (error) {
    console.error('Fehler bei der Chunk-Validierung:', error);
    // Bei Fehlern versuchen wir trotzdem, den Chunk zu verwenden, wenn er wichtige Inhalte enthält
    if (containsImportantContent(chunk)) {
      return { isValid: true, repairedChunk: chunk };
    }
    return { isValid: false, repairedChunk: chunk };
  }
}

/**
 * Prüft, ob ein Chunk wichtige Inhalte enthält, auch wenn er nicht valides XML ist
 * Verbesserte Version mit mehr Erkennungsmustern
 */
function containsImportantContent(chunk: string): boolean {
  if (!chunk || chunk.length < 10) return false;
  
  try {
    // Sanitize den Chunk für bessere Erkennung
    const sanitizedChunk = sanitizeXml(chunk);

    // Prüfe auf wichtige Inhaltstags mit mehr Varianten
    const hasNameInfo = sanitizedChunk.includes('<name>') || sanitizedChunk.includes('<n>') || 
                       sanitizedChunk.match(/name[^>]*>[^<]+/);
                       
    const hasCategoryInfo = sanitizedChunk.includes('<category>') || sanitizedChunk.match(/category[^>]*>[^<]+/);
    
    const hasImageInfo = sanitizedChunk.includes('<image>') || sanitizedChunk.match(/image[^>]*>http/);
    
    // Prüfe auf Sektions-Tags
    const hasIntroContent = sanitizedChunk.includes('<intro>') && sanitizedChunk.length > 15;
    const hasTipContent = sanitizedChunk.includes('<tip>') && sanitizedChunk.length > 15;
    const hasFollowUpContent = sanitizedChunk.includes('<followUp>') && sanitizedChunk.length > 15;

    // Prüfe auf strukturierte Daten mit mehr Varianten
    const hasStructuredData = (
      sanitizedChunk.includes('<shop') ||
      sanitizedChunk.includes('<restaurant') ||
      sanitizedChunk.includes('<event') ||
      sanitizedChunk.includes('<service') ||
      sanitizedChunk.includes('<opening') ||
      sanitizedChunk.includes('<parking')
    );
    
    // Prüfe auf Beschreibungsinhalte
    const hasDescriptionContent = sanitizedChunk.includes('<description>') && 
                                 sanitizedChunk.match(/<description>[^<]{10,}/);

    return hasNameInfo || hasCategoryInfo || hasImageInfo || 
           hasIntroContent || hasTipContent || hasFollowUpContent || 
           hasStructuredData || hasDescriptionContent;
  } catch (error) {
    // Bei Fehlern in der Erkennung gehen wir auf Nummer sicher und betrachten längere Chunks als wichtig
    return chunk.length > 50;
  }
}

/**
 * Verarbeitet XML-Inhalte in Chunks
 */
export function processXmlContent(content: string, previousContent: string = ''): {
  validContent: string;
  remainingContent: string;
  hasInvalidChunks: boolean;
  processedChunks: string[];
} {
  try {
    // Kombiniere vorherigen und neuen Content
    const combinedContent = previousContent + content;

    // Parse Chunks
    const { chunks, remainingContent, invalidChunks } = parseXmlChunks(combinedContent);

    // Kombiniere gültige Chunks
    const validContent = chunks.join('');

    // Wenn wir gültige Chunks haben, aber auch ungültige, versuche die ungültigen zu retten
    if (chunks.length > 0 && invalidChunks.length > 0) {
      console.log(`${chunks.length} gültige Chunks und ${invalidChunks.length} ungültige Chunks gefunden`);
    }

    return {
      validContent,
      remainingContent,
      hasInvalidChunks: invalidChunks.length > 0,
      processedChunks: chunks // Gib die verarbeiteten Chunks zurück für inkrementelles Rendering
    };
  } catch (error) {
    console.error('Fehler bei der XML-Verarbeitung:', error);
    return {
      validContent: previousContent,
      remainingContent: content,
      hasInvalidChunks: true,
      processedChunks: [] // Keine Chunks bei Fehler
    };
  }
}
