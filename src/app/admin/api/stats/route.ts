import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Hilfsfunktion zum Formatieren von Zeitstempeln für die Anzeige
function formatTimestamp(date: Date): string {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const isToday = date.toDateString() === now.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) {
    return `Heute, ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
  } else if (isYesterday) {
    return `Gestern, ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) +
           `, ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
  }
}

// Hilfsfunktion für das Abrufen von Daten in einem bestimmten Zeitraum
function getDateFilter(timeRange: string) {
  const now = new Date()
  let startDate = new Date()

  switch (timeRange) {
    case '1d':
      startDate.setDate(now.getDate() - 1)
      break
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    case '90d':
      startDate.setDate(now.getDate() - 90)
      break
    default:
      startDate.setDate(now.getDate() - 7) // Standard: 7 Tage
  }

  return {
    gte: startDate
  }
}

// Hilfsfunktion für Beispieldaten
function getDummyStatsData(botId: string | null, timeRange: string) {
  const now = new Date();

  // Beispiel-Bots
  const dummyBots = [
    { id: 'bot1', name: 'Brandenburg Bot', active: true },
    { id: 'bot2', name: 'Stadtinfo Bot', active: true },
    { id: 'bot3', name: 'Testbot', active: false }
  ];

  // Beispiel-Fragen
  const dummyQuestions = [
    { question: 'Wie beantrage ich einen neuen Personalausweis?', count: 42 },
    { question: 'Öffnungszeiten des Bürgerbüros?', count: 38 },
    { question: 'Wo kann ich einen Termin vereinbaren?', count: 27 },
    { question: 'Kosten für einen Reisepass?', count: 21 },
    { question: 'Anmeldung Kindergarten', count: 18 }
  ];

  // Beispiel für aktuelle Fragen
  const dummyRecentQuestions = [
    { id: 'msg1', question: 'Wie beantrage ich Elterngeld?', timestamp: formatTimestamp(new Date(now.getTime() - 1000 * 60 * 5)), botId: 'bot1', botName: 'Brandenburg Bot' },
    { id: 'msg2', question: 'Wann ist die nächste Stadtratssitzung?', timestamp: formatTimestamp(new Date(now.getTime() - 1000 * 60 * 30)), botId: 'bot1', botName: 'Brandenburg Bot' },
    { id: 'msg3', question: 'Wo finde ich Informationen zur Hundesteuer?', timestamp: formatTimestamp(new Date(now.getTime() - 1000 * 60 * 120)), botId: 'bot2', botName: 'Stadtinfo Bot' },
    { id: 'msg4', question: 'Wie kann ich Sperrmüll anmelden?', timestamp: formatTimestamp(new Date(now.getTime() - 1000 * 60 * 240)), botId: 'bot1', botName: 'Brandenburg Bot' },
    { id: 'msg5', question: 'Öffnungszeiten der Bibliothek?', timestamp: formatTimestamp(new Date(now.getTime() - 1000 * 60 * 360)), botId: 'bot2', botName: 'Stadtinfo Bot' }
  ];

  // Zeitreihendaten für die letzten 7 Tage
  const dailyData = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    return {
      date: date.toISOString().split('T')[0],
      conversations: Math.floor(Math.random() * 30) + 5
    };
  });

  // Bot-Statistiken
  const botStats = dummyBots.map(bot => ({
    id: bot.id,
    name: bot.name,
    active: bot.active,
    stats: {
      conversationCount: Math.floor(Math.random() * 100) + 20,
      messageCount: Math.floor(Math.random() * 500) + 100,
      avgMessagesPerConversation: ((Math.random() * 3) + 2).toFixed(1)
    }
  }));

  // Gesamtstatistiken
  const systemStats = {
    totalBots: dummyBots.length,
    totalConversations: 187,
    uniqueUsers: 142,
    averageResponseTime: '1.2s',
    successRate: '92%',
    userMessages: 432,
    botMessages: 587
  };

  return {
    systemStats,
    topQuestions: dummyQuestions,
    recentQuestions: dummyRecentQuestions,
    bots: botStats,
    timeSeries: {
      daily: dailyData
    },
    meta: {
      timeRange,
      botId: botId || 'all',
      lastUpdated: new Date().toISOString()
    }
  };
}

export async function GET(request: Request) {
  console.log('Admin Stats API - Anfrage erhalten');
  const { searchParams } = new URL(request.url)
  const botId = searchParams.get('botId')
  const timeRange = searchParams.get('timeRange') || '7d'

  console.log(`Admin Stats API - Parameter: botId=${botId}, timeRange=${timeRange}`);

  // Wenn keine echten Daten vorhanden sind, geben wir Beispieldaten zurück
  // Dies ist nützlich für die Entwicklung und wenn die Datenbank leer ist
  const useDummyData = true; // Auf false setzen, um echte Daten zu verwenden

  try {
    // Wenn wir Beispieldaten verwenden sollen, geben wir diese zurück
    if (useDummyData) {
      console.log('Admin Stats API - Verwende Beispieldaten');
      return NextResponse.json(getDummyStatsData(botId, timeRange));
    }

    // Zeitfilter basierend auf timeRange
    const dateFilter = getDateFilter(timeRange)

    // Gesamtzahl der Bots
    const totalBots = await prisma.bot.count()

    // Gesamtzahl der Konversationen (mit optionalem Bot-Filter und Zeitfilter)
    const conversationFilter: any = {
      createdAt: dateFilter
    }
    // Setze den botId Filter nur, wenn ein spezifischer Bot ausgewählt wurde (nicht 'all')
    if (botId && botId !== 'all') {
      conversationFilter.botId = botId
    }

    const totalConversations = await prisma.conversation.count({
      where: conversationFilter
    })

    // Anzahl einzigartiger Nutzer
    const uniqueUsers = await prisma.conversation.groupBy({
      by: ['sessionId'],
      where: conversationFilter
    }).then(results => results.length)

    // Anzahl der Nachrichten pro Rolle
    const userMessages = await prisma.message.count({
      where: {
        role: 'user',
        conversation: conversationFilter
      }
    })

    const botMessages = await prisma.message.count({
      where: {
        role: 'assistant',
        conversation: conversationFilter
      }
    })

    // Häufige Fragen analysieren
    const topQuestions = await prisma.message.groupBy({
      by: ['content'],
      where: {
        role: 'user',
        conversation: conversationFilter
      },
      _count: {
        content: true
      },
      orderBy: {
        _count: {
          content: 'desc'
        }
      },
      take: 5
    })

    // Neueste Fragen
    const recentMessages = await prisma.message.findMany({
      where: {
        role: 'user',
        conversation: conversationFilter
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        conversation: {
          select: {
            botId: true,
            bot: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Statistiken pro Bot abrufen
    const botStats = await prisma.bot.findMany({
      include: {
        conversations: {
          where: {
            createdAt: dateFilter
          },
          include: {
            _count: {
              select: {
                messages: true
              }
            }
          }
        }
      }
    })

    // Antwortzeiten berechnen (vereinfachtes Beispiel)
    const averageResponseTime = '1.5s' // In einer echten Implementierung würde dies aus den Daten berechnet

    // Erfolgsrate schätzen (basierend auf der Anzahl der Nachrichten pro Konversation)
    let successRate = 85
    if (userMessages > 0) {
      // Wenn eine Konversation mehrere Bot-Antworten hat, betrachten wir sie als erfolgreicher
      const successRatio = botMessages / userMessages
      successRate = Math.min(100, Math.round(successRatio * 100))
    }

    // Daten für Bot-Statistiken aufbereiten
    const formattedBotStats = botStats.map(bot => {
      const conversationCount = bot.conversations.length
      const messageCount = bot.conversations.reduce((sum, conv) => sum + conv._count.messages, 0)

      return {
        id: bot.id,
        name: bot.name,
        active: bot.active,
        stats: {
          conversationCount,
          messageCount,
          avgMessagesPerConversation: conversationCount > 0
            ? (messageCount / conversationCount).toFixed(1)
            : '0'
        }
      }
    })

    // Antwort mit allen zusammengestellten Statistiken
    return NextResponse.json({
      systemStats: {
        totalBots,
        totalConversations,
        uniqueUsers,
        averageResponseTime,
        successRate: `${successRate}%`,
        userMessages,
        botMessages,
      },

      topQuestions: topQuestions.map(q => ({
        question: q.content.length > 60 ? q.content.substring(0, 60) + '...' : q.content,
        count: q._count.content
      })),

      recentQuestions: recentMessages.map(m => ({
        id: m.id,
        question: m.content.length > 60 ? m.content.substring(0, 60) + '...' : m.content,
        timestamp: formatTimestamp(m.createdAt),
        botId: m.conversation.botId,
        botName: m.conversation.bot.name
      })),

      bots: formattedBotStats,

      // Zeitreihendaten (in einer echten Implementierung würden hier tatsächliche Zeitreihendaten zurückgegeben)
      timeSeries: {
        daily: Array(7).fill(0).map((_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - 6 + i)
          return {
            date: date.toISOString().split('T')[0],
            conversations: Math.floor(Math.random() * 30) + 5
          }
        })
      },

      meta: {
        timeRange,
        botId: botId || 'all',
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Dashboard-Statistiken:', error)

    // Detaillierte Fehlerinformationen für Debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    };

    console.error('Admin Stats API - Fehlerdetails:', errorDetails);

    return NextResponse.json(
      {
        error: 'Fehler beim Laden der Statistikdaten',
        details: errorDetails.message
      },
      { status: 500 }
    )
  }
}