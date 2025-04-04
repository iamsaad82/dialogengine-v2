'use client'

import { Chat } from '@/components/chat'
import { StreamingChat } from '@/components/chat/StreamingChat'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { BotSuggestion } from '@/types/bot'

// VERSION-MARKER: Chat-Embed-Debug-Code - Version 008
console.log("Embed Chat Client - Debug-Version 008");

// Client-Komponente für Chat-Embed mit useSearchParams
export default function ClientComponent() {
  const [mode, setMode] = useState<'bubble' | 'inline' | 'fullscreen'>('inline')
  const [primaryColor, setPrimaryColor] = useState('#e63946')
  const [botId, setBotId] = useState<string | undefined>(undefined)
  const [useStreaming, setUseStreaming] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<BotSuggestion[]>([])
  const [botInfo, setBotInfo] = useState<any>(null)
  const [messageTemplate, setMessageTemplate] = useState<string | undefined>(undefined)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true)
  const [enableFeedback, setEnableFeedback] = useState<boolean>(false)
  const [showCopyButton, setShowCopyButton] = useState<boolean>(true)
  const [showNameInHeader, setShowNameInHeader] = useState<boolean>(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  // Bot-Informationen und Vorschläge laden
  useEffect(() => {
    const loadBotInfo = async (id: string) => {
      try {
        console.log(`CHAT-EMBED-DEBUG-008: Lade Bot-Informationen für ID: ${id}`);
        const response = await fetch(`/api/bots/${id}`);

        if (!response.ok) {
          console.error(`CHAT-EMBED-DEBUG-008: Fehler beim Laden des Bots: ${response.status}`);
          return;
        }

        const botData = await response.json();
        console.log(`CHAT-EMBED-DEBUG-008: Bot-Daten geladen. Name: ${botData.name}, Hat Vorschläge: ${!!botData.suggestions}`);
        console.log(`CHAT-EMBED-DEBUG-008: WelcomeMessage: ${botData.welcomeMessage ? 'vorhanden' : 'fehlt'}, AvatarUrl: ${botData.avatarUrl ? 'vorhanden' : 'fehlt'}`);

        setBotInfo(botData);

        // Setze Vorschläge, wenn vorhanden
        if (botData.suggestions && Array.isArray(botData.suggestions)) {
          const activeSuggestions = botData.suggestions
            .filter((s: BotSuggestion) => s.isActive)
            .sort((a: BotSuggestion, b: BotSuggestion) => a.order - b.order);

          console.log(`CHAT-EMBED-DEBUG-008: ${activeSuggestions.length} aktive Vorschläge gefunden`);
          if (activeSuggestions.length > 0) {
            console.log(`CHAT-EMBED-DEBUG-008: Erste Vorschläge: ${activeSuggestions.slice(0, 3).map((s: BotSuggestion) => s.text).join(', ')}...`);
          }
          setSuggestions(activeSuggestions);
        }
      } catch (error) {
        console.error("CHAT-EMBED-DEBUG-008: Fehler beim Laden der Bot-Informationen:", error);
      }
    };

    // Bot-ID aus den URL-Parametern extrahieren
    const id = searchParams?.get('botId') || undefined
    if (id) {
      loadBotInfo(id);
    }

    // Prüfen, ob Streaming-Parameter vorhanden ist
    const streamingParam = searchParams?.get('streaming')
    const shouldUseStreaming = streamingParam === 'true' || streamingParam === '1'

    console.log(`CHAT-EMBED-DEBUG-008: Bot-ID aus URL: ${id || 'nicht gefunden'}`)
    console.log(`CHAT-EMBED-DEBUG-008: Streaming-Parameter: "${streamingParam}", wird interpretiert als: ${shouldUseStreaming ? 'aktiviert' : 'deaktiviert'}`)

    setBotId(id)
    setUseStreaming(shouldUseStreaming)

    // Erfasse die primäre Farbe aus der URL
    const embedColor = searchParams?.get('color')
    if (embedColor) {
      // Setze die Farbe, wenn sie in der URL angegeben ist
      setPrimaryColor(embedColor)
      console.log(`CHAT-EMBED-DEBUG-008: Primärfarbe aus URL: ${embedColor}`)
    } else {
      console.log(`CHAT-EMBED-DEBUG-008: Keine Primärfarbe in URL, verwende Standard: ${primaryColor}`)
    }

    // Message Template aus URL erfassen
    const templateParam = searchParams?.get('messageTemplate')
    if (templateParam) {
      setMessageTemplate(templateParam)
      console.log(`CHAT-EMBED-DEBUG-008: Message Template aus URL: ${templateParam}`)
    } else {
      console.log(`CHAT-EMBED-DEBUG-008: Kein Message Template in URL, verwende Standard aus Bot-Settings`)
    }

    // showSuggestions aus URL erfassen
    const showSuggestionsParam = searchParams?.get('showSuggestions')
    const shouldShowSuggestions = showSuggestionsParam === 'false' ? false : true
    console.log(`CHAT-EMBED-DEBUG-008: Vorschläge anzeigen: ${shouldShowSuggestions}`)
    setShowSuggestions(shouldShowSuggestions)

    // enableFeedback aus URL erfassen
    const enableFeedbackParam = searchParams?.get('enableFeedback')
    const shouldEnableFeedback = enableFeedbackParam === 'true' ? true : false
    console.log(`CHAT-EMBED-DEBUG-008: Feedback aktivieren: ${shouldEnableFeedback}`)
    setEnableFeedback(shouldEnableFeedback)

    // showCopyButton aus URL erfassen
    const showCopyButtonParam = searchParams?.get('showCopyButton')
    const shouldShowCopyButton = showCopyButtonParam === 'false' ? false : true
    console.log(`CHAT-EMBED-DEBUG-008: Kopieren-Button anzeigen: ${shouldShowCopyButton}`)
    setShowCopyButton(shouldShowCopyButton)

    // showNameInHeader aus URL erfassen
    const showNameInHeaderParam = searchParams?.get('showNameInHeader')
    const shouldShowNameInHeader = showNameInHeaderParam === 'false' ? false : true
    console.log(`CHAT-EMBED-DEBUG-008: Bot-Namen im Header anzeigen: ${shouldShowNameInHeader}`)
    setShowNameInHeader(shouldShowNameInHeader)

    // Mode aus URL erfassen
    const modeParam = searchParams?.get('mode')
    if (modeParam === 'bubble' || modeParam === 'inline' || modeParam === 'fullscreen') {
      setMode(modeParam)
      console.log(`CHAT-EMBED-DEBUG-008: Chat-Modus aus URL: ${modeParam}`)
    } else {
      console.log(`CHAT-EMBED-DEBUG-008: Kein gültiger Modus in URL, verwende Standard: ${mode}`)
    }

    setIsLoading(false)
  }, [searchParams, primaryColor, mode])

  // Größe des iframes automatisch anpassen
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const height = containerRef.current?.offsetHeight || 600
      const width = containerRef.current?.offsetWidth || 400

      window.parent.postMessage({
        type: 'resize',
        height,
        width
      }, '*')

      console.log(`CHAT-EMBED-DEBUG-008: Sende Resize-Event: ${width}x${height}`)
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  if (isLoading) {
    return <div className="w-screen h-screen bg-white/50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  }

  return (
    <div ref={containerRef} className="h-screen w-screen overflow-hidden relative">
      {useStreaming ? (
        // Streaming-Chat - unterstützt jetzt auch inline
        <StreamingChat
          botId={botId}
          initialMode={mode}
          embedded={true}
          suggestions={suggestions}
          initialSettings={{
            ...botInfo?.settings,
            name: botInfo?.name,
            welcomeMessage: botInfo?.welcomeMessage,
            avatarUrl: botInfo?.avatarUrl || botInfo?.settings?.avatarUrl,
            showSuggestions,
            enableFeedback,
            showCopyButton,
            showNameInHeader,
            ...(messageTemplate ? { messageTemplate } : {})
          }}
        />
      ) : (
        // Normaler Chat
        <Chat
          botId={botId}
          initialMode={mode}
          embedded={true}
          suggestions={suggestions}
          initialSettings={{
            ...botInfo?.settings,
            name: botInfo?.name,
            welcomeMessage: botInfo?.welcomeMessage,
            avatarUrl: botInfo?.avatarUrl || botInfo?.settings?.avatarUrl,
            showSuggestions,
            enableFeedback,
            showCopyButton,
            showNameInHeader,
            ...(messageTemplate ? { messageTemplate } : {})
          }}
        />
      )}
    </div>
  )
}