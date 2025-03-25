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