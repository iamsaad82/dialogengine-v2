'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ConversationDetailsModal from './components/ConversationDetailsModal'

// Dashboard-Karte für Statistiken
function DashboardCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="flex-1 min-w-[200px] bg-card rounded-lg shadow p-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Tab-Button für die Navigation
function TabButton({ isActive, onClick, label }: { isActive: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm border-b-2 ${
        isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )
}

// Neue Komponente für die Zeitraum-Auswahl
function TimeRangeSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center space-x-1 bg-muted rounded-md p-1">
      <button
        onClick={() => onChange('1d')}
        className={`text-xs px-2 py-1 rounded ${value === '1d' ? 'bg-background shadow' : 'hover:bg-background/50'}`}
      >
        24h
      </button>
      <button
        onClick={() => onChange('7d')}
        className={`text-xs px-2 py-1 rounded ${value === '7d' ? 'bg-background shadow' : 'hover:bg-background/50'}`}
      >
        7 Tage
      </button>
      <button
        onClick={() => onChange('30d')}
        className={`text-xs px-2 py-1 rounded ${value === '30d' ? 'bg-background shadow' : 'hover:bg-background/50'}`}
      >
        30 Tage
      </button>
      <button
        onClick={() => onChange('90d')}
        className={`text-xs px-2 py-1 rounded ${value === '90d' ? 'bg-background shadow' : 'hover:bg-background/50'}`}
      >
        90 Tage
      </button>
    </div>
  )
}

