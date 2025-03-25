// Script zum Aktualisieren der globalen AppSettings in der Datenbank
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateAppSettings() {
  try {
    console.log('Starte Update der globalen App-Einstellungen...')
    
    // Aktuelle Einstellungen abrufen
    const currentSettings = await prisma.appSettings.findUnique({
      where: { id: 'global' }
    })
    
    if (currentSettings) {
      console.log('Aktuelle App-Einstellungen gefunden:')
      console.log('brandName:', currentSettings.brandName)
      console.log('defaultWelcomeMessage:', currentSettings.defaultWelcomeMessage)
      
      // App-Einstellungen aktualisieren
      const updatedSettings = await prisma.appSettings.update({
        where: { id: 'global' },
        data: {
          brandName: 'Stadtassistent',
          defaultWelcomeMessage: 'Willkommen! Wie kann ich Ihnen helfen?'
        }
      })
      
      console.log('App-Einstellungen aktualisiert:')
      console.log('brandName:', updatedSettings.brandName)
      console.log('defaultWelcomeMessage:', updatedSettings.defaultWelcomeMessage)
    } else {
      console.log('Keine vorhandenen App-Einstellungen gefunden, erstelle neue...')
      
      // Neue App-Einstellungen erstellen
      const newSettings = await prisma.appSettings.create({
        data: {
          id: 'global',
          brandName: 'Stadtassistent',
          defaultWelcomeMessage: 'Willkommen! Wie kann ich Ihnen helfen?'
        }
      })
      
      console.log('Neue App-Einstellungen erstellt:')
      console.log('brandName:', newSettings.brandName)
      console.log('defaultWelcomeMessage:', newSettings.defaultWelcomeMessage)
    }
    
    console.log('Update der App-Einstellungen abgeschlossen!')
  } catch (error) {
    console.error('Fehler beim Aktualisieren der App-Einstellungen:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Skript ausführen
updateAppSettings() 