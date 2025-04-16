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

  // Entferne überschüssige schließende Tags am Ende des Contents
  // Dies ist ein häufiges Problem beim Streaming
  content = content.replace(/(<\/[^>]+>)+$/, '');

  // Schritt 1: Normalisiere den Content
  let normalizedContent = content
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // Entferne Steuerzeichen
    .replace(/\uFFFD/g, '') // Entferne Ersatzzeichen
    .replace(/\r\n|\r|\n/g, ' ') // Normalisiere Zeilenumbrüche zu Leerzeichen
    .replace(/\s+/g, ' ') // Normalisiere Whitespace
    .trim();

  // Schritt 2: Zähle öffnende und schließende Tags
  const tagCounts = new Map<string, { opening: number, closing: number }>();
  const openingTagRegex = /<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>/g;
  const closingTagRegex = /<\/([a-zA-Z][a-zA-Z0-9]*)>/g;

  let match;

  // Zähle öffnende Tags
  while ((match = openingTagRegex.exec(normalizedContent)) !== null) {
    const tagName = match[1];
    if (!tagCounts.has(tagName)) {
      tagCounts.set(tagName, { opening: 0, closing: 0 });
    }
    const counts = tagCounts.get(tagName)!;
    counts.opening++;
    tagCounts.set(tagName, counts);
  }

  // Zähle schließende Tags
  while ((match = closingTagRegex.exec(normalizedContent)) !== null) {
    const tagName = match[1];
    if (!tagCounts.has(tagName)) {
      tagCounts.set(tagName, { opening: 0, closing: 0 });
    }
    const counts = tagCounts.get(tagName)!;
    counts.closing++;
    tagCounts.set(tagName, counts);
  }

  // Schritt 3: Identifiziere unbalancierte Tags
  const missingClosingTags: string[] = [];
  const extraClosingTags: string[] = [];

  tagCounts.forEach((counts, tagName) => {
    const diff = counts.opening - counts.closing;

    if (diff > 0) {
      // Fehlende schließende Tags
      for (let i = 0; i < diff; i++) {
        missingClosingTags.push(tagName);
      }
    } else if (diff < 0) {
      // Überschüssige schließende Tags
      for (let i = 0; i < Math.abs(diff); i++) {
        extraClosingTags.push(tagName);
      }
    }
  });

  // Schritt 4: Korrigiere die Tag-Struktur
  let balancedContent = normalizedContent;

  // Entferne überschüssige schließende Tags
  extraClosingTags.forEach(tagName => {
    // Finde das letzte Vorkommen des schließenden Tags
    const tagToRemove = `</${tagName}>`;
    const lastIndex = balancedContent.lastIndexOf(tagToRemove);

    if (lastIndex !== -1) {
      balancedContent =
        balancedContent.substring(0, lastIndex) +
        balancedContent.substring(lastIndex + tagToRemove.length);
    }
  });

  // Füge fehlende schließende Tags hinzu
  missingClosingTags.forEach(tagName => {
    balancedContent += `</${tagName}>`;
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

  // Protokolliere die unbalancierten Tags
  if (extraClosingTags.length > 0) {
    console.log('XML-Balancer: Überschüssige schließende Tags:', extraClosingTags);
  }

  if (missingClosingTags.length > 0) {
    console.log('XML-Balancer: Fehlende schließende Tags:', missingClosingTags);
  }

  return balancedContent;
}
