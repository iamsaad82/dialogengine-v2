'use client'

import { Chat } from '@/components/chat'
import { StreamingChat } from '@/components/chat/StreamingChat'
import { useState } from 'react'

export default function Home() {
  const [useStreaming, setUseStreaming] = useState(true) // Standardmäßig Streaming aktivieren

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Willkommen bei der Stadtverwaltung Brandenburg an der Havel</h1>
        <p className="text-xl mb-4">
          Unser digitaler Assistent steht Ihnen zur Verfügung, um Ihre Fragen zu beantworten.
        </p>
        
        <div className="flex items-center mb-4 justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Chat-Modus:</span>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                useStreaming ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'
              }`}
              onClick={() => setUseStreaming(true)}
            >
              Streaming
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                !useStreaming ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'
              }`}
              onClick={() => setUseStreaming(false)}
            >
              Standard
            </button>
          </div>
        </div>
        
        <div className="h-[600px] w-full">
          {useStreaming ? (
            <StreamingChat />
          ) : (
            <Chat />
          )}
        </div>
        <div className="absolute bottom-8 right-8">
          <div className="flex gap-4">
            <a href="/admin" className="text-sm text-muted-foreground hover:text-primary transition">
              Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
