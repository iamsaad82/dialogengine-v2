'use client'

import { useState, useEffect } from 'react'
import { StreamingChat } from '@/components/chat/StreamingChat'
import { Chat } from '@/components/chat'

export default function StreamingChatDemo() {
  const [selectedBot, setSelectedBot] = useState<string | null>(null)
  const [botsList, setBotsList] = useState<Array<{id: string, name: string}>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [useStreaming, setUseStreaming] = useState(true) // Standardmäßig Streaming aktivieren

  // Lade die verfügbaren Bots
  useEffect(() => {
    const fetchBots = async () => {
      try {
        const response = await fetch('/api/bots')
        if (response.ok) {
          const data = await response.json()
          setBotsList(data)
          setIsLoading(false)
          
          // Setze den ersten aktiven Bot als ausgewählt
          const activeBot = data.find((bot: any) => bot.active === true)
          if (activeBot) {
            setSelectedBot(activeBot.id)
          } else if (data.length > 0) {
            setSelectedBot(data[0].id)
          }
        } else {
          console.error('Fehler beim Laden der Bots')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Fehler:', error)
        setIsLoading(false)
      }
    }

    fetchBots()
  }, [])

  const handleBotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBot(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container px-4 mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Streaming Chat Demo
        </h1>
        
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="bot-select" className="block text-sm font-medium mb-2">
                Bot auswählen:
              </label>
              <select
                id="bot-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={selectedBot || ''}
                onChange={handleBotChange}
                disabled={isLoading}
              >
                {isLoading ? (
                  <option>Lade Bots...</option>
                ) : botsList.length === 0 ? (
                  <option>Keine Bots verfügbar</option>
                ) : (
                  botsList.map(bot => (
                    <option key={bot.id} value={bot.id}>
                      {bot.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Streaming-Modus:
              </label>
              <div className="flex items-center space-x-4">
                <button
                  className={`px-4 py-2 rounded-md ${
                    useStreaming 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                  onClick={() => setUseStreaming(true)}
                >
                  Mit Streaming
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    !useStreaming 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                  onClick={() => setUseStreaming(false)}
                >
                  Ohne Streaming
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-2 bg-yellow-50 text-yellow-800 rounded-md text-sm">
            <strong>Hinweis:</strong> {useStreaming 
              ? 'Im Streaming-Modus werden Antworten in Echtzeit angezeigt, während die Sektionen verfügbar werden.' 
              : 'Im normalen Modus erscheint die Antwort erst, wenn sie vollständig generiert wurde.'
            }
          </div>
        </div>
        
        <div className="border rounded-lg shadow-md bg-white dark:bg-gray-800 p-4 min-h-[600px] relative">
          {selectedBot ? (
            useStreaming ? (
              <StreamingChat 
                botId={selectedBot} 
                initialMode="fullscreen"
                embedded={true}
              />
            ) : (
              <Chat 
                botId={selectedBot} 
                initialMode="fullscreen"
                embedded={true}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-[600px] text-gray-500">
              Bitte wähle einen Bot aus
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 