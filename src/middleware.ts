import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Prüfen, ob es sich um eine Admin-Route handelt
  const isAdminRoute = path.startsWith('/admin');
  
  // Prüfen, ob der Benutzer authentifiziert ist
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Nicht-authentifizierte Benutzer zur Login-Seite umleiten, wenn sie auf Admin-Routen zugreifen
  if (isAdminRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Admin-API-Routen schützen
  if (path.startsWith('/api/admin') && !token) {
    return new NextResponse(
      JSON.stringify({ message: 'Nicht autorisiert' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return NextResponse.next();
}

// Routen konfigurieren, für die die Middleware ausgeführt werden soll
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}; 