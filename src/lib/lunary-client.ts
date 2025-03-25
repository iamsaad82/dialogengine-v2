import type { LunaryFeedbackData, LunaryFeedbackOptions, LunaryTrackOptions } from './lunary-types'

// Typen für die Tracking-Events
export interface TrackEvent {
  eventName: string
  properties?: Record<string, any>
  userId?: string
  metadata?: Record<string, any>
}

// Typen für das Feedback
export interface TrackFeedback {
  rating: number | boolean
  userId?: string
  metadata?: Record<string, any>
  text?: string
}

// Einfacher Client für Lunary Analytics
// Version 1.0

interface TrackingEvent {
  eventName: string;
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface FeedbackEvent {
  rating: boolean;
  userId: string;
  metadata?: Record<string, any>;
}

// API-Wrapper für Lunary Analytics
export class LunaryClient {
  private static instance: LunaryClient;
  private publicKey: string | null = null;
  private privateKey: string | null = null;
  private enabled: boolean = false;

  constructor() {
    // Prüfe, ob Umgebungsvariablen gesetzt sind
    this.publicKey = process.env.NEXT_PUBLIC_LUNARY_PUBLIC_KEY || null;
    this.privateKey = typeof window === 'undefined' ? process.env.LUNARY_PRIVATE_KEY || null : null;
    
    // Aktiviere nur wenn Public Key vorhanden ist
    this.enabled = Boolean(this.publicKey);
    
    if (this.enabled) {
      console.log('Lunary Analytics initialisiert mit Public Key');
      
      // Wenn im Browser und Lunary global verfügbar ist, initialisiere das Client-SDK
      if (typeof window !== 'undefined' && this.publicKey) {
        this.initBrowserClient();
      }
    } else {
      console.log('Lunary Analytics deaktiviert (Public Key fehlt)');
    }
  }

  private initBrowserClient(): void {
    // Prüfen ob das Lunary-Skript bereits geladen wurde
    if (typeof window.lunary === 'undefined') {
      // Lunary-Skript dynamisch laden
      const script = document.createElement('script');
      script.src = 'https://cdn.lunary.ai/lunary.js';
      script.async = true;
      
      script.onload = () => {
        // Lunary initialisieren
        if (window.lunary && this.publicKey) {
          window.lunary('init', this.publicKey);
          console.log('Lunary Browser-Client initialisiert');
        }
      };
      
      document.head.appendChild(script);
    } else if (window.lunary && this.publicKey) {
      // Falls bereits geladen, nur initialisieren
      window.lunary('init', this.publicKey);
    }
  }

  private static getInstance(): LunaryClient {
    if (!LunaryClient.instance) {
      LunaryClient.instance = new LunaryClient();
    }
    return LunaryClient.instance;
  }

  // Tracking-Event senden
  private async sendEvent(event: TrackingEvent): Promise<void> {
    if (!this.enabled) {
      console.log('Lunary Analytics deaktiviert, Event ignoriert:', event);
      return;
    }

    try {
      // Im Browser das globale Lunary-Objekt verwenden
      if (typeof window !== 'undefined' && window.lunary) {
        const options: LunaryTrackOptions = {
          userId: event.metadata?.userId || 'anonymous',
          metadata: event.metadata
        };
        
        window.lunary('track', event.eventName, event.properties || {}, options);
        console.log('Lunary Event im Browser gesendet:', event.eventName);
        return;
      }
      
      // Server-seitiges Tracking, nur wenn Private Key vorhanden
      if (this.privateKey) {
        await fetch('https://api.lunary.ai/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.privateKey}`
          },
          body: JSON.stringify({
            project_id: this.publicKey,
            event: event.eventName,
            properties: event.properties,
            metadata: event.metadata
          })
        });
        console.log('Lunary Event auf dem Server gesendet:', event.eventName);
      } else {
        console.log('Lunary Event nicht gesendet (kein Private Key):', event.eventName);
      }
    } catch (error) {
      console.error('Fehler beim Senden des Lunary Events:', error);
    }
  }

  // Feedback senden
  private async sendFeedback(feedback: FeedbackEvent): Promise<void> {
    if (!this.enabled) {
      console.log('Lunary Analytics deaktiviert, Feedback ignoriert:', feedback);
      return;
    }

    try {
      // Im Browser das globale Lunary-Objekt verwenden
      if (typeof window !== 'undefined' && window.lunary) {
        const data: LunaryFeedbackData = {
          rating: feedback.rating,
          metadata: feedback.metadata
        };
        
        const options: LunaryFeedbackOptions = {
          userId: feedback.userId
        };
        
        window.lunary('feedback', data, options);
        console.log('Lunary Feedback im Browser gesendet:', feedback.rating ? 'positiv' : 'negativ');
        return;
      }
      
      // Server-seitiges Feedback, nur wenn Private Key vorhanden
      if (this.privateKey) {
        await fetch('https://api.lunary.ai/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.privateKey}`
          },
          body: JSON.stringify({
            project_id: this.publicKey,
            rating: feedback.rating,
            user_id: feedback.userId,
            metadata: feedback.metadata
          })
        });
        console.log('Lunary Feedback auf dem Server gesendet:', feedback.rating ? 'positiv' : 'negativ');
      } else {
        console.log('Lunary Feedback nicht gesendet (kein Private Key):', feedback.rating ? 'positiv' : 'negativ');
      }
    } catch (error) {
      console.error('Fehler beim Senden des Lunary Feedbacks:', error);
    }
  }

  // Statische Methoden für einfachen Zugriff

  // Event tracking
  public static track(event: TrackingEvent): void {
    const instance = LunaryClient.getInstance();
    instance.sendEvent(event);
  }

  // Feedback tracking
  public static trackFeedback(feedback: FeedbackEvent): void {
    const instance = LunaryClient.getInstance();
    instance.sendFeedback(feedback);
  }
} 