'use client'

import { Chat } from '@/components/chat'
import { StreamingChat } from '@/components/chat/StreamingChat'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

// Client-Komponente für Chat-Embed mit useSearchParams
export default function ClientChatEmbed() {
  const [mode, setMode] = useState<'bubble' | 'inline' | 'fullscreen'>('inline')
  const [primaryColor, setPrimaryColor] = useState('#e63946')
  const [botId, setBotId] = useState<string | undefined>(undefined)
  const [useStreaming, setUseStreaming] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Bot-ID aus den URL-Parametern extrahieren
    const id = searchParams?.get('botId') || undefined
    
    // Prüfen, ob Streaming-Parameter vorhanden ist
    const streamingParam = searchParams?.get('streaming')
    const shouldUseStreaming = streamingParam === 'true' || streamingParam === '1'
    
    console.log(`CHAT-EMBED-DEBUG-004: Bot-ID aus URL: ${id || 'nicht gefunden'}`)
    console.log(`CHAT-EMBED-DEBUG-004: Streaming: ${shouldUseStreaming ? 'aktiviert' : 'deaktiviert'}`)
    
    setBotId(id)
    setUseStreaming(shouldUseStreaming)
    
    // Erfasse die primäre Farbe aus der URL
    const embedColor = searchParams?.get('color')
    if (embedColor) {
      // Setze die Farbe, wenn sie in der URL angegeben ist
      setPrimaryColor(embedColor)
      console.log(`CHAT-EMBED-DEBUG-004: Primärfarbe aus URL: ${embedColor}`)
    } else {
      console.log(`CHAT-EMBED-DEBUG-004: Keine Primärfarbe in URL, verwende Standard: ${primaryColor}`)
    }
    
    // Mode aus URL erfassen
    const modeParam = searchParams?.get('mode')
    if (modeParam === 'bubble' || modeParam === 'inline' || modeParam === 'fullscreen') {
      setMode(modeParam)
      console.log(`CHAT-EMBED-DEBUG-004: Chat-Modus aus URL: ${modeParam}`)
    } else {
      console.log(`CHAT-EMBED-DEBUG-004: Kein gültiger Modus in URL, verwende Standard: ${mode}`)
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
      
      console.log(`CHAT-EMBED-DEBUG-004: Sende Resize-Event: ${width}x${height}`)
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
        />
      ) : (
        // Normaler Chat
        <Chat 
          botId={botId} 
          initialMode={mode}
          embedded={true}
        />
      )}
    </div>
  )
} 