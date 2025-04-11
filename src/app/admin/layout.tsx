'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { data: session, status } = useSession()

  // Debug-Ausgabe für Session-Status
  useEffect(() => {
    console.log('Admin Layout - Session Status:', status)
    console.log('Admin Layout - Session Data:', session)

    // Wenn nicht authentifiziert, zur Login-Seite umleiten
    if (status === 'unauthenticated') {
      console.log('Nicht authentifiziert, leite zur Login-Seite um')
      router.push('/login')
    }
  }, [status, session, router])

  // Funktion zum Prüfen, ob der aktuelle Pfad mit dem Link übereinstimmt
  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') {
      return true
    }
    return pathname !== '/admin' && pathname.startsWith(path)
  }

  return (
    <div className="admin-layout min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`bg-card border-r transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          <div className={`flex items-center ${sidebarCollapsed ? 'hidden' : ''}`}>
            <span className="text-xl font-semibold">Admin</span>
          </div>
          <button
            className="p-1 rounded-md hover:bg-muted"
            onClick={() => setSidebarCollapsed(prev => !prev)}
          >
            {sidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            )}
          </button>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            <li>
              <a
                href="/admin"
                className={`flex items-center px-4 py-2 text-sm ${
                  isActive('/admin') && pathname === '/admin'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                {!sidebarCollapsed && <span>Dashboard</span>}
              </a>
            </li>
            <li>
              <a
                href="/admin/bots"
                className={`flex items-center px-4 py-2 text-sm ${
                  isActive('/admin/bots')
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M12 2a3 3 0 0 0-3 3v6h6V5a3 3 0 0 0-3-3z"></path>
                </svg>
                {!sidebarCollapsed && <span>Bots</span>}
              </a>
            </li>
            <li>
              <a
                href="/admin/embed"
                className={`flex items-center px-4 py-2 text-sm ${
                  isActive('/admin/embed')
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                {!sidebarCollapsed && <span>Embed-Generator</span>}
              </a>
            </li>
            <li>
              <a
                href="/admin/settings"
                className={`flex items-center px-4 py-2 text-sm ${
                  isActive('/admin/settings')
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                {!sidebarCollapsed && <span>Einstellungen</span>}
              </a>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t p-4">
          {!sidebarCollapsed && session?.user && (
            <div className="mb-3 text-xs text-muted-foreground">
              <p>Angemeldet als:</p>
              <p className="font-medium">{session.user.name || session.user.email}</p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center text-sm text-muted-foreground hover:text-destructive"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              {!sidebarCollapsed && <span>Abmelden</span>}
            </button>

            <a
              href="/"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              {!sidebarCollapsed && <span>Zurück zur Website</span>}
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}