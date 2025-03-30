import dynamic from 'next/dynamic'

// Dynamischer Import der Client-Komponente ohne SSR
const ClientComponent = dynamic(() => import('./client'), { 
  ssr: false,
  loading: () => <Loading />
})

// Eine sehr einfache Server-Komponente, die als Wrapper für die Client-Komponente dient
export default function EmbedChatPage() {
  return <ClientComponent />
}

function Loading() {
  return (
    <div className="w-screen h-screen bg-white/50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
} 