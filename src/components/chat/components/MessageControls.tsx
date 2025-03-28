import React, { useState } from 'react';
import { CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon } from './ui/icons';
import { LunaryClient } from '@/lib/lunary';

interface MessageControlsProps {
  isBot: boolean;
  showCopyButton: boolean;
  enableFeedback: boolean;
  messageContent: string;
  botId?: string;
  isLastMessage?: boolean;
}

export const MessageControls: React.FC<MessageControlsProps> = ({
  isBot,
  showCopyButton,
  enableFeedback,
  messageContent,
  botId = 'default',
  isLastMessage = false
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);

  // Kopieren des Nachrichteninhalts
  const copyToClipboard = async () => {
    const plainText = messageContent.replace(/\*\*(.*?)\*\*/g, '$1') // Entferne Markdown-Formatierung
    
    // Tracking für Kopieren
    LunaryClient.track({
      message: 'Nachricht kopiert',
      botId: botId,
      metadata: { messageContent: plainText.slice(0, 100) }
    })

    // Erstellt einen temporären DOM-Knoten um HTML-Tags aus dem Text zu entfernen
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = messageContent || ''
    const plainTextFromContent = tempDiv.textContent || tempDiv.innerText || ''

    // Versuche erst navigator.clipboard.writeText zu verwenden
    const copyWithAPI = () => {
      navigator.clipboard.writeText(plainTextFromContent).then(
        () => {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        },
        (err) => {
          console.error('Fehler beim Kopieren mit Clipboard API:', err)
          // Fallback zu document.execCommand
          copyWithExecCommand()
        }
      )
    }

    // Fallback mit document.execCommand
    const copyWithExecCommand = () => {
      try {
        // Erstelle temporäres Textarea-Element
        const textArea = document.createElement('textarea')
        textArea.value = plainTextFromContent
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        // Führe Kopier-Befehl aus
        const successful = document.execCommand('copy')
        if (successful) {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        } else {
          console.error('Fehler beim Kopieren mit execCommand')
        }
        
        // Entferne temporäres Element
        document.body.removeChild(textArea)
      } catch (err) {
        console.error('Fehler beim Kopieren mit Fallback-Methode:', err)
      }
    }

    // Versuche erst die moderne API, dann den Fallback
    try {
      copyWithAPI()
    } catch (err) {
      console.error('Clipboard API nicht verfügbar, verwende Fallback:', err)
      copyWithExecCommand()
    }
  }
  
  // Funktion zum Senden von Feedback
  const sendFeedback = (isPositive: boolean) => {
    setFeedbackGiven(isPositive ? 'positive' : 'negative')
    
    // Tracking für Feedback
    LunaryClient.trackFeedback({
      rating: isPositive ? 'positive' : 'negative',
      conversationId: botId || 'unknown',
      botId: botId,
      comment: `Feedback zu Nachricht: ${messageContent.slice(0, 50)}...` // Verwende comment statt metadata
    })
    
    console.log(`Feedback gesendet: ${isPositive ? 'positiv' : 'negativ'} für Bot ${botId}`)
  }

  // Zeit-Anzeige im Footer der Nachricht
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mt-1 flex items-center justify-end gap-2 text-xs text-muted-foreground/70">
      {isBot && (
        <div className="flex items-center gap-2">
          {showCopyButton && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 opacity-0 hover:bg-muted/50 group-hover:opacity-100 focus:opacity-100"
              aria-label="Nachricht kopieren"
              title="Nachricht kopieren"
            >
              {copySuccess ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5" />
                  <span>Kopiert</span>
                </>
              ) : (
                <>
                  <CopyIcon className="h-3.5 w-3.5" />
                  <span>Kopieren</span>
                </>
              )}
            </button>
          )}
          
          {enableFeedback && feedbackGiven === null && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => sendFeedback(true)}
                className="rounded p-1 opacity-0 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 group-hover:opacity-100 focus:opacity-100"
                aria-label="Positive Bewertung"
                title="Diese Nachricht war hilfreich"
              >
                <ThumbsUpIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => sendFeedback(false)}
                className="rounded p-1 opacity-0 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 group-hover:opacity-100 focus:opacity-100"
                aria-label="Negative Bewertung"
                title="Diese Nachricht war nicht hilfreich"
              >
                <ThumbsDownIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          
          {enableFeedback && feedbackGiven === 'positive' && (
            <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
              Danke für Ihr positives Feedback!
            </span>
          )}
          
          {enableFeedback && feedbackGiven === 'negative' && (
            <span className="ml-2 text-xs text-rose-600 dark:text-rose-400">
              Danke für Ihr Feedback. Wir verbessern uns stetig.
            </span>
          )}
        </div>
      )}
      
      
      {!isBot && isLastMessage && (
        <div className="flex items-center gap-1">
          <CheckIcon className="h-3.5 w-3.5" />
          <span>Gesendet</span>
        </div>
      )}
      
      <span suppressHydrationWarning>
        {currentTime}
      </span>
    </div>
  );
}; 