import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brandenburg Dialog',
  description: 'Stadtassistent für Brandenburg an der Havel',
  viewport: 'width=device-width, initial-scale=1, minimum-scale=1',
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