import { Metadata } from 'next'

// SEO-Metadaten
export const metadata: Metadata = {
  title: 'Brandenburg Dialog',
  description: 'Stadtassistent für Brandenburg an der Havel',
}

// Separater Viewport-Export nach Next.js 14 Konvention
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
}

export default function EmbedChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning style={{ background: 'transparent' }}>
      <body className="embedded-body" style={{ background: 'transparent' }}>
        {children}
      </body>
    </html>
  )
} 