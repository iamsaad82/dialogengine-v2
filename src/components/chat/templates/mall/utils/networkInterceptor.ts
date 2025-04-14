'use client';

import { logData } from './dataLogger';

/**
 * Netzwerk-Interceptor für die Überwachung von API-Aufrufen
 * 
 * Diese Utility-Klasse überwacht API-Aufrufe und protokolliert die Antworten,
 * um Probleme bei der Übertragung zu identifizieren.
 */

// Speichert die originale fetch-Funktion
const originalFetch = global.fetch;

// Überschreibt die fetch-Funktion mit einer überwachten Version
global.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  // Rufe die originale fetch-Funktion auf
  const response = await originalFetch(input, init);
  
  try {
    // Prüfe, ob es sich um einen API-Aufruf handelt, der uns interessiert
    const url = input instanceof Request ? input.url : input.toString();
    
    // Prüfe, ob es sich um einen Flowise-API-Aufruf handelt
    if (url.includes('api/v1/prediction') || url.includes('api/chat')) {
      // Klone die Antwort, da sie nur einmal gelesen werden kann
      const clonedResponse = response.clone();
      
      // Versuche, den Antworttext zu lesen
      const text = await clonedResponse.text();
      
      // Protokolliere die Antwort
      logData('API-Antwort', text);
      
      // Prüfe auf XML-Inhalte
      if (text.includes('<intro>') || text.includes('<shop>') || text.includes('<tip>')) {
        logData('XML in API-Antwort gefunden', text);
      }
    }
  } catch (error) {
    console.error('Fehler beim Intercepten der Netzwerkanfrage:', error);
  }
  
  // Gib die originale Antwort zurück
  return response;
};

/**
 * Initialisiert den Netzwerk-Interceptor
 */
export function initNetworkInterceptor() {
  console.log('Netzwerk-Interceptor initialisiert');
  
  // Überwache auch XMLHttpRequest
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    // Speichere die URL für spätere Verwendung
    (this as any)._interceptedUrl = url;
    return originalXhrOpen.apply(this, [method, url, ...args] as any);
  };
  
  XMLHttpRequest.prototype.send = function(body) {
    // Füge einen Listener für die Antwort hinzu
    this.addEventListener('load', function() {
      try {
        const url = (this as any)._interceptedUrl;
        
        // Prüfe, ob es sich um einen Flowise-API-Aufruf handelt
        if (url && (url.includes('api/v1/prediction') || url.includes('api/chat'))) {
          // Protokolliere die Antwort
          const responseText = this.responseText;
          logData('XHR-Antwort', responseText);
          
          // Prüfe auf XML-Inhalte
          if (responseText.includes('<intro>') || responseText.includes('<shop>') || responseText.includes('<tip>')) {
            logData('XML in XHR-Antwort gefunden', responseText);
          }
        }
      } catch (error) {
        console.error('Fehler beim Intercepten der XHR-Antwort:', error);
      }
    });
    
    return originalXhrSend.apply(this, [body] as any);
  };
}