// Neue Komponente für die Bot-Auswahl
function BotSelector({ value, onChange, bots }: { 
  value: string; 
  onChange: (value: string) => void; 
  bots: Array<{id: string; name: string}>;
}) {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="bot-selector" className="text-sm">Bot:</label>
      <select
        id="bot-selector"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background border rounded-md px-2 py-1 text-sm"
      >
        <option value="all">Alle Bots</option>
        {bots.map((bot: {id: string; name: string}) => (
          <option key={bot.id} value={bot.id}>{bot.name}</option>
        ))}
      </select>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [brandName, setBrandName] = useState('SMG Dialog Engine')
  const [selectedBot, setSelectedBot] = useState('all')
  const [timeRange, setTimeRange] = useState('7d')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // State für die Detailansicht
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  
  // Lade den Markennamen und die Statistiken
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Parallele Anfragen für bessere Performance
        const [settingsResponse, statsResponse] = await Promise.all([
          fetch('/api/settings'),
          fetch(`/admin/api/stats?botId=${selectedBot}&timeRange=${timeRange}`)
        ])
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setBrandName(settingsData.brandName)
        }
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
          setError(null)
        } else {
          throw new Error(`Fehler beim Laden der Statistiken: ${statsResponse.status}`)
        }
      } catch (err) {
        console.error('Fehler beim Laden der Daten:', err)
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [selectedBot, timeRange])
  
  // Fallback für leere Daten
  const recentQuestions = stats?.recentQuestions || []
  const topQuestions = stats?.topQuestions || []
  const systemStats = stats?.systemStats || {}
  const botsList = stats?.bots || []
  
  return (
    <div className="min-h-screen bg-background">
      {/* Modal für Konversationsdetails */}
      {selectedMessageId && (
        <ConversationDetailsModal 
          messageId={selectedMessageId}
          onClose={() => setSelectedMessageId(null)}
        />
      )}
      
      <header className="bg-primary text-primary-foreground p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">{brandName} - Admin Dashboard</h1>
          <a 
            href="/"
            className="bg-primary-foreground/10 hover:bg-primary-foreground/20 px-4 py-2 rounded-md text-primary-foreground transition"
          >
            Zurück zur Website
          </a>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <BotSelector 
              value={selectedBot} 
              onChange={setSelectedBot}
              bots={botsList.map((b: any) => ({ id: b.id, name: b.name }))}
            />
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-4 my-4">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-sm"
            >
              Neu laden
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-6 mb-6">
              <DashboardCard 
                title="Bots" 
                value={systemStats.totalBots || 0} 
                icon="🤖" 
              />
              <DashboardCard 
                title="Gespräche" 
                value={systemStats.totalConversations || 0} 
                icon="💬" 
              />
              <DashboardCard 
                title="Erfolgsrate" 
                value={systemStats.successRate || '0%'} 
                icon="✅" 
              />
              <DashboardCard 
                title="Ø Antwortzeit" 
                value={systemStats.averageResponseTime || '0s'} 
                icon="⏱️" 
              />
              <DashboardCard 
                title="Aktive Nutzer" 
                value={systemStats.uniqueUsers || 0} 
                icon="👥" 
              />
            </div>
            
            <div className="flex mb-4 border-b">
              <TabButton 
                isActive={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')}
                label="Übersicht"
              />
              <TabButton 
                isActive={activeTab === 'questions'} 
                onClick={() => setActiveTab('questions')}
                label="Häufige Fragen"
              />
              <TabButton 
                isActive={activeTab === 'stats'} 
                onClick={() => setActiveTab('stats')}
                label="Statistiken"
              />
              <TabButton 
                isActive={activeTab === 'bots'} 
                onClick={() => setActiveTab('bots')}
                label="Bots"
              />
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 mt-4">
              {activeTab === 'overview' && (
                <>
                  <div className="w-full lg:w-1/2 bg-card rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Aktuelle Fragen</h2>
                      <div className="text-sm text-muted-foreground">
                        {selectedBot !== 'all' && (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded mr-2">
                            {botsList.find((b: any) => b.id === selectedBot)?.name || 'Bot'}
                          </span>
                        )}
                        <button className="text-primary hover:underline">Alle anzeigen</button>
                      </div>
                    </div>
                    {recentQuestions.length > 0 ? (
                      <div className="space-y-3">
                        {recentQuestions.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-start border-b pb-3">
                            <div>
                              <p className="font-medium">{item.question}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                                {selectedBot === 'all' && (
                                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                                    {item.botName}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button 
                              className="text-primary hover:underline text-sm"
                              onClick={() => setSelectedMessageId(item.id)}
                            >
                              Details
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-48 text-muted-foreground">
                        Keine aktuellen Fragen gefunden
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full lg:w-1/2 bg-card rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Top Fragen</h2>
                      <button 
                        className="text-sm text-primary hover:underline"
                        onClick={() => alert('Bericht wird erstellt... (Funktion noch in Entwicklung)')}
                      >
                        Bericht erstellen
                      </button>
                    </div>
                    {topQuestions.length > 0 ? (
                      <div className="space-y-3">
                        {topQuestions.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center border-b pb-3">
                            <p className="font-medium">{item.question}</p>
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                              {item.count}x
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-48 text-muted-foreground">
                        Keine Top-Fragen gefunden
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {activeTab === 'bots' && (
                <div className="w-full bg-card rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Bot-Performance</h2>
                  <p className="text-muted-foreground mb-4">
                    Übersicht über die Performance aller Bots im System.
                  </p>
                  
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3 border-b">Bot</th>
                          <th className="text-right p-3 border-b">Gespräche</th>
                          <th className="text-right p-3 border-b">Nachrichten</th>
                          <th className="text-right p-3 border-b">Ø Nachrichten/Gespräch</th>
                          <th className="text-right p-3 border-b">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {botsList.map((bot: any) => (
                          <tr key={bot.id} className="border-b hover:bg-muted/20">
                            <td className="p-3 font-medium">{bot.name}</td>
                            <td className="p-3 text-right">{bot.stats.conversationCount}</td>
                            <td className="p-3 text-right">{bot.stats.messageCount}</td>
                            <td className="p-3 text-right">{bot.stats.avgMessagesPerConversation}</td>
                            <td className="p-3 text-right">
                              <span className={`px-2 py-1 rounded-full text-xs ${bot.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {bot.active ? 'Aktiv' : 'Inaktiv'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 bg-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" />
                            <circle cx="12" cy="5" r="2" />
                            <path d="M12 7v4" />
                            <line x1="8" x2="8" y1="16" y2="16" />
                            <line x1="16" x2="16" y1="16" y2="16" />
                          </svg>
                        </div>
                        <h3 className="font-medium">Integration</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Informationen zur Integration der Bots in Ihre Website oder Anwendung.
                      </p>
                      <a href="/admin/embed" className="text-primary text-sm hover:underline mt-2 inline-block">
                        Einbettungscode generieren →
                      </a>
                    </div>
                    
                    <div className="border rounded-md p-4 bg-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v2" />
                            <path d="M12 20v2" />
                            <path d="M4.93 4.93l1.41 1.41" />
                            <path d="M17.66 17.66l1.41 1.41" />
                            <path d="M2 12h2" />
                            <path d="M20 12h2" />
                            <path d="M6.34 17.66l-1.41 1.41" />
                            <path d="M19.07 4.93l-1.41 1.41" />
                          </svg>
                        </div>
                        <h3 className="font-medium">Wissensquellen</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Verwalten Sie die Wissensquellen für Ihre Chatbots.
                      </p>
                      <a href="#" className="text-primary text-sm hover:underline mt-2 inline-block">
                        Wissensquellen verwalten →
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'questions' && (
                <div className="w-full bg-card rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Häufig gestellte Fragen verwalten</h2>
                  <p className="text-muted-foreground mb-6">
                    Hier können Sie die häufigsten Fragen und Antworten verwalten, 
                    die in der Wissensdatenbank vorkommen.
                  </p>
                  <div className="border rounded-md p-4 mb-4 bg-card">
                    <p className="text-primary font-medium mb-2">
                      Wissensdatenbank-Verbindungsstatus: <span className="text-green-500">Verbunden</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Letzte Aktualisierung: {stats?.meta?.lastUpdated 
                        ? new Date(stats.meta.lastUpdated).toLocaleString('de-DE')
                        : 'Unbekannt'}
                    </p>
                  </div>
                  
                  {topQuestions.length > 0 ? (
                    <div className="divide-y">
                      {topQuestions.map((item: any, index: number) => (
                        <div key={index} className="py-3">
                          <div className="flex justify-between mb-1">
                            <h3 className="font-medium">{item.question}</h3>
                            <span className="bg-primary/10 text-primary px-2 rounded text-sm">
                              {item.count}x
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20">
                              Antwort bearbeiten
                            </button>
                            <button className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80">
                              Als FAQ hinzufügen
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Keine Fragen gefunden. Passen Sie den Zeitraum an oder wählen Sie einen anderen Bot.
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'stats' && (
                <div className="w-full bg-card rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Analytics & Statistiken</h2>
                  <p className="text-muted-foreground mb-6">
                    Detaillierte Statistiken über die Nutzung des Chatbots.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Nutzungsstatistiken</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gesamtzahl Gespräche:</span>
                          <span className="font-medium">{systemStats.totalConversations || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Benutzernachrichten:</span>
                          <span className="font-medium">{systemStats.userMessages || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bot-Antworten:</span>
                          <span className="font-medium">{systemStats.botMessages || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Durchschnittliche Antwortzeit:</span>
                          <span className="font-medium">{systemStats.averageResponseTime || '0s'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Zeitraum-Informationen</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ausgewählter Zeitraum:</span>
                          <span className="font-medium">{
                            timeRange === '1d' ? 'Letzte 24 Stunden' : 
                            timeRange === '7d' ? 'Letzte 7 Tage' : 
                            timeRange === '30d' ? 'Letzte 30 Tage' : 
                            'Letzte 90 Tage'
                          }</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ausgewählter Bot:</span>
                          <span className="font-medium">{
                            selectedBot === 'all' ? 'Alle Bots' : 
                            botsList.find((b: any) => b.id === selectedBot)?.name || 'Unbekannt'
                          }</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Letzte Aktualisierung:</span>
                          <span className="font-medium">{
                            stats?.meta?.lastUpdated ? 
                            new Date(stats.meta.lastUpdated).toLocaleString('de-DE') : 
                            'Unbekannt'
                          }</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 mb-6">
                    <h3 className="font-medium mb-4">Gespräche pro Tag (letzte 7 Tage)</h3>
                    <div className="h-64 flex items-end justify-between">
                      {stats?.timeSeries?.daily.map((day: any, i: number) => {
                        const maxValue = Math.max(...stats.timeSeries.daily.map((d: any) => d.conversations));
                        const percentage = day.conversations / maxValue * 100;
                        
                        return (
                          <div key={i} className="flex flex-col items-center w-1/8">
                            <div 
                              className="bg-primary/80 w-12 rounded-t-md hover:bg-primary transition-all"
                              style={{ height: `${percentage}%` }}
                            ></div>
                            <div className="text-xs mt-2 text-muted-foreground">
                              {new Date(day.date).toLocaleDateString('de-DE', { weekday: 'short' })}
                            </div>
                            <div className="text-xs font-medium">{day.conversations}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">
                      Komplette Statistiken und erweiterte Analysen
                    </p>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition">
                      Ausführlichen Bericht erstellen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="fixed bottom-10 right-10">
          <a 
            href="/admin/embed" 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg hover:bg-primary/90 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 8-6 4 6 4V8Z"/>
              <rect x="2" y="6" width="14" height="12" rx="2"/>
            </svg>
            Embed-Code Generator
          </a>
        </div>
      </main>
    </div>
  )
} 