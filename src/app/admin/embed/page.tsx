'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Bot {
  id: string
  name: string
  description: string | null
  active: boolean
  settings?: {
    primaryColor: string
    enableFeedback: boolean
    enableAnalytics: boolean
    showSuggestions: boolean
    showCopyButton: boolean
  }
}

export default function EmbedGenerator() {
  const router = useRouter()
  const [initialMode, setInitialMode] = useState<'bubble' | 'inline' | 'fullscreen'>('bubble')
  const [primaryColor, setPrimaryColor] = useState('#e63946')
  const [height, setHeight] = useState('500')
  const [width, setWidth] = useState('100%')
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')
  const [embedCode, setEmbedCode] = useState('')
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBotId, setSelectedBotId] = useState<string>('')

  // Lade verfügbare Bots
  useEffect(() => {
    const fetchBots = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/bots')
        
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Bots')
        }
        
        const data = await response.json()
        setBots(data)
        
        // Setze den ersten aktiven Bot als Standard, wenn verfügbar
        if (data.length > 0) {
          const activeBot = data.find((bot: Bot) => bot.active) || data[0]
          setSelectedBotId(activeBot.id)
          
          // Wenn der Bot eine Primärfarbe hat, setze diese
          if (activeBot.settings?.primaryColor) {
            setPrimaryColor(activeBot.settings.primaryColor)
          }
        }
        
        setError(null)
      } catch (err) {
        console.error('Fehler beim Laden der Bots:', err)
        setError('Bots konnten nicht geladen werden')
      } finally {
        setLoading(false)
      }
    }
    
    fetchBots()
  }, [])

  // Generiert den Embed-Code basierend auf den Einstellungen
  const generateEmbedCode = () => {
    // Verwende einen relativen Pfad
    const scriptSrc = '/api/embed'
    
    // Basierend darauf, ob ein Bot ausgewählt wurde, füge botId hinzu oder nicht
    const botIdAttribute = selectedBotId ? `data-bot-id="${selectedBotId}" ` : '';
    
    return `<!-- Brandenburg Dialog Chat Widget -->
<div id="brandenburg-dialog-container" 
  ${botIdAttribute}data-mode="${initialMode}" 
  data-color="${primaryColor}" 
  data-position="${position}" 
  style="width: ${width}; height: ${initialMode === 'inline' ? height + 'px' : 'auto'};"></div>
<script src="${scriptSrc}" defer></script>
`
  }

  // Aktualisiere den Embed-Code, wenn sich die Einstellungen ändern
  useEffect(() => {
    setEmbedCode(generateEmbedCode())
  }, [initialMode, primaryColor, position, height, width, selectedBotId])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Embed-Code Generator</h1>
        <p className="text-muted-foreground">Generieren Sie einen Embed-Code für den Brandenburg Dialog Chat-Widget</p>
      </div>
      
      <div className="max-w-3xl">
        <div className="bg-card rounded-lg shadow p-6 mb-8">
          <p className="text-muted-foreground mb-6">
            Hier können Sie einen Embed-Code für den Brandenburg Dialog Chat-Widget generieren.
            Dieser Code kann auf jeder Website eingefügt werden, um den Chat einzubinden.
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            {/* Bot-Auswahl */}
            <div>
              <label className="block text-sm font-medium mb-2">Bot auswählen</label>
              {loading ? (
                <div className="w-full p-2 border rounded-md bg-muted/20">Lade Bots...</div>
              ) : (
                <select 
                  value={selectedBotId}
                  onChange={(e) => {
                    setSelectedBotId(e.target.value)
                    // Finde den ausgewählten Bot
                    const selectedBot = bots.find(bot => bot.id === e.target.value)
                    // Wenn der Bot eine Primärfarbe hat, setze diese
                    if (selectedBot?.settings?.primaryColor) {
                      setPrimaryColor(selectedBot.settings.primaryColor)
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  {bots.length === 0 && (
                    <option value="">Keine Bots verfügbar</option>
                  )}
                  {bots.map(bot => (
                    <option key={bot.id} value={bot.id}>
                      {bot.name} {!bot.active && '(inaktiv)'}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Wählen Sie den Bot aus, der in dieses Embed integriert werden soll.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Anfangsmodus</label>
              <select 
                value={initialMode}
                onChange={(e) => setInitialMode(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="bubble">Bubble (Chat-Icon in der Ecke)</option>
                <option value="inline">Inline (Eingebettet in die Seite)</option>
                <option value="fullscreen">Vollbild</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Farbe</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 border rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            
            {initialMode === 'inline' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Höhe (px)</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Breite</label>
                  <input 
                    type="text" 
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="100% oder px-Wert"
                  />
                </div>
              </div>
            )}
            
            {initialMode === 'bubble' && (
              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <select 
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="bottom-right">Unten rechts</option>
                  <option value="bottom-left">Unten links</option>
                  <option value="top-right">Oben rechts</option>
                  <option value="top-left">Oben links</option>
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Generierter Embed-Code</h3>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(embedCode);
                alert('Code in die Zwischenablage kopiert!');
              }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
            >
              Code kopieren
            </button>
          </div>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap text-sm">
              {embedCode}
            </pre>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Hinweis</h3>
          <p className="text-yellow-700">
            Der Embed-Code sollte in den HTML-Body einer Website eingefügt werden.
            Stellen Sie sicher, dass die Website über HTTPS zugänglich ist, damit alle Funktionen korrekt funktionieren.
          </p>
        </div>
      </div>
    </div>
  )
} 