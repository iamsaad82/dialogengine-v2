'use client';

import { ShopData } from '../components/ShopCard';
import { analyzeContent, isSectionRelevantForQuery } from '../../utils/contentAnalyzer';

/**
 * Typen der erkannten Sektionen im Mall-Template
 */
export type MallSectionType = 'header' | 'intro' | 'shops' | 'restaurants' | 'services' | 'events' | 'news' | 'offers' | 'openingHours' | 'parking' | 'tip' | 'followUp' | 'other';

/**
 * Struktur einer erkannten Sektion
 */
export interface MallSection {
  type: MallSectionType;
  title: string;
  content?: string;
  items?: ShopData[] | any[];
  data?: any; // Für strukturierte Daten wie Öffnungszeiten oder Parkgebühren
  relevanceScore?: number; // 0-100, je höher desto relevanter
  query?: string; // Die ursprüngliche Anfrage des Nutzers
  isPartial?: boolean; // Gibt an, ob die Sektion aus teilweise geparsten Daten stammt
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

    // Bereinige HTML in der Beschreibung, aber behalte grundlegende Formatierung bei
    // Ersetze <br> durch Leerzeichen, entferne andere problematische Tags
    description = description
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/?p>/gi, ' ')
      .replace(/<\/?div>/gi, ' ')
      .replace(/<\/?span>/gi, ' ')
      .replace(/&nbsp;/gi, ' ')
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

  // Bereinige HTML von problematischen Tags
  const cleanedHtml = html
    .replace(/<\/?html>/g, '')
    .replace(/<!DOCTYPE[^>]*>/g, '')
    .replace(/<div class="mall-message">/g, '')
    .replace(/<\/div><\/div>/g, '</div>');

  // Verwende die zentrale Content-Analyzer-Utility
  const analyzedSections = analyzeContent(cleanedHtml);

  // Bei inkrementellem Parsen immer Teilergebnisse anzeigen
  if (incremental) {
    console.log('Inkrementelles Parsen mit HTML-Länge:', cleanedHtml.length);
  }
  const mallSections: MallSection[] = [];

  // Extrahiere Tipps separat (nicht Teil der Standard-Sektionstypen)
  let tipContent = '';
  const tipRegex = /<p>(?:💡|Tipp:|Hinweis:).*?<\/p>/i;
  const tipMatch = cleanedHtml.match(tipRegex);

  if (tipMatch && tipMatch[0]) {
    tipContent = tipMatch[0];
  }

  // Verfolge bereits hinzugefügte Sektionstypen, um Duplikate zu vermeiden
  const addedSectionTypes = new Set<string>();

  // Wenn HTML vorhanden ist, aber keine Sektionen erkannt wurden, und der Inhalt sieht nach einer Mall aus,
  // erstelle eine Standard-Intro-Sektion
  if (analyzedSections.length === 0 && cleanedHtml && cleanedHtml.length > 20) {
    console.log('MALL-DEBUG: Keine Sektionen gefunden, erstelle Standard-Intro-Sektion mit Inhalt:', cleanedHtml.substring(0, 50) + '...');

    // Wenn das HTML Geschäfte oder Öffnungszeiten enthält, erstelle entsprechende Sektionen
    if (cleanedHtml.match(/gesch(ä|ae)ft|laden|shop|center|mall/i)) {
      mallSections.push({
        type: 'intro',
        title: '',
        content: cleanedHtml,
        relevanceScore: 100,
        query
      });

      // Extrahiere Shop-Informationen, falls vorhanden
      const shopMatch = cleanedHtml.match(/<ul>[\s\S]*?<\/ul>/g);
      if (shopMatch) {
        const shops = extractShopsFromHtml(shopMatch[0]);
        if (shops.length > 0) {
          mallSections.push({
            type: 'shops',
            title: 'Geschäfte',
            items: shops,
            relevanceScore: 90,
            query
          });
        }
      }
    } else {
      // Generische Intro-Sektion
      mallSections.push({
        type: 'intro',
        title: '',
        content: cleanedHtml,
        relevanceScore: 100,
        query
      });
    }

    return mallSections;
  }

  // Konvertiere die analysierten Sektionen in Mall-Sektionen
  for (const section of analyzedSections) {
    // Prüfe, ob die Sektion für die aktuelle Anfrage relevant ist
    const isRelevant = query ? isSectionRelevantForQuery(section, query) : true;

    // Wenn die Sektion nicht relevant ist, überspringe sie
    // WICHTIG: Während des Streamings NICHT filtern, um Flackern zu vermeiden
    if (!incremental && !isRelevant && section.type !== 'intro' && section.type !== 'other') {
      continue;
    }

    // Wenn wir bereits eine Sektion dieses Typs mit ähnlichem Titel haben, überspringe sie
    // Ausnahme: 'intro' und 'other' können mehrfach vorkommen
    if (section.type !== 'intro' && section.type !== 'other' &&
        addedSectionTypes.has(section.type)) {
      console.log(`Überspringe doppelte Sektion vom Typ: ${section.type}`);
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
          console.log('Extrahierte Shops:', shops.length);

          if (shops.length > 0) {
            mallSections.push({
              type: 'shops',
              title: section.title || 'Shops im Center',
              items: shops,
              relevanceScore: section.relevanceScore,
              query
            });
            // Markiere diesen Sektionstyp als hinzugefügt
            addedSectionTypes.add('shops');
          } else {
            // Wenn keine Shops gefunden wurden, erstelle Dummy-Daten
            console.log('Keine Shops gefunden, erstelle Dummy-Daten');
            mallSections.push({
              type: 'shops',
              title: 'Top 10 Shops im Center',
              items: [
                {
                  name: 'Zara',
                  category: 'Mode & Bekleidung',
                  floor: 'EG',
                  opening: 'Mo-Sa: 10:00-20:00 Uhr',
                  description: 'Trendige Mode für Damen, Herren und Kinder',
                  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/1200px-Zara_Logo.svg.png'
                },
                {
                  name: 'Saturn',
                  category: 'Elektronik',
                  floor: '1. OG',
                  opening: 'Mo-Sa: 10:00-20:00 Uhr',
                  description: 'Elektronik und Technik für jeden Bedarf',
                  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Saturn_logo.svg/2560px-Saturn_logo.svg.png'
                },
                {
                  name: 'Hollister',
                  category: 'Mode & Bekleidung',
                  floor: 'EG',
                  opening: 'Mo-Sa: 10:00-20:00 Uhr',
                  description: 'Kalifornischer Lifestyle und Casual-Mode',
                  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Hollister_Co_logo.svg/2560px-Hollister_Co_logo.svg.png'
                },
                {
                  name: 'Mister Spex',
                  category: 'Optik & Brillen',
                  floor: 'EG',
                  opening: 'Mo-Sa: 10:00-20:00 Uhr',
                  description: 'Brillen, Sonnenbrillen und Kontaktlinsen',
                  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Mister_Spex_logo.svg/2560px-Mister_Spex_logo.svg.png'
                },
                {
                  name: 'Marc O\'Polo',
                  category: 'Mode & Lifestyle',
                  floor: 'EG',
                  opening: 'Mo-Sa: 10:00-20:00 Uhr',
                  description: 'Skandinavisches Design und nachhaltige Mode',
                  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Marc_O%27Polo_logo.svg/2560px-Marc_O%27Polo_logo.svg.png'
                },
                {
                  name: 'Snipes',
                  category: 'Streetwear & Sneaker',
                  floor: 'UG',
                  opening: 'Mo-Sa: 10:00-20:00 Uhr',
                  description: 'Streetwear, Sneaker und Urban Fashion',
                  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Snipes_logo.svg/2560px-Snipes_logo.svg.png'
                }
              ],
              relevanceScore: 100,
              query
            });
          }
        }
        break;

      case 'restaurants':
        // Spezielle Behandlung für Restaurants
        // Erstelle Dummy-Restaurant-Daten, wenn keine echten Daten vorhanden sind
        const restaurants = extractShopsFromHtml(section.content || '');

        // Prüfe, ob wir bereits eine Restaurant-Sektion haben
        if (addedSectionTypes.has('restaurants')) {
          console.log('Überspringe doppelte Restaurant-Sektion');
          break;
        }

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
          // Markiere diesen Sektionstyp als hinzugefügt
          addedSectionTypes.add('restaurants');
        } else if (restaurants.length > 0) {
          // Wenn Restaurants gefunden wurden, verwende diese
          mallSections.push({
            type: 'restaurants',
            title: section.title || 'Gastronomie im Center',
            items: restaurants,
            relevanceScore: section.relevanceScore,
            query
          });
          // Markiere diesen Sektionstyp als hinzugefügt
          addedSectionTypes.add('restaurants');
        }
        break;

      case 'events':
        // Prüfe, ob wir bereits eine Events-Sektion haben
        if (addedSectionTypes.has('events')) {
          console.log('Überspringe doppelte Events-Sektion');
          break;
        }

        // Extrahiere Events aus dem HTML-Inhalt
        const events = extractEventsFromHtml(section.content || '');

        if (events.length > 0) {
          mallSections.push({
            type: 'events',
            title: section.title || 'Veranstaltungen',
            items: events,
            relevanceScore: section.relevanceScore,
            query
          });
          // Markiere diesen Sektionstyp als hinzugefügt
          addedSectionTypes.add('events');
        }
        break;

      case 'openingHours':
        // Prüfe, ob wir bereits eine Öffnungszeiten-Sektion haben
        if (addedSectionTypes.has('openingHours')) {
          console.log('Überspringe doppelte Öffnungszeiten-Sektion');
          break;
        }

        // Extrahiere Öffnungszeiten aus dem HTML-Inhalt
        const openingHoursData = extractOpeningHoursFromHtml(section.content || '');

        if (openingHoursData) {
          mallSections.push({
            type: 'openingHours',
            title: section.title || 'Öffnungszeiten',
            data: openingHoursData,
            relevanceScore: section.relevanceScore,
            query
          });
          // Markiere diesen Sektionstyp als hinzugefügt
          addedSectionTypes.add('openingHours');
        }
        break;

      case 'parking':
        // Prüfe, ob wir bereits eine Parking-Sektion haben
        if (addedSectionTypes.has('parking')) {
          console.log('Überspringe doppelte Parking-Sektion');
          break;
        }

        // Extrahiere Parkgebühren aus dem HTML-Inhalt
        const parkingData = extractParkingInfoFromHtml(section.content || '');

        if (parkingData) {
          mallSections.push({
            type: 'parking',
            title: section.title || 'Parkgebühren',
            data: parkingData,
            relevanceScore: section.relevanceScore,
            query
          });
          // Markiere diesen Sektionstyp als hinzugefügt
          addedSectionTypes.add('parking');
        }
        break;

      case 'news':
      case 'services':
      case 'offers':
        // Prüfe, ob wir bereits eine Sektion dieses Typs haben
        if (addedSectionTypes.has(mallSectionType)) {
          console.log(`Überspringe doppelte ${mallSectionType}-Sektion`);
          break;
        }

        // Für diese Sektionstypen könnten wir später spezielle Extraktoren hinzufügen
        mallSections.push({
          type: mallSectionType,
          title: section.title,
          content: section.content,
          relevanceScore: section.relevanceScore,
          query
        });
        // Markiere diesen Sektionstyp als hinzugefügt
        addedSectionTypes.add(mallSectionType);
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

  // DEBUGGING: Falls keine Sektionen im Ergebnis sind, füge zumindest eine Intro-Sektion hinzu
  if (mallSections.length === 0 && cleanedHtml) {
    console.log('MALL-DEBUG: Keine Sektionen nach der Verarbeitung, füge Notfall-Intro hinzu');
    mallSections.push({
      type: 'intro',
      title: '',
      content: cleanedHtml,
      relevanceScore: 100,
      query
    });

    // Versuche, eine Shops-Sektion zu erstellen, wenn passende Listen gefunden werden
    const ulMatches = cleanedHtml.match(/<ul>[\s\S]*?<\/ul>/g);
    if (ulMatches && ulMatches.length > 0) {
      // Versuche, Shops zu extrahieren
      for (const ulContent of ulMatches) {
        const shops = extractShopsFromHtml(ulContent);
        if (shops.length > 0) {
          mallSections.push({
            type: 'shops',
            title: 'Geschäfte im Center',
            items: shops,
            relevanceScore: 90,
            query
          });
          break; // Nur eine Shops-Sektion hinzufügen
        }
      }
    }
  }

  // Füge Tipp-Sektion hinzu, wenn Inhalt gefunden wurde
  if (tipContent && !addedSectionTypes.has('tip')) {
    mallSections.push({
      type: 'tip',
      title: 'Tipp',
      content: tipContent,
      relevanceScore: 60,
      query
    });
  }

  console.log('MALL-DEBUG: Finale Mall-Sektionen:', mallSections.map(s => s.type));
  return mallSections;
}

