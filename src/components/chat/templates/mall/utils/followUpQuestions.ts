'use client';

/**
 * Generiert Rückfragen basierend auf der Nutzeranfrage und dem Antwortinhalt
 * Diese Rückfragen werden am Ende der Antwort angezeigt, um den Dialog interaktiver zu gestalten
 */
export function generateFollowUpQuestions(query: string, content: string): string[] {
  // Wenn die Anfrage oder der Inhalt leer ist, keine Rückfragen generieren
  if (!query || !content) return [];
  
  // Normalisiere die Anfrage und den Inhalt für bessere Vergleiche
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedContent = content.toLowerCase().trim();
  
  // Prüfe, ob die Anfrage unklar ist oder zu wenig Informationen enthält
  const isUnclearQuery = 
    normalizedQuery.length < 10 || 
    normalizedQuery.split(' ').length < 3 ||
    /^(wo|was|wie|wann|warum|welche|gibt es)/.test(normalizedQuery);
  
  // Wenn die Anfrage nicht unklar ist, keine Rückfragen generieren
  if (!isUnclearQuery) return [];
  
  // Kategorien für Rückfragen
  const categories = {
    shops: /shop|geschäft|laden|store|boutique|einkauf/i.test(normalizedContent),
    restaurants: /restaurant|café|essen|trinken|gastronomie|food/i.test(normalizedContent),
    events: /event|veranstaltung|konzert|ausstellung|show/i.test(normalizedContent),
    openingHours: /öffnungszeit|geöffnet|öffnet|schließt/i.test(normalizedContent),
    parking: /park|parken|parkhaus|parkplatz|tiefgarage/i.test(normalizedContent),
    location: /standort|adresse|anfahrt|weg|route/i.test(normalizedContent),
    services: /service|dienstleistung|beratung|kundenservice/i.test(normalizedContent)
  };
  
  // Mögliche Rückfragen nach Kategorie
  const questionsByCategory: Record<string, string[]> = {
    shops: [
      'Suchen Sie nach einem bestimmten Geschäft oder einer Produktkategorie?',
      'Möchten Sie mehr über die Shops in einem bestimmten Bereich erfahren?',
      'Interessieren Sie sich für aktuelle Angebote in den Geschäften?'
    ],
    restaurants: [
      'Suchen Sie nach einem bestimmten Restaurant oder einer Küche?',
      'Möchten Sie Informationen zu Reservierungsmöglichkeiten?',
      'Interessieren Sie sich für spezielle Angebote oder Mittagsmenüs?'
    ],
    events: [
      'Suchen Sie nach Veranstaltungen in einem bestimmten Zeitraum?',
      'Möchten Sie mehr über ein bestimmtes Event erfahren?',
      'Interessieren Sie sich für kommende Veranstaltungen?'
    ],
    openingHours: [
      'Suchen Sie die Öffnungszeiten für einen bestimmten Tag?',
      'Möchten Sie wissen, ob es Sonderöffnungszeiten gibt?',
      'Interessieren Sie sich für die Öffnungszeiten bestimmter Geschäfte?'
    ],
    parking: [
      'Möchten Sie mehr über die Parkgebühren erfahren?',
      'Suchen Sie Informationen zu Parkmöglichkeiten in der Nähe?',
      'Interessieren Sie sich für spezielle Parkangebote?'
    ],
    location: [
      'Benötigen Sie eine Wegbeschreibung?',
      'Möchten Sie wissen, wie Sie mit öffentlichen Verkehrsmitteln zu uns kommen?',
      'Suchen Sie nach einem bestimmten Bereich im Center?'
    ],
    services: [
      'Suchen Sie nach einem bestimmten Service im Center?',
      'Benötigen Sie Informationen zu Kundenservice oder Beratung?',
      'Möchten Sie mehr über unsere Serviceangebote erfahren?'
    ]
  };
  
  // Allgemeine Rückfragen, wenn keine spezifische Kategorie erkannt wurde
  const generalQuestions = [
    'Kann ich Ihnen mit weiteren Informationen helfen?',
    'Haben Sie noch weitere Fragen zum Center?',
    'Möchten Sie mehr über unsere Angebote erfahren?',
    'Suchen Sie nach bestimmten Informationen?'
  ];
  
  // Sammle relevante Fragen basierend auf erkannten Kategorien
  const relevantQuestions: string[] = [];
  
  // Füge Fragen aus erkannten Kategorien hinzu
  Object.entries(categories).forEach(([category, isRelevant]) => {
    if (isRelevant && questionsByCategory[category]) {
      // Wähle eine zufällige Frage aus der Kategorie
      const randomIndex = Math.floor(Math.random() * questionsByCategory[category].length);
      relevantQuestions.push(questionsByCategory[category][randomIndex]);
    }
  });
  
  // Wenn keine relevanten Fragen gefunden wurden, verwende allgemeine Fragen
  if (relevantQuestions.length === 0) {
    const randomIndex = Math.floor(Math.random() * generalQuestions.length);
    relevantQuestions.push(generalQuestions[randomIndex]);
  }
  
  // Begrenze auf maximal eine Rückfrage
  return relevantQuestions.slice(0, 1);
}

/**
 * Fügt Rückfragen am Ende des Inhalts hinzu
 */
export function addFollowUpQuestions(content: string, query: string): string {
  // Generiere Rückfragen
  const followUpQuestions = generateFollowUpQuestions(query, content);
  
  // Wenn keine Rückfragen generiert wurden, gib den ursprünglichen Inhalt zurück
  if (followUpQuestions.length === 0) return content;
  
  // Füge die Rückfragen am Ende des Inhalts hinzu
  let updatedContent = content;
  
  // Prüfe, ob der Inhalt bereits mit einem Absatz endet
  if (!updatedContent.endsWith('</p>')) {
    updatedContent += '<p></p>';
  }
  
  // Füge die Rückfragen hinzu
  updatedContent += '<p style="margin-top: 1rem; font-style: italic;">' + followUpQuestions.join(' ') + '</p>';
  
  return updatedContent;
}
