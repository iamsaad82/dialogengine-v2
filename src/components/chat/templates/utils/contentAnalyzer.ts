'use client';

/**
 * Content-Analyzer für alle Templates
 *
 * Diese Utility-Klasse analysiert den HTML-Content und erkennt verschiedene Sektionstypen
 * basierend auf Keywords und Strukturen. Sie kann von allen Templates verwendet werden,
 * um eine intelligente Sektionserkennung zu implementieren.
 */

export type SectionType =
  | 'intro'
  | 'shops'
  | 'restaurants'
  | 'services'
  | 'events'
  | 'news'
  | 'offers'
  | 'contact'
  | 'hours'
  | 'location'
  | 'faq'
  | 'tip'
  | 'other';

export interface ContentSection {
  type: SectionType;
  title: string;
  content?: string;
  items?: any[];
  relevanceScore: number; // 0-100, je höher desto relevanter
}

interface KeywordMap {
  [key: string]: {
    keywords: string[];
    patterns?: RegExp[];
  }
}

// Keywords für verschiedene Sektionstypen
const sectionKeywords: KeywordMap = {
  shops: {
    keywords: [
      'shop', 'geschäft', 'laden', 'store', 'einkauf', 'boutique',
      'einzelhandel', 'shopping', 'kaufhaus', 'center', 'markt'
    ],
    patterns: [
      /\b(shops?|gesch[äa]fte?|l[äa]den|stores?)\b/i
    ]
  },
  restaurants: {
    keywords: [
      'restaurant', 'café', 'bistro', 'gastronomie', 'essen', 'trinken',
      'speisen', 'getränke', 'food', 'imbiss', 'mensa', 'kantine'
    ],
    patterns: [
      /\b(restaurants?|caf[ée]s?|bistros?|gastronom(ie|isch)|essen|speisen)\b/i
    ]
  },
  events: {
    keywords: [
      'event', 'veranstaltung', 'termin', 'konzert', 'ausstellung', 'messe',
      'festival', 'show', 'aufführung', 'feier', 'party', 'treffen'
    ],
    patterns: [
      /\b(events?|veranstaltung(en)?|termin[e]?|konzert[e]?|ausstellung(en)?)\b/i
    ]
  },
  news: {
    keywords: [
      'news', 'neuigkeit', 'aktuell', 'nachricht', 'mitteilung', 'information',
      'update', 'bericht', 'ankündigung', 'meldung'
    ],
    patterns: [
      /\b(news|neuigkeit(en)?|aktuell(es?)?|nachricht(en)?)\b/i
    ]
  },
  hours: {
    keywords: [
      'öffnungszeit', 'geschäftszeit', 'sprechstunde', 'uhr', 'geöffnet',
      'geschlossen', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag',
      'samstag', 'sonntag', 'wochenende', 'feiertag'
    ],
    patterns: [
      /\b([öo]ffnungszeit(en)?|gesch[äa]ftszeit(en)?|sprechstunde(n)?)\b/i,
      /\b(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/i,
      /\b(\d{1,2}[:.]\d{2})\s*(uhr|h)\b/i
    ]
  },
  location: {
    keywords: [
      'standort', 'adresse', 'anschrift', 'ort', 'straße', 'platz', 'weg',
      'allee', 'postleitzahl', 'stadt', 'stadtteil', 'viertel', 'bezirk'
    ],
    patterns: [
      /\b(standort[e]?|adresse[n]?|anschrift(en)?|stra[ßs]e)\b/i,
      /\b(\d{5})\b/ // Postleitzahl
    ]
  },
  contact: {
    keywords: [
      'kontakt', 'telefon', 'handy', 'mobil', 'email', 'e-mail', 'mail',
      'anruf', 'fax', 'formular', 'anfrage', 'support', 'hilfe', 'service'
    ],
    patterns: [
      /\b(kontakt|telefon|e[-\s]?mail|mail|anruf(en)?|fax|formular)\b/i,
      /\b(\+\d{2}|\d{3,5})[\/\-\s]?(\d{3,})/i, // Telefonnummern
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i // E-Mail
    ]
  },
  faq: {
    keywords: [
      'faq', 'häufig', 'frage', 'antwort', 'hilfe', 'support', 'problem',
      'lösung', 'tipp', 'hinweis', 'ratgeber', 'anleitung'
    ],
    patterns: [
      /\b(faq|h[äa]ufige?\s+fragen|fragen\s+und\s+antworten)\b/i
    ]
  }
};

/**
 * Analysiert den HTML-Content und erkennt verschiedene Sektionstypen
 *
 * @param html Der HTML-Content als String
 * @returns Ein Array von ContentSection-Objekten
 */
export function analyzeContent(html: string): ContentSection[] {
  if (!html) return [];

  const sections: ContentSection[] = [];

  // 1. Extrahiere den Intro-Text (erster Absatz oder Text vor dem ersten HTML-Tag)
  let introContent = '';
  const introParagraph = html.match(/<p>(.*?)<\/p>/i);
  if (introParagraph && introParagraph[0]) {
    introContent = introParagraph[0];
    html = html.replace(introParagraph[0], '');
  } else {
    const textBeforeFirstTag = html.match(/^([^<]+)/i);
    if (textBeforeFirstTag && textBeforeFirstTag[1].trim()) {
      introContent = `<p>${textBeforeFirstTag[1].trim()}</p>`;
      html = html.replace(textBeforeFirstTag[1], '');
    }
  }

  if (introContent) {
    sections.push({
      type: 'intro',
      title: '',
      content: introContent,
      relevanceScore: 100 // Intro ist immer relevant
    });
  }

  // 2. Analysiere den restlichen Content nach Sektionstypen
  const contentLower = html.toLowerCase();

  // Berechne Relevanz-Scores für jeden Sektionstyp
  const typeScores: Record<SectionType, number> = {
    intro: 0,
    shops: 0,
    restaurants: 0,
    services: 0,
    events: 0,
    news: 0,
    offers: 0,
    contact: 0,
    hours: 0,
    location: 0,
    faq: 0,
    tip: 0,
    other: 0
  };

  // Berechne Scores basierend auf Keywords und Patterns
  Object.entries(sectionKeywords).forEach(([type, { keywords, patterns }]) => {
    // Keyword-basierte Scores
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = contentLower.match(regex);
      if (matches) {
        typeScores[type as SectionType] += matches.length * 10;
      }
    });

    // Pattern-basierte Scores
    if (patterns) {
      patterns.forEach(pattern => {
        const matches = contentLower.match(pattern);
        if (matches) {
          typeScores[type as SectionType] += matches.length * 15;
        }
      });
    }
  });

  // Spezielle Erkennung für Öffnungszeiten
  if (
    contentLower.includes('öffnungszeit') ||
    contentLower.includes('geöffnet') ||
    contentLower.includes('geschlossen') ||
    contentLower.includes('uhr') ||
    /\b(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)[\s\S]{1,50}\d{1,2}[\s]*:[\s]*\d{2}/i.test(contentLower) ||
    /\b(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)[\s\S]{1,50}\d{1,2}[\s]*-[\s]*\d{1,2}/i.test(contentLower) ||
    /\b(mo|di|mi|do|fr|sa|so)[\s\.-][\s\S]{1,30}\d{1,2}[\s]*:[\s]*\d{2}/i.test(contentLower)
  ) {
    typeScores.hours += 80; // Erhöhter Score für Öffnungszeiten

    // Wenn Wochentage als Liste dargestellt werden, reduziere den Shop-Score
    if (/\b(montag|dienstag|mittwoch|donnerstag|freitag)\b/i.test(contentLower)) {
      typeScores.shops -= 30;
    }
  }

  // Spezielle Erkennung für Shops/Geschäfte
  if (/<li>[\s\S]*?<\/li>/gi.test(html) && typeScores.shops > 0) {
    typeScores.shops += 30;
  }

  // Spezielle Erkennung für Events
  if (
    /\b\d{1,2}\.\s*\d{1,2}\.\s*\d{2,4}\b/.test(html) && // Datumsformat
    typeScores.events > 0
  ) {
    typeScores.events += 30;
  }

  // 3. Erstelle Sektionen basierend auf den Scores
  // Wir verwenden einen Schwellenwert von 20 für die Relevanz
  const relevantTypes = Object.entries(typeScores)
    .filter(([type, score]) => score >= 20 && type !== 'intro')
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

  // Wenn keine relevanten Typen gefunden wurden, füge den gesamten Content als "other" hinzu
  if (relevantTypes.length === 0) {
    sections.push({
      type: 'other',
      title: '',
      content: html,
      relevanceScore: 100
    });
    return sections;
  }

  // Füge relevante Sektionen hinzu
  relevantTypes.forEach(([type, score]) => {
    const sectionType = type as SectionType;

    // Titel basierend auf dem Sektionstyp
    let title = '';
    switch (sectionType) {
      case 'shops':
        title = 'Shops im Center';
        break;
      case 'restaurants':
        title = 'Gastronomie';
        break;
      case 'events':
        title = 'Aktuelle Events';
        break;
      case 'news':
        title = 'Neuigkeiten';
        break;
      case 'hours':
        title = 'Öffnungszeiten';
        break;
      case 'location':
        title = 'Standort & Anfahrt';
        break;
      case 'contact':
        title = 'Kontakt';
        break;
      case 'faq':
        title = 'Häufige Fragen';
        break;
      default:
        title = 'Weitere Informationen';
    }

    // Normalisiere den Score auf 0-100
    const normalizedScore = Math.min(100, Math.round(score / 2));

    sections.push({
      type: sectionType,
      title,
      content: html, // Der gesamte Content wird zunächst der Sektion zugewiesen
      relevanceScore: normalizedScore
    });
  });

  return sections;
}

