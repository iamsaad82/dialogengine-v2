/**
 * Verarbeitet HTML-Inhalte und extrahiert spezielle Sektionen
 * @param htmlContent Der HTML-Inhalt, der verarbeitet werden soll
 * @param additionalSelectors Optionale zusätzliche CSS-Selektoren für Template-spezifische Klassen
 */
export function processHtmlContent(htmlContent: string, additionalSelectors: string[] = []) {
  // In der Browser-Umgebung
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Key Facts extrahieren
    // Basisselektoren + optionale zusätzliche Selektoren
    const keyFactsSelectors = ['.keyfacts', '.aok-keyfacts', '.creditreform-keyfacts'];
    const keyFactsDiv = doc.querySelector(keyFactsSelectors.concat(additionalSelectors.filter(s => s.includes('keyfacts') || s.includes('facts'))).join(', '));
    const hasKeyFacts = !!keyFactsDiv;
    const keyFactsContent = keyFactsDiv?.innerHTML || '';
    
    // Schnellüberblick extrahieren
    const quickOverviewDiv = doc.querySelector('.schnellueberblick, .aok-schnellueberblick');
    const hasQuickOverview = !!quickOverviewDiv;
    const quickOverviewContent = quickOverviewDiv?.innerHTML || '';
    
    // Kontaktinformationen extrahieren
    const contactSelectors = ['.kontakt', '.aok-kontakt', '.creditreform-service-section', '.creditreform-contact'];
    const contactDiv = doc.querySelector(contactSelectors.concat(additionalSelectors.filter(s => s.includes('contact') || s.includes('service'))).join(', '));
    const hasContactInfo = !!contactDiv;
    const contactInfoContent = contactDiv?.innerHTML || '';
    
    // Allgemeine Infobox extrahieren
    const infoSelectors = ['.creditreform-info'];
    const infoBoxDiv = doc.querySelector(infoSelectors.concat(additionalSelectors.filter(s => s.includes('info'))).join(', '));
    const hasInfoBox = !!infoBoxDiv;
    const infoBoxContent = infoBoxDiv?.innerHTML || '';
    
    // HTML bereinigen - spezielle Sektionen entfernen, um Duplikate zu vermeiden
    if (keyFactsDiv && keyFactsDiv.parentNode) {
      keyFactsDiv.parentNode.removeChild(keyFactsDiv);
    }
    
    if (quickOverviewDiv && quickOverviewDiv.parentNode) {
      quickOverviewDiv.parentNode.removeChild(quickOverviewDiv);
    }
    
    if (contactDiv && contactDiv.parentNode) {
      contactDiv.parentNode.removeChild(contactDiv);
    }
    
    if (infoBoxDiv && infoBoxDiv.parentNode) {
      infoBoxDiv.parentNode.removeChild(infoBoxDiv);
    }
    
    // Restlicher Inhalt ohne die speziellen Sektionen
    const regularContent = doc.body.innerHTML;
    
    return {
      hasKeyFacts,
      keyFactsContent,
      hasQuickOverview,
      quickOverviewContent,
      hasContactInfo,
      contactInfoContent,
      hasInfoBox,
      infoBoxContent,
      regularContent
    };
  }
  
  // SSR-Umgebung
  return {
    hasKeyFacts: false,
    keyFactsContent: '',
    hasQuickOverview: false,
    quickOverviewContent: '',
    hasContactInfo: false,
    contactInfoContent: '',
    hasInfoBox: false,
    infoBoxContent: '',
    regularContent: htmlContent
  };
}

/**
 * Extrahiert Listenelemente aus HTML-Inhalt
 */
export function extractListItems(htmlContent: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return [];
  }
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  const listItems = tempDiv.querySelectorAll('li');
  const result = [];
  
  for (const item of Array.from(listItems)) {
    // Icon aus dem ersten <strong>-Element extrahieren
    const strong = item.querySelector('strong');
    const icon = strong ? strong.textContent || '•' : '•';
    
    // HTML-Inhalt nach dem Icon
    let textContent = item.innerHTML;
    if (strong) {
      textContent = textContent.replace(strong.outerHTML, '').trim();
    }
    
    result.push({
      icon,
      text: textContent
    });
  }
  
  return result;
} 