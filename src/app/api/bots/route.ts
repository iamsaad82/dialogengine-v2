import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/bots - Alle Bots abrufen
export async function GET() {
  try {
    const bots = await prisma.bot.findMany({
      include: {
        settings: true
      }
    })

    return NextResponse.json(bots)
  } catch (error) {
    console.error('Fehler beim Abrufen der Bots:', error)
    return NextResponse.json(
      { error: 'Bots konnten nicht abgerufen werden' },
      { status: 500 }
    )
  }
}

// POST /api/bots - Neuen Bot erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Überprüfen der erforderlichen Felder
    if (!body.name || !body.flowiseId) {
      return NextResponse.json(
        { error: 'Name und Flowise Chatflow ID sind erforderlich' },
        { status: 400 }
      )
    }

    // Bot und Standardeinstellungen in einer Transaktion erstellen
    const newBot = await prisma.$transaction(async (tx) => {
      // Bot erstellen
      const bot = await tx.bot.create({
        data: {
          name: body.name,
          description: body.description || '',
          avatarUrl: body.avatarUrl || '',
          welcomeMessage: body.welcomeMessage || 'Willkommen! Wie kann ich Ihnen helfen?',
          flowiseId: body.flowiseId,
          active: body.active !== undefined ? body.active : true,
        }
      })

      // Standardeinstellungen erstellen
      await tx.botSettings.create({
        data: {
          botId: bot.id,
          primaryColor: body.primaryColor || '#3b82f6',
          enableFeedback: body.enableFeedback !== undefined ? body.enableFeedback : true,
          enableAnalytics: body.enableAnalytics !== undefined ? body.enableAnalytics : true,
          showSuggestions: body.showSuggestions !== undefined ? body.showSuggestions : true,
          showCopyButton: body.showCopyButton !== undefined ? body.showCopyButton : true,
          showNameInHeader: body.showNameInHeader !== undefined ? body.showNameInHeader : true,
        }
      })

      // Bot mit Einstellungen zurückgeben
      return await tx.bot.findUnique({
        where: { id: bot.id },
        include: { settings: true }
      })
    })

    return NextResponse.json(newBot)
  } catch (error) {
    console.error('Fehler beim Erstellen des Bots:', error)
    return NextResponse.json(
      { error: 'Bot konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}