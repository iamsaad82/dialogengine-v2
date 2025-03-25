import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET-Anfrage: Hole Bot-Einstellungen anhand der Bot-ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const parameters = await params;
  const botId = parameters.id
  
  try {
    if (!botId) {
      return new NextResponse(JSON.stringify({ error: 'Keine Bot-ID angegeben' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const settings = await prisma.botSettings.findUnique({
      where: { botId }
    })

    if (!settings) {
      // Wenn keine Einstellungen gefunden wurden, senden wir Default-Werte zurück
      return NextResponse.json({
        primaryColor: '#3b82f6',
        botBgColor: 'rgba(248, 250, 252, 0.8)',
        botTextColor: '#000000',
        botAccentColor: '#3b82f6',
        userBgColor: '',
        userTextColor: '#ffffff',
        enableFeedback: true,
        enableAnalytics: true,
        showSuggestions: true,
        showCopyButton: true,
        botId
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Fehler beim Abrufen der Bot-Einstellungen:', error)
    return new NextResponse(JSON.stringify({ error: 'Interner Serverfehler' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// PUT-Anfrage: Aktualisiere Bot-Einstellungen
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const parameters = await params;
  const botId = parameters.id
  
  try {
    console.log('PUT-Anfrage für Bot-Einstellungen erhalten, Bot-ID:', botId)
    
    if (!botId) {
      console.error('Keine Bot-ID angegeben')
      return new NextResponse(JSON.stringify({ error: 'Keine Bot-ID angegeben' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Überprüfe, ob der Bot existiert
    const bot = await prisma.bot.findUnique({
      where: { id: botId }
    })

    if (!bot) {
      console.error('Bot nicht gefunden, ID:', botId)
      return new NextResponse(JSON.stringify({ error: 'Bot nicht gefunden' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await req.json()
    console.log('Erhaltene Daten:', data)
    
    // Validiere die Eingabedaten und stelle sicher, dass alle Felder definiert sind
    const {
      primaryColor = '#3b82f6',
      botBgColor = 'rgba(248, 250, 252, 0.8)',
      botTextColor = '#000000',
      botAccentColor = '#3b82f6',
      userBgColor = '',
      userTextColor = '#ffffff',
      enableFeedback = true,
      enableAnalytics = true,
      showSuggestions = true,
      showCopyButton = true
    } = data

    // Erstelle ein Objekt mit allen Werten für den Upsert
    const settingsData = {
      botId,
      primaryColor,
      botBgColor,
      botTextColor,
      botAccentColor,
      userBgColor,
      userTextColor,
      enableFeedback,
      enableAnalytics,
      showSuggestions,
      showCopyButton
    }
    
    console.log('Zu speichernde Einstellungen:', settingsData)

    // Upsert der Bot-Einstellungen (erstellen, falls nicht vorhanden, sonst aktualisieren)
    const settings = await prisma.botSettings.upsert({
      where: { botId },
      create: settingsData,
      update: settingsData
    })
    
    console.log('Einstellungen erfolgreich gespeichert:', settings)

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Fehler beim Aktualisieren der Bot-Einstellungen:', error)
    return new NextResponse(JSON.stringify({ error: 'Interner Serverfehler', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 