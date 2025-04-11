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

// Hilfsfunktion für Beispiel-Konversationsdaten
function getDummyConversationData(messageId: string) {
  const now = new Date();
  const botName = 'Brandenburg Bot';

  // Beispiel-Konversation
  const dummyMessages = [
    {
      id: 'user1',
      content: 'Wie beantrage ich einen neuen Personalausweis?',
      role: 'user',
      createdAt: new Date(now.getTime() - 1000 * 60 * 10)
    },
    {
      id: 'bot1',
      content: 'Um einen neuen Personalausweis zu beantragen, benötigen Sie folgende Unterlagen:\n\n- Ein aktuelles biometrisches Passfoto\n- Ihren alten Personalausweis (falls vorhanden)\n- Ihre Geburtsurkunde (bei Erstausstellung)\n- Einen Termin beim Bürgerbüro\n\nSie können online einen Termin vereinbaren unter: https://www.brandenburg-havel.de/de/termin\n\nDie Kosten betragen 37,00 € für Personen ab 24 Jahren.',
      role: 'assistant',
      createdAt: new Date(now.getTime() - 1000 * 60 * 9.5)
    },
    {
      id: 'user2',
      content: 'Wie lange dauert die Bearbeitung?',
      role: 'user',
      createdAt: new Date(now.getTime() - 1000 * 60 * 9)
    },
    {
      id: 'bot2',
      content: 'Die Bearbeitungszeit für einen neuen Personalausweis beträgt in der Regel etwa 2-3 Wochen. Nach Eingang Ihres Antrags wird dieser an die Bundesdruckerei weitergeleitet, die den Ausweis herstellt.\n\nSobald Ihr neuer Personalausweis zur Abholung bereit ist, erhalten Sie eine Benachrichtigung. Sie müssen den Ausweis persönlich im Bürgerbüro abholen.',
      role: 'assistant',
      createdAt: new Date(now.getTime() - 1000 * 60 * 8.5)
    },
    {
      id: messageId,
      content: 'Kann ich den Ausweis auch für jemand anderen abholen?',
      role: 'user',
      createdAt: new Date(now.getTime() - 1000 * 60 * 5)
    },
    {
      id: 'bot3',
      content: 'Grundsätzlich müssen Sie Ihren Personalausweis persönlich abholen, da Sie bei der Abholung Ihre PIN für die Online-Ausweisfunktion festlegen und Ihre Fingerabdrücke überprüft werden.\n\nIn Ausnahmefällen kann eine Abholung durch eine bevollmächtigte Person erfolgen, wenn Sie diese mit einer schriftlichen Vollmacht ausstatten. Die bevollmächtigte Person muss sich ausweisen können und Ihre Vollmacht vorlegen.\n\nBitte beachten Sie, dass in diesem Fall die Online-Ausweisfunktion deaktiviert bleibt, da Sie persönlich anwesend sein müssen, um die PIN festzulegen.',
      role: 'assistant',
      createdAt: new Date(now.getTime() - 1000 * 60 * 4.5)
    }
  ];

  return {
    id: 'conv123',
    messageId: messageId,
    botName: botName,
    botAvatar: null,
    question: 'Kann ich den Ausweis auch für jemand anderen abholen?',
    createdAt: new Date(now.getTime() - 1000 * 60 * 5),
    formattedDate: formatTimestamp(new Date(now.getTime() - 1000 * 60 * 5)),
    messages: dummyMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      formattedDate: formatTimestamp(msg.createdAt)
    }))
  };
}

export async function GET(request: Request) {
  console.log('Conversation API - Anfrage erhalten');
  const { searchParams } = new URL(request.url)
  const messageId = searchParams.get('messageId')

  console.log(`Conversation API - Parameter: messageId=${messageId}`);

  try {
    if (!messageId) {
      return NextResponse.json({ error: 'messageId ist erforderlich' }, { status: 400 })
    }

    // Verwende Beispieldaten für die Entwicklung
    const useDummyData = true;

    if (useDummyData) {
      console.log('Conversation API - Verwende Beispieldaten');
      return NextResponse.json(getDummyConversationData(messageId));
    }

    // Suche zuerst die Nachricht anhand der ID
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            bot: {
              select: {
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Nachricht nicht gefunden' }, { status: 404 })
    }

    // Finde alle Nachrichten dieser Konversation
    const allMessages = await prisma.message.findMany({
      where: {
        conversationId: message.conversationId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Formatierte Antwort
    return NextResponse.json({
      id: message.conversationId,
      messageId: message.id,
      botName: message.conversation.bot.name,
      botAvatar: message.conversation.bot.avatarUrl,
      question: message.content,
      createdAt: message.createdAt,
      formattedDate: formatTimestamp(message.createdAt),
      messages: allMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        formattedDate: formatTimestamp(msg.createdAt)
      }))
    })

  } catch (error) {
    console.error('Fehler beim Abrufen der Konversationsdetails:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Laden der Konversationsdetails',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}