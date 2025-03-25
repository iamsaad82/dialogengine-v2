/**
 * Typendefinitionen für Lunary Analytics
 */

export interface LunaryTrackOptions {
  userId?: string;
  metadata?: Record<string, any>;
}

export interface LunaryFeedbackOptions {
  userId?: string;
}

export interface LunaryFeedbackData {
  rating: number | boolean;
  text?: string;
  metadata?: Record<string, any>;
}

export interface LunaryClient {
  (method: 'init', projectId: string): void;
  (method: 'track', eventName: string, properties?: Record<string, any>, options?: LunaryTrackOptions): void;
  (method: 'feedback', data: LunaryFeedbackData, options?: LunaryFeedbackOptions): void;
}

// Deklariere Lunary als globales Objekt im Window
declare global {
  interface Window {
    lunary: LunaryClient;
  }
} 