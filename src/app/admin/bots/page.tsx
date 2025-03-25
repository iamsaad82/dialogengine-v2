'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Bot {
  id: string
  name: string
  description: string | null
  flowiseId: string
  welcomeMessage: string
  active: boolean
  createdAt: string
  updatedAt: string
  settings: {
    id: string
    primaryColor: string
    enableFeedback: boolean
    enableAnalytics: boolean
    showSuggestions: boolean
    showCopyButton: boolean
  } | null
}

export default function BotManagement() {
  const router = useRouter()
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Neuen Bot hinzufügen
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBotName, setNewBotName] = useState('')
  const [newBotDescription, setNewBotDescription] = useState('')
  const [newBotFlowiseId, setNewBotFlowiseId] = useState('')
  
  // Laden der Bot-Daten
  useEffect(() => {
    const fetchBots = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/bots')
        
        if (!res.ok) {
          throw new Error('Fehler beim Laden der Bots')
        }
        
        const data = await res.json()
        setBots(data)
        setError(null)
      } catch (err) {
        setError('Fehler beim Laden der Bots: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
      } finally {
        setLoading(false)
      }
    }
    
    fetchBots()
  }, [])
  
  // Neuen Bot erstellen
  const createBot = async () => {
    try {
      setLoading(true)
      
      if (!newBotName || !newBotFlowiseId) {
        setError('Name und Flowise ID sind erforderlich')
        return
      }
      
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newBotName,
          description: newBotDescription,
          flowiseId: newBotFlowiseId,
        }),
      })
      
      if (!res.ok) {
        throw new Error('Fehler beim Erstellen des Bots')
      }
      
      // Aktualisiere die Bot-Liste
      const updatedRes = await fetch('/api/bots')
      if (updatedRes.ok) {
        const data = await updatedRes.json()
        setBots(data)
      }
      
      // Setze die Formularfelder zurück
      setNewBotName('')
      setNewBotDescription('')
      setNewBotFlowiseId('')
      setShowAddModal(false)
      setError(null)
    } catch (err) {
      setError('Fehler beim Erstellen des Bots: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
    } finally {
      setLoading(false)
    }
  }
  
  // Bot löschen
  const deleteBot = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Bot löschen möchten?')) return
    
    try {
      setLoading(true)
      
      const res = await fetch(`/api/bots/${id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        throw new Error('Fehler beim Löschen des Bots')
      }
      
      // Aktualisiere die Bot-Liste
      setBots(bots.filter(bot => bot.id !== id))
      setError(null)
    } catch (err) {
      setError('Fehler beim Löschen des Bots: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
    } finally {
      setLoading(false)
    }
  }
  
  // Bot bearbeiten
  const editBot = (id: string) => {
    router.push(`/admin/bots/${id}`)
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bot-Verwaltung</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 rounded-md hover:bg-[hsl(var(--primary))/0.9] transition flex items-center gap-2"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
          Neuen Bot erstellen
        </button>
      </div>
      
      {error && (
        <div className="bg-[hsl(var(--destructive))/0.1] border border-[hsl(var(--destructive))] p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {loading && !bots.length ? (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-[hsl(var(--primary))]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Lade Bots...</span>
          </div>
        </div>
      ) : (
        <>
          {bots.length === 0 ? (
            <div className="text-center py-8 bg-[hsl(var(--muted))/0.5] rounded-lg">
              <p className="text-[hsl(var(--muted-foreground))]">Keine Bots vorhanden. Erstellen Sie einen neuen Bot, um zu beginnen.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))] shadow-sm">
              <table className="w-full bg-[hsl(var(--background))]">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium text-[hsl(var(--muted-foreground))]">Name</th>
                    <th className="py-3 px-4 text-left font-medium text-[hsl(var(--muted-foreground))]">Beschreibung</th>
                    <th className="py-3 px-4 text-left font-medium text-[hsl(var(--muted-foreground))]">Flowise ID</th>
                    <th className="py-3 px-4 text-left font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                    <th className="py-3 px-4 text-right font-medium text-[hsl(var(--muted-foreground))]">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {bots.map((bot) => (
                    <tr key={bot.id} className="border-b last:border-0 hover:bg-[hsl(var(--muted))/0.3]">
                      <td className="py-3 px-4">
                        <div className="font-medium">{bot.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[hsl(var(--muted-foreground))] line-clamp-1">{bot.description || '—'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs text-[hsl(var(--muted-foreground))] truncate max-w-xs">{bot.flowiseId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          bot.active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800/20 dark:text-gray-400'
                        }`}>
                          {bot.active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`/bot-test/${bot.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-[hsl(var(--primary))/0.1] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
                            title="Bot testen"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 11-8-8-8 8"/><path d="M12 3v14"/><path d="M7 17h10"/></svg>
                          </a>
                          <button
                            onClick={() => editBot(bot.id)}
                            className="p-1 rounded hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                            title="Bearbeiten"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                          </button>
                          <button
                            onClick={() => deleteBot(bot.id)}
                            className="p-1 rounded hover:bg-[hsl(var(--destructive))/0.1] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                            title="Löschen"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* Modal zum Hinzufügen eines neuen Bots */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[hsl(var(--background))] p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Neuen Bot erstellen</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--input))] rounded-md"
                  placeholder="Name des Bots"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Beschreibung</label>
                <textarea
                  value={newBotDescription}
                  onChange={(e) => setNewBotDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--input))] rounded-md"
                  placeholder="Beschreibung des Bots"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Flowise Chatflow ID *</label>
                <input
                  type="text"
                  value={newBotFlowiseId}
                  onChange={(e) => setNewBotFlowiseId(e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--input))] rounded-md"
                  placeholder="Flowise Chatflow ID"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-[hsl(var(--border))] rounded-md hover:bg-[hsl(var(--muted))]"
              >
                Abbrechen
              </button>
              <button
                onClick={createBot}
                className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary))/0.9] disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Speichern...' : 'Erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 