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
        messageTemplate: 'default',
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
    
    // Prüfe, ob die Einstellungen in einem verschachtelten "settings"-Objekt sind
    const settingsData = data.settings || data
    
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
      showCopyButton = true,
      messageTemplate: rawMessageTemplate = 'default',
      avatarUrl,
      // Prompt-Einstellungen für Flowise (noch nicht in DB)
      botPersonality,
      botContext,
      botScope,
      offerTip,
      closedDays
    } = settingsData

    // Stelle sicher, dass messageTemplate nicht leer ist
    const messageTemplate = rawMessageTemplate === '' ? 'default' : rawMessageTemplate;

    // Erstelle ein Objekt mit allen Werten für den Upsert
    // Nur die Werte, die in der Datenbank existieren
    const settingsToSave: any = {
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
      showCopyButton,
      messageTemplate
    }
    
    // Wenn ein Avatar-URL angegeben wurde, füge es hinzu
    if (avatarUrl !== undefined) {
      settingsToSave.avatarUrl = avatarUrl;
    }
    
    // Speichere die Prompt-Einstellungen im Log für Entwicklungszwecke
    // Diese werden später in der Datenbank integriert
    if (botPersonality || botContext || botScope || offerTip || closedDays) {
      console.log('Prompt-Einstellungen für zukünftige Verwendung:', { 
        botPersonality, botContext, botScope, offerTip, closedDays 
      });
    }
    
    console.log('Zu speichernde Einstellungen:', settingsToSave)

    try {
      // Upsert der Bot-Einstellungen (erstellen, falls nicht vorhanden, sonst aktualisieren)
      const settings = await prisma.botSettings.upsert({
        where: { botId },
        create: settingsToSave,
        update: settingsToSave
      })
      
      console.log('Einstellungen erfolgreich gespeichert:', settings)
  
      return NextResponse.json(settings)
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren der Bot-Einstellungen:', error)
      // Wenn das Feld nicht existiert, versuche es erneut ohne avatarUrl
      if (error.message.includes('Unknown argument `avatarUrl`')) {
        console.log('avatarUrl wird nicht unterstützt, versuche ohne...')
        delete settingsToSave.avatarUrl;
        
        const settings = await prisma.botSettings.upsert({
          where: { botId },
          create: settingsToSave,
          update: settingsToSave
        })
        
        console.log('Einstellungen erfolgreich gespeichert (ohne avatarUrl):', settings)
        
        // Wenn die Datenbank das Feld noch nicht kennt, speichern wir den Avatar-URL in der Bot-Entität
        if (avatarUrl) {
          try {
            await prisma.bot.update({
              where: { id: botId },
              data: { avatarUrl }
            });
            console.log('Avatar-URL im Bot-Objekt gespeichert')
          } catch (botError) {
            console.error('Fehler beim Aktualisieren des Bot-Avatars:', botError)
          }
        }
        
        return NextResponse.json(settings)
      }
      
      return new NextResponse(JSON.stringify({ error: 'Interner Serverfehler', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error: any) {
    console.error('Fehler beim Aktualisieren der Bot-Einstellungen:', error)
    return new NextResponse(JSON.stringify({ error: 'Interner Serverfehler', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 