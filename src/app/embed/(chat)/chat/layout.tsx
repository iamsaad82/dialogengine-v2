import { Metadata } from 'next'
import '../../../../styles/chat/base.css'
import '../../../../styles/chat/bubble-mode.css'
import '../../../../styles/chat/fullscreen-mode.css'
import '../../../../styles/chat/inline-mode.css'
import '../../../../components/chat/styles/message-content.css'

// Bot-Template-Styles
import '../../../../styles/bot-templates/aok-message-styles.css'
import '../../../../styles/bot-templates/brandenburg-message-styles.css'
import '../../../../styles/bot-templates/mall-message-styles.css'
import '../../../../styles/bot-templates/standard-message-styles.css'
import '../../../../styles/bot-templates/creditreform-message-styles.css'

// Streaming-Stabilität CSS
import '../../../../styles/streaming-stability.css'

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