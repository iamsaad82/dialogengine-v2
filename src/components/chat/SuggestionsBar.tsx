import React from 'react'
import { BotSuggestion } from '@/types/bot'

interface SuggestionsBarProps {
  suggestions: BotSuggestion[]
  onSuggestionClick: (text: string) => void
  className?: string
}

export function SuggestionsBar({
  suggestions,
  onSuggestionClick,
  className = ''
}: SuggestionsBarProps) {
  // Filtere nur aktive Vorschläge
  const activeSuggestions = suggestions.filter(s => s.isActive);
  
  // Wenn keine aktiven Vorschläge vorhanden sind, zeige nichts an
  if (activeSuggestions.length === 0) {
    return null;
  }
  
  return (
    <div className={`w-full my-1 flex flex-wrap gap-1.5 ${className}`}>
      {activeSuggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSuggestionClick(suggestion.text)}
          className="px-2.5 py-1 text-sm rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary transition-colors"
        >
          {suggestion.text}
        </button>
      ))}
    </div>
  )
} 