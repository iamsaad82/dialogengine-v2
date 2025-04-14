'use client';

import { ShopData } from '../components/ShopCard';
import { MallSection, MallSectionType } from './contentParser';
import { EventData } from '../components/FluidEventSlider';
import { ServiceData } from '../components/FluidServiceSlider';
import { OpeningHoursData } from '../components/FluidOpeningHoursCard';
import { ParkingData } from '../components/FluidParkingCard';
import { parseXmlContent } from './xmlParser';

/**
 * Sicherer XML-Parser mit Fehlerbehandlung
 * 
 * Diese Funktion versucht, den XML-Content zu parsen und gibt im Fehlerfall
 * eine leere Liste zurück, anstatt einen Fehler zu werfen.
 */
export function safeParseXmlContent(content: string, query: string = ''): MallSection[] {
  try {
    // Prüfe, ob der Content XML-Tags enthält
    if (!content.includes('<intro>') && 
        !content.includes('<shop>') && 
        !content.includes('<restaurant>') && 
        !content.includes('<tip>')) {
      console.log('Keine XML-Tags erkannt, überspringe XML-Parsing');
      return [];
    }
    
    // Versuche, den Content zu parsen
    const sections = parseXmlContent(content, query);
    
    // Prüfe, ob das Parsing erfolgreich war
    if (!sections || sections.length === 0) {
      console.warn('XML-Parsing ergab keine Sektionen');
      return [];
    }
    
    return sections;
  } catch (error) {
    // Logge den Fehler, aber gib eine leere Liste zurück
    console.error('Fehler beim XML-Parsing:', error);
    return [];
  }
}

/**
 * Prüft, ob der Content gültige XML-Tags enthält
 */
export function hasValidXmlTags(content: string): boolean {
  if (!content) return false;
  
  // Prüfe auf vollständige XML-Tags
  const hasIntro = content.includes('<intro>') && content.includes('</intro>');
  const hasShops = content.includes('<shops') && content.includes('</shops>');
  const hasRestaurants = content.includes('<restaurants') && content.includes('</restaurants>');
  const hasTip = content.includes('<tip>') && content.includes('</tip>');
  
  return hasIntro || hasShops || hasRestaurants || hasTip;
}

/**
 * Versucht, beschädigte XML-Tags zu reparieren
 */
export function repairXmlContent(content: string): string {
  if (!content) return '';
  
  let repairedContent = content;
  
  // Repariere häufige Fehler
  
  // 1. Fehlende schließende Tags
  const openTags = [
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
    { open: '<parking', close: '</parking>' }
  ];
  
  // Prüfe auf fehlende schließende Tags
  openTags.forEach(tag => {
    const openCount = (repairedContent.match(new RegExp(tag.open, 'g')) || []).length;
    const closeCount = (repairedContent.match(new RegExp(tag.close, 'g')) || []).length;
    
    if (openCount > closeCount) {
      // Füge fehlende schließende Tags hinzu
      for (let i = 0; i < openCount - closeCount; i++) {
        repairedContent += tag.close;
      }
    }
  });
  
  // 2. Repariere abgeschnittene Tags und korrigiere falsche Tags
  
  // Korrigiere <n> zu <name> Tags (häufiger Fehler in Lunary-Ausgaben)
  repairedContent = repairedContent.replace(/<n>([^<]*?)<\/n>/g, '<name>$1</name>');
  repairedContent = repairedContent.replace(/<n>([^<]*?)(?=<|$)/g, '<name>$1</name>');
  
  // Repariere andere abgeschnittene Tags
  const tagPairs = [
    { pattern: /<name>([^<]*?)(?=<|$)/, replacement: '<name>$1</name>' },
    { pattern: /<category>([^<]*?)(?=<|$)/, replacement: '<category>$1</category>' },
    { pattern: /<floor>([^<]*?)(?=<|$)/, replacement: '<floor>$1</floor>' },
    { pattern: /<image>([^<]*?)(?=<|$)/, replacement: '<image>$1</image>' },
    { pattern: /<description>([^<]*?)(?=<|$)/, replacement: '<description>$1</description>' },
    { pattern: /<opening>([^<]*?)(?=<|$)/, replacement: '<opening>$1</opening>' },
    { pattern: /<location>([^<]*?)(?=<|$)/, replacement: '<location>$1</location>' },
    { pattern: /<date>([^<]*?)(?=<|$)/, replacement: '<date>$1</date>' },
    { pattern: /<time>([^<]*?)(?=<|$)/, replacement: '<time>$1</time>' },
    { pattern: /<duration>([^<]*?)(?=<|$)/, replacement: '<duration>$1</duration>' },
    { pattern: /<price>([^<]*?)(?=<|$)/, replacement: '<price>$1</price>' },
    { pattern: /<day>([^<]*?)(?=<|$)/, replacement: '<day>$1</day>' },
    { pattern: /<hours>([^<]*?)(?=<|$)/, replacement: '<hours>$1</hours>' }
  ];
  
  tagPairs.forEach(pair => {
    repairedContent = repairedContent.replace(new RegExp(pair.pattern, 'g'), pair.replacement);
  });
  
  // 3. Entferne doppelte Leerzeichen und Zeilenumbrüche
  repairedContent = repairedContent.replace(/\s+/g, ' ').trim();
  
  // 4. Füge Zeilenumbrüche für bessere Lesbarkeit hinzu
  repairedContent = repairedContent.replace(/<\/intro>/g, '</intro>\n\n');
  repairedContent = repairedContent.replace(/<\/shop>/g, '</shop>\n\n');
  repairedContent = repairedContent.replace(/<\/restaurant>/g, '</restaurant>\n\n');
  repairedContent = repairedContent.replace(/<\/event>/g, '</event>\n\n');
  repairedContent = repairedContent.replace(/<\/service>/g, '</service>\n\n');
  
  // 5. Entferne leere Tags
  repairedContent = repairedContent.replace(/<([a-z]+)>\s*<\/\1>/g, '');
  
  return repairedContent;
}
