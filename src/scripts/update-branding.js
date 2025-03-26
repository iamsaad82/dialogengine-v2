// Script zum Aktualisieren des Markennamens in den globalen App-Einstellungen
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function updateAppSettings() {
  console.log("Starte Update der App-Einstellungen...")
  
  try {
    // Suche nach existierenden App-Einstellungen
    const existingSettings = await prisma.appSettings.findFirst({
      where: { id: "default" }
    })
    
    if (existingSettings) {
      // Update der App-Einstellungen
      const updatedSettings = await prisma.appSettings.update({
        where: { id: "default" },
        data: {
          brandName: "SMG Dialog Engine",
        }
      })
      
      console.log("App-Einstellungen erfolgreich aktualisiert:", {
        id: updatedSettings.id,
        brandName: updatedSettings.brandName
      })
    } else {
      // Erstelle neue App-Einstellungen, falls keine vorhanden sind
      const newSettings = await prisma.appSettings.create({
        data: {
          id: "default",
          brandName: "SMG Dialog Engine",
          defaultPrimaryColor: "#3b82f6",
          defaultWelcomeMessage: "Willkommen! Wie kann ich Ihnen helfen?"
        }
      })
      
      console.log("Neue App-Einstellungen erstellt:", {
        id: newSettings.id,
        brandName: newSettings.brandName
      })
    }
    
    console.log("App-Einstellungen-Update abgeschlossen.")
  } catch (error) {
    console.error("Fehler beim Aktualisieren der App-Einstellungen:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Führe das Update aus
updateAppSettings() 