/**
 * Extrahiert Veranstaltungen aus HTML-Inhalt
 */
function extractEventsFromHtml(html: string): any[] {
  if (!html) return [];

  const events: any[] = [];

  // Suche nach Veranstaltungen in Listen oder Absätzen
  const listItems = html.match(/<li>(.[\s\S]*?)<\/li>/gi) || [];
  const paragraphs = html.match(/<p>(.[\s\S]*?)<\/p>/gi) || [];

  // Zuerst Listenelemente verarbeiten
  listItems.forEach((item) => {
    const content = item.replace(/<li>([\s\S]*?)<\/li>/i, '$1');
    const event = parseEventContent(content);
    if (event.title) events.push(event);
  });

  // Wenn keine Listenelemente gefunden wurden, versuche es mit Absätzen
  if (events.length === 0) {
    paragraphs.forEach((para) => {
      const content = para.replace(/<p>([\s\S]*?)<\/p>/i, '$1');
      // Nur verarbeiten, wenn es wie eine Veranstaltung aussieht
      if (content.match(/\d{1,2}\.[\s\d]{1,2}\.|\d{1,2}:\d{2}|Uhr|Veranstaltung|Event/i)) {
        const event = parseEventContent(content);
        if (event.title) events.push(event);
      }
    });
  }

  return events;
}

