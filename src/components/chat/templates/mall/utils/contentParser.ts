'use client';

import { ShopData } from '../components/ShopCard';

/**
 * Typen der erkannten Sektionen im Mall-Template
 */
export type MallSectionType = 'header' | 'intro' | 'shops' | 'restaurants' | 'services' | 'events' | 'news' | 'offers' | 'tip' | 'other';

/**
 * Struktur einer erkannten Sektion
 */
export interface MallSection {
  type: MallSectionType;
  title: string;
  content?: string;
  items?: ShopData[] | any[];
}

/**
 * Extrahiert Shops aus einer HTML-Liste
 */
export function extractShopsFromHtml(html: string): ShopData[] {
  if (!html) return [];
  
  const shops: ShopData[] = [];
  const listItems = html.match(/<li>([\s\S]*?)<\/li>/gi) || [];
  
  listItems.forEach((item) => {
    const content = item.replace(/<li>([\s\S]*?)<\/li>/i, '$1');
    
    // Versuche, einen Namen zu extrahieren (entweder aus <strong> oder erster Zeile)
    const nameMatch = content.match(/<strong>(.*?)<\/strong>/) || content.match(/^([^<:]+)/) || [];
    const name = (nameMatch[1] || 'Shop').trim();
    
    // Extrahiere weitere Informationen
    const categoryMatch = content.match(/Kategorie:\s*(.*?)(?:<br>|<\/p>|$)/) || [];
    const category = categoryMatch[1] || '';
    
    const floorMatch = content.match(/(?:Etage|Standort):\s*(.*?)(?:<br>|<\/p>|$)/) || [];
    const floor = floorMatch[1] || '';
    
    const openingMatch = content.match(/(?:Öffnungszeiten|Zeiten):\s*(.*?)(?:<br>|<\/p>|$)/) || [];
    const opening = openingMatch[1] || '';
    
    // Beschreibung aus Restinhalt
    let description = content
      .replace(/<strong>(.*?)<\/strong>/, '')
      .replace(/Kategorie:\s*(.*?)(?:<br>|<\/p>|$)/, '')
      .replace(/(?:Etage|Standort):\s*(.*?)(?:<br>|<\/p>|$)/, '')
      .replace(/(?:Öffnungszeiten|Zeiten):\s*(.*?)(?:<br>|<\/p>|$)/, '')
      .trim();
    
    // Bild extrahieren, falls vorhanden
    const imageMatch = description.match(/src="(.*?)"/) || [];
    const image = imageMatch[1] || '';
    
    // Entferne das Bild aus der Beschreibung
    if (image) {
      description = description.replace(/<img[^>]*>/g, '').trim();
    }
    
    shops.push({
      name,
      category,
      floor,
      opening,
      image,
      description
    });
  });
  
  return shops;
}

/**
 * Hauptfunktion zur Analyse des HTML-Inhalts und Extraktion von strukturierten Daten
 */
export function parseMallContent(html: string): MallSection[] {
  if (!html) return [];
  
  const sections: MallSection[] = [];
  
  // 1. Ermittle einzelne Inhaltsbereiche
  // a) Einleitungstext (direkte Antwort auf die Frage)
  let introContent = '';
  let shopsContent = '';
  let tipContent = '';
  
  // Versuche, den ersten Absatz als Einleitung zu extrahieren
  const introParagraph = html.match(/<p>(.*?)<\/p>/i);
  if (introParagraph && introParagraph[0]) {
    introContent = introParagraph[0];
    
    // Entferne die Einleitung aus dem HTML-Content für weitere Verarbeitung
    html = html.replace(introParagraph[0], '');
  }
  
  // b) Suche nach Hinweis/Tipp-Bereich (üblicherweise mit 💡 oder "Tipp:" markiert)
  const tipRegex = /<p>(?:💡|Tipp:|Hinweis:).*?<\/p>/i;
  const tipMatch = html.match(tipRegex);
  
  if (tipMatch && tipMatch[0]) {
    tipContent = tipMatch[0];
    // Entferne den Tipp aus dem HTML für weitere Verarbeitung
    html = html.replace(tipMatch[0], '');
  }
  
  // c) Der Rest ist wahrscheinlich der Shop-/Daten-Bereich
  shopsContent = html;
  
  // 2. Füge die Einleitung als erste Sektion hinzu
  if (introContent) {
    sections.push({
      type: 'intro',
      title: '',
      content: introContent
    });
  }
  
  // 3. Verarbeite Shop-Listen und andere strukturierte Daten
  const listItemMatches = shopsContent.match(/<li>([\s\S]*?)<\/li>/gi) || [];
  
  if (listItemMatches.length > 0) {
    const shops = extractShopsFromHtml(shopsContent);
    
    if (shops.length > 0) {
      sections.push({
        type: 'shops',
        title: 'Shops im Center',
        items: shops
      });
    }
  }
  
  // 4. Füge den Tipp als letzte Sektion hinzu, wenn vorhanden
  if (tipContent) {
    sections.push({
      type: 'tip',
      title: 'Tipp',
      content: tipContent
    });
  }
  
  // Falls keine Sektionen gefunden wurden, füge den gesamten Inhalt als generische Sektion hinzu
  if (sections.length === 0) {
    sections.push({
      type: 'other',
      title: '',
      content: html
    });
  }
  
  return sections;
}

/**
 * Hook-kompatible Funktion für inkrementelle Verarbeitung
 */
export function incrementalParseMallContent(html: string, previousSections: MallSection[] = []): MallSection[] {
  // Vollständige Analyse durchführen
  const newSections = parseMallContent(html);
  
  // Vergleichen und nur neue/geänderte Sektionen zurückgeben
  if (previousSections.length === 0) return newSections;
  
  // Überspringen, wenn es keine Änderungen gibt
  const previousJson = JSON.stringify(previousSections);
  const newJson = JSON.stringify(newSections);
  if (previousJson === newJson) return previousSections;
  
  return newSections;
} 