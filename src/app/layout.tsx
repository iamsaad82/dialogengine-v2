import { Metadata } from 'next'
import './globals.css'
import prisma from '@/lib/db'
import { LunaryScript } from "@/components/LunaryScript";
import AuthProvider from '@/providers/AuthProvider'

// Lade die App-Einstellungen
async function getAppSettings() {
  const settings = await prisma.appSettings.findUnique({
    where: { id: 'global' },
    select: {
      brandName: true,
      lunaryEnabled: true,
      lunaryProjectId: true,
      enableDebugMode: true,
      cacheTimeout: true
    }
  })
  return settings || {
    brandName: 'Brandenburg Dialog',
    lunaryEnabled: false,
    lunaryProjectId: null,
    enableDebugMode: false,
    cacheTimeout: 3600
  }
}

// Metadaten für SEO und Browsertitel
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings()

  return {
    title: settings.brandName,
    description: `Stadtassistent für ${settings.brandName}`,
  }
}

// Separater Viewport-Export nach Next.js 14 Konvention
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  // Wir erlauben Zoom für bessere Zugänglichkeit, aber verhindern automatisches Zoomen bei Fokus
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', // Optimiert für Geräte mit Notch (iPhone X+)
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
