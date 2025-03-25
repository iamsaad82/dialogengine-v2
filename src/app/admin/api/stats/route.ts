import { NextResponse } from 'next/server'

// Simulierte Statistik-Daten - später mit realen Daten ersetzen
export async function GET() {
  // In einer realen Anwendung würden diese Daten aus einer Datenbank kommen
  const stats = {
    totalConversations: 124,
    avgResponseTime: '1.2s',
    satisfactionRate: '87%',
    activeUsers: 23,
    questionsAnswered: 543,
    
    recentQuestions: [
      { id: 1, question: "Wann hat das Bürgeramt geöffnet?", timestamp: "Heute, 14:32" },
      { id: 2, question: "Wie beantrage ich einen neuen Personalausweis?", timestamp: "Heute, 13:15" },
      { id: 3, question: "Was kostet ein Anwohnerparkausweis?", timestamp: "Heute, 11:47" },
      { id: 4, question: "Wo kann ich Sperrmüll anmelden?", timestamp: "Gestern, 16:23" },
      { id: 5, question: "Wie lange dauert die Bearbeitung eines Bauantrags?", timestamp: "Gestern, 14:05" },
    ],
    
    topQuestions: [
      { id: 1, question: "Öffnungszeiten Bürgeramt", count: 87 },
      { id: 2, question: "Personalausweis beantragen", count: 73 },
      { id: 3, question: "Anwohnerparkausweis", count: 65 },
      { id: 4, question: "Müllabfuhr Termine", count: 58 },
      { id: 5, question: "Bauanträge", count: 42 },
    ],
    
    // Diese Daten würden normalerweise in einem regelmäßigen Intervall aktualisiert
    lastUpdated: new Date().toISOString(),
  }

  return NextResponse.json(stats)
} 