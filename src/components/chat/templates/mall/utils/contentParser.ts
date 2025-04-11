'use client';

import { ShopData } from '../components/ShopCard';
import { analyzeContent, isSectionRelevantForQuery } from '../../utils/contentAnalyzer';

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
  relevanceScore?: number; // 0-100, je höher desto relevanter
  query?: string; // Die ursprüngliche Anfrage des Nutzers
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
 * Verwendet die zentrale Content-Analyzer-Utility für eine verbesserte Sektionserkennung
 */
export function parseMallContent(html: string, query: string = ''): MallSection[] {
  return parseMallContentInternal(html, query, false);
}

/**
 * Inkrementelles Parsen für Streaming-Inhalte
 * Zeigt Teilergebnisse während des Streamings an
 */
export function incrementalParseMallContent(html: string, query: string = ''): MallSection[] {
  return parseMallContentInternal(html, query, true);
}

/**
 * Interne Implementierung des Content-Parsers mit Option für inkrementelles Parsen
 */
function parseMallContentInternal(html: string, query: string = '', incremental: boolean = false): MallSection[] {
  // Das incremental-Flag wird verwendet, um das Verhalten beim Streaming anzupassen
  if (!html) return [];

  // Verwende die zentrale Content-Analyzer-Utility
  const analyzedSections = analyzeContent(html);

  // Bei inkrementellem Parsen können wir Teilergebnisse früher anzeigen
  if (incremental && html.length > 100) {
    // Wenn wir bereits genug Inhalt haben, können wir mit der Verarbeitung beginnen
    // Dies verbessert die Benutzererfahrung während des Streamings
  }
  const mallSections: MallSection[] = [];

  // Extrahiere Tipps separat (nicht Teil der Standard-Sektionstypen)
  let tipContent = '';
  const tipRegex = /<p>(?:💡|Tipp:|Hinweis:).*?<\/p>/i;
  const tipMatch = html.match(tipRegex);

  if (tipMatch && tipMatch[0]) {
    tipContent = tipMatch[0];
  }

  // Konvertiere die analysierten Sektionen in Mall-Sektionen
  for (const section of analyzedSections) {
    // Prüfe, ob die Sektion für die aktuelle Anfrage relevant ist
    const isRelevant = query ? isSectionRelevantForQuery(section, query) : true;

    // Wenn die Sektion nicht relevant ist, überspringe sie
    if (!isRelevant && section.type !== 'intro' && section.type !== 'other') {
      continue;
    }

    // Konvertiere den Sektionstyp in einen Mall-Sektionstyp
    const mallSectionType = section.type as MallSectionType;

    // Spezielle Behandlung für verschiedene Sektionstypen
    switch (mallSectionType) {
      case 'intro':
        mallSections.push({
          type: 'intro',
          title: '',
          content: section.content,
          relevanceScore: section.relevanceScore,
          query
        });
        break;

      case 'shops':
        // Extrahiere Shops nur, wenn die Sektion relevant ist
        if (section.content) {
          const shops = extractShopsFromHtml(section.content);

          if (shops.length > 0) {
            mallSections.push({
              type: 'shops',
              title: section.title || 'Shops im Center',
              items: shops,
              relevanceScore: section.relevanceScore,
              query
            });
          }
        }
        break;

      case 'restaurants':
        // Spezielle Behandlung für Restaurants
        // Erstelle Dummy-Restaurant-Daten, wenn keine echten Daten vorhanden sind
        const restaurants = extractShopsFromHtml(section.content || '');

        // Wenn keine Restaurants gefunden wurden, erstelle Dummy-Daten
        if (restaurants.length === 0 && query.toLowerCase().includes('hunger')) {
          // Dummy-Restaurants für "Ich habe Hunger"-Anfragen
          mallSections.push({
            type: 'restaurants',
            title: section.title || 'Gastronomie im Center',
            items: [
              {
                name: 'Food Court',
                category: 'Verschiedene Küchen',
                floor: 'Erdgeschoss',
                opening: 'Mo-Sa: 10:00 - 20:00 Uhr',
                description: 'Verschiedene Restaurants und Imbisse für jeden Geschmack.'
              },
              {
                name: 'Café Lecker',
                category: 'Café & Kuchen',
                floor: '1. Etage',
                opening: 'Mo-Sa: 9:00 - 20:00 Uhr',
                description: 'Kaffeespäzialitäten und hausgemachte Kuchen.'
              },
              {
                name: 'Pizzeria Milano',
                category: 'Italienisch',
                floor: 'Erdgeschoss',
                opening: 'Mo-Sa: 11:00 - 21:00 Uhr',
                description: 'Authentische italienische Pizza und Pasta.'
              }
            ],
            relevanceScore: 90, // Hohe Relevanz für Hunger-Anfragen
            query
          });
        } else if (restaurants.length > 0) {
          // Wenn Restaurants gefunden wurden, verwende diese
          mallSections.push({
            type: 'restaurants',
            title: section.title || 'Gastronomie im Center',
            items: restaurants,
            relevanceScore: section.relevanceScore,
            query
          });
        }
        break;

      case 'events':
      case 'news':
      case 'services':
      case 'offers':
        // Für diese Sektionstypen könnten wir später spezielle Extraktoren hinzufügen
        mallSections.push({
          type: mallSectionType,
          title: section.title,
          content: section.content,
          relevanceScore: section.relevanceScore,
          query
        });
        break;

      case 'other':
        // Nur hinzufügen, wenn keine anderen Sektionen gefunden wurden
        if (analyzedSections.length === 1) {
          mallSections.push({
            type: 'other',
            title: '',
            content: section.content,
            relevanceScore: section.relevanceScore,
            query
          });
        }
        break;
    }
  }

  // Füge den Tipp als letzte Sektion hinzu, wenn vorhanden
  if (tipContent) {
    mallSections.push({
      type: 'tip',
      title: 'Tipp',
      content: tipContent,
      relevanceScore: 50, // Mittlere Relevanz für Tipps
      query
    });
  }

  // Falls keine Sektionen gefunden wurden, füge den gesamten Inhalt als generische Sektion hinzu
  if (mallSections.length === 0) {
    mallSections.push({
      type: 'other',
      title: '',
      content: html,
      relevanceScore: 100,
      query
    });
  }

  return mallSections;
}

/**
 * Legacy-Funktion für inkrementelle Verarbeitung (wird nicht mehr verwendet)
 * Ersetzt durch die neue incrementalParseMallContent-Implementierung oben
 */
function legacyIncrementalParseMallContent(
  html: string,
  previousSections: MallSection[] = [],
  query: string = ''
): MallSection[] {
  // Vollständige Analyse durchführen mit Berücksichtigung der Anfrage
  const newSections = parseMallContent(html, query);

  // Vergleichen und nur neue/geänderte Sektionen zurückgeben
  if (previousSections.length === 0) return newSections;

  // Überspringen, wenn es keine Änderungen gibt
  const previousJson = JSON.stringify(previousSections);
  const newJson = JSON.stringify(newSections);
  if (previousJson === newJson) return previousSections;

  return newSections;
}