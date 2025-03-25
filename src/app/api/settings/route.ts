import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Temporär direkter Import, um Typfehler zu umgehen
const prismaClient = new PrismaClient()

// GET: Holt die globalen Anwendungseinstellungen
export async function GET() {
  try {
    // Abrufen der Anwendungseinstellungen
    const settings = await prismaClient.appSettings.findUnique({
      where: { id: 'global' }
    })

    // Standardwerte, falls keine Einstellungen gefunden wurden
    const defaultSettings = {
      lunaryEnabled: false,
      lunaryProjectId: null,
      brandName: 'Brandenburg Dialog',
      defaultPrimaryColor: '#e63946',
      defaultWelcomeMessage: 'Willkommen! Wie kann ich Ihnen mit Informationen zur Stadtverwaltung Brandenburg an der Havel helfen?',
      enableDebugMode: false
    }

    // Einstellungen zurückgeben (oder Standardwerte, falls keine gefunden wurden)
    return NextResponse.json(settings || defaultSettings)
  } catch (error) {
    console.error("Fehler beim Abrufen der Einstellungen:", error)
    return NextResponse.json(
      { error: "Interner Serverfehler beim Abrufen der Einstellungen" },
      { status: 500 }
    )
  }
}

// PUT: Aktualisiert die globalen Anwendungseinstellungen
export async function PUT(request: Request) {
  try {
    const data = await request.json()

    // Einstellungen in der Datenbank aktualisieren oder erstellen
    const updatedSettings = await prismaClient.appSettings.upsert({
      where: { id: 'global' },
      update: {
        lunaryEnabled: data.lunaryEnabled !== undefined ? data.lunaryEnabled : undefined,
        lunaryProjectId: data.lunaryProjectId !== undefined ? data.lunaryProjectId : undefined,
        brandName: data.brandName !== undefined ? data.brandName : undefined,
        defaultPrimaryColor: data.defaultPrimaryColor !== undefined ? data.defaultPrimaryColor : undefined,
        defaultWelcomeMessage: data.defaultWelcomeMessage !== undefined ? data.defaultWelcomeMessage : undefined,
        enableDebugMode: data.enableDebugMode !== undefined ? data.enableDebugMode : undefined
      },
      create: {
        id: 'global',
        lunaryEnabled: data.lunaryEnabled !== undefined ? data.lunaryEnabled : false,
        lunaryProjectId: data.lunaryProjectId || null,
        brandName: data.brandName || 'Brandenburg Dialog',
        defaultPrimaryColor: data.defaultPrimaryColor || '#e63946',
        defaultWelcomeMessage: data.defaultWelcomeMessage || 'Willkommen! Wie kann ich Ihnen mit Informationen zur Stadtverwaltung Brandenburg an der Havel helfen?',
        enableDebugMode: data.enableDebugMode !== undefined ? data.enableDebugMode : false
      }
    })

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Einstellungen:", error)
    return NextResponse.json(
      { error: "Interner Serverfehler beim Aktualisieren der Einstellungen" },
      { status: 500 }
    )
  }
} 