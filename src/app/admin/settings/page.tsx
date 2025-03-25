'use client'

import { useState, useEffect } from 'react'

interface AppSettings {
  id: string
  lunaryEnabled: boolean
  lunaryProjectId: string | null
  brandName: string
  logoUrl: string | null
  defaultPrimaryColor: string
  defaultWelcomeMessage: string
  enableDebugMode: boolean
  cacheTimeout: number
  updatedAt: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Einstellungen laden
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Einstellungen')
      }
      
      const data = await response.json()
      setSettings(data)
      setError(null)
    } catch (err) {
      console.error('Fehler beim Laden der Einstellungen:', err)
      setError('Einstellungen konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  // Einstellungen speichern
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!settings) return
    
    try {
      setSaving(true)
      setSuccessMessage(null)
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })
      
      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Einstellungen')
      }
      
      // Einstellungen neu laden
      await fetchSettings()
      
      setSuccessMessage('Einstellungen erfolgreich gespeichert')
      setError(null)
    } catch (err) {
      console.error('Fehler beim Speichern der Einstellungen:', err)
      setError('Einstellungen konnten nicht gespeichert werden')
      setSuccessMessage(null)
    } finally {
      setSaving(false)
    }
  }

  // Handler für Änderungen an den Formularfeldern
  const handleChange = (field: keyof AppSettings, value: any) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [field]: value
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Anwendungseinstellungen</h1>
        <p className="text-muted-foreground">Konfigurieren Sie globale Einstellungen für die Brandenburg Dialog-Anwendung</p>
      </div>
      
      {/* Fehlermeldung */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
          {error}
        </div>
      )}
      
      {/* Erfolgsmeldung */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-500 rounded-md text-green-800">
          {successMessage}
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : settings ? (
        <form onSubmit={saveSettings} className="space-y-8">
          {/* Allgemeine Einstellungen */}
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Allgemeine Einstellungen</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Markenname</label>
                <input
                  type="text"
                  value={settings.brandName}
                  onChange={(e) => handleChange('brandName', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Logo URL</label>
                <input
                  type="text"
                  value={settings.logoUrl || ''}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lassen Sie dieses Feld leer, um das Standardlogo zu verwenden
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Standard-Primärfarbe</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.defaultPrimaryColor}
                    onChange={(e) => handleChange('defaultPrimaryColor', e.target.value)}
                    className="w-10 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.defaultPrimaryColor}
                    onChange={(e) => handleChange('defaultPrimaryColor', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Standard-Willkommensnachricht</label>
                <textarea
                  value={settings.defaultWelcomeMessage}
                  onChange={(e) => handleChange('defaultWelcomeMessage', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Lunary Analytics Integration */}
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Lunary Analytics Integration</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lunaryEnabled"
                  checked={settings.lunaryEnabled}
                  onChange={(e) => handleChange('lunaryEnabled', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="lunaryEnabled">Lunary Analytics aktivieren</label>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Lunary Project ID</label>
                <input
                  type="text"
                  value={settings.lunaryProjectId || ''}
                  onChange={(e) => handleChange('lunaryProjectId', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="lun_xxxxxxxxxxxxxxxx"
                  disabled={!settings.lunaryEnabled}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Die Project ID finden Sie in Ihrem Lunary Dashboard
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="text-sm font-medium text-yellow-800 mb-1">Hinweis zur Lunary-Integration</h3>
                <p className="text-xs text-yellow-700">
                  Sie können für alle Bots die gleiche Project ID verwenden und in Lunary zwischen ihnen unterscheiden, indem Sie Tags oder benutzerdefinierte Eigenschaften verwenden. 
                  Diese Einstellung gilt global für alle Bots, die Analytics aktiviert haben.
                </p>
              </div>
            </div>
          </div>
          
          {/* Erweiterte Einstellungen */}
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Erweiterte Einstellungen</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableDebugMode"
                  checked={settings.enableDebugMode}
                  onChange={(e) => handleChange('enableDebugMode', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="enableDebugMode">Debug-Modus aktivieren</label>
                <p className="text-xs text-muted-foreground ml-2">
                  (Zusätzliche Logs und Debugging-Informationen)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cache-Timeout (Sekunden)</label>
                <input
                  type="number"
                  value={settings.cacheTimeout}
                  onChange={(e) => handleChange('cacheTimeout', parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  max="86400"
                />
              </div>
              
              <div className="pt-4 text-xs text-muted-foreground">
                Letzte Aktualisierung: {new Date(settings.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Speichern Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Wird gespeichert...' : 'Einstellungen speichern'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
          Einstellungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.
        </div>
      )}
    </div>
  )
} 