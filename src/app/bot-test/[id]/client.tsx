'use client'

import { useEffect, useState } from 'react'
import { Chat } from '@/components/chat'
import { useRouter } from 'next/navigation'
import { Bot } from '@/types/bot'

export default function BotTestClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true)
  const [bot, setBot] = useState<Bot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [origin, setOrigin] = useState<string>('')
  
  // Sichere Erfassung von window.location.origin nur im Client
  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : '')
  }, [])
  
  useEffect(() => {
    const fetchBot = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/bots/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Bot nicht gefunden')
          }
          throw new Error('Fehler beim Laden des Bots')
        }
        
        const data = await response.json()
        setBot(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten')
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchBot()
    }
  }, [id])
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Lade Bot-Informationen...</span>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/10 border border-destructive p-4 rounded-md">
          <h2 className="text-destructive text-lg font-semibold">Fehler</h2>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/admin/bots')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Zurück zur Bot-Übersicht
          </button>
        </div>
      </div>
    )
  }
  
  if (!bot) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-muted p-4 rounded-md">
          <h2 className="text-lg font-semibold">Bot nicht gefunden</h2>
          <p>Der angeforderte Bot konnte nicht gefunden werden.</p>
          <button 
            onClick={() => router.push('/admin/bots')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Zurück zur Bot-Übersicht
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{bot.name} (Test-Modus)</h1>
          <p className="text-muted-foreground">{bot.description}</p>
        </div>
        <button 
          onClick={() => router.push('/admin/bots')}
          className="px-4 py-2 bg-muted/80 hover:bg-muted text-muted-foreground rounded-md flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Zurück
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="border rounded-lg bg-card p-4 h-[600px]">
            <Chat initialMode="inline" embedded={true} botId={id} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-lg bg-card p-4">
            <h2 className="text-lg font-semibold mb-2">Bot-Informationen</h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">ID:</span>
                <p className="text-sm font-mono break-all">{bot.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Flowise ID:</span>
                <p className="text-sm font-mono break-all">{bot.flowiseId}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  bot.active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800/20 dark:text-gray-400'
                }`}>
                  {bot.active ? 'Aktiv' : 'Inaktiv'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg bg-card p-4">
            <h2 className="text-lg font-semibold mb-2">Embed-Hilfe</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Verwenden Sie den folgenden Code, um diesen Bot in eine Webseite einzubetten:
            </p>
            <div className="bg-muted/50 p-3 rounded-md text-xs font-mono whitespace-pre-wrap overflow-x-auto">
{`<div id="brandenburg-dialog-container" 
  data-mode="bubble" 
  data-color="${bot.settings?.primaryColor || '#3b82f6'}" 
  data-position="bottom-right"
  data-bot-id="${id}">
</div>
<script src="${origin}/api/embed"></script>`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 