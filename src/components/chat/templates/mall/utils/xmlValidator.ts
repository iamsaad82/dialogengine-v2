'use client';

/**
 * XML-Validator für die Überprüfung von XML-Inhalten
 * 
 * Diese Utility-Klasse prüft, ob XML-Inhalte wohlgeformt sind.
 */

/**
 * Prüft, ob XML-Inhalte wohlgeformt sind
 */
export function isValidXml(content: string): boolean {
  if (!content) return false;
  
  try {
    // Verwende DOMParser für die Validierung
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    
    // Prüfe, ob der Parser Fehler gefunden hat
    const parserError = doc.querySelector('parsererror');
    return !parserError;
  } catch (error) {
    console.error('Fehler bei der XML-Validierung:', error);
    return false;
  }
}

/**
 * Prüft, ob XML-Inhalte wohlgeformt sind und gibt Details zurück
 */
export function validateXml(content: string): { isValid: boolean; errors: string[] } {
  if (!content) return { isValid: false, errors: ['Leerer Inhalt'] };
  
  try {
    // Verwende DOMParser für die Validierung
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    
    // Prüfe, ob der Parser Fehler gefunden hat
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return {
        isValid: false,
        errors: [parserError.textContent || 'Unbekannter Parser-Fehler']
      };
    }
    
    return { isValid: true, errors: [] };
  } catch (error) {
    console.error('Fehler bei der XML-Validierung:', error);
    return {
      isValid: false,
      errors: [(error as Error).message || 'Unbekannter Fehler']
    };
  }
}

/**
 * Prüft, ob XML-Inhalte bestimmte Tags enthalten
 */
export function containsXmlTags(content: string, tags: string[]): boolean {
  if (!content) return false;
  
  return tags.some(tag => {
    const openTag = `<${tag}>`;
    const closeTag = `</${tag}>`;
    return content.includes(openTag) && content.includes(closeTag);
  });
}