/**
 * Extrahiert Listenelemente aus HTML
 *
 * @param html Der HTML-Content als String
 * @returns Ein Array von Listenelementen
 */
export function extractListItems(html: string): any[] {
  if (!html) return [];

  const items: any[] = [];
  const listItems = html.match(/<li>([\s\S]*?)<\/li>/gi) || [];

  listItems.forEach(item => {
    const content = item.replace(/<li>([\s\S]*?)<\/li>/i, '$1');
    items.push({
      content,
      html: content
    });
  });

  return items;
}

/**
 * Prüft, ob eine Sektion relevant für die aktuelle Anfrage ist
 *
 * @param section Die zu prüfende Sektion
 * @param query Die Anfrage des Nutzers
 * @returns true, wenn die Sektion relevant ist, sonst false
 */
export function isSectionRelevantForQuery(section: ContentSection, query: string): boolean {
  // Intro-Sektion ist immer relevant
  if (section.type === 'intro') return true;

  // Wenn keine Anfrage vorhanden ist, zeige alle Sektionen an
  if (!query || query.trim() === '') return true;

  const queryLower = query.toLowerCase();

  // Allgemeine Relevanz-Checks für Essen/Hunger/Restaurants
  if (section.type === 'restaurants') {
    const foodKeywords = ['essen', 'hunger', 'restaurant', 'café', 'gastro', 'speise', 'mittag', 'abend', 'frühstück',
                         'food', 'mahlzeit', 'snack', 'imbiss', 'mensa', 'kantine', 'bistro'];

    for (const keyword of foodKeywords) {
      if (queryLower.includes(keyword)) {
        return true;
      }
    }

    // Spezielle Patterns für Hunger/Essen
    if (/\b(ich\s+habe\s+hunger|wo\s+kann\s+(ich|man)\s+(essen|etwas\s+essen))\b/i.test(queryLower)) {
      return true;
    }
  }

  // Prüfe, ob die Anfrage Keywords für den Sektionstyp enthält
  const typeKeywords = sectionKeywords[section.type]?.keywords || [];
  const typePatterns = sectionKeywords[section.type]?.patterns || [];

  // Keyword-Check
  for (const keyword of typeKeywords) {
    if (queryLower.includes(keyword.toLowerCase())) {
      return true;
    }
  }

  // Pattern-Check
  for (const pattern of typePatterns) {
    if (pattern.test(queryLower)) {
      return true;
    }
  }

  // Spezielle Checks basierend auf dem Sektionstyp
  switch (section.type) {
    case 'shops':
      return /\b(wo|welche|gibt es)\b.*?\b(shops?|gesch[äa]fte?|l[äa]den|kaufen)\b/i.test(queryLower);

    case 'events':
      return /\b(events?|veranstaltung(en)?|was (ist|gibt es) los|passiert|aktuell)\b/i.test(queryLower);

    case 'hours':
      return /\b(wann|wie lange|öffnungszeit|geöffnet|offen|geschlossen|schließt|auf|zu|uhr)\b/i.test(queryLower) ||
             queryLower.includes('hat') && (queryLower.includes('mall') || queryLower.includes('center') || queryLower.includes('laden'));

    case 'location':
      return /\b(wo|standort|adresse|anfahrt|finden)\b/i.test(queryLower);

    default:
      // Für andere Sektionstypen: Relevanz basierend auf dem Score
      return section.relevanceScore >= 40; // Niedrigerer Schwellenwert für mehr Relevanz
  }
}
