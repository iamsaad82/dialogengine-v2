# Chatbot Stadtverwaltung Brandenburg an der Havel

## 🎯 Projektziel
Entwicklung eines modernen, KI-gestützten Chatbots für die Stadtverwaltung Brandenburg an der Havel, der Bürgeranfragen effizient und intelligent beantwortet.

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 15.1.7 mit React 19
- **Styling:** 
  - Tailwind CSS v4
  - tw-animate-css
  - Framer Motion für Mikroanimationen
  - shadcn/ui (v4-kompatibel)
    - Neue `@theme` Direktive
    - Optimierte Dark Mode Farben in OKLCH
    - Verbesserte Komponenten ohne forwardRef

### Backend & Datenbank
- **Chatflow:** Flowise (gehostet auf Render)
- **Wissensdatenbank:** Weaviate
- **API-Layer:** Next.js API Routes mit Edge Runtime

## 💡 Features

### Chat-Interface
- **Drei Anzeigemodi:**
  - Inline Content Integration
  - Chat-Bubble (rechts unten)
  - Fullscreen-Toggle (Toggle mit Klassisch und Dialog)
- **Streaming-Unterstützung:** (Erstmal nach hinten gestellt)
  - Echtzeit-Antworten
  - Typing-Indikator
  - Unterbrechbare Streams

### UI/UX
- **Moderne Gestaltung:**
  - Mikroanimationen für Interaktionen
  - Smooth Transitions
  - Responsive Design
  - Barrierefreiheit (WCAG 2.1)
- **Chat-Features:**
  - Markdown-Rendering
  - Code-Highlighting
  - Link-Erkennung
  - Dateianhänge-Support

### Benutzerfreundlichkeit
- **Chat-Funktionen:**
  - Willkommensnachricht
  - Vorgeschlagene Fragen
  - Feedback-System
  - Chat-History (nicht nötig)
  - Kopier-Funktion
  - "Scroll to Bottom" Button

## 📊 Analytics & Reporting

### Lunary Integration
- **Performance Monitoring:**
  - Core Web Vitals
  - API-Response-Zeiten
  - Fehler-Tracking
- **Chat-Analyse:**
  - Nutzungsstatistiken
  - Antwortzeiten
  - Erfolgsraten

### Automatische Reports
- **Nutzungsstatistiken:**
  - Top 10 häufigste Fragen
  - Tageszeit-basierte Analyse
  - Gesprächsdauer-Metriken
- **Themen-Analyse:**
  - Kategorisierung nach Verwaltungsbereichen
  - Saisonale Trends
  - Wissenslücken-Identifikation

### Export & Dashboard
- **Berichtsformate:**
  - PDF-Reports
  - Excel/CSV-Export
  - Automatischer E-Mail-Versand
- **Verwaltungs-Dashboard:**
  - Echtzeit-Übersicht
  - Trend-Erkennung
  - Wissensdatenbank-Updates

## 🔧 Konfiguration

### Umgebungsvariablen
```env
NEXT_PUBLIC_FLOWISE_URL=
FLOWISE_CHATFLOW_ID=
WEAVIATE_URL=
WEAVIATE_API_KEY=
LUNARY_TOKEN=
```

### Design-System
- **Farben:**
  - Primary: Stadt-CI
  - Secondary: Stadt-CI
  - Accent: Stadt-CI
  - Neutral: OKLCH-basierte Graustufen

### CSS-Struktur
```css
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(0 0% 3.9%);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

## 🔒 Sicherheit & Datenschutz
- DSGVO-konform
- Anonymisierte Datenerfassung
- Verschlüsselte Übertragung
- Automatische Datenlöschung
- Cookie-Richtlinien-konform

## 📱 Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 📈 Performance-Ziele
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Lighthouse Score: > 90

## 🚀 Deployment
- Frontend: Render
- Flowise: Render
- Weaviate: Weaviate Cloud
- Monitoring: Lunary

## 📋 Nächste Schritte
1. [ ] Projekt-Setup mit Next.js 15
2. [ ] Basis-UI-Komponenten erstellen
3. [ ] Flowise-Integration
4. [ ] Weaviate-Anbindung
5. [ ] Chat-Logik implementieren
6. [ ] Animations & Polish
7. [ ] Testing & QA
8. [ ] Lunary Setup
9. [ ] Dokumentation
10. [ ] Deployment

## 🧪 Testing
- Jest für Unit Tests
- Cypress für E2E Tests
- Lighthouse für Performance
- WCAG für Barrierefreiheit

## 📚 Dokumentation
- Technische Dokumentation
- Integrations-Guide
- Wartungs-Handbuch
- Benutzer-Guide für Verwaltung

---

*Letzte Aktualisierung: [DATUM]*