'use client';

/**
 * Vereinfachte Streaming-Status-Hook für die Mall-Komponente
 * Gibt immer isComplete=true zurück, um die Verarbeitung in der Mall-Komponente zu ermöglichen
 */

export function useStreamedMessage() {
  // Immer als abgeschlossen betrachten, damit die Mall-Komponente den Inhalt verarbeitet
  return {
    isComplete: true,
    isStreaming: false
  };
} 