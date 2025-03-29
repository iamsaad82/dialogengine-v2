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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const messageId = searchParams.get('messageId')
  
  try {
    if (!messageId) {
      return NextResponse.json({ error: 'messageId ist erforderlich' }, { status: 400 })
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