'use client'

import { useEffect, useState } from 'react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  formattedDate: string
}

interface ConversationDetails {
  id: string
  messageId: string
  botName: string
  botAvatar?: string
  question: string
  formattedDate: string
  messages: Message[]
}

interface ConversationDetailsModalProps {
  messageId: string | null
  onClose: () => void
}

export default function ConversationDetailsModal({ messageId, onClose }: ConversationDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ConversationDetails | null>(null)
  
  useEffect(() => {
    const fetchConversation = async () => {
      if (!messageId) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/admin/api/conversation?messageId=${messageId}`)
        
        if (!response.ok) {
          throw new Error(`Fehler beim Laden der Konversation: ${response.status}`)
        }
        
        const data = await response.json()
        setData(data)
      } catch (err) {
        console.error('Fehler beim Laden der Konversationsdetails:', err)
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      } finally {
        setLoading(false)
      }
    }
    
    fetchConversation()
  }, [messageId])
  
  if (!messageId) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Konversationsdetails</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-4 my-4">
              <p>{error}</p>
            </div>
          ) : data ? (
            <div>
              <div className="mb-6">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                    {data.botAvatar ? (
                      <img 
                        src={data.botAvatar} 
                        alt={data.botName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="10" x="3" y="11" rx="2" />
                        <circle cx="12" cy="5" r="2" />
                        <path d="M12 7v4" />
                        <line x1="8" x2="8" y1="16" y2="16" />
                        <line x1="16" x2="16" y1="16" y2="16" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">Konversation mit {data.botName}</h3>
                    <p className="text-sm text-muted-foreground">{data.formattedDate}</p>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">Konversationsverlauf:</div>
              </div>
              
              <div className="space-y-4">
                {data.messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-muted ml-4 mr-12' 
                        : 'bg-primary/10 ml-12 mr-4'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">
                        {message.role === 'user' ? 'Benutzer' : data.botName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.formattedDate}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Keine Konversationsdaten gefunden
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
} 