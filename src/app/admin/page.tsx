'use client'

import { useState } from 'react'
import Link from 'next/link'

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  
  // Beispiel-Daten für das Dashboard
  const stats = {
    totalConversations: 124,
    avgResponseTime: '1.2s',
    satisfactionRate: '87%',
    activeUsers: 23,
    questionsAnswered: 543,
  }
  
  const recentQuestions = [
    { id: 1, question: "Wann hat das Bürgeramt geöffnet?", timestamp: "Heute, 14:32" },
    { id: 2, question: "Wie beantrage ich einen neuen Personalausweis?", timestamp: "Heute, 13:15" },
    { id: 3, question: "Was kostet ein Anwohnerparkausweis?", timestamp: "Heute, 11:47" },
    { id: 4, question: "Wo kann ich Sperrmüll anmelden?", timestamp: "Gestern, 16:23" },
    { id: 5, question: "Wie lange dauert die Bearbeitung eines Bauantrags?", timestamp: "Gestern, 14:05" },
  ]
  
  const topQuestions = [
    { id: 1, question: "Öffnungszeiten Bürgeramt", count: 87 },
    { id: 2, question: "Personalausweis beantragen", count: 73 },
    { id: 3, question: "Anwohnerparkausweis", count: 65 },
    { id: 4, question: "Müllabfuhr Termine", count: 58 },
    { id: 5, question: "Bauanträge", count: 42 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Brandenburg Dialog - Admin Dashboard</h1>
          <a 
            href="/"
            className="bg-primary-foreground/10 hover:bg-primary-foreground/20 px-4 py-2 rounded-md text-primary-foreground transition"
          >
            Zurück zur Website
          </a>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="flex flex-wrap gap-6 mb-6">
          <DashboardCard title="Gespräche" value={stats.totalConversations} icon="💬" />
          <DashboardCard title="Ø Antwortzeit" value={stats.avgResponseTime} icon="⏱️" />
          <DashboardCard title="Zufriedenheit" value={stats.satisfactionRate} icon="😊" />
          <DashboardCard title="Aktive Nutzer" value={stats.activeUsers} icon="👥" />
          <DashboardCard title="Beantwortete Fragen" value={stats.questionsAnswered} icon="✅" />
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
            isActive={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            label="Einstellungen"
          />
          <TabButton 
            isActive={activeTab === 'bots'} 
            onClick={() => setActiveTab('bots')}
            label="Bots"
          />
        </div>
        
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
        
        <div className="flex flex-col lg:flex-row gap-6">
          {activeTab === 'overview' && (
            <>
              <div className="w-full lg:w-1/2 bg-card rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Aktuelle Fragen</h2>
                  <button className="text-sm text-primary hover:underline">Alle anzeigen</button>
                </div>
                <div className="space-y-3">
                  {recentQuestions.map(item => (
                    <div key={item.id} className="flex justify-between items-start border-b pb-3">
                      <div>
                        <p className="font-medium">{item.question}</p>
                        <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                      </div>
                      <button className="text-primary hover:underline text-sm">Details</button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="w-full lg:w-1/2 bg-card rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Top Fragen</h2>
                  <button className="text-sm text-primary hover:underline">Bericht erstellen</button>
                </div>
                <div className="space-y-3">
                  {topQuestions.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-3">
                      <p className="font-medium">{item.question}</p>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                        {item.count}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
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
                  Letzte Aktualisierung: Heute, 15:30 Uhr
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-center text-muted-foreground py-8">
                  In Entwicklung - Hier werden bald Fragen und Antworten angezeigt.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'stats' && (
            <div className="w-full bg-card rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Analytics & Statistiken</h2>
              <p className="text-muted-foreground mb-6">
                Detaillierte Statistiken über die Nutzung des Chatbots.
              </p>
              <div className="h-[400px] border rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  Diagramm-Visualisierung in Entwicklung
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="w-full bg-card rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Dashboard-Einstellungen</h2>
              <p className="text-muted-foreground mb-6">
                Konfigurieren Sie das Dashboard nach Ihren Bedürfnissen.
              </p>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium">Willkommensnachricht</label>
                  <textarea 
                    className="min-h-[100px] p-3 rounded-md border"
                    defaultValue="Willkommen! Wie kann ich Ihnen mit Informationen zur Stadtverwaltung Brandenburg an der Havel helfen?"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium">Bot-Name</label>
                  <input 
                    type="text" 
                    className="p-2 rounded-md border"
                    defaultValue="Brandenburg Dialog" 
                  />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="enable-feedback" defaultChecked />
                  <label htmlFor="enable-feedback">Feedback-System aktivieren</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="enable-analytics" defaultChecked />
                  <label htmlFor="enable-analytics">Analytics aktivieren</label>
                </div>
                <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md">
                  Einstellungen speichern
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'bots' && (
            <div className="w-full bg-card rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Bot-Verwaltung</h2>
              <p className="text-muted-foreground mb-6">
                Hier können Sie verschiedene Chatbots für unterschiedliche Anwendungsfälle erstellen und verwalten.
              </p>
              
              <div className="space-y-6">
                <div className="border rounded-md p-4 bg-card">
                  <h3 className="font-medium mb-2">Vorhandene Bots</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Verwalten Sie Ihre vorhandenen Chatbots oder erstellen Sie neue.
                  </p>
                  <a 
                    href="/admin/bots" 
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 10h-4V6" />
                      <path d="M14 10 21 3" />
                      <path d="M21 13v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8" />
                    </svg>
                    Zur Bot-Verwaltung
                  </a>
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
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 