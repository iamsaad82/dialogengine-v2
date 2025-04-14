'use client';

/**
 * XML-Sanitizer für die Vorverarbeitung von XML-Inhalten
 *
 * Diese Utility-Klasse bereitet XML-Inhalte für das Parsing vor,
 * indem sie Encoding-Probleme behebt und problematische Zeichen entschärft.
 */

/**
 * Sanitiert XML-Inhalte für das Parsing
 */
export function sanitizeXml(content: string): string {
  if (!content) return '';

  // Schritt 1: Encoding sicherstellen (UTF-8)
  // Da JavaScript Strings bereits in UTF-16 sind, müssen wir nur sicherstellen,
  // dass keine ungültigen Zeichen enthalten sind
  let sanitized = content
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // Entferne Steuerzeichen
    .replace(/\uFFFD/g, '') // Entferne Ersatzzeichen
    .replace(/\r\n|\r|\n/g, ' '); // Normalisiere Zeilenumbrüche zu Leerzeichen

  // Schritt 2: XML-Entitäten für problematische Zeichen außerhalb von Tags
  sanitized = escapeXmlEntitiesOutsideTags(sanitized);

  // Schritt 3: Doppelte Leerzeichen außerhalb von Tags entfernen
  sanitized = removeExtraWhitespaceOutsideTags(sanitized);

  // Schritt 4: Sicherstellen, dass Tags korrekt geschlossen sind
  sanitized = ensureClosedTags(sanitized);

  return sanitized;
}

/**
 * Ersetzt problematische XML-Zeichen durch Entitäten, aber nur außerhalb von Tags
 */
function escapeXmlEntitiesOutsideTags(content: string): string {
  // Teile den Content in Tags und Text auf
  const parts: { isTag: boolean; content: string }[] = [];
  let currentIndex = 0;
  let inTag = false;

  // Finde alle Tags und Text dazwischen
  while (currentIndex < content.length) {
    if (!inTag && content.indexOf('<', currentIndex) !== -1) {
      // Text vor dem Tag
      const tagStart = content.indexOf('<', currentIndex);
      if (tagStart > currentIndex) {
        parts.push({
          isTag: false,
          content: content.substring(currentIndex, tagStart)
        });
      }

      inTag = true;
      currentIndex = tagStart;
    } else if (inTag && content.indexOf('>', currentIndex) !== -1) {
      // Tag
      const tagEnd = content.indexOf('>', currentIndex) + 1;
      parts.push({
        isTag: true,
        content: content.substring(currentIndex, tagEnd)
      });

      inTag = false;
      currentIndex = tagEnd;
    } else {
      // Rest des Contents
      parts.push({
        isTag: inTag,
        content: content.substring(currentIndex)
      });
      break;
    }
  }

  // Ersetze problematische Zeichen nur in Textteilen
  return parts.map(part => {
    if (part.isTag) {
      return part.content;
    } else {
      return part.content
        .replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }
  }).join('');
}

/**
 * Entfernt doppelte Leerzeichen außerhalb von Tags
 */
function removeExtraWhitespaceOutsideTags(content: string): string {
  // Teile den Content in Tags und Text auf
  const parts: { isTag: boolean; content: string }[] = [];
  let currentIndex = 0;
  let inTag = false;

  // Finde alle Tags und Text dazwischen
  while (currentIndex < content.length) {
    if (!inTag && content.indexOf('<', currentIndex) !== -1) {
      // Text vor dem Tag
      const tagStart = content.indexOf('<', currentIndex);
      if (tagStart > currentIndex) {
        parts.push({
          isTag: false,
          content: content.substring(currentIndex, tagStart)
        });
      }

      inTag = true;
      currentIndex = tagStart;
    } else if (inTag && content.indexOf('>', currentIndex) !== -1) {
      // Tag
      const tagEnd = content.indexOf('>', currentIndex) + 1;
      parts.push({
        isTag: true,
        content: content.substring(currentIndex, tagEnd)
      });

      inTag = false;
      currentIndex = tagEnd;
    } else {
      // Rest des Contents
      parts.push({
        isTag: inTag,
        content: content.substring(currentIndex)
      });
      break;
    }
  }

  // Entferne doppelte Leerzeichen nur in Textteilen
  return parts.map(part => {
    if (part.isTag) {
      return part.content;
    } else {
      return part.content.replace(/\s+/g, ' ').trim();
    }
  }).join('');
}

/**
 * Stellt sicher, dass alle Tags korrekt geschlossen sind
 */
function ensureClosedTags(content: string): string {
  // Liste der Tags, die geschlossen werden müssen
  const tagPairs = [
    { open: '<intro>', close: '</intro>' },
    { open: '<tip>', close: '</tip>' },
    { open: '<shop>', close: '</shop>' },
    { open: '<restaurant>', close: '</restaurant>' },
    { open: '<event>', close: '</event>' },
    { open: '<service>', close: '</service>' },
    { open: '<shops', close: '</shops>' },
    { open: '<restaurants', close: '</restaurants>' },
    { open: '<events', close: '</events>' },
    { open: '<services', close: '</services>' },
    { open: '<openingHours', close: '</openingHours>' },
    { open: '<parking', close: '</parking>' },
    { open: '<name>', close: '</name>' },
    { open: '<n>', close: '</n>' },
    { open: '<category>', close: '</category>' },
    { open: '<floor>', close: '</floor>' },
    { open: '<image>', close: '</image>' },
    { open: '<description>', close: '</description>' },
    { open: '<opening>', close: '</opening>' },
    { open: '<location>', close: '</location>' },
    { open: '<date>', close: '</date>' },
    { open: '<time>', close: '</time>' },
    { open: '<duration>', close: '</duration>' },
    { open: '<price>', close: '</price>' },
    { open: '<day>', close: '</day>' },
    { open: '<hours>', close: '</hours>' }
  ];

  let result = content;

  // Prüfe auf fehlende schließende Tags
  tagPairs.forEach(tag => {
    const openCount = (result.match(new RegExp(escapeRegExp(tag.open), 'g')) || []).length;
    const closeCount = (result.match(new RegExp(escapeRegExp(tag.close), 'g')) || []).length;

    if (openCount > closeCount) {
      // Füge fehlende schließende Tags hinzu
      for (let i = 0; i < openCount - closeCount; i++) {
        result += tag.close;
      }
    }
  });

  return result;
}

/**
 * Escapes special characters in a string for use in a regular expression
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
