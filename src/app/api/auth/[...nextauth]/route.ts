import NextAuth, { AuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { JWT } from "next-auth/jwt";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

// Debug-Ausgabe für NextAuth-Konfiguration
console.log('NextAuth-Konfiguration wird initialisiert')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('NEXTAUTH_SECRET vorhanden:', !!process.env.NEXTAUTH_SECRET)

// NextAuth Configuration
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any, // Type-Cast wegen Typkompatibilität
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Keine Anmeldedaten angegeben');
          return null;
        }

        try {
          console.log(`Versuche Benutzer zu finden mit E-Mail: ${credentials.email}`);

          // Versuche zuerst mit dem Prisma-Client
          try {
            console.log('Versuche Benutzer mit Prisma-Client zu finden');
            const userWithClient = await prisma.user.findUnique({
              where: { email: credentials.email }
            });

            if (userWithClient) {
              console.log('Benutzer mit Prisma-Client gefunden:', userWithClient.id);

              if (!userWithClient.passwordHash) {
                console.log('Kein Passwort-Hash vorhanden');
                return null;
              }

              // Passwort überprüfen
              const passwordValid = await bcrypt.compare(
                credentials.password,
                userWithClient.passwordHash
              );

              if (!passwordValid) {
                console.log('Passwort ungültig');
                return null;
              }

              console.log('Authentifizierung erfolgreich mit Prisma-Client');
              return {
                id: userWithClient.id,
                name: userWithClient.name,
                email: userWithClient.email,
                role: userWithClient.role,
              };
            } else {
              console.log('Benutzer mit Prisma-Client nicht gefunden, versuche Raw-Query');
            }
          } catch (prismaError) {
            console.error('Fehler bei Prisma-Client-Suche:', prismaError);
          }

          // Fallback: Direkte Verwendung von Prisma mit dem richtigen Tabellenname
          console.log('Versuche Benutzer mit Raw-Query zu finden');
          const users = await prisma.$queryRaw`
            SELECT * FROM "User" WHERE email = ${credentials.email}
          `;

          const user = Array.isArray(users) && users.length > 0 ? users[0] : null;

          if (!user) {
            console.log('Benutzer nicht gefunden');
            return null;
          }

          if (!user.passwordHash) {
            console.log('Kein Passwort-Hash vorhanden');
            return null;
          }

          console.log('Benutzer gefunden, überprüfe Passwort');

          // Passwort überprüfen
          const passwordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!passwordValid) {
            console.log('Passwort ungültig');
            return null;
          }

          console.log('Authentifizierung erfolgreich');

          // Benutzer erfolgreich authentifiziert
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Fehler bei der Authentifizierung:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 Tage
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT, user?: User }) {
      // Wenn der Benutzer sich gerade angemeldet hat
      if (user) {
        console.log('JWT Callback - Benutzer angemeldet:', user.email);
        token.id = user.id;
        token.role = user.role;
      }
      console.log('JWT Callback - Token:', token);
      return token;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      console.log('Session Callback - Token:', token);
      // Füge benutzerdefinierte Daten zur Session hinzu
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        console.log('Session Callback - Erweiterte Session:', session);
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Cookie-Konfiguration
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Debug-Modus aktivieren, unabhängig von der Umgebung
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };