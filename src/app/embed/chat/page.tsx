'use client'

import { Chat } from '@/components/chat'
import { useEffect, useState, useRef } from 'react'

export default function EmbeddedChat() {
  const [mode, setMode] = useState<'bubble' | 'inline' | 'fullscreen'>('inline')
  const [primaryColor, setPrimaryColor] = useState('#e63946')
  const [botId, setBotId] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Setze Hintergrund transparent
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    
    // Kurze Ladezeit für Client-Hydration
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    
    // Parameter aus der URL holen mit nativem URLSearchParams
    const searchParams = new URLSearchParams(window.location.search)
    
    const modeParam = searchParams.get('mode')
    if (modeParam === 'bubble' || modeParam === 'inline' || modeParam === 'fullscreen') {
      setMode(modeParam)
      
      // Bei Bubble-Modus speziellen Stylings für den Body
      if (modeParam === 'bubble') {
        document.body.style.overflow = 'visible';
        document.body.style.height = 'auto';
        document.documentElement.style.overflow = 'visible';
        document.documentElement.style.height = 'auto';
      }
    }
    
    const colorParam = searchParams.get('color')
    if (colorParam) {
      const decodedColor = decodeURIComponent(colorParam)
      setPrimaryColor(decodedColor)
      
      // Primärfarbe als CSS-Variable setzen
      document.documentElement.style.setProperty('--primary', decodedColor)
      
      // RGB-Werte für Primärfarbe berechnen für Schatten etc.
      if (decodedColor.startsWith('#') && decodedColor.length >= 7) {
        const r = parseInt(decodedColor.slice(1, 3), 16)
        const g = parseInt(decodedColor.slice(3, 5), 16)
        const b = parseInt(decodedColor.slice(5, 7), 16)
        document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`)
      }
      
      // Wenn kein Bot-ID Parameter angegeben ist, werden hier die Standardfarben für den Chat gesetzt
      if (!searchParams.get('botId')) {
        document.documentElement.style.setProperty('--bot-accent-color', decodedColor)
        document.documentElement.style.setProperty('--user-bg-color', `linear-gradient(135deg, ${decodedColor}, ${decodedColor}cc)`)
      }
    }
    
    // Bot-ID aus der URL holen
    const botIdParam = searchParams.get('botId')
    if (botIdParam) {
      setBotId(botIdParam)
    }
    
    // Größenmessungs-Funktion zum Senden der Container-Höhe an die übergeordnete Seite
    const reportSize = () => {
      if (containerRef.current) {
        const height = containerRef.current.scrollHeight;
        // Sende Nachricht an übergeordnetes Fenster mit der aktuellen Höhe
        window.parent.postMessage({ 
          type: 'dialog-resize', 
          height: height,
          mode: mode
        }, '*');
      }
    };
    
    // Regelmäßig die Größe überprüfen und bei Änderungen melden
    const sizeObserver = new ResizeObserver(() => {
      reportSize();
    });
    
    if (containerRef.current) {
      sizeObserver.observe(containerRef.current);
    }
    
    // Kommunikation mit der Eltern-Seite
    function handleMessage(event: MessageEvent) {
      // Sicherstellen, dass die Nachricht von einer vertrauenswürdigen Quelle kommt
      if (event.data && event.data.type === 'smg-dialog') {
        // Hier könnten später weitere Befehle verarbeitet werden
        if (event.data.action === 'close') {
          // Chat schließen - für die Bubble-Implementierung
          window.parent.postMessage({ type: 'smg-dialog', action: 'chat-closed' }, '*')
        } else if (event.data.action === 'request-size') {
          // Bei Anfrage die aktuelle Größe melden
          reportSize();
        }
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    // Initial die Größe melden, nachdem der Inhalt geladen wurde
    setTimeout(reportSize, 500);
    
    return () => {
      window.removeEventListener('message', handleMessage)
      clearTimeout(timer)
      sizeObserver.disconnect();
    }
  }, [mode])

  // Lade-Zustand während der Client-Hydration
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3">Lade...</span>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className={`embedded-chat ${mode}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}
    >
      <Chat initialMode={mode} embedded={true} botId={botId} />
    </div>
  )
} 