'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bot } from '@prisma/client'
import { BotSettingsTabs } from '@/components/bot-settings-tabs'

interface BotSettings {
  id?: string
  primaryColor: string
  botBgColor: string
  botTextColor: string
  botAccentColor: string
  userBgColor: string
  userTextColor: string
  enableFeedback: boolean
  enableAnalytics: boolean
  showSuggestions: boolean
  showCopyButton: boolean
}

export default function BotDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [bot, setBot] = useState<Bot & { settings: BotSettings | null }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const botId = params.id
  
  // Formular-Zustand
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [flowiseId, setFlowiseId] = useState('')
  const [active, setActive] = useState(true)
  
  // Design-Einstellungen
  const [settings, setSettings] = useState<BotSettings>({
    primaryColor: '#3b82f6',
    botBgColor: 'rgba(248, 250, 252, 0.8)',
    botTextColor: '#000000',
    botAccentColor: '#3b82f6',
    userBgColor: '',
    userTextColor: '#ffffff',
    enableFeedback: true, 
    enableAnalytics: true,
    showSuggestions: true,
    showCopyButton: true
  })
  
  // Bot-Daten laden
  useEffect(() => {
    const fetchBot = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/bots/${botId}`)
        
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Fehler beim Laden des Bots')
        }
        
        const botData = await res.json()
        setBot(botData)
        
        // Formularfelder mit Bot-Daten füllen
        setName(botData.name || '')
        setDescription(botData.description || '')
        setWelcomeMessage(botData.welcomeMessage || '')
        setFlowiseId(botData.flowiseId || '')
        setActive(botData.active)
        
        // Design-Einstellungen
        if (botData.settings) {
          setSettings({
            primaryColor: botData.settings.primaryColor || '#3b82f6',
            botBgColor: botData.settings.botBgColor || 'rgba(248, 250, 252, 0.8)',
            botTextColor: botData.settings.botTextColor || '#000000',
            botAccentColor: botData.settings.botAccentColor || '#3b82f6',
            userBgColor: botData.settings.userBgColor || '',
            userTextColor: botData.settings.userTextColor || '#ffffff',
            enableFeedback: botData.settings.enableFeedback,
            enableAnalytics: botData.settings.enableAnalytics,
            showSuggestions: botData.settings.showSuggestions,
            showCopyButton: botData.settings.showCopyButton
          })
        }
        
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten')
      } finally {
        setLoading(false)
      }
    }
    
    fetchBot()
  }, [botId])
  
  // Bot speichern
  const saveBot = async () => {
    try {
      setSaving(true)
      
      // Allgemeine Bot-Einstellungen speichern
      const generalRes = await fetch(`/api/bots/${botId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          welcomeMessage,
          flowiseId,
          active
        }),
      })
      
      if (!generalRes.ok) {
        const errorData = await generalRes.json()
        throw new Error(errorData.error || 'Fehler beim Speichern der Bot-Informationen')
      }
      
      // Design-Einstellungen speichern
      const designRes = await fetch(`/api/bots/${botId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          welcomeMessage,
          settings
        }),
      })
      
      if (!designRes.ok) {
        const errorData = await designRes.json()
        throw new Error(errorData.error || 'Fehler beim Speichern der Bot-Einstellungen')
      }
      
      // Bot neu laden
      const updatedBotRes = await fetch(`/api/bots/${botId}`)
      if (updatedBotRes.ok) {
        const updatedBot = await updatedBotRes.json()
        setBot(updatedBot)
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten')
    } finally {
      setSaving(false)
    }
  }
  
  const navigateBack = () => {
    router.push('/admin/bots')
  }
  
  if (error) {
    return (
      <div className="py-8">
        <div className="bg-destructive/10 border border-destructive p-4 rounded-md mb-4">
          {error}
        </div>
        <a href="/admin/bots" className="text-[hsl(var(--primary))] hover:underline">
          Zurück zur Bot-Übersicht
        </a>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Lade Bot-Daten...</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bot verwalten: {bot?.name}</h1>
        <button 
          onClick={navigateBack}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Zurück zur Übersicht
        </button>
      </div>
      
      <BotSettingsTabs
        name={name}
        description={description}
        welcomeMessage={welcomeMessage}
        flowiseId={flowiseId}
        active={active}
        settings={settings}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onWelcomeMessageChange={setWelcomeMessage}
        onFlowiseIdChange={setFlowiseId}
        onActiveChange={setActive}
        onSettingsChange={setSettings}
      />
      
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={navigateBack}
          disabled={saving}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Abbrechen
        </button>
        <button
          onClick={saveBot}
          disabled={saving}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
} 