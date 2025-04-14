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
  } else {
    // Versuche, Shops ohne vollständige Tags zu extrahieren
    const shopBlocks = extractBlocks(content, '<shop', '</shop>');
    if (shopBlocks.length > 0) {
      // Starte die reparierte Shops-Sektion
      repairedContent += `<shops title="Shops im Center">\n`;
      
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
  } else {
    // Suche nach Tip-Inhalten ohne vollständige Tags
    const tipMatch = content.match(/Tipp:([^<]*)/i);
    if (tipMatch) {
      repairedContent += `<tip>\n${cleanText(tipMatch[1])}\n</tip>\n\n`;
    }
  }
  
  console.log('Extreme XML-Reparatur: Abgeschlossen mit Content-Länge', repairedContent.length);
  return repairedContent;
}

/**
 * Extrahiert eine Sektion aus dem Content
 */
function extractSection(content: string, startTag: string, endTag: string): string {
  const startIndex = content.indexOf(startTag);
  if (startIndex === -1) {
    // Versuche, einen teilweise vorhandenen Start-Tag zu finden
    const partialStartTag = startTag.substring(0, startTag.length - 1);
    const partialStartIndex = content.indexOf(partialStartTag);
    if (partialStartIndex === -1) return '';
    
    // Suche nach dem Ende des Tags
    const tagEndIndex = content.indexOf('>', partialStartIndex);
    if (tagEndIndex === -1) return '';
    
    // Extrahiere den Inhalt nach dem teilweise vorhandenen Tag
    const endIndex = content.indexOf(endTag, tagEndIndex);
    if (endIndex === -1) {
      // Wenn kein End-Tag gefunden wurde, nimm den Rest des Contents
      return content.substring(tagEndIndex + 1);
    }
    
    return content.substring(tagEndIndex + 1, endIndex);
  }
  
  const endIndex = content.indexOf(endTag, startIndex + startTag.length);
  if (endIndex === -1) {
    // Wenn kein End-Tag gefunden wurde, versuche, ein teilweise vorhandenes End-Tag zu finden
    const partialEndTag = endTag.substring(0, endTag.length - 1);
    const partialEndIndex = content.indexOf(partialEndTag, startIndex + startTag.length);
    if (partialEndIndex === -1) {
      // Wenn auch kein teilweise vorhandenes End-Tag gefunden wurde, nimm den Rest des Contents
      return content.substring(startIndex + startTag.length);
    }
    
    return content.substring(startIndex + startTag.length, partialEndIndex);
  }
  
  return content.substring(startIndex + startTag.length, endIndex);
}

/**
 * Extrahiert Blöcke aus dem Content
 */
function extractBlocks(content: string, startTag: string, endTag: string): string[] {
  const blocks: string[] = [];
  let currentIndex = 0;
  
  // Versuche zuerst, vollständige Blöcke zu extrahieren
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
    // Suche nach allen möglichen Anfangspunkten von Blöcken
    const partialStartTag = startTag.substring(0, startTag.length - 1);
    const partialStartIndices: number[] = [];
    let searchIndex = 0;
    
    // Finde alle teilweise vorhandenen Start-Tags
    while (true) {
      const partialIndex = content.indexOf(partialStartTag, searchIndex);
      if (partialIndex === -1) break;
      
      partialStartIndices.push(partialIndex);
      searchIndex = partialIndex + partialStartTag.length;
    }
    
    // Finde alle vollständigen Start-Tags
    searchIndex = 0;
    while (true) {
      const fullIndex = content.indexOf(startTag, searchIndex);
      if (fullIndex === -1) break;
      
      partialStartIndices.push(fullIndex);
      searchIndex = fullIndex + startTag.length;
    }
    
    // Sortiere die Indizes
    partialStartIndices.sort((a, b) => a - b);
    
    // Extrahiere Blöcke für jeden gefundenen Index
    for (const startIdx of partialStartIndices) {
      // Suche nach dem Ende des Tags
      const tagEndIndex = content.indexOf('>', startIdx);
      if (tagEndIndex === -1) continue;
      
      // Suche nach dem nächsten Start-Tag oder End-Tag
      const nextStartIndex = content.indexOf(startTag, tagEndIndex);
      const endIndex = content.indexOf(endTag, tagEndIndex);
      
      let blockEndIndex;
      if (endIndex !== -1 && (nextStartIndex === -1 || endIndex < nextStartIndex)) {
        // Wenn ein End-Tag gefunden wurde und es vor dem nächsten Start-Tag kommt
        blockEndIndex = endIndex;
      } else if (nextStartIndex !== -1) {
        // Wenn ein nächster Start-Tag gefunden wurde
        blockEndIndex = nextStartIndex;
      } else {
        // Wenn weder End-Tag noch nächster Start-Tag gefunden wurde, nimm den Rest des Contents
        const block = content.substring(tagEndIndex + 1);
        if (block.trim()) blocks.push(block);
        continue;
      }
      
      const block = content.substring(tagEndIndex + 1, blockEndIndex);
      if (block.trim()) blocks.push(block);
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
  
  // Versuche, die Eigenschaft aus teilweise vorhandenen Tags zu extrahieren
  const partialTagRegex = new RegExp(`<${tag.substring(0, tag.length - 1)}[^>]*>([\\s\\S]*?)(?:<|$)`, 'i');
  const partialTagMatch = block.match(partialTagRegex);
  if (partialTagMatch) {
    return cleanText(partialTagMatch[1]);
  }
  
  // Versuche, die Eigenschaft aus abgekürzten Tags zu extrahieren
  if (tag === 'name') {
    // Versuche <n> Tag (häufig in Lunary-Ausgaben)
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
    
    // Versuche teilweise vorhandenes <n> Tag
    const partialNTagRegex = /<n[^>]*>([\\s\\S]*?)(?:<|$)/i;
    const partialNTagMatch = block.match(partialNTagRegex);
    if (partialNTagMatch) {
      return cleanText(partialNTagMatch[1]);
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
