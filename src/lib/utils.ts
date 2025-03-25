import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Kombiniert Tailwind-Klassen und behebt Konflikte
 * 
 * Diese Funktion nimmt mehrere Klassen oder bedingte Klassenobjekte an und
 * kombiniert sie, wobei Konflikte zwischen Tailwind-Klassen korrekt aufgelöst werden.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 