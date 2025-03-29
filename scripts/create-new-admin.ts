/**
 * Dieses Skript erstellt einen neuen Admin-Benutzer in der Datenbank.
 * 
 * Ausführung: npx ts-node scripts/create-new-admin.ts
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Erstelle neuen Admin-Benutzer...');

  // Admin-Einstellungen
  const adminEmail = 'admin@dialog-ai-web.de';
  const adminPassword = 'SMG2025!';
  const adminName = 'Dialog AI Admin';

  try {
    // Prüfen, ob der Benutzer bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      console.log('Admin-Benutzer existiert bereits.');
      return;
    }

    // Passwort hashen
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Benutzer erstellen
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash,
        role: 'admin'
      }
    });

    console.log(`Admin-Benutzer erstellt mit ID: ${user.id}`);
    console.log(`E-Mail: ${adminEmail}`);
    console.log(`Passwort: ${adminPassword}`);
  } catch (error) {
    console.error('Fehler beim Erstellen des Admin-Benutzers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 