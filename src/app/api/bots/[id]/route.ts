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
    const { name, description, welcomeMessage, flowiseId, active, settings, suggestions } = await req.json()

    // Aktualisieren des Bots in der Datenbank
    const updatedBot = await prisma.bot.update({
      where: {
        id: botId
      },
      data: {
        name,
        description,
        welcomeMessage,
        flowiseId,
        active,
        settings: {
          update: {
            primaryColor: settings?.primaryColor || '#3b82f6',
            // Überprüfe jedes Feld, bevor es aktualisiert wird
            ...(settings?.chatBgColor !== undefined && { chatBgColor: settings?.chatBgColor }),
            ...(settings?.botBgColor !== undefined && { botBgColor: settings?.botBgColor }),
            ...(settings?.userBgColor !== undefined && { userBgColor: settings?.userBgColor }),
            ...(settings?.botTextColor !== undefined && { botTextColor: settings?.botTextColor }),
            ...(settings?.userTextColor !== undefined && { userTextColor: settings?.userTextColor }),
            ...(settings?.showSuggestions !== undefined && { showSuggestions: settings?.showSuggestions }),
            ...(settings?.position !== undefined && { position: settings?.position }),
            ...(settings?.maxWidth !== undefined && { maxWidth: settings?.maxWidth }),
            ...(settings?.botAvatarUrl !== undefined && { botAvatarUrl: settings?.botAvatarUrl }),
            ...(settings?.userAvatarUrl !== undefined && { userAvatarUrl: settings?.userAvatarUrl }),
            ...(settings?.useStreaming !== undefined && { useStreaming: settings?.useStreaming }),
          },
        },
      },
      include: {
        settings: true
      }
    })

    // Aktualisiere Vorschläge
    if (suggestions && Array.isArray(suggestions)) {
      // Lösche vorhandene Vorschläge
      await prisma.botSuggestion.deleteMany({
        where: {
          botId: botId
        }
      });

      // Füge neue Vorschläge hinzu
      for (const suggestion of suggestions) {
        // Ignoriere temporäre IDs, die mit "temp-" beginnen
        if (suggestion.id && suggestion.id.startsWith('temp-')) {
          await prisma.botSuggestion.create({
            data: {
              text: suggestion.text,
              order: suggestion.order,
              isActive: suggestion.isActive,
              botId: botId
            }
          });
        } else if (suggestion.id) {
          // Bestehende Vorschläge aktualisieren falls vorhanden (sollte nicht vorkommen, da wir alle gelöscht haben)
          await prisma.botSuggestion.upsert({
            where: {
              id: suggestion.id
            },
            update: {
              text: suggestion.text,
              order: suggestion.order,
              isActive: suggestion.isActive
            },
            create: {
              text: suggestion.text,
              order: suggestion.order,
              isActive: suggestion.isActive,
              botId: botId
            }
          });
        }
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