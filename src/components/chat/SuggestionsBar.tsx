import { motion } from 'framer-motion';
import { SuggestionsBarProps } from './types/common';
import { BotSuggestion } from '@/types/bot';

// Hilfsfunktion für Gradienten aus der Primärfarbe
const createGradientFromColor = (color: string | undefined): string => {
  if (!color) return 'linear-gradient(135deg, #3b82f6, #1e40af)'; // Default-Gradient
  
  try {
    // Aus der Hex-Farbe die einzelnen RGB-Komponenten extrahieren
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Hellere Version für den Start des Gradienten (10% heller)
    const lighterColor = `#${Math.min(255, Math.floor(r * 1.1)).toString(16).padStart(2, '0')}${
      Math.min(255, Math.floor(g * 1.1)).toString(16).padStart(2, '0')}${
      Math.min(255, Math.floor(b * 1.1)).toString(16).padStart(2, '0')}`;
    
    // Dunklere Version für das Ende des Gradienten (15% dunkler)
    const darkerColor = `#${Math.floor(r * 0.85).toString(16).padStart(2, '0')}${
      Math.floor(g * 0.85).toString(16).padStart(2, '0')}${
      Math.floor(b * 0.85).toString(16).padStart(2, '0')}`;
    
    return `linear-gradient(135deg, ${lighterColor}, ${darkerColor})`;
  } catch (e) {
    return 'linear-gradient(135deg, #3b82f6, #1e40af)'; // Fallback
  }
};

export function SuggestionsBar({ 
  suggestions, 
  onSuggestionClick,
  botPrimaryColor,
  botAccentColor,
  botTextColor
}: SuggestionsBarProps) {
  // Filtere nur aktive Vorschläge
  const activeSuggestions = (suggestions as BotSuggestion[]).filter(s => s.isActive);
  
  // Wenn keine aktiven Vorschläge vorhanden sind, zeige nichts an
  if (activeSuggestions.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-2 p-3 border-t border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {activeSuggestions.map((suggestion, index) => (
        <motion.button
          key={`${suggestion.text}-${index}`}
          className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200"
          style={{
            background: createGradientFromColor(botPrimaryColor),
            color: '#ffffff',
            opacity: 0.95,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
          whileHover={{ 
            opacity: 1,
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSuggestionClick(suggestion.text)}
        >
          {suggestion.text}
        </motion.button>
      ))}
    </motion.div>
  );
} 