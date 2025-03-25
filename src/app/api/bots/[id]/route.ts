import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { revalidateTag } from 'next/cache'

// GET-Anfrage: Hole Bot-Daten anhand der ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  // ID aus den Parametern extrahieren, bevor sie verwendet werden
  const params = await context.params;
  const botId = params.id
  
  if (!botId) {
    return NextResponse.json({ error: 'Bot ID erforderlich' }, { status: 400 })
  }

  try {
    // Suchen des Bots in der Datenbank
    const bot = await prisma.bot.findUnique({
      where: {
        id: botId,
      },
      include: {
        settings: true
      }
    })

    // Wenn der Bot nicht gefunden wird, 404 zurückgeben
    if (!bot) {
      return NextResponse.json({ error: 'Bot nicht gefunden' }, { status: 404 })
    }

    // Bot-Daten zurückgeben
    return NextResponse.json(bot)
  } catch (error) {
    console.error('Fehler beim Abrufen des Bots:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// PUT-Anfrage: Aktualisiere Bot-Daten
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  // ID aus den Parametern extrahieren, bevor sie verwendet werden
  const params = await context.params;
  const botId = params.id
  
  if (!botId) {
    return NextResponse.json({ error: 'Bot ID erforderlich' }, { status: 400 })
  }

  try {
    const body = await req.json()

    const { name, description, welcomeMessage, flowiseId, active, settings } = body

    // Aktualisieren des Bots in der Datenbank
    const updatedBot = await prisma.bot.update({
      where: {
        id: botId,
      },
      data: {
        name,
        description,
        welcomeMessage,
        flowiseId,
        active,
        settings: settings
          ? {
              upsert: {
                create: { ...settings },
                update: { ...settings }
              }
            }
          : undefined
      },
      include: {
        settings: true
      }
    })

    // Cache revalidieren
    revalidateTag('bots')

    // Aktualisierte Bot-Daten zurückgeben
    return NextResponse.json(updatedBot)
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Bots:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// DELETE-Anfrage: Lösche einen Bot
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  // ID aus den Parametern extrahieren, bevor sie verwendet werden
  const params = await context.params;
  const botId = params.id
  
  if (!botId) {
    return NextResponse.json({ error: 'Bot ID erforderlich' }, { status: 400 })
  }

  try {
    // Zuerst die zugehörigen Einstellungen löschen, falls vorhanden
    await prisma.botSettings.deleteMany({
      where: { botId }
    })
    
    // Löschen des Bots aus der Datenbank
    await prisma.bot.delete({
      where: {
        id: botId,
      },
    })

    // Cache revalidieren
    revalidateTag('bots')

    // Erfolgreiche Löschung bestätigen
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen des Bots:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
} 