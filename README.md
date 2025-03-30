# Brandenburg Dialog - Web-Client

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Funktionen

### Bot-Vorschläge

Die Anwendung unterstützt jetzt Vorschlags-Fragen für Bots, die Nutzern helfen, schnell typische Fragen zu stellen.

#### Vorschläge verwalten

1. Navigieren Sie im Admin-Bereich zu einem Bot und wählen Sie die Einstellungen.
2. Wechseln Sie zum Tab "Vorschläge".
3. Hier können Sie neue Vorschläge hinzufügen, bestehende Vorschläge bearbeiten, deren Reihenfolge ändern oder deaktivieren.

#### Vorschläge aktivieren/deaktivieren

Die Anzeige der Vorschläge kann global für einen Bot aktiviert oder deaktiviert werden:

1. Wechseln Sie zum Tab "Design & Erscheinungsbild".
2. Aktivieren oder deaktivieren Sie die Option "Vorschläge anzeigen".

#### Funktionsweise

- Vorschläge werden nur angezeigt, wenn der Chat neu geöffnet wird und noch keine Nachrichten gesendet wurden.
- Durch Klicken auf einen Vorschlag wird die entsprechende Frage automatisch in den Chat eingefügt und sofort gesendet.
- Inaktive Vorschläge werden nicht angezeigt, können aber im Admin-Bereich verwaltet werden.
- Die Reihenfolge der Vorschläge kann im Admin-Bereich konfiguriert werden.

#### Technische Details

- Vorschläge werden in der Datenbank in der Tabelle `BotSuggestion` gespeichert.
- Jeder Vorschlag ist mit einem bestimmten Bot verknüpft und hat eine definierte Reihenfolge.
- Vorschläge können über die API-Endpunkte für Bot-Verwaltung zusammen mit den Bot-Einstellungen verwaltet werden.