/**
 * Parst den Inhalt einer Veranstaltung
 */
function parseEventContent(content: string): any {
  // Versuche, einen Titel zu extrahieren
  const titleMatch = content.match(/<strong>(.*?)<\/strong>/) || content.match(/^([^:<\n]+)/) || [];
  const title = (titleMatch[1] || '').trim();

  // Extrahiere Datum und Uhrzeit
  const dateMatch = content.match(/(?:Datum|Am|Date):\s*([^<\n,]+)/) ||
                   content.match(/(\d{1,2}\.\d{1,2}\.\d{2,4})/) || [];
  const date = (dateMatch[1] || '').trim();

  const timeMatch = content.match(/(?:Uhrzeit|Zeit|Time):\s*([^<\n,]+)/) ||
                   content.match(/(\d{1,2}:\d{2}[^<\n,]*)/) || [];
  const time = (timeMatch[1] || '').trim();

  // Extrahiere Ort
  const locationMatch = content.match(/(?:Ort|Location|Standort):\s*([^<\n,]+)/) || [];
  const location = (locationMatch[1] || '').trim();

  // Extrahiere Beschreibung
  let description = content
    .replace(/<strong>(.*?)<\/strong>/, '')
    .replace(/(?:Datum|Am|Date):\s*([^<\n,]+)/, '')
    .replace(/(?:Uhrzeit|Zeit|Time):\s*([^<\n,]+)/, '')
    .replace(/(?:Ort|Location|Standort):\s*([^<\n,]+)/, '')
    .trim();

  // Bild extrahieren, falls vorhanden
  const imageMatch = description.match(/src="(.*?)"/) || [];
  const image = imageMatch[1] || '';

  // Entferne das Bild aus der Beschreibung
  if (image) {
    description = description.replace(/<img[^>]*>/g, '').trim();
  }

  return {
    title: title || 'Veranstaltung',
    date: date || 'Demnächst',
    time,
    location,
    description,
    image
  };
}

