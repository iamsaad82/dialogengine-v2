'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon, AlertCircle, Copy, ExternalLink, Settings2, EyeIcon, Eye, Smartphone, Monitor, CheckCircle2, HelpCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface Bot {
  id: string
  name: string
  description: string | null
  active: boolean
  settings?: {
    primaryColor: string
    enableFeedback: boolean
    enableAnalytics: boolean
    showSuggestions: boolean
    showCopyButton: boolean
    botBgColor: string
    botTextColor: string
    userBgColor: string
    userTextColor: string
    messageTemplate?: string
    avatarUrl?: string
  }
}

export default function EmbedGenerator() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('standard')
  const [initialMode, setInitialMode] = useState<'bubble' | 'inline' | 'fullscreen'>('bubble')
  const [primaryColor, setPrimaryColor] = useState('#e63946')
  const [height, setHeight] = useState('500')
  const [width, setWidth] = useState('100%')
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')
  const [bubbleSize, setBubbleSize] = useState('60')
  const [offsetX, setOffsetX] = useState('20')
  const [offsetY, setOffsetY] = useState('20')
  const [chatWidth, setChatWidth] = useState('480')
  const [chatHeight, setChatHeight] = useState('700')
  const [embedCode, setEmbedCode] = useState('')
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBotId, setSelectedBotId] = useState<string>('')
  const [zIndex, setZIndex] = useState('')
  const [streamingEnabled, setStreamingEnabled] = useState(true)
  const [codeCopied, setCodeCopied] = useState(false)
  const [isMobilePreview, setIsMobilePreview] = useState(false)
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null)
  const [previewHtml, setPreviewHtml] = useState('')

  // Lade verfügbare Bots
  useEffect(() => {
    const fetchBots = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/bots')

        if (!response.ok) {
          throw new Error('Fehler beim Laden der Bots')
        }

        const data = await response.json()
        setBots(data)

        // Setze den ersten aktiven Bot als Standard, wenn verfügbar
        if (data.length > 0) {
          const activeBot = data.find((bot: Bot) => bot.active) || data[0]
          setSelectedBotId(activeBot.id)
          setSelectedBot(activeBot)

          // Wenn der Bot eine Primärfarbe hat, setze diese
          if (activeBot.settings?.primaryColor) {
            setPrimaryColor(activeBot.settings.primaryColor)
          }
        }

        setError(null)
      } catch (err) {
        console.error('Fehler beim Laden der Bots:', err)
        setError('Bots konnten nicht geladen werden')
      } finally {
        setLoading(false)
      }
    }

    fetchBots()
  }, [])

  // Update des ausgewählten Bots, wenn sich die Bot-ID ändert
  useEffect(() => {
    if (selectedBotId && bots.length > 0) {
      const bot = bots.find(bot => bot.id === selectedBotId)
      setSelectedBot(bot || null)

      // Aktualisiere alle Farbwerte und Einstellungen aus den Bot-Einstellungen
      if (bot?.settings) {
        // Primärfarbe aktualisieren
        if (bot.settings.primaryColor) {
          setPrimaryColor(bot.settings.primaryColor)
        }

        // Weitere Bot-Einstellungen im UI-Zustand aktualisieren
        setStreamingEnabled(true); // Standard: Streaming aktiviert

        // Aktualisiere hier weitere relevante Einstellungen für die Vorschau
        console.log('Bot-Einstellungen aktualisiert:', bot.settings)
      }
    }
  }, [selectedBotId, bots])

  // Funktion zum Aktualisieren von Bot-Einstellungen für die Vorschau
  const updateBotSetting = (setting: string, value: boolean) => {
    if (!selectedBot || !selectedBot.settings) return;

    // Tiefe Kopie des Bots und seiner Einstellungen erstellen
    const updatedBot: Bot = {
      ...selectedBot,
      settings: {
        ...selectedBot.settings,
        [setting]: value
      }
    };

    setSelectedBot(updatedBot);
  };

  // Generiert den Embed-Code basierend auf den Einstellungen
  const generateEmbedCode = () => {
    // Base URL für das Skript
    const baseUrl = window.location.origin;

    // URL mit Parametern statt data-Attributen
    const scriptUrl = new URL(`${baseUrl}/api/embed`);

    // Parameter direkt in die URL einfügen
    if (selectedBotId) {
      scriptUrl.searchParams.append('botId', selectedBotId);
    }
    scriptUrl.searchParams.append('mode', initialMode);
    scriptUrl.searchParams.append('color', primaryColor.replace('#', '%23')); // Einfache URL-Kodierung für #
    scriptUrl.searchParams.append('streaming', streamingEnabled.toString());

    if (initialMode === 'bubble') {
      scriptUrl.searchParams.append('position', position);

      // Erweiterte Optionen nur hinzufügen, wenn sie verändert wurden
      if (bubbleSize !== '60') scriptUrl.searchParams.append('bubbleSize', bubbleSize);
      if (offsetX !== '20') scriptUrl.searchParams.append('offsetX', offsetX);
      if (offsetY !== '20') scriptUrl.searchParams.append('offsetY', offsetY);
      if (chatWidth !== '480') scriptUrl.searchParams.append('chatWidth', chatWidth);
      if (chatHeight !== '700') scriptUrl.searchParams.append('chatHeight', chatHeight);
    }

    // Z-Index hinzufügen, wenn angegeben
    if (zIndex) scriptUrl.searchParams.append('zIndex', zIndex);

    // Message Template hinzufügen, wenn der Bot eines hat
    if (selectedBot?.settings?.messageTemplate && selectedBot.settings.messageTemplate !== 'default') {
      scriptUrl.searchParams.append('messageTemplate', selectedBot.settings.messageTemplate);
    }

    // Vorschläge-Anzeige hinzufügen
    if (selectedBot?.settings?.showSuggestions !== undefined) {
      scriptUrl.searchParams.append('showSuggestions', selectedBot.settings.showSuggestions.toString());
    }

    // Feedback-Option hinzufügen
    if (selectedBot?.settings?.enableFeedback !== undefined) {
      scriptUrl.searchParams.append('enableFeedback', selectedBot.settings.enableFeedback.toString());
    }

    // Kopieren-Button-Option hinzufügen
    if (selectedBot?.settings?.showCopyButton !== undefined) {
      scriptUrl.searchParams.append('showCopyButton', selectedBot.settings.showCopyButton.toString());
    }

    const code = `<!-- Dialog Engine Chat Widget -->
<div id="dialog-container"
  data-mode="${initialMode}"
  data-color="${primaryColor}"
  data-position="${position}"
  data-bot-id="${selectedBotId}"
  data-streaming="${streamingEnabled}"
  data-initial-dialog-mode="true"
  ${selectedBot?.settings?.showSuggestions !== undefined ? `data-show-suggestions="${selectedBot.settings.showSuggestions}"` : ''}
  ${selectedBot?.settings?.enableFeedback !== undefined ? `data-enable-feedback="${selectedBot.settings.enableFeedback}"` : ''}
  ${selectedBot?.settings?.showCopyButton !== undefined ? `data-show-copy-button="${selectedBot.settings.showCopyButton}"` : ''}
  ${selectedBot?.settings?.messageTemplate && selectedBot.settings.messageTemplate !== 'default' ?
    `data-message-template="${selectedBot.settings.messageTemplate}"` : ''}
  ${zIndex ? `data-z-index="${zIndex}"` : ''}
  ${initialMode === 'bubble' ? '' : `style="width: ${width}; height: ${initialMode === 'inline' ? height + 'px' : '100%'}; position: relative; border-radius: 12px; overflow: hidden;"`}
></div>
<script src="${scriptUrl.toString()}" defer></script>`;

    return code;
  }

  // Aktualisiere den Embed-Code und die Vorschau, wenn sich die Einstellungen ändern
  useEffect(() => {
    const code = generateEmbedCode();
    setEmbedCode(code);

    // Erstelle HTML für die iFrame-Vorschau
    const previewHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bot-Vorschau</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f9fafb;
      height: ${isMobilePreview ? '100%' : '100vh'};
      width: ${isMobilePreview ? '100%' : '100%'};
      box-sizing: border-box;
    }
    h1 {
      font-size: ${isMobilePreview ? '1.5rem' : '2rem'};
      color: #111827;
    }
    p {
      color: #4b5563;
      line-height: 1.6;
    }
    .content {
      max-width: ${isMobilePreview ? '100%' : '800px'};
      margin: 0 auto;
    }
    .placeholder {
      margin-top: 2rem;
      padding: 1rem;
      background-color: #e5e7eb;
      border-radius: 0.5rem;
      height: 100px;
    }
  </style>
</head>
<body>
  <div class="content">
    <h1>Beispielseite für Bot-Vorschau</h1>
    <p>
      Hier sehen Sie eine Beispielseite mit dem eingebetteten Bot.
      Sie können die verschiedenen Einstellungen und Platzierungen testen.
    </p>
    <div class="placeholder">Platzhalterinhalt</div>
    <p>
      Dieser Text dient nur der Demonstration, um die Seite zu füllen und
      den Bot in verschiedenen Szenarien zu testen.
    </p>
    <div class="placeholder">Weiterer Platzhalterinhalt</div>
  </div>

  ${code}
</body>
</html>
    `;

    setPreviewHtml(previewHtml);
  }, [initialMode, primaryColor, position, height, width, selectedBotId,
    bubbleSize, offsetX, offsetY, chatWidth, chatHeight, zIndex, streamingEnabled, isMobilePreview]);

  // Funktion zum Kopieren des Codes
  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Funktion zur Anzeige der Vorschau
  const showPreview = () => {
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bot-Einbettung generieren</h1>
          <p className="text-muted-foreground">Erstellen Sie einen Einbettungscode für Ihre Website</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/bots')}>
          <Settings2 className="w-4 h-4 mr-2" />
          Bots verwalten
        </Button>
      </div>

      {/* Haupt-UI-Bereich */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Linke Spalte - Einstellungen */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>1. Bot auswählen</CardTitle>
              <CardDescription>
                Wählen Sie den Bot aus, der auf Ihrer Website eingebettet werden soll
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-24 bg-muted/20 rounded-md">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className="ml-2">Bots werden geladen...</span>
                </div>
              ) : bots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center bg-muted/20 rounded-md">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium">Keine Bots verfügbar</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Erstellen Sie zuerst einen Bot, bevor Sie einen Einbettungscode generieren.
                  </p>
                  <Button variant="default" className="mt-4" onClick={() => router.push('/admin/bots/new')}>
                    Bot erstellen
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-6">
                    <div>
                      <Label htmlFor="bot-select">Bot</Label>
                      <div className="relative">
                        <select
                          id="bot-select"
                          value={selectedBotId}
                          onChange={(e) => setSelectedBotId(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        >
                          {bots.map(bot => (
                            <option key={bot.id} value={bot.id}>
                              {bot.name} {!bot.active && '(inaktiv)'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedBot && (
                      <div className="rounded-md border p-4 bg-muted/10">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <InfoIcon className="w-4 h-4 mr-1 text-muted-foreground" />
                          Bot-Einstellungen
                        </h3>
                        <dl className="text-sm divide-y">
                          <div className="grid grid-cols-3 py-2">
                            <dt className="font-medium text-muted-foreground">Primärfarbe</dt>
                            <dd className="col-span-2 flex items-center">
                              <div
                                className="w-4 h-4 mr-2 rounded-full border"
                                style={{ backgroundColor: selectedBot.settings?.primaryColor || '#3b82f6' }}
                              />
                              {selectedBot.settings?.primaryColor || '#3b82f6'}
                            </dd>
                          </div>
                          <div className="grid grid-cols-3 py-2">
                            <dt className="font-medium text-muted-foreground">Vorschläge</dt>
                            <dd className="col-span-2 flex justify-between items-center">
                              <span>{selectedBot.settings?.showSuggestions ? 'Aktiviert' : 'Deaktiviert'}</span>
                              <button
                                onClick={() => updateBotSetting('showSuggestions', !selectedBot.settings?.showSuggestions)}
                                className="text-xs px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary"
                              >
                                {selectedBot.settings?.showSuggestions ? 'Deaktivieren' : 'Aktivieren'}
                              </button>
                            </dd>
                          </div>
                          <div className="grid grid-cols-3 py-2">
                            <dt className="font-medium text-muted-foreground">Feedback</dt>
                            <dd className="col-span-2 flex justify-between items-center">
                              <span>{selectedBot.settings?.enableFeedback ? 'Aktiviert' : 'Deaktiviert'}</span>
                              <button
                                onClick={() => updateBotSetting('enableFeedback', !selectedBot.settings?.enableFeedback)}
                                className="text-xs px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary"
                              >
                                {selectedBot.settings?.enableFeedback ? 'Deaktivieren' : 'Aktivieren'}
                              </button>
                            </dd>
                          </div>
                          <div className="grid grid-cols-3 py-2">
                            <dt className="font-medium text-muted-foreground">Kopier-Button</dt>
                            <dd className="col-span-2 flex justify-between items-center">
                              <span>{selectedBot.settings?.showCopyButton ? 'Aktiviert' : 'Deaktiviert'}</span>
                              <button
                                onClick={() => updateBotSetting('showCopyButton', !selectedBot.settings?.showCopyButton)}
                                className="text-xs px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary"
                              >
                                {selectedBot.settings?.showCopyButton ? 'Deaktivieren' : 'Aktivieren'}
                              </button>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Darstellungsmodus wählen</CardTitle>
              <CardDescription>
                Wählen Sie aus, wie der Bot auf Ihrer Website angezeigt werden soll
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bubble" onValueChange={(value) => setInitialMode(value as any)}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="bubble" className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <span>Bubble</span>
                  </TabsTrigger>
                  <TabsTrigger value="inline" className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="12" x="3" y="6" rx="2" ry="2"></rect>
                        <line x1="3" x2="21" y1="12" y2="12"></line>
                      </svg>
                    </div>
                    <span>Inline</span>
                  </TabsTrigger>
                  <TabsTrigger value="fullscreen" className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m10 7-3 3 3 3"></path>
                        <path d="m14 17 3-3-3-3"></path>
                      </svg>
                    </div>
                    <span>Vollbild</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mb-4 border p-4 rounded-md bg-muted/5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Vorschau</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsMobilePreview(false)}
                        className={`p-1 rounded ${!isMobilePreview ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                        title="Desktop-Vorschau"
                      >
                        <Monitor className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setIsMobilePreview(true)}
                        className={`p-1 rounded ${isMobilePreview ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                        title="Mobile-Vorschau"
                      >
                        <Smartphone className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className={`relative border rounded-md overflow-hidden ${isMobilePreview ? 'w-64 h-96 mx-auto' : 'w-full h-80'}`}>
                    <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-6">
                      {initialMode === 'bubble' && (
                        <>
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white mb-2"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div
                            className="absolute rounded-md shadow-lg p-4"
                            style={{
                              [position.includes('top') ? 'top' : 'bottom']: offsetY + 'px',
                              [position.includes('left') ? 'left' : 'right']: offsetX + 'px',
                              width: chatWidth + 'px',
                              height: chatHeight + 'px',
                              maxWidth: '90%',
                              maxHeight: '70%',
                              background: 'white',
                              display: 'none'
                            }}
                          >
                            <span className="text-sm">Chat-Fenster (erscheint beim Klick)</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Dargestellt als Bubble in der <strong>{position}</strong>-Ecke
                          </p>
                        </>
                      )}

                      {initialMode === 'inline' && (
                        <>
                          <div className="w-full h-full border rounded-md flex items-center justify-center">
                            <div className="text-center max-w-xs">
                              <span className="text-sm font-medium block mb-1">Inline Chat</span>
                              <p className="text-xs text-muted-foreground">Eingebettet mit Größe: {width} × {height}px</p>
                            </div>
                          </div>
                        </>
                      )}

                      {initialMode === 'fullscreen' && (
                        <>
                          <div className="w-full h-full flex items-center justify-center bg-opacity-80 bg-black">
                            <div className="text-center max-w-xs text-white">
                              <span className="text-sm font-medium block mb-1">Vollbild-Chat</span>
                              <p className="text-xs opacity-70">Nimmt den gesamten Bildschirm ein</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-2">
                    <Button variant="outline" size="sm" onClick={showPreview} className="flex gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Vollbild-Vorschau</span>
                    </Button>
                  </div>
                </div>

                <TabsContent value="bubble" className="mt-0">
                  <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                    <p className="text-sm">
                      Ein Chat-Symbol in einer Ecke des Bildschirms, das sich beim Klicken zu einem Chat-Fenster öffnet.
                      Ideal für Websites, bei denen der Chat eine ergänzende Funktion ist.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="position" className="text-sm">Position</Label>
                        <select
                          id="position"
                          value={position}
                          onChange={(e) => setPosition(e.target.value as any)}
                          className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                        >
                          <option value="bottom-right">Unten rechts</option>
                          <option value="bottom-left">Unten links</option>
                          <option value="top-right">Oben rechts</option>
                          <option value="top-left">Oben links</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="bubble-size" className="text-sm">Bubble-Größe (px)</Label>
                        <input
                          id="bubble-size"
                          type="number"
                          value={bubbleSize}
                          onChange={(e) => setBubbleSize(e.target.value)}
                          min="40"
                          max="100"
                          className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                        />
                      </div>
                    </div>

                    <Accordion type="single" collapsible>
                      <AccordionItem value="advanced-bubble">
                        <AccordionTrigger className="text-sm">Erweiterte Einstellungen</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <Label htmlFor="offset-x" className="text-sm">Horizontaler Abstand (px)</Label>
                              <input
                                id="offset-x"
                                type="number"
                                value={offsetX}
                                onChange={(e) => setOffsetX(e.target.value)}
                                min="0"
                                className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="offset-y" className="text-sm">Vertikaler Abstand (px)</Label>
                              <input
                                id="offset-y"
                                type="number"
                                value={offsetY}
                                onChange={(e) => setOffsetY(e.target.value)}
                                min="0"
                                className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="chat-width" className="text-sm">Chat-Breite (px)</Label>
                              <input
                                id="chat-width"
                                type="number"
                                value={chatWidth}
                                onChange={(e) => setChatWidth(e.target.value)}
                                min="300"
                                className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="chat-height" className="text-sm">Chat-Höhe (px)</Label>
                              <input
                                id="chat-height"
                                type="number"
                                value={chatHeight}
                                onChange={(e) => setChatHeight(e.target.value)}
                                min="400"
                                className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                              />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </TabsContent>

                <TabsContent value="inline" className="mt-0">
                  <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                    <p className="text-sm">
                      Der Chat wird direkt in die Seite eingebettet. Ideal für dedizierte Chat-Seiten oder
                      wenn der Chat eine zentrale Funktion auf der Seite ist.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="inline-height" className="text-sm">Höhe (px)</Label>
                        <input
                          id="inline-height"
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          min="300"
                          className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Empfohlene Mindesthöhe: 500px
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="inline-width" className="text-sm">Breite</Label>
                        <input
                          id="inline-width"
                          type="text"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                          placeholder="100% oder px-Wert"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Z.B. "100%", "350px", "50vw"
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fullscreen" className="mt-0">
                  <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                    <p className="text-sm">
                      Der Chat füllt das gesamte Browserfenster aus, mit einem Dialog/Web-Switcher.
                      Ideal für dedizierte Chat-Seiten oder als Vollbildanwendung.
                    </p>

                    <div className="rounded-md bg-amber-50 border border-amber-200 p-3 mt-4">
                      <h4 className="text-sm font-medium text-amber-800 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Hinweis
                      </h4>
                      <p className="text-xs text-amber-700 mt-1">
                        Im Vollbildmodus werden automatisch alle verfügbaren Abmessungen genutzt.
                        Der Bot bietet einen Dialog/Web-Switcher, mit dem Benutzer zwischen dem Chat
                        und der darunter liegenden Website wechseln können.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Weitere Einstellungen</CardTitle>
              <CardDescription>
                Passen Sie zusätzliche Optionen für den Bot an
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="space-y-4">
                  <Label className="text-sm">Design</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 border rounded cursor-pointer"
                      aria-label="Primärfarbe"
                    />
                    <div className="flex-1">
                      <Label htmlFor="color-input" className="sr-only">Primärfarbe</Label>
                      <input
                        id="color-input"
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Diese Farbe wird für das Chat-Icon, Schaltflächen und Akzente im Chat verwendet.
                  </p>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Streaming-Modus</Label>
                  <RadioGroup
                    value={streamingEnabled ? "true" : "false"}
                    onValueChange={(v: string) => setStreamingEnabled(v === "true")}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="streaming-on" />
                      <Label htmlFor="streaming-on" className="font-normal">Aktiviert</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="streaming-off" />
                      <Label htmlFor="streaming-off" className="font-normal">Deaktiviert</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-2">
                    Der Streaming-Modus zeigt die Antworten in Echtzeit an, während sie generiert werden.
                  </p>
                </div>

                <Accordion type="single" collapsible>
                  <AccordionItem value="technical">
                    <AccordionTrigger className="text-sm">Technische Einstellungen</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div>
                          <Label htmlFor="z-index" className="text-sm">Z-Index (optional)</Label>
                          <input
                            id="z-index"
                            type="number"
                            value={zIndex}
                            onChange={(e) => setZIndex(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                            placeholder="leer = Standard"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Z-Index für den Chat, falls es Überlagerungsprobleme mit anderen Elementen gibt.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rechte Spalte - Vorschau und Code */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Vorschau & Embed-Code</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsMobilePreview(!isMobilePreview)}>
                    {isMobilePreview ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                    <span className="ml-2">{isMobilePreview ? 'Desktop' : 'Mobil'}</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={showPreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Vorschau
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vorschau-Container */}
              <div className={`relative bg-muted/20 border rounded-md overflow-hidden ${isMobilePreview ? 'w-[320px] h-[568px] mx-auto' : 'w-full h-[300px]'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4">
                    <p className="text-muted-foreground text-sm mb-2">Klicken Sie auf "Vorschau", um den Bot in einem neuen Tab zu testen</p>
                    <Button variant="outline" size="sm" onClick={showPreview}>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Bot-Vorschau öffnen
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Embed-Code */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-medium">Embed-Code</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCode}
                  >
                    {codeCopied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        <span>Kopiert!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        <span>Kopieren</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative rounded-md overflow-hidden">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                    {embedCode}
                  </pre>
                </div>
              </div>

              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>Hilfe zur Integration</AlertTitle>
                <AlertDescription className="text-sm">
                  <p className="mb-2">
                    Fügen Sie den obigen Code an der Stelle ein, an der der Bot auf Ihrer Website erscheinen soll.
                  </p>
                  <p className="mb-2">
                    <strong>Inline-Modus:</strong> Der Container passt sich an die angegebenen Abmessungen an.
                  </p>
                  <p className="mb-1">
                    <strong>Bubble-Modus:</strong> Der Bot erscheint als Bubble in der angegebenen Ecke.
                  </p>
                  <Button variant="link" className="h-auto p-0 text-primary" onClick={() => router.push('/admin')}>
                    Mehr erfahren
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}