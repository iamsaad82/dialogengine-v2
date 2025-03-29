import { Metadata } from 'next'
import './globals.css'
import prisma from '@/lib/db'
import { LunaryScript } from "@/components/LunaryScript";
import AuthProvider from '@/providers/AuthProvider'

// Lade die App-Einstellungen
async function getAppSettings() {
  const settings = await prisma.appSettings.findUnique({
    where: { id: 'global' }
  })
  return settings || {
    brandName: 'Brandenburg Dialog',
    defaultWelcomeMessage: 'Willkommen! Wie kann ich Ihnen mit Informationen zur Stadtverwaltung Brandenburg an der Havel helfen?'
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings()
  
  return {
    title: settings.brandName,
    description: `Stadtassistent für ${settings.brandName}`,
    viewport: 'width=device-width, initial-scale=1, minimum-scale=1',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        
        {/* Lunary Analytics Script (wird nur geladen, wenn in den Einstellungen aktiviert) */}
        <LunaryScript />
      </body>
    </html>
  )
}
