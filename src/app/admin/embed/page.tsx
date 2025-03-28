'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

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
  const [bubbleSize, setBubbleSize] = useState('60')
  const [offsetX, setOffsetX] = useState('20')
  const [offsetY, setOffsetY] = useState('20')
  const [chatWidth, setChatWidth] = useState('480')
  const [chatHeight, setChatHeight] = useState('700')
  const [embedCode, setEmbedCode] = useState('')
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBotId, setSelectedBotId] = useState<string>('')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [zIndex, setZIndex] = useState('')

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
    // Base URL für das Skript
    const baseUrl = window.location.origin;
    
    // URL mit Parametern statt data-Attributen
    const scriptUrl = new URL(`${baseUrl}/api/embed`);
    
    // Parameter direkt in die URL einfügen
    if (selectedBotId) {
      scriptUrl.searchParams.append('botId', selectedBotId);
    }
    scriptUrl.searchParams.append('mode', initialMode);
    scriptUrl.searchParams.append('color', encodeURIComponent(primaryColor));
    
    if (initialMode === 'bubble') {
      scriptUrl.searchParams.append('position', position);
      
      // Erweiterte Optionen nur hinzufügen, wenn sie verändert wurden
      if (bubbleSize !== '60') scriptUrl.searchParams.append('bubbleSize', bubbleSize);
      if (offsetX !== '20') scriptUrl.searchParams.append('offsetX', offsetX);
      if (offsetY !== '20') scriptUrl.searchParams.append('offsetY', offsetY);
      if (chatWidth !== '480') scriptUrl.searchParams.append('chatWidth', chatWidth);
      if (chatHeight !== '700') scriptUrl.searchParams.append('chatHeight', chatHeight);
    }
    
    // Z-Index hinzufügen, wenn angegeben
    if (zIndex) scriptUrl.searchParams.append('zIndex', zIndex);
    
    return `<!-- Dialog Engine Chat Widget -->
<div id="dialog-container" 
  data-mode="${initialMode}" 
  data-color="${primaryColor}" 
  data-position="${position}"
  data-bot-id="${selectedBotId}"
  ${zIndex ? `data-z-index="${zIndex}"` : ''}
  ${initialMode === 'bubble' ? '' : `style="width: ${width}; height: ${initialMode === 'inline' ? height + 'px' : '100%'}; position: relative; border-radius: 12px; overflow: hidden;"`}
></div>
<script src="${scriptUrl.toString()}" defer></script>
`
  }

  // Aktualisiere den Embed-Code, wenn sich die Einstellungen ändern
  useEffect(() => {
    setEmbedCode(generateEmbedCode())
  }, [initialMode, primaryColor, position, height, width, selectedBotId, 
      bubbleSize, offsetX, offsetY, chatWidth, chatHeight, zIndex])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Embed-Code Generator</h1>
        <p className="text-muted-foreground">Generieren Sie einen Embed-Code für die SMG Dialog Engine</p>
      </div>
      
      <div className="max-w-3xl">
        <div className="bg-card rounded-lg shadow p-6 mb-8">
          <p className="text-muted-foreground mb-6">
            Hier können Sie einen Embed-Code für die SMG Dialog Engine generieren.
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
              <label className="block text-sm font-medium mb-2">Darstellungsmodus</label>
              <select 
                value={initialMode}
                onChange={(e) => setInitialMode(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="bubble">Bubble (Chat-Icon in der Ecke)</option>
                <option value="inline">Inline (Eingebettet in die Seite)</option>
                <option value="fullscreen">Vollbild (Mit Dialog/Web-Switcher)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Der Bubble-Modus zeigt ein Chat-Icon, das beim Klick den Chat öffnet. 
                Inline bettet den Chat direkt in die Seite ein.
                Vollbild nutzt die gesamte Bildschirmfläche und bietet einen Dialog/Web-Switcher.
              </p>
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
              <p className="text-xs text-muted-foreground mt-1">
                Diese Farbe wird für das Chat-Icon, Schaltflächen und Akzente im Chat verwendet.
              </p>
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
                    min="300"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Empfohlene Mindesthöhe: 500px
                  </p>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Z.B. "100%", "350px", "50vw"
                  </p>
                </div>
              </div>
            )}
            
            {initialMode === 'bubble' && (
              <div className="space-y-4">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Position des Chat-Icons auf der Webseite
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Container-Breite</label>
                    <input 
                      type="text" 
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="100% oder px-Wert"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Z.B. "30%", "350px", "50vw"
                    </p>
                  </div>
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="text-sm font-medium text-primary flex items-center"
                  >
                    {showAdvancedOptions ? '- Erweiterte Optionen ausblenden' : '+ Erweiterte Optionen anzeigen'}
                  </button>
                </div>
                
                {showAdvancedOptions && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bubble-Größe (px)</label>
                      <input
                        type="number"
                        value={bubbleSize}
                        onChange={(e) => setBubbleSize(e.target.value)}
                        min="40"
                        max="100"
                        className="w-full p-2 border rounded-md"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Größe des Chat-Icons (Standard: 60px)
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Horizontaler Abstand (px)</label>
                        <input
                          type="number"
                          value={offsetX}
                          onChange={(e) => setOffsetX(e.target.value)}
                          min="0"
                          className="w-full p-2 border rounded-md"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Abstand vom Rand (Standard: 20px)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Vertikaler Abstand (px)</label>
                        <input
                          type="number"
                          value={offsetY}
                          onChange={(e) => setOffsetY(e.target.value)}
                          min="0"
                          className="w-full p-2 border rounded-md"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Abstand vom Rand (Standard: 20px)
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Chat-Breite (px)</label>
                        <input
                          type="number"
                          value={chatWidth}
                          onChange={(e) => setChatWidth(e.target.value)}
                          min="300"
                          className="w-full p-2 border rounded-md"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Breite des Chat-Fensters (Standard: 480px)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Chat-Höhe (px)</label>
                        <input
                          type="number"
                          value={chatHeight}
                          onChange={(e) => setChatHeight(e.target.value)}
                          min="400"
                          className="w-full p-2 border rounded-md"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Höhe des Chat-Fensters (Standard: 700px)
                        </p>
                      </div>
                    </div>
                  </>
                )}
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
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Beispiele für verschiedene Größen:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-1">30% Breite, 700px Höhe:</p>
                <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                  {`<div id="dialog-container" 
  data-mode="bubble" 
  data-color="${primaryColor}" 
  data-bot-id="${selectedBotId}"
  style="width: 30%; height: 700px; position: relative;">
</div>`}
                </pre>
              </div>
              <div>
                <p className="mb-1">550px Breite, 80% Höhe:</p>
                <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                  {`<div id="dialog-container" 
  data-mode="bubble" 
  data-color="${primaryColor}" 
  data-bot-id="${selectedBotId}"
  style="width: 550px; height: 80%; position: relative;">
</div>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Hinweis zur Installation</h3>
          <p className="text-yellow-700 mb-2">
            <strong>Einfache Einbettung:</strong> Kopieren Sie einfach den generierten Code in Ihre Website, und der Bot wird mit den Standardgrößen funktionieren.
          </p>
          <p className="text-yellow-700 mb-2">
            <strong>Bubble-Modus:</strong> Der Bot erscheint standardmäßig als Bubble unten rechts und öffnet sich bei Klick mit 480px×700px.
          </p>
          <p className="text-yellow-700 mb-2">
            <strong>Inline-Modus:</strong> Legen Sie die Größe entweder im container-div oder über die erweiterten Optionen fest.
          </p>
          <p className="text-yellow-700">
            <strong>Anpassung:</strong> Im container-div können Sie über <code>style="width: 500px; height: 700px;"</code> die Größe des Bots anpassen.
          </p>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Erweiterte Optionen</h3>
            <button 
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-sm text-primary hover:underline flex items-center"
            >
              {showAdvancedOptions ? 'Weniger anzeigen' : 'Mehr anzeigen'}
              <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showAdvancedOptions && (
            <div className="space-y-6 rounded-md p-4 bg-muted/20">
              {/* Z-Index Option */}
              <div>
                <label className="block text-sm font-medium mb-2">Z-Index (optional)</label>
                <input 
                  type="number" 
                  value={zIndex}
                  onChange={(e) => setZIndex(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="z-index Wert (leer = Standard)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Z-Index für Chat-Elemente, falls es Überlagerungsprobleme mit anderen Elementen gibt.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 