import { NextResponse } from 'next/server'

export async function GET() {
  // Simulierte Einstellungen - später mit realen Daten ersetzen
  const settings = {
    botName: "Brandenburg Dialog",
    welcomeMessage: "Willkommen! Wie kann ich Ihnen mit Informationen zur Stadtverwaltung Brandenburg an der Havel helfen?",
    enableFeedback: true,
    enableAnalytics: true,
    appearance: {
      primaryColor: "#e63946",
      textColor: "#1d3557",
      fontFamily: "Inter, sans-serif"
    },
    system: {
      maxTokens: 2000,
      temperature: 0.7,
      presencePenalty: 0.6
    }
  }

  return NextResponse.json(settings)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // In einer realen Anwendung würden hier die Einstellungen gespeichert werden
    console.log("Einstellungen gespeichert:", data)
    
    return NextResponse.json({ 
      success: true, 
      message: "Einstellungen erfolgreich gespeichert"
    })
  } catch (error) {
    console.error("Fehler beim Speichern der Einstellungen:", error)
    return NextResponse.json(
      { success: false, message: "Fehler beim Speichern der Einstellungen" },
      { status: 500 }
    )
  }
} 