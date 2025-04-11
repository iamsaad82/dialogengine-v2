'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Bitte geben Sie Ihre E-Mail und Ihr Passwort ein')
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('Login-Versuch mit E-Mail:', email)

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      console.log('Login-Ergebnis:', result)

      if (result?.error) {
        console.error('Login fehlgeschlagen:', result.error)
        setError('Ungültige Anmeldedaten')
        return
      }

      console.log('Login erfolgreich, leite weiter zur Admin-Seite')

      // Erfolgreiche Anmeldung, zur Admin-Seite weiterleiten
      // Verwende window.location für eine vollständige Seitenaktualisierung
      window.location.href = '/admin'
    } catch (error) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
      console.error('Login-Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin-Login</h1>
          <p className="mt-2 text-muted-foreground">
            Bitte melden Sie sich an, um auf den Admin-Bereich zuzugreifen
          </p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="admin@beispiel.de"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Anmelden...
                </span>
              ) : (
                'Anmelden'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-primary hover:underline">
            Zurück zur Website
          </a>
        </div>
      </div>
    </div>
  )
}