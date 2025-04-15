'use client';

/**
 * HTML-Sanitizer für Mall-Template
 *
 * Diese Utility-Klasse bietet Funktionen zum Sanitizen von HTML-Inhalten,
 * um XSS-Angriffe zu verhindern und sicherzustellen, dass nur erlaubte
 * HTML-Tags und -Attribute verwendet werden.
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  try {
    // Einfache Implementierung: Entferne potenziell gefährliche Tags und Attribute
    // In einer Produktionsumgebung sollte eine robustere Lösung wie DOMPurify verwendet werden

    // Entferne <script> Tags und deren Inhalt
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Entferne onclick, onerror und andere on* Attribute
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');

    // Entferne javascript: URLs
    sanitized = sanitized.replace(/javascript:[^\s>]*/gi, '');

    return sanitized;
  } catch (error) {
    console.error('Fehler beim Sanitizen von HTML:', error);
    return '';
  }
}

/**
 * Speziell für Follow-up-Fragen optimierte Sanitizer-Funktion
 */
export function sanitizeFollowUpContent(content: string): string {
  if (!content) return '';

  try {
    // Basis-Sanitizing
    let sanitized = sanitizeHtml(content);

    // Stelle sicher, dass Links in neuem Tab geöffnet werden
    sanitized = sanitized.replace(/<a\s+(?![^>]*\starget=)/gi, '<a target="_blank" rel="noopener noreferrer" ');

    // Füge Klassen zu Listen hinzu für besseres Styling
    sanitized = sanitized.replace(/<ul>/gi, '<ul class="follow-up-list">');
    sanitized = sanitized.replace(/<li>/gi, '<li class="follow-up-item">');

    return sanitized;
  } catch (error) {
    console.error('Fehler beim Sanitizen von Follow-up-Inhalten:', error);
    return content; // Fallback zum Original-Content
  }
}
