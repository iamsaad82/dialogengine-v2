'use client';

/**
 * Daten-Logger für die Diagnose von XML-Übertragungsproblemen
 * 
 * Diese Utility-Klasse protokolliert Daten an verschiedenen Punkten im Verarbeitungsprozess,
 * um zu identifizieren, wo genau die XML-Daten beschädigt werden.
 */

// Aktiviere/deaktiviere das Logging
const ENABLE_LOGGING = true;
// Maximale Länge für geloggte Inhalte
const MAX_LOG_LENGTH = 500;

// Speicher für die Logs
let logs: LogEntry[] = [];

// Log-Eintrag-Typ
interface LogEntry {
  timestamp: string;
  stage: string;
  contentPreview: string;
  contentLength: number;
  contentHash: string;
  issues?: string[];
}

/**
 * Protokolliert Daten an einem bestimmten Punkt im Verarbeitungsprozess
 */
export function logData(stage: string, content: string): void {
  if (!ENABLE_LOGGING) return;
  
  const timestamp = new Date().toISOString();
  const contentLength = content.length;
  const contentPreview = content.length > MAX_LOG_LENGTH 
    ? `${content.substring(0, MAX_LOG_LENGTH)}...` 
    : content;
  const contentHash = generateSimpleHash(content);
  
  // Identifiziere potenzielle Probleme
  const issues = identifyIssues(content);
  
  const logEntry: LogEntry = {
    timestamp,
    stage,
    contentPreview,
    contentLength,
    contentHash,
    issues: issues.length > 0 ? issues : undefined
  };
  
  logs.push(logEntry);
  
  // Konsolenausgabe für sofortige Diagnose
  console.log(`[DataLogger] ${stage}: ${contentLength} Zeichen, Hash: ${contentHash}`);
  if (issues.length > 0) {
    console.warn(`[DataLogger] Probleme erkannt: ${issues.join(', ')}`);
  }
}

/**
 * Gibt alle gesammelten Logs zurück
 */
export function getAllLogs(): LogEntry[] {
  return logs;
}

/**
 * Löscht alle gesammelten Logs
 */
export function clearLogs(): void {
  logs = [];
}

/**
 * Generiert einen einfachen Hash für einen String
 */
function generateSimpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString(16);
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Identifiziert potenzielle Probleme im Content
 */
function identifyIssues(content: string): string[] {
  const issues: string[] = [];
  
  // Prüfe auf abgeschnittene XML-Tags
  const openTags = (content.match(/<[a-z]+>/g) || []).length;
  const closeTags = (content.match(/<\/[a-z]+>/g) || []).length;
  if (openTags !== closeTags) {
    issues.push(`Ungleiche Anzahl von öffnenden (${openTags}) und schließenden (${closeTags}) Tags`);
  }
  
  // Prüfe auf überlappende Tags
  const tagPairs = [
    { open: '<intro>', close: '</intro>' },
    { open: '<shop>', close: '</shop>' },
    { open: '<shops', close: '</shops>' },
    { open: '<restaurant>', close: '</restaurant>' },
    { open: '<restaurants', close: '</restaurants>' },
    { open: '<tip>', close: '</tip>' }
  ];
  
  tagPairs.forEach(pair => {
    const openIndex = content.indexOf(pair.open);
    const closeIndex = content.indexOf(pair.close);
    
    if (openIndex !== -1 && closeIndex !== -1) {
      // Prüfe, ob zwischen dem öffnenden und schließenden Tag ein anderes öffnendes Tag des gleichen Typs vorkommt
      const middleContent = content.substring(openIndex + pair.open.length, closeIndex);
      if (middleContent.includes(pair.open)) {
        issues.push(`Überlappende ${pair.open} Tags`);
      }
    }
  });
  
  // Prüfe auf ungewöhnliche Zeichen oder Sequenzen
  if (content.includes('\u0000')) {
    issues.push('Enthält Null-Bytes');
  }
  
  if (content.includes('�')) {
    issues.push('Enthält Ersatzzeichen (möglicherweise Kodierungsprobleme)');
  }
  
  // Prüfe auf abruptes Ende
  if (content.length > 10 && !content.endsWith('>') && !content.endsWith('\n')) {
    issues.push('Abruptes Ende (kein schließendes Tag oder Zeilenumbruch)');
  }
  
  return issues;
}
