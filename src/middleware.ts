import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Prüfen, ob es sich um eine Admin-Route handelt
  const isAdminRoute = path.startsWith('/admin');
  const isAdminApiRoute = path.startsWith('/api/admin');

  console.log(`Middleware - Pfad: ${path}, isAdminRoute: ${isAdminRoute}, isAdminApiRoute: ${isAdminApiRoute}`);

  // Prüfen, ob der Benutzer authentifiziert ist
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  console.log('Middleware - Token vorhanden:', !!token);
  if (token) {
    console.log('Middleware - Token Inhalt:', { id: token.id, email: token.email, role: token.role });
  }

  // Nicht-authentifizierte Benutzer zur Login-Seite umleiten, wenn sie auf Admin-Routen zugreifen
  if ((isAdminRoute || isAdminApiRoute) && !token) {
    console.log('Middleware - Nicht authentifiziert, leite zur Login-Seite um');
    // Absolute URL für die Umleitung verwenden
    const loginUrl = new URL('/login', request.url);
    console.log('Middleware - Umleitung zu:', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  // Wenn der Benutzer authentifiziert ist und auf die Login-Seite zugreift, zur Admin-Seite umleiten
  if (path === '/login' && token) {
    console.log('Middleware - Bereits authentifiziert, leite zur Admin-Seite um');
    const adminUrl = new URL('/admin', request.url);
    console.log('Middleware - Umleitung zu:', adminUrl.toString());
    return NextResponse.redirect(adminUrl);
  }

  // Admin-API-Routen schützen
  if (isAdminApiRoute && !token) {
    console.log('Middleware - Nicht autorisierter API-Zugriff');
    return new NextResponse(
      JSON.stringify({ message: 'Nicht autorisiert' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  console.log('Middleware - Zugriff erlaubt');

  return NextResponse.next();
}

// Routen konfigurieren, für die die Middleware ausgeführt werden soll
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};