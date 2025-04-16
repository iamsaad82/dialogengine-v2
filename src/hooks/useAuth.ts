'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/**
 * Ein benutzerdefinierter Hook für die Authentifizierung, der die next-auth Funktionalität 
 * erweitert und lokalisierte Rückgabewerte zur Verfügung stellt.
 */
export const useAuth = () => {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  /**
   * Prüft, ob der Benutzer eingeloggt ist
   */
  const isAuthenticated = status === 'authenticated' && !!session?.user
  
  /**
   * Prüft, ob der Benutzer die Admin-Rolle hat
   */
  const isAdmin = isAuthenticated && session?.user?.role === 'ADMIN'

  /**
   * Login-Funktion mit Credentials Provider
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        return {
          erfolg: false,
          fehler: 'Anmeldedaten ungültig. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.'
        }
      }

      return {
        erfolg: true,
        fehler: null
      }
    } catch (error) {
      console.error('Login-Fehler:', error)
      return {
        erfolg: false,
        fehler: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      }
    }
  }, [])

  /**
   * Logout-Funktion
   */
  const logout = useCallback(async (redirectUrl = '/login') => {
    await signOut({ callbackUrl: redirectUrl })
  }, [])

  /**
   * Funktion zum Weiterleiten des Benutzers zur geschützten Seite, falls angemeldet
   */
  const redirectToProtectedPage = useCallback((redirectUrl = '/admin') => {
    if (isAuthenticated) {
      router.push(redirectUrl as any)
    }
  }, [isAuthenticated, router])

  /**
   * Funktion zum Weiterleiten des Benutzers zur Login-Seite, falls nicht angemeldet
   */
  const redirectToLogin = useCallback((redirectUrl = '/login') => {
    if (!isAuthenticated) {
      router.push(redirectUrl as any)
    }
  }, [isAuthenticated, router])

  /**
   * Funktion zum Aktualisieren der Session
   */
  const refreshSession = useCallback(async () => {
    await update()
  }, [update])

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated,
    isAdmin,
    user: session?.user,
    login,
    logout,
    redirectToProtectedPage,
    redirectToLogin,
    refreshSession
  }
}

export default useAuth 