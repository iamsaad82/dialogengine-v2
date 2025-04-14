'use client';

/**
 * XML-Balancer für die Korrektur von ungleichen Tags
 * 
 * Diese Utility-Klasse korrigiert ungleiche öffnende und schließende Tags
 * in XML-Inhalten.
 */

/**
 * Balanciert XML-Tags, um sicherzustellen, dass jedes öffnende Tag ein entsprechendes
 * schließendes Tag hat und umgekehrt.
 */
export function balanceXmlTags(content: string): string {
  if (!content) return '';
  
  console.log('XML-Balancer: Starte mit Content-Länge', content.length);
  
  // Schritt 1: Normalisiere den Content
  let normalizedContent = content
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // Entferne Steuerzeichen
    .replace(/\uFFFD/g, '') // Entferne Ersatzzeichen
    .replace(/\r\n|\r|\n/g, ' ') // Normalisiere Zeilenumbrüche zu Leerzeichen
    .replace(/\s+/g, ' ') // Normalisiere Whitespace
    .trim();
  
  // Schritt 2: Identifiziere alle Tags
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  const tags: { type: string; isOpening: boolean; position: number }[] = [];
  let match;
  
  while ((match = tagRegex.exec(normalizedContent)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    const isOpening = !fullTag.includes('/');
    
    tags.push({
      type: tagName,
      isOpening,
      position: match.index
    });
  }
  
  // Schritt 3: Analysiere die Tag-Struktur
  const tagStack: { type: string; position: number }[] = [];
  const missingClosingTags: { type: string; position: number }[] = [];
  const extraClosingTags: { type: string; position: number }[] = [];
  
  tags.forEach(tag => {
    if (tag.isOpening) {
      // Öffnendes Tag
      tagStack.push({ type: tag.type, position: tag.position });
    } else {
      // Schließendes Tag
      if (tagStack.length > 0 && tagStack[tagStack.length - 1].type === tag.type) {
        // Passendes öffnendes Tag gefunden
        tagStack.pop();
      } else {
        // Kein passendes öffnendes Tag gefunden
        extraClosingTags.push({ type: tag.type, position: tag.position });
      }
    }
  });
  
  // Übrige öffnende Tags benötigen schließende Tags
  missingClosingTags.push(...tagStack);
  
  // Schritt 4: Korrigiere die Tag-Struktur
  let balancedContent = normalizedContent;
  
  // Entferne überschüssige schließende Tags
  extraClosingTags.forEach(tag => {
    const tagToRemove = `</${tag.type}>`;
    balancedContent = balancedContent.replace(tagToRemove, '');
  });
  
  // Füge fehlende schließende Tags hinzu
  missingClosingTags.reverse().forEach(tag => {
    balancedContent += `</${tag.type}>`;
  });
  
  // Schritt 5: Füge Zeilenumbrüche für bessere Lesbarkeit hinzu
  balancedContent = balancedContent
    .replace(/<\/intro>/g, '</intro>\n\n')
    .replace(/<\/shop>/g, '</shop>\n\n')
    .replace(/<\/restaurant>/g, '</restaurant>\n\n')
    .replace(/<\/event>/g, '</event>\n\n')
    .replace(/<\/service>/g, '</service>\n\n')
    .replace(/<\/shops>/g, '</shops>\n\n')
    .replace(/<\/restaurants>/g, '</restaurants>\n\n')
    .replace(/<\/events>/g, '</events>\n\n')
    .replace(/<\/services>/g, '</services>\n\n')
    .replace(/<\/tip>/g, '</tip>\n\n');
  
  console.log('XML-Balancer: Abgeschlossen mit Content-Länge', balancedContent.length);
  console.log('XML-Balancer: Entfernte überschüssige Tags:', extraClosingTags.length);
  console.log('XML-Balancer: Hinzugefügte fehlende Tags:', missingClosingTags.length);
  
  return balancedContent;
}
