import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import prisma from '@/lib/db'
import { LunaryScript } from "@/components/LunaryScript";
import AuthProvider from '@/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

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
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        
        {/* Lunary Analytics Script (wird nur geladen, wenn in den Einstellungen aktiviert) */}
        <LunaryScript />
      </body>
    </html>
  )
}
