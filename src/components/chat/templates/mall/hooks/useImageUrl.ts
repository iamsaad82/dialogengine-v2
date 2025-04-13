'use client';

/**
 * Temporäre Mock-Implementierung für den useImageUrl-Hook
 * Diese Datei sollte durch die tatsächliche Implementierung ersetzt werden
 */

export function useImageUrl() {
  // Einfache Implementierung, die eine URL basierend auf der imageId zurückgibt
  const getImageUrl = (imageId: string) => {
    // Standard-Bildpfad für Logos im Mall-Template
    if (!imageId) {
      return '/images/default_shop.jpg';
    }
    
    // Bereinige die imageId von potenziell problematischen Zeichen
    const safeImageId = imageId.replace(/[^\w-]/g, '_');
    
    // Prüfe, ob die ID schon einen Dateityp enthält
    if (safeImageId.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return `/images/${safeImageId}`;
    }
    
    return `/images/${safeImageId}.jpg`;
  };
  
  return { getImageUrl };
} 