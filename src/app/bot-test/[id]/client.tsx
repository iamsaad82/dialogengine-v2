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
  const [chatMode, setChatMode] = useState<'bubble' | 'inline' | 'fullscreen'>('inline')
  const [debugMode, setDebugMode] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [testSettings, setTestSettings] = useState({
    showDebugInfo: false,
    simulateMobile: false,
    darkMode: false
  })
  
  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : '')
  }, [])
  
  useEffect(() => {
    if (chatMode === 'bubble') {
      setShowChat(false)
    } else {
      setShowChat(true)
    }
  }, [chatMode])
  
  const toggleChatVisibility = () => {
    if (chatMode === 'bubble') {
      setShowChat(!showChat)
    }
  }
  
  useEffect(() => {
    if (testSettings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [testSettings.darkMode])
  
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Lade Bot-Informationen...</span>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 border border-destructive p-4 rounded-md max-w-md w-full">
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
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-muted p-4 rounded-md max-w-md w-full">
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
  
  const renderChatBubble = () => {
    if (chatMode === 'bubble' && !showChat) {
      return (
        <div 
          onClick={toggleChatVisibility}
          className="fixed bottom-5 right-5 p-4 rounded-full bg-primary text-primary-foreground shadow-lg cursor-pointer flex items-center justify-center hover:opacity-90 transition-opacity z-50"
          style={{ width: '60px', height: '60px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
      )
    }
    return null
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Fixed Header/Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/bots')}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
            title="Zurück zur Übersicht"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </button>
          
          <div>
            <h1 className="text-lg font-bold">{bot.name}</h1>
            <p className="text-sm text-muted-foreground truncate max-w-md">{bot.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => setChatMode('bubble')}
              className={`px-3 py-1.5 text-sm rounded-l-md ${
                chatMode === 'bubble' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
              }`}
              title="Bubble Modus"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            <button
              onClick={() => setChatMode('inline')}
              className={`px-3 py-1.5 text-sm border-x ${
                chatMode === 'inline' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
              }`}
              title="Inline Modus"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="12" x="3" y="6" rx="2" ry="2"></rect>
                <line x1="3" x2="21" y1="12" y2="12"></line>
              </svg>
            </button>
            <button
              onClick={() => setChatMode('fullscreen')}
              className={`px-3 py-1.5 text-sm rounded-r-md ${
                chatMode === 'fullscreen' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
              }`}
              title="Fullscreen Modus"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m10 7-3 3 3 3"></path>
                <path d="m14 17 3-3-3-3"></path>
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={testSettings.simulateMobile}
                onChange={(e) => setTestSettings(prev => ({ ...prev, simulateMobile: e.target.checked }))}
                className="rounded border-gray-300 h-4 w-4"
              />
              <span>Mobile</span>
            </label>
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={testSettings.darkMode}
                onChange={(e) => setTestSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
                className="rounded border-gray-300 h-4 w-4"
              />
              <span>Dark</span>
            </label>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <button 
              onClick={() => setDebugMode(!debugMode)}
              className={`p-1.5 rounded-md ${
                debugMode 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
              }`}
              title="Debug-Modus"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4"/>
                <path d="M12 18v4"/>
                <path d="m4.93 4.93 2.83 2.83"/>
                <path d="m16.24 16.24 2.83 2.83"/>
                <path d="M2 12h4"/>
                <path d="M18 12h4"/>
                <path d="m4.93 19.07 2.83-2.83"/>
                <path d="m16.24 7.76 2.83-2.83"/>
              </svg>
            </button>
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-1.5 rounded-md ${
                !showSidebar
                  ? 'bg-muted/80 text-muted-foreground' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
              }`}
              title={showSidebar ? "Sidebar ausblenden" : "Sidebar einblenden"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <line x1="9" x2="9" y1="3" y2="21"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Test Area - Flexible Width */}
        <div className={`flex-1 overflow-hidden bg-muted/20 relative`}>
          {/* Render Chat Bubble for Bubble Mode */}
          {renderChatBubble()}
          
          {/* Chat Container */}
          {(showChat || chatMode !== 'bubble') && (
            <div className={`h-full ${testSettings.simulateMobile ? 'flex justify-center' : ''}`}>
              <div className={`h-full ${testSettings.simulateMobile ? 'w-[390px]' : 'w-full'}`}>
                <Chat 
                  initialMode={chatMode} 
                  embedded={true} 
                  botId={id}
                  className=""
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar - Fixed Width - Collapsible */}
        {showSidebar && (
          <div className="w-80 border-l overflow-y-auto h-full p-3 flex flex-col gap-3 bg-card">
            {/* Bot Info Panel */}
            <div className="border rounded-lg bg-card p-3">
              <h2 className="text-sm font-semibold mb-2">Bot-Informationen</h2>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="font-medium text-muted-foreground">ID:</span>
                  <p className="font-mono break-all">{bot.id}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Flowise ID:</span>
                  <p className="font-mono break-all">{bot.flowiseId}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Status:</span>
                  <p className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                    bot.active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800/20 dark:text-gray-400'
                  }`}>
                    {bot.active ? 'Aktiv' : 'Inaktiv'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Debug Info Panel - Conditional */}
            {debugMode && (
              <div className="border rounded-lg bg-card p-3">
                <h2 className="text-sm font-semibold mb-2">Debug-Informationen</h2>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="font-medium">Aktueller Modus:</span>
                    <p className="font-mono">{chatMode}</p>
                  </div>
                  <div>
                    <span className="font-medium">Chat sichtbar:</span>
                    <p className="font-mono">{showChat ? 'Ja' : 'Nein'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Test-Einstellungen:</span>
                    <pre className="font-mono bg-muted/50 p-2 rounded mt-1 text-[10px] overflow-auto">
                      {JSON.stringify(testSettings, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="font-medium">Bot-Einstellungen:</span>
                    <pre className="font-mono bg-muted/50 p-2 rounded mt-1 text-[10px] overflow-auto">
                      {JSON.stringify(bot.settings, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
            
            {/* Embed Help Panel */}
            <div className="border rounded-lg bg-card p-3 mt-auto">
              <h2 className="text-sm font-semibold mb-2">Embed-Hilfe</h2>
              <p className="text-xs text-muted-foreground mb-2">
                Verwenden Sie den folgenden Code, um diesen Bot einzubetten:
              </p>
              <div className="bg-muted/50 p-2 rounded-md text-xs font-mono whitespace-pre-wrap overflow-x-auto text-[10px]">
{`<div id="dialog-container" 
  data-mode="${chatMode}" 
  data-color="${bot.settings?.primaryColor || '#3b82f6'}" 
  data-position="bottom-right"
  data-bot-id="${id}">
</div>
<script src="${origin}/api/embed?botId=${id}&mode=${chatMode}&color=${(bot.settings?.primaryColor || '#3b82f6').replace('#', '%23')}" defer></script>`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 