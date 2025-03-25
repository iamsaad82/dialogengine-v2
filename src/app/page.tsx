import { Chat } from '@/components/chat'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Willkommen bei der Stadtverwaltung Brandenburg an der Havel</h1>
        <p className="text-xl mb-4">
          Unser digitaler Assistent steht Ihnen zur Verfügung, um Ihre Fragen zu beantworten.
        </p>
        <div className="h-[600px] w-full">
          <Chat />
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
