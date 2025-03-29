/**
 * Dieses Skript erstellt einen Admin-Benutzer in der Datenbank.
 * 
 * Ausführung: npx ts-node -r tsconfig-paths/register scripts/create-admin.ts
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('Erstelle Admin-Benutzer...')

  // Admin-Einstellungen
  const adminEmail = 'admin@brandenburg-dialog.de'
  const adminPassword = 'Admin123!' // In der Produktion sollte ein sicheres Passwort verwendet werden
  const adminName = 'Administrator'

  try {
    // Prüfen, ob der Benutzer bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingUser) {
      console.log('Admin-Benutzer existiert bereits.')
      return
    }

    // Passwort hashen
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    // Benutzer erstellen
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash,
        role: 'admin'
      }
    })

    console.log(`Admin-Benutzer erstellt mit ID: ${user.id}`)
    console.log(`E-Mail: ${adminEmail}`)
    console.log(`Passwort: ${adminPassword} (bitte in der Produktion ändern)`)
  } catch (error) {
    console.error('Fehler beim Erstellen des Admin-Benutzers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Skript ausführen
createAdmin();

// Module-Flag setzen
export {}; 