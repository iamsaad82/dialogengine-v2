import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'
import { Bot } from '@prisma/client'

// GET-Anfrage: Hole Bot-Daten anhand der ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const botId = params.id
  if (!botId) {
    return NextResponse.json(
      { error: 'Bot-ID ist erforderlich' },
      { status: 400 }
    )
  }

  try {
    // Bot aus der Datenbank abrufen
    const bot = await prisma.bot.findUnique({
      where: {
        id: botId
      },
      include: {
        settings: true,
        suggestions: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot nicht gefunden' },
        { status: 404 }
      )
    }

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
  { params }: { params: { id: string } }
) {
  const botId = params.id
  if (!botId) {
    return NextResponse.json(
      { error: 'Bot-ID ist erforderlich' },
      { status: 400 }
    )
  }

  try {
    const { name, description, welcomeMessage, flowiseId, active, settings, suggestions, avatarUrl } = await req.json()

    // Entferne Prompt-Einstellungsfelder, die noch nicht in der Datenbank existieren
    let cleanedSettings = settings;
    if (settings) {
      // Für die Datenbank-Operationen nur die existierenden Felder verwenden
      const { botPersonality, botContext, botScope, offerTip, closedDays, ...dbSettings } = settings;
      cleanedSettings = dbSettings;
      
      console.log('Bereinigte Einstellungen für DB-Update:', cleanedSettings);
      console.log('Entfernte Einstellungen (für zukünftige Verwendung):', { 
        botPersonality, botContext, botScope, offerTip, closedDays 
      });
    }

    // Aktualisieren des Bots in der Datenbank
    const updatedBot = await prisma.bot.update({
      where: {
        id: botId
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(welcomeMessage !== undefined && { welcomeMessage }),
        ...(flowiseId !== undefined && { flowiseId }),
        ...(active !== undefined && { active }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        settings: cleanedSettings ? {
          update: {
            ...(cleanedSettings.primaryColor !== undefined && { primaryColor: cleanedSettings.primaryColor }),
            ...(cleanedSettings.botBgColor !== undefined && { botBgColor: cleanedSettings.botBgColor }),
            ...(cleanedSettings.botTextColor !== undefined && { botTextColor: cleanedSettings.botTextColor }),
            ...(cleanedSettings.botAccentColor !== undefined && { botAccentColor: cleanedSettings.botAccentColor }),
            ...(cleanedSettings.userBgColor !== undefined && { userBgColor: cleanedSettings.userBgColor }),
            ...(cleanedSettings.userTextColor !== undefined && { userTextColor: cleanedSettings.userTextColor }),
            ...(cleanedSettings.enableFeedback !== undefined && { enableFeedback: cleanedSettings.enableFeedback }),
            ...(cleanedSettings.enableAnalytics !== undefined && { enableAnalytics: cleanedSettings.enableAnalytics }),
            ...(cleanedSettings.showSuggestions !== undefined && { showSuggestions: cleanedSettings.showSuggestions }),
            ...(cleanedSettings.showCopyButton !== undefined && { showCopyButton: cleanedSettings.showCopyButton }),
            ...(cleanedSettings.avatarUrl !== undefined && { avatarUrl: cleanedSettings.avatarUrl }),
            ...(cleanedSettings.messageTemplate !== undefined && { messageTemplate: cleanedSettings.messageTemplate }),
          },
        } : undefined
      },
      include: {
        settings: true
      }
    })

    // Aktualisiere Vorschläge getrennt vom Bot-Update
    if (suggestions && Array.isArray(suggestions)) {
      // Lösche vorhandene Vorschläge
      await prisma.botSuggestion.deleteMany({
        where: {
          botId: botId
        }
      });

      // Füge neue Vorschläge hinzu in einer separaten Transaktion
      if (suggestions.length > 0) {
        await prisma.botSuggestion.createMany({
          data: suggestions.map(suggestion => ({
            text: suggestion.text,
            order: suggestion.order || 0,
            isActive: suggestion.isActive !== undefined ? suggestion.isActive : true,
            botId: botId
          }))
        });
      }
    }

    // Lade aktualisierte Daten mit Suggestions
    const updatedBotWithSuggestions = await prisma.bot.findUnique({
      where: {
        id: botId,
      },
      include: {
        settings: true,
        suggestions: {
          orderBy: {
            order: 'asc'
          }
        }
      },
    });

    // Cache revalidieren
    revalidateTag('bots')

    // Aktualisierte Bot-Daten zurückgeben
    return NextResponse.json(updatedBotWithSuggestions)
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