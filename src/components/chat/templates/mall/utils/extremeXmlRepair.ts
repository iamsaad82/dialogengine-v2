'use client';

/**
 * Extreme XML-Reparaturfunktion für stark beschädigte XML-Inhalte
 * 
 * Diese Funktion versucht, stark beschädigte XML-Inhalte zu reparieren,
 * indem sie den Inhalt vollständig neu strukturiert.
 */
export function extremeXmlRepair(content: string): string {
  if (!content) return '';
  
  console.log('Extreme XML-Reparatur: Starte mit Content-Länge', content.length);
  
  // Schritt 1: Extrahiere die Hauptsektionen
  let repairedContent = '';
  
  // Intro-Sektion extrahieren und reparieren
  const introContent = extractSection(content, '<intro>', '</intro>');
  if (introContent) {
    repairedContent += `<intro>\n${cleanText(introContent)}\n</intro>\n\n`;
  }
  
  // Shops-Sektion extrahieren und reparieren
  const shopsMatch = content.match(/<shops([^>]*)>([\s\S]*?)<\/shops>/);
  if (shopsMatch) {
    const shopsAttrs = shopsMatch[1] || '';
    const shopsContent = shopsMatch[2] || '';
    
    // Extrahiere den Titel
    const titleMatch = shopsAttrs.match(/title="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : 'Shops im Center';
    
    // Starte die reparierte Shops-Sektion
    repairedContent += `<shops title="${title}">\n`;
    
    // Extrahiere und repariere einzelne Shops
    const shopBlocks = extractBlocks(shopsContent, '<shop>', '</shop>');
    shopBlocks.forEach(shopBlock => {
      repairedContent += '<shop>\n';
      
      // Extrahiere und repariere die Shop-Eigenschaften
      const properties = [
        { tag: 'name', required: true },
        { tag: 'category', required: false },
        { tag: 'floor', required: false },
        { tag: 'image', required: false },
        { tag: 'description', required: false },
        { tag: 'opening', required: false },
        { tag: 'link', required: false }
      ];
      
      properties.forEach(prop => {
        const value = extractProperty(shopBlock, prop.tag);
        if (value || prop.required) {
          repairedContent += `<${prop.tag}>${value || ''}</${prop.tag}>\n`;
        }
      });
      
      repairedContent += '</shop>\n\n';
    });
    
    repairedContent += '</shops>\n\n';
  }
  
  // Restaurants-Sektion extrahieren und reparieren
  const restaurantsMatch = content.match(/<restaurants([^>]*)>([\s\S]*?)<\/restaurants>/);
  if (restaurantsMatch) {
    const restaurantsAttrs = restaurantsMatch[1] || '';
    const restaurantsContent = restaurantsMatch[2] || '';
    
    // Extrahiere den Titel
    const titleMatch = restaurantsAttrs.match(/title="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : 'Restaurants im Center';
    
    // Starte die reparierte Restaurants-Sektion
    repairedContent += `<restaurants title="${title}">\n`;
    
    // Extrahiere und repariere einzelne Restaurants
    const restaurantBlocks = extractBlocks(restaurantsContent, '<restaurant>', '</restaurant>');
    restaurantBlocks.forEach(restaurantBlock => {
      repairedContent += '<restaurant>\n';
      
      // Extrahiere und repariere die Restaurant-Eigenschaften
      const properties = [
        { tag: 'name', required: true },
        { tag: 'category', required: false },
        { tag: 'floor', required: false },
        { tag: 'image', required: false },
        { tag: 'description', required: false },
        { tag: 'opening', required: false },
        { tag: 'link', required: false }
      ];
      
      properties.forEach(prop => {
        const value = extractProperty(restaurantBlock, prop.tag);
        if (value || prop.required) {
          repairedContent += `<${prop.tag}>${value || ''}</${prop.tag}>\n`;
        }
      });
      
      repairedContent += '</restaurant>\n\n';
    });
    
    repairedContent += '</restaurants>\n\n';
  }
  
  // Tip-Sektion extrahieren und reparieren
  const tipContent = extractSection(content, '<tip>', '</tip>');
  if (tipContent) {
    repairedContent += `<tip>\n${cleanText(tipContent)}\n</tip>\n\n`;
  }
  
  console.log('Extreme XML-Reparatur: Abgeschlossen mit Content-Länge', repairedContent.length);
  return repairedContent;
}

/**
 * Extrahiert eine Sektion aus dem Content
 */
function extractSection(content: string, startTag: string, endTag: string): string {
  const startIndex = content.indexOf(startTag);
  if (startIndex === -1) return '';
  
  const endIndex = content.indexOf(endTag, startIndex + startTag.length);
  if (endIndex === -1) return '';
  
  return content.substring(startIndex + startTag.length, endIndex);
}

/**
 * Extrahiert Blöcke aus dem Content
 */
function extractBlocks(content: string, startTag: string, endTag: string): string[] {
  const blocks: string[] = [];
  let currentIndex = 0;
  
  while (true) {
    const startIndex = content.indexOf(startTag, currentIndex);
    if (startIndex === -1) break;
    
    const endIndex = content.indexOf(endTag, startIndex + startTag.length);
    if (endIndex === -1) break;
    
    const block = content.substring(startIndex + startTag.length, endIndex);
    blocks.push(block);
    
    currentIndex = endIndex + endTag.length;
  }
  
  // Wenn keine vollständigen Blöcke gefunden wurden, versuche, unvollständige Blöcke zu extrahieren
  if (blocks.length === 0) {
    // Suche nach dem Anfang eines Blocks
    const startIndex = content.indexOf(startTag);
    if (startIndex !== -1) {
      // Nehme den Rest des Contents als unvollständigen Block
      const block = content.substring(startIndex + startTag.length);
      blocks.push(block);
    }
  }
  
  return blocks;
}

/**
 * Extrahiert eine Eigenschaft aus einem Block
 */
function extractProperty(block: string, tag: string): string {
  // Versuche zuerst, die Eigenschaft mit vollständigen Tags zu extrahieren
  const fullTagRegex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const fullTagMatch = block.match(fullTagRegex);
  if (fullTagMatch) return cleanText(fullTagMatch[1]);
  
  // Versuche dann, die Eigenschaft mit unvollständigen Tags zu extrahieren
  const startTagRegex = new RegExp(`<${tag}>([\\s\\S]*)`, 'i');
  const startTagMatch = block.match(startTagRegex);
  if (startTagMatch) {
    // Suche nach dem nächsten Tag, um das Ende der Eigenschaft zu finden
    const restContent = startTagMatch[1];
    const nextTagMatch = restContent.match(/<([a-z]+)>/i);
    if (nextTagMatch) {
      const endIndex = restContent.indexOf(nextTagMatch[0]);
      return cleanText(restContent.substring(0, endIndex));
    }
    return cleanText(restContent);
  }
  
  // Versuche, die Eigenschaft aus abgekürzten Tags zu extrahieren
  if (tag === 'name') {
    const nTagRegex = /<n>([\\s\\S]*?)<\/n>/i;
    const nTagMatch = block.match(nTagRegex);
    if (nTagMatch) return cleanText(nTagMatch[1]);
    
    const nStartTagRegex = /<n>([\\s\\S]*)/i;
    const nStartTagMatch = block.match(nStartTagRegex);
    if (nStartTagMatch) {
      const restContent = nStartTagMatch[1];
      const nextTagMatch = restContent.match(/<([a-z]+)>/i);
      if (nextTagMatch) {
        const endIndex = restContent.indexOf(nextTagMatch[0]);
        return cleanText(restContent.substring(0, endIndex));
      }
      return cleanText(restContent);
    }
  }
  
  // Versuche, die Eigenschaft aus dem Text zu extrahieren
  if (tag === 'name' && block.length > 0) {
    // Wenn keine Tags gefunden wurden, verwende die erste Zeile als Namen
    const lines = block.split('\n');
    return cleanText(lines[0]);
  }
  
  return '';
}

/**
 * Bereinigt Text von Sonderzeichen und doppelten Leerzeichen
 */
function cleanText(text: string): string {
  if (!text) return '';
  
  // Entferne HTML-Tags
  let cleanedText = text.replace(/<[^>]*>/g, '');
  
  // Entferne doppelte Leerzeichen und Zeilenumbrüche
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  
  return cleanedText;
}
