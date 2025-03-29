import NextAuth, { AuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { JWT } from "next-auth/jwt";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

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
          return null;
        }

        try {
          console.log(`Versuche Benutzer zu finden mit E-Mail: ${credentials.email}`);
          
          // Benutzer in der Datenbank suchen
          // Direkte Verwendung von Prisma mit dem richtigen Tabellenname
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
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      // Füge benutzerdefinierte Daten zur Session hinzu
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
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