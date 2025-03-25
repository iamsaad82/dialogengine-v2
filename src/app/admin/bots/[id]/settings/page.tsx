'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bot } from '@prisma/client'

export default function BotSettings({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [bot, setBot] = useState<Bot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [botId, setBotId] = useState<string>('')
  const [settings, setSettings] = useState({
    primaryColor: '#3b82f6',
    botBgColor: 'rgba(248, 250, 252, 0.8)',
    botTextColor: '#000000',
    botAccentColor: '#3b82f6',
    userBgColor: '',
    userTextColor: '#ffffff',
    welcomeMessage: '',
    enableFeedback: true,
    enableAnalytics: true,
    showSuggestions: true,
    showCopyButton: true
  })
  
  // UseEffect um die ID zu setzen
  useEffect(() => {
    setBotId(params.id)
  }, [params.id])
  
  // Initial-Effekt zum Laden der Bot-Daten
  useEffect(() => {
    if (!botId) return;
    
    async function loadBot() {
      try {
        setLoading(true)
        const res = await fetch(`/api/bots/${botId}`)
        
        if (!res.ok) {
          throw new Error(`Fehler beim Laden des Bots: ${res.status}`)
        }
        
        const botData = await res.json()
        setBot(botData)
        
        // Einstellungen aus den Bot-Daten initialisieren
        if (botData.settings) {
          setSettings({
            primaryColor: botData.settings.primaryColor || '#3b82f6',
            botBgColor: botData.settings.botBgColor || 'rgba(248, 250, 252, 0.8)',
            botTextColor: botData.settings.botTextColor || '#000000',
            botAccentColor: botData.settings.botAccentColor || '#3b82f6',
            userBgColor: botData.settings.userBgColor || '',
            userTextColor: botData.settings.userTextColor || '#ffffff',
            welcomeMessage: botData.welcomeMessage || '',
            enableFeedback: botData.settings.enableFeedback || true,
            enableAnalytics: botData.settings.enableAnalytics || true,
            showSuggestions: botData.settings.showSuggestions || true,
            showCopyButton: botData.settings.showCopyButton || true
          })
        } else {
          setSettings(prev => ({
            ...prev,
            welcomeMessage: botData.welcomeMessage || ''
          }))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      } finally {
        setLoading(false)
      }
    }
    
    loadBot()
  }, [botId])
  
  // Funktion zum Speichern der Einstellungen
  const saveSettings = async () => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/bots/${botId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          primaryColor: settings.primaryColor,
          botBgColor: settings.botBgColor,
          botTextColor: settings.botTextColor,
          botAccentColor: settings.botAccentColor,
          userBgColor: settings.userBgColor,
          userTextColor: settings.userTextColor,
          enableFeedback: settings.enableFeedback,
          enableAnalytics: settings.enableAnalytics,
          showSuggestions: settings.showSuggestions,
          showCopyButton: settings.showCopyButton
        })
      })
      
      if (!response.ok) {
        throw new Error(`Speichern fehlgeschlagen: ${response.status}`)
      }
      
      // Router-Refresh zur Aktualisierung der Daten
      router.refresh()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }
  
  // Funktion zum Ändern der Einstellungswerte
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Vorschau-Sektion für die Bot-Stile
  const ChatBubblePreview = () => {
    // Inline-Stil für die Vorschau
    const previewStyle = document.createElement('style')
    previewStyle.textContent = `
      .preview-bot-bubble {
        background-color: ${settings.botBgColor} !important;
        color: ${settings.botTextColor};
        border-radius: 12px;
        padding: 12px;
        max-width: 80%;
        margin-bottom: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .preview-user-bubble {
        background: ${settings.userBgColor || `linear-gradient(135deg, ${settings.primaryColor}, ${settings.primaryColor}cc)`};
        color: ${settings.userTextColor};
        border-radius: 12px;
        padding: 12px;
        max-width: 80%;
        margin-left: auto;
        margin-bottom: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .preview-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        margin-right: 8px;
        background-color: white;
        color: ${settings.botAccentColor};
        border: 1px solid ${settings.botAccentColor};
      }
    `
    document.head.appendChild(previewStyle)
    
    useEffect(() => {
      return () => {
        previewStyle.remove()
      }
    }, [])
    
    return (
      <div className="preview-container border rounded-lg p-4 bg-background/50 mb-6">
        <h3 className="text-sm font-semibold mb-3">Vorschau</h3>
        <div className="preview-chat">
          <div className="flex items-start preview-bot-bubble">
            <div className="preview-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                <rect width="18" height="10" x="3" y="11" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-sm">Brandenburg Dialog</div>
              <div className="text-sm">Hallo! Wie kann ich Ihnen helfen?</div>
            </div>
          </div>
          
          <div className="preview-user-bubble">
            <div className="text-sm">Ich habe eine Frage zum Termin.</div>
          </div>
        </div>
      </div>
    )
  }
  
  if (loading) {
    return <div className="py-8 text-center">Lade Bot-Daten...</div>
  }
  
  if (error) {
    return (
      <div className="py-8">
        <div className="bg-destructive/10 border border-destructive p-4 rounded-md mb-4">
          {error}
        </div>
        <a href="/admin/bots" className="text-primary hover:underline">
          Zurück zur Bot-Übersicht
        </a>
      </div>
    )
  }
  
  if (!bot) {
    return <div className="py-8 text-center">Bot nicht gefunden</div>
  }
  
  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bot-Einstellungen: {bot.name}</h1>
        <a href="/admin/bots" className="text-primary hover:underline">
          Zurück
        </a>
      </div>
      
      {/* Vorschau */}
      <ChatBubblePreview />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Bot-Design</h2>
          
          <div className="form-group mb-4">
            <label htmlFor="primaryColor" className="block text-sm font-medium mb-1">
              Primärfarbe
            </label>
            <div className="flex items-center">
              <input 
                type="color" 
                id="primaryColor"
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleChange}
                className="w-12 h-8 rounded cursor-pointer"
              />
              <input 
                type="text" 
                value={settings.primaryColor}
                onChange={handleChange}
                name="primaryColor"
                className="ml-2 flex-1 p-2 border rounded-md text-sm"
              />
            </div>
          </div>
          
          <div className="form-group mb-4">
            <label htmlFor="botBgColor" className="block text-sm font-medium mb-1">
              Bot-Hintergrundfarbe
            </label>
            <input 
              type="text" 
              id="botBgColor"
              name="botBgColor"
              value={settings.botBgColor}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-sm"
              placeholder="rgba(248, 250, 252, 0.8)"
            />
          </div>
          
          <div className="form-group mb-4">
            <label htmlFor="botTextColor" className="block text-sm font-medium mb-1">
              Bot-Textfarbe
            </label>
            <div className="flex items-center">
              <input 
                type="color" 
                id="botTextColor"
                name="botTextColor"
                value={settings.botTextColor}
                onChange={handleChange}
                className="w-12 h-8 rounded cursor-pointer"
              />
              <input 
                type="text" 
                value={settings.botTextColor}
                onChange={handleChange}
                name="botTextColor"
                className="ml-2 flex-1 p-2 border rounded-md text-sm"
              />
            </div>
          </div>
          
          <div className="form-group mb-4">
            <label htmlFor="botAccentColor" className="block text-sm font-medium mb-1">
              Bot-Akzentfarbe
            </label>
            <div className="flex items-center">
              <input 
                type="color" 
                id="botAccentColor"
                name="botAccentColor"
                value={settings.botAccentColor}
                onChange={handleChange}
                className="w-12 h-8 rounded cursor-pointer"
              />
              <input 
                type="text" 
                value={settings.botAccentColor}
                onChange={handleChange}
                name="botAccentColor"
                className="ml-2 flex-1 p-2 border rounded-md text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Benutzer-Design</h2>
          
          <div className="form-group mb-4">
            <label htmlFor="userBgColor" className="block text-sm font-medium mb-1">
              Benutzer-Hintergrundfarbe (leer = Primärfarbe)
            </label>
            <input 
              type="text" 
              id="userBgColor"
              name="userBgColor"
              value={settings.userBgColor}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-sm"
              placeholder="linear-gradient(135deg, #3b82f6, #3b82f6cc)"
            />
          </div>
          
          <div className="form-group mb-4">
            <label htmlFor="userTextColor" className="block text-sm font-medium mb-1">
              Benutzer-Textfarbe
            </label>
            <div className="flex items-center">
              <input 
                type="color" 
                id="userTextColor"
                name="userTextColor"
                value={settings.userTextColor}
                onChange={handleChange}
                className="w-12 h-8 rounded cursor-pointer"
              />
              <input 
                type="text" 
                value={settings.userTextColor}
                onChange={handleChange}
                name="userTextColor"
                className="ml-2 flex-1 p-2 border rounded-md text-sm"
              />
            </div>
          </div>
          
          <div className="form-group mb-4">
            <label htmlFor="welcomeMessage" className="block text-sm font-medium mb-1">
              Begrüßungsnachricht
            </label>
            <textarea 
              id="welcomeMessage"
              name="welcomeMessage"
              value={settings.welcomeMessage}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-sm h-32"
              placeholder="Willkommen! Wie kann ich Ihnen helfen?"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {saving ? 'Speichern...' : 'Einstellungen speichern'}
        </button>
      </div>
    </div>
  )
} 