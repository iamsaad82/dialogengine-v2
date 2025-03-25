/**
 * Lunary Analytics Integration
 * 
 * Dieses Modul bietet einfache Funktionen für das Tracking von Events mit Lunary.
 * Das Lunary-Script wird bereits automatisch im Layout geladen.
 */

import prisma from './db'

// Interface für Tracking-Ereignisse
interface TrackEvent {
  user?: string
  message: string
  botId?: string
  botName?: string
  metadata?: Record<string, any>
}

// Interface für Tracking-Feedback
interface TrackFeedback {
  user?: string
  conversationId: string
  rating: 'positive' | 'negative'
  comment?: string
  botId?: string
  botName?: string
}

/**
 * Lunary-Client für die Aufzeichnung von Ereignissen und Feedback
 */
export const LunaryClient = {
  /**
   * Sendet ein Tracking-Ereignis an Lunary
   */
  async track({ user, message, botId, botName, metadata = {} }: TrackEvent) {
    try {
      // Prüfen, ob Lunary aktiviert ist
      const settings = await prisma.appSettings.findUnique({
        where: { id: 'global' }
      })

      if (!settings?.lunaryEnabled || !settings?.lunaryProjectId) {
        return null // Lunary ist nicht aktiviert
      }

      // Bot-Informationen abrufen, wenn vorhanden
      let bot = null
      if (botId) {
        bot = await prisma.bot.findUnique({
          where: { id: botId },
          include: { settings: true }
        })

        // Wenn Bot-Settings Analytics nicht aktiviert haben, nicht tracken
        if (bot?.settings?.enableAnalytics === false) {
          return null
        }
      }

      // Lunary API aufrufen
      const response = await fetch('https://api.lunary.ai/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.lunaryProjectId}`
        },
        body: JSON.stringify({
          type: 'message',
          text: message,
          userId: user || 'anonymous',
          metadata: {
            ...metadata,
            botId: botId || 'default',
            botName: botName || bot?.name || 'Brandenburg Dialog',
          }
        })
      })

      if (!response.ok) {
        console.error('Fehler beim Senden an Lunary:', await response.text())
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Fehler beim Tracking mit Lunary:', error)
      return null
    }
  },

  /**
   * Sendet Feedback an Lunary
   */
  async trackFeedback({ user, conversationId, rating, comment, botId, botName }: TrackFeedback) {
    try {
      // Prüfen, ob Lunary aktiviert ist
      const settings = await prisma.appSettings.findUnique({
        where: { id: 'global' }
      })

      if (!settings?.lunaryEnabled || !settings?.lunaryProjectId) {
        return null // Lunary ist nicht aktiviert
      }

      // Bot-Informationen abrufen, wenn vorhanden
      let bot = null
      if (botId) {
        bot = await prisma.bot.findUnique({
          where: { id: botId },
          include: { settings: true }
        })

        // Wenn Bot-Settings Feedback nicht aktiviert haben, nicht tracken
        if (bot?.settings?.enableFeedback === false) {
          return null
        }
      }

      // Lunary API aufrufen
      const response = await fetch('https://api.lunary.ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.lunaryProjectId}`
        },
        body: JSON.stringify({
          conversationId,
          rating: rating === 'positive' ? 'thumbsUp' : 'thumbsDown',
          userId: user || 'anonymous',
          comment: comment || '',
          metadata: {
            botId: botId || 'default',
            botName: botName || bot?.name || 'Brandenburg Dialog',
          }
        })
      })

      if (!response.ok) {
        console.error('Fehler beim Senden von Feedback an Lunary:', await response.text())
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Fehler beim Senden von Feedback an Lunary:', error)
      return null
    }
  },

  /**
   * Prüft, ob Lunary aktiviert ist
   */
  async isEnabled() {
    try {
      const settings = await prisma.appSettings.findUnique({
        where: { id: 'global' }
      })
      
      return settings?.lunaryEnabled && !!settings?.lunaryProjectId
    } catch {
      return false
    }
  }
}

/**
 * Prüft, ob Lunary verfügbar ist
 */
const isLunaryAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.lunary !== undefined;
};

/**
 * Trackt ein Event mit Lunary
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
  if (isLunaryAvailable()) {
    try {
      window.lunary!.track(eventName, properties);
    } catch (error) {
      console.error('Fehler beim Tracking-Event:', error);
    }
  }
};

/**
 * Trackt ein Chat-Event (Nachricht gesendet, erhalten, etc.)
 */
export const trackChatEvent = (action: string, metadata?: Record<string, any>): void => {
  trackEvent(`chat_${action}`, metadata);
}; 