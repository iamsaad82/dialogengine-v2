// Script zum Aktualisieren aller Bot-Willkommensnachrichten in der Datenbank
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateBotWelcomeMessages() {
  try {
    console.log('Starte Update aller Bot-Willkommensnachrichten...')
    
    // Alle Bots abrufen
    const bots = await prisma.bot.findMany()
    console.log(`${bots.length} Bots gefunden`)
    
    // Für jeden Bot die Willkommensnachricht aktualisieren
    for (const bot of bots) {
      console.log(`Aktualisiere Bot: ${bot.name} (${bot.id})`)
      console.log(`Aktuelle Willkommensnachricht: "${bot.welcomeMessage}"`)
      
      // Neue Willkommensnachricht, die nicht die Brandenburg-spezifische enthält
      const newWelcomeMessage = 'Willkommen! Wie kann ich Ihnen helfen?'
      
      // Bot aktualisieren
      await prisma.bot.update({
        where: { id: bot.id },
        data: { welcomeMessage: newWelcomeMessage }
      })
      
      console.log(`Neue Willkommensnachricht: "${newWelcomeMessage}"`)
    }
    
    console.log('Update aller Bot-Willkommensnachrichten abgeschlossen!')
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Willkommensnachrichten:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Skript ausführen
updateBotWelcomeMessages() 