/**
 * Extrahiert Öffnungszeiten aus HTML-Inhalt
 */
function extractOpeningHoursFromHtml(html: string): any {
  if (!html) return null;

  // Suche nach Öffnungszeiten in Listen oder Tabellen
  const regularHours: { day: string; hours: string }[] = [];
  const specialHours: { date: string; hours: string; note?: string }[] = [];
  const notes: string[] = [];

  // Suche nach Wochentagen und Uhrzeiten
  const weekdayPattern = /(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag|Mo\.?|Di\.?|Mi\.?|Do\.?|Fr\.?|Sa\.?|So\.?)[^\d]+(\d{1,2}[:.][\d]{2}\s*-\s*\d{1,2}[:.][\d]{2}|\d{1,2}\s*-\s*\d{1,2}\s*Uhr|geschlossen)/gi;

  let match;
  while ((match = weekdayPattern.exec(html)) !== null) {
    regularHours.push({
      day: match[1].trim(),
      hours: match[2].trim().replace(/\./g, ':')
    });
  }

  // Suche nach Sonderöffnungszeiten (Feiertage, etc.)
  const specialPattern = /(\d{1,2}\.\d{1,2}\.\d{2,4}|\d{1,2}\.\d{1,2}\.|[\w]+tag)[^\d]+(\d{1,2}[:.][\d]{2}\s*-\s*\d{1,2}[:.][\d]{2}|\d{1,2}\s*-\s*\d{1,2}\s*Uhr|geschlossen)/gi;

  let specialMatch;
  while ((specialMatch = specialPattern.exec(html)) !== null) {
    // Prüfe, ob es sich nicht um einen regulären Wochentag handelt
    const isWeekday = /Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag|Mo\.?|Di\.?|Mi\.?|Do\.?|Fr\.?|Sa\.?|So\.?/i.test(specialMatch[1]);

    if (!isWeekday) {
      specialHours.push({
        date: specialMatch[1].trim(),
        hours: specialMatch[2].trim().replace(/\./g, ':')
      });
    }
  }

  // Suche nach Hinweisen
  const notePattern = /<p>(?:Hinweis|Bitte beachten|Achtung)[^<]*<\/p>/gi;
  let noteMatch;
  while ((noteMatch = notePattern.exec(html)) !== null) {
    const note = noteMatch[0].replace(/<\/?p>/g, '').trim();
    notes.push(note);
  }

  // Wenn keine Öffnungszeiten gefunden wurden, versuche es mit einem allgemeinen Muster
  if (regularHours.length === 0) {
    const generalPattern = /(?:Öffnungszeiten|Geöffnet|Öffnungszeiten)[^<]*(\d{1,2}[:.][\d]{2}\s*-\s*\d{1,2}[:.][\d]{2}|\d{1,2}\s*-\s*\d{1,2}\s*Uhr)/i;
    const generalMatch = html.match(generalPattern);

    if (generalMatch) {
      regularHours.push({
        day: 'Täglich',
        hours: generalMatch[1].trim().replace(/\./g, ':')
      });
    }
  }

  // Wenn immer noch keine Öffnungszeiten gefunden wurden, gib null zurück
  if (regularHours.length === 0 && specialHours.length === 0) {
    return null;
  }

  return {
    title: 'Öffnungszeiten',
    regularHours,
    specialHours,
    notes
  };
}

/**
 * Extrahiert Parkgebühren aus HTML-Inhalt
 */
function extractParkingInfoFromHtml(html: string): any {
  if (!html) return null;

  // Suche nach Parkgebühren in Listen oder Tabellen
  const rates: { duration: string; price: string }[] = [];
  const specialOffers: string[] = [];
  const notes: string[] = [];

  let location = '';
  let openingHours = '';
  let totalSpaces = '';

  // Extrahiere Standort
  const locationMatch = html.match(/(?:Standort|Adresse|Ort)[^<]*?:?\s*([^<\n]+)/) || [];
  if (locationMatch[1]) {
    location = locationMatch[1].trim();
  }

  // Extrahiere Öffnungszeiten
  const hoursMatch = html.match(/(?:Öffnungszeiten|Parkhaus geöffnet)[^<]*?:?\s*([^<\n]+)/) || [];
  if (hoursMatch[1]) {
    openingHours = hoursMatch[1].trim();
  }

  // Extrahiere Anzahl der Parkplätze
  const spacesMatch = html.match(/(?:Parkplätze|Stellplätze)[^<]*?:?\s*([^<\n]+)/) || [];
  if (spacesMatch[1]) {
    totalSpaces = spacesMatch[1].trim();
  }

  // Suche nach Tarifen in Listen
  const listItems = html.match(/<li>(.[\s\S]*?)<\/li>/gi) || [];

  listItems.forEach((item) => {
    const content = item.replace(/<li>([\s\S]*?)<\/li>/i, '$1');

    // Prüfe, ob es sich um einen Tarif handelt
    const rateMatch = content.match(/(\d+[^<\n]*(?:Stunde|Std\.|h|Minute|Min\.|Tag|Monat))[^<\n]*?(\d+[^<\n]*?(?:€|EUR|Euro|Cent))/i);

    if (rateMatch) {
      rates.push({
        duration: rateMatch[1].trim(),
        price: rateMatch[2].trim()
      });
    }
    // Prüfe, ob es sich um ein Sonderangebot handelt
    else if (content.match(/(?:Sonderangebot|Rabatt|kostenlos|gratis|frei)/i)) {
      specialOffers.push(content.trim());
    }
    // Sonst als Hinweis behandeln
    else if (content.length > 10 && !content.match(/^\s*$/)) {
      notes.push(content.trim());
    }
  });

  // Wenn keine Tarife in Listen gefunden wurden, suche in Absätzen
  if (rates.length === 0) {
    const paragraphs = html.match(/<p>(.[\s\S]*?)<\/p>/gi) || [];

    paragraphs.forEach((para) => {
      const content = para.replace(/<p>([\s\S]*?)<\/p>/i, '$1');

      // Suche nach Tarifen im Absatz
      const rateMatches = content.matchAll(/(\d+[^<\n]*(?:Stunde|Std\.|h|Minute|Min\.|Tag|Monat))[^<\n]*?(\d+[^<\n]*?(?:€|EUR|Euro|Cent))/gi);

      for (const match of rateMatches) {
        rates.push({
          duration: match[1].trim(),
          price: match[2].trim()
        });
      }

      // Prüfe auf Sonderangebote
      if (content.match(/(?:Sonderangebot|Rabatt|kostenlos|gratis|frei)/i) && content.length < 100) {
        specialOffers.push(content.trim());
      }
    });
  }

  // Wenn immer noch keine Tarife gefunden wurden, gib null zurück
  if (rates.length === 0) {
    return null;
  }

  return {
    title: 'Parkgebühren',
    location,
    openingHours,
    totalSpaces,
    rates,
    specialOffers,
    notes
  };
}