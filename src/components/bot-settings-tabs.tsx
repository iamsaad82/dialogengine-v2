'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BotSettings, BotSuggestion } from "@/types/bot"
import { useState } from "react"

interface BotSettingsTabsProps {
  name: string
  description: string
  welcomeMessage: string
  flowiseId: string
  active: boolean
  settings: BotSettings
  suggestions?: BotSuggestion[]
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onWelcomeMessageChange: (value: string) => void
  onFlowiseIdChange: (value: string) => void
  onActiveChange: (value: boolean) => void
  onSettingsChange: (settings: BotSettings) => void
  onSuggestionsChange?: (suggestions: BotSuggestion[]) => void
}

// ChatBubble-Vorschau Komponente
function ChatBubblePreview({ settings, welcomeMessage }: { settings: BotSettings, welcomeMessage: string }) {
  const botBubbleStyle = {
    backgroundColor: settings.botBgColor || 'rgba(248, 250, 252, 0.8)',
    color: settings.botTextColor || '#000000',
    borderColor: settings.botAccentColor || settings.primaryColor || '#3b82f6',
    boxShadow: `0 4px 12px rgba(0, 0, 0, 0.08)`
  }

  const userBubbleStyle = {
    background: settings.userBgColor || createGradientFromColor(settings.primaryColor),
    color: settings.userTextColor || '#ffffff',
    boxShadow: `0 4px 12px rgba(${parseInt(settings.primaryColor.slice(1, 3), 16)}, ${parseInt(settings.primaryColor.slice(3, 5), 16)}, ${parseInt(settings.primaryColor.slice(5, 7), 16)}, 0.2)`
  }

  // Hilfsfunktion für Gradienten aus der Primärfarbe
  function createGradientFromColor(color: string): string {
    try {
      // Aus der Hex-Farbe die einzelnen RGB-Komponenten extrahieren
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      // Hellere Version für den Start des Gradienten (10% heller)
      const lighterColor = `#${Math.min(255, Math.floor(r * 1.1)).toString(16).padStart(2, '0')}${
        Math.min(255, Math.floor(g * 1.1)).toString(16).padStart(2, '0')}${
        Math.min(255, Math.floor(b * 1.1)).toString(16).padStart(2, '0')}`;

      // Dunklere Version für das Ende des Gradienten (15% dunkler)
      const darkerColor = `#${Math.floor(r * 0.85).toString(16).padStart(2, '0')}${
        Math.floor(g * 0.85).toString(16).padStart(2, '0')}${
        Math.floor(b * 0.85).toString(16).padStart(2, '0')}`;

      return `linear-gradient(135deg, ${lighterColor}, ${darkerColor})`;
    } catch (e) {
      return `linear-gradient(135deg, ${color}, ${color}cc)`;
    }
  }

  return (
    <div className="preview-container border rounded-lg p-4 bg-background/50 mb-6">
      <h3 className="text-sm font-medium mb-3">Vorschau</h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-md bg-white/70 border flex items-center justify-center shadow-sm" style={{ borderColor: settings.botAccentColor || settings.primaryColor }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: settings.botAccentColor || settings.primaryColor }}><path d="m8 10 4 4 4-4" /></svg>
          </div>
          <div className="max-w-[80%] rounded-lg p-3 border" style={botBubbleStyle}>
            <p className="text-sm">{welcomeMessage || "Willkommen! Wie kann ich Ihnen helfen?"}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 justify-end">
          <div className="max-w-[80%] rounded-lg p-3" style={userBubbleStyle}>
            <p className="text-sm">Können Sie mir bei einer Frage helfen?</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-white/70 border flex items-center justify-center shadow-sm" style={{ borderColor: settings.primaryColor }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7v4"></path><path d="M5 7v4"></path><circle cx="12" cy="11" r="1"></circle><path d="M7 19.4V13a5 5 0 0 1 10 0v6.4"></path></svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BotSettingsTabs({
  name,
  description,
  welcomeMessage,
  flowiseId,
  active,
  settings,
  suggestions = [],
  onNameChange,
  onDescriptionChange,
  onWelcomeMessageChange,
  onFlowiseIdChange,
  onActiveChange,
  onSettingsChange,
  onSuggestionsChange
}: BotSettingsTabsProps) {
  const [newSuggestion, setNewSuggestion] = useState("")

  // Funktion zum Hinzufügen eines neuen Vorschlags
  const addSuggestion = () => {
    if (!newSuggestion.trim() || !onSuggestionsChange) return;

    const nextOrder = suggestions.length > 0
      ? Math.max(...suggestions.map(s => s.order)) + 1
      : 0;

    const newSuggestionItem: BotSuggestion = {
      id: `temp-${Date.now()}`, // temporäre ID, wird vom Server ersetzt
      text: newSuggestion,
      order: nextOrder,
      isActive: true,
      botId: "", // wird vom Server gesetzt
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSuggestionsChange([...suggestions, newSuggestionItem]);
    setNewSuggestion("");
  };

  // Funktion zum Löschen eines Vorschlags
  const removeSuggestion = (id: string) => {
    if (!onSuggestionsChange) return;
    onSuggestionsChange(suggestions.filter(s => s.id !== id));
  };

  // Funktion zum Ändern der Aktivität eines Vorschlags
  const toggleSuggestionActive = (id: string) => {
    if (!onSuggestionsChange) return;
    onSuggestionsChange(
      suggestions.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
    );
  };

  // Funktion zum Ändern der Reihenfolge der Vorschläge
  const moveSuggestion = (id: string, direction: 'up' | 'down') => {
    if (!onSuggestionsChange || suggestions.length < 2) return;

    const currentIndex = suggestions.findIndex(s => s.id === id);
    if (currentIndex === -1) return;

    const newSuggestions = [...suggestions];

    if (direction === 'up' && currentIndex > 0) {
      // Tausche mit dem vorherigen Element
      const temp = { ...newSuggestions[currentIndex - 1] };
      newSuggestions[currentIndex - 1] = {
        ...newSuggestions[currentIndex],
        order: temp.order
      };
      newSuggestions[currentIndex] = {
        ...temp,
        order: newSuggestions[currentIndex].order
      };
    } else if (direction === 'down' && currentIndex < suggestions.length - 1) {
      // Tausche mit dem nächsten Element
      const temp = { ...newSuggestions[currentIndex + 1] };
      newSuggestions[currentIndex + 1] = {
        ...newSuggestions[currentIndex],
        order: temp.order
      };
      newSuggestions[currentIndex] = {
        ...temp,
        order: newSuggestions[currentIndex].order
      };
    }

    // Sortiere nach order-Attribut
    newSuggestions.sort((a, b) => a.order - b.order);
    onSuggestionsChange(newSuggestions);
  };

  return (
    <Tabs defaultValue="allgemein" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="allgemein">Allgemeine Einstellungen</TabsTrigger>
        <TabsTrigger value="design">Design &amp; Erscheinungsbild</TabsTrigger>
        <TabsTrigger value="prompt">Prompt-Einstellungen</TabsTrigger>
        <TabsTrigger value="suggestions">Vorschläge</TabsTrigger>
      </TabsList>

      <TabsContent value="allgemein">
        <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Bot-Informationen</h3>
            <p className="text-sm text-muted-foreground">
              Grundlegende Informationen und Konfiguration Ihres Chatbots.
            </p>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Name des Bots"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Beschreibung</label>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Beschreibung des Bots"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Bot-Logo</label>
              <div className="flex items-center gap-4">
                {settings.avatarUrl && (
                  <div className="w-32 h-24 rounded-lg border overflow-hidden flex items-center justify-center bg-background">
                    <img
                      src={settings.avatarUrl}
                      alt="Bot-Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Statt Base64-Codierung direkt einen Form-Upload zum Server machen
                        const formData = new FormData();
                        formData.append('file', file);

                        try {
                          const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                          });

                          if (response.ok) {
                            const data = await response.json();
                            // URL des hochgeladenen Bildes speichern
                            onSettingsChange({
                              ...settings,
                              avatarUrl: data.url
                            });
                          } else {
                            console.error('Fehler beim Hochladen des Bildes');
                            alert('Das Bild konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.');
                          }
                        } catch (error) {
                          console.error('Fehler beim Hochladen:', error);
                          alert('Das Bild konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.');
                        }
                      }
                    }}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20
                      cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Empfohlene Größe: 128x128 Pixel. Max. 1MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Flowise Chatflow ID</label>
              <input
                type="text"
                value={flowiseId}
                onChange={(e) => onFlowiseIdChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Flowise Chatflow ID"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => onActiveChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="active" className="text-sm font-medium">Bot aktiv</label>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="design">
        <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Erscheinungsbild</h3>
            <p className="text-sm text-muted-foreground">
              Passen Sie das Design und die Farbgebung Ihres Chatbots an.
            </p>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <ChatBubblePreview settings={settings} welcomeMessage={welcomeMessage} />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Willkommensnachricht</label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => onWelcomeMessageChange(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Willkommensnachricht, die angezeigt wird, wenn der Chat geöffnet wird"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Nachrichten-Template</label>
                <select
                  value={settings.messageTemplate === null || settings.messageTemplate === '' ? 'default' : settings.messageTemplate}
                  onChange={(e) => onSettingsChange({...settings, messageTemplate: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="default">Standard</option>
                  <option value="aok">AOK-Design</option>
                  <option value="creditreform">Creditreform-Design</option>
                  <option value="brandenburg">Stadt Brandenburg-Design</option>
                  <option value="mall">Shopping Mall-Design</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Wähle ein spezielles Design für die Chat-Nachrichten.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Primärfarbe</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => onSettingsChange({...settings, primaryColor: e.target.value})}
                    className="w-10 h-10 rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => onSettingsChange({...settings, primaryColor: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Bot-Hintergrundfarbe</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.botBgColor.startsWith('rgba') ? '#f8fafc' : settings.botBgColor}
                    onChange={(e) => onSettingsChange({...settings, botBgColor: e.target.value})}
                    className="w-10 h-10 rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.botBgColor}
                    onChange={(e) => onSettingsChange({...settings, botBgColor: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="z.B.: #ffffff oder rgba(255,255,255,0.8)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Bot-Textfarbe</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.botTextColor}
                    onChange={(e) => onSettingsChange({...settings, botTextColor: e.target.value})}
                    className="w-10 h-10 rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.botTextColor}
                    onChange={(e) => onSettingsChange({...settings, botTextColor: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Bot-Akzentfarbe</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.botAccentColor}
                    onChange={(e) => onSettingsChange({...settings, botAccentColor: e.target.value})}
                    className="w-10 h-10 rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.botAccentColor}
                    onChange={(e) => onSettingsChange({...settings, botAccentColor: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Benutzer-Hintergrundfarbe (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.userBgColor || settings.primaryColor}
                    onChange={(e) => onSettingsChange({...settings, userBgColor: e.target.value})}
                    className="w-10 h-10 rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.userBgColor}
                    onChange={(e) => onSettingsChange({...settings, userBgColor: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Leer lassen für Gradient mit Primärfarbe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Benutzer-Textfarbe</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.userTextColor}
                    onChange={(e) => onSettingsChange({...settings, userTextColor: e.target.value})}
                    className="w-10 h-10 rounded overflow-hidden cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.userTextColor}
                    onChange={(e) => onSettingsChange({...settings, userTextColor: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableFeedback"
                  checked={settings.enableFeedback}
                  onChange={(e) => onSettingsChange({...settings, enableFeedback: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="enableFeedback" className="text-sm font-medium">Feedback-Buttons anzeigen</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableAnalytics"
                  checked={settings.enableAnalytics}
                  onChange={(e) => onSettingsChange({...settings, enableAnalytics: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="enableAnalytics" className="text-sm font-medium">Analytics aktivieren</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showSuggestions"
                  checked={settings.showSuggestions}
                  onChange={(e) => onSettingsChange({...settings, showSuggestions: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="showSuggestions" className="text-sm font-medium">Vorschläge anzeigen</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showCopyButton"
                  checked={settings.showCopyButton}
                  onChange={(e) => onSettingsChange({...settings, showCopyButton: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="showCopyButton" className="text-sm font-medium">Kopier-Button anzeigen</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showNameInHeader"
                  checked={settings.showNameInHeader !== undefined ? settings.showNameInHeader : true}
                  onChange={(e) => onSettingsChange({...settings, showNameInHeader: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="showNameInHeader" className="text-sm font-medium">Bot-Namen im Header anzeigen</label>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="prompt">
        <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Prompt-Einstellungen</h3>
            <p className="text-sm text-muted-foreground">
              Konfigurieren Sie die Prompt-Templates für die KI-Generierung.
            </p>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Bot-Persönlichkeit</label>
              <textarea
                value={settings.botPersonality || "Du bist der Assistent des Einkaufscenters ORO Schwabach"}
                onChange={(e) => onSettingsChange({...settings, botPersonality: e.target.value})}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Beschreibung der Bot-Persönlichkeit (z.B. 'Du bist der Assistent des...')"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Bot-Kontext</label>
              <input
                type="text"
                value={settings.botContext || "Center"}
                onChange={(e) => onSettingsChange({...settings, botContext: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Der Kontext, zu dem der Bot Fragen beantwortet (z.B. 'Center')"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Bot-Themenbereich</label>
              <input
                type="text"
                value={settings.botScope || "das Center, die Shops und die Produkte"}
                onChange={(e) => onSettingsChange({...settings, botScope: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Themenbereich des Bots (z.B. 'das Center, die Shops und die Produkte')"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Angebots-Hinweis</label>
              <input
                type="text"
                value={settings.offerTip || "Wenn du einen Shop findest in dem es ein Aktuelles Angebot bist, bietest du das Angebot als Tipp an."}
                onChange={(e) => onSettingsChange({...settings, offerTip: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Anweisung für Angebote (z.B. 'Wenn du einen Shop findest...')"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Geschlossene Tage</label>
              <textarea
                value={settings.closedDays || `An diesen Tagen ist das Center geschlossen:

Feiertage:
- Neujahr: Montag, 01.01.2024
- Heilige Drei Könige: Samstag, 06.01.2024
- Karfreitag: Freitag, 29.03.2024
- Ostermontag: Montag, 01.04.2024
- Tag der Arbeit: Mittwoch, 01.05.2024
- Christi Himmelfahrt: Donnerstag, 09.05.2024
- Pfingstmontag: Montag, 20.05.2024
- Fronleichnam: Donnerstag, 30.05.2024
- Mariä Himmelfahrt: Donnerstag, 15.08.2024
- Tag der Deutschen Einheit: Donnerstag, 03.10.2024
- Allerheiligen: Freitag, 01.11.2024
- 1. Weihnachtsfeiertag: Mittwoch, 25.12.2024
- 2. Weihnachtsfeiertag: Donnerstag, 26.12.2024`}
                onChange={(e) => onSettingsChange({...settings, closedDays: e.target.value})}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Liste der Tage, an denen das Center geschlossen ist"
              />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="suggestions">
        <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Fragen-Vorschläge</h3>
            <p className="text-sm text-muted-foreground">
              Verwalten Sie die Vorschläge, die Nutzern im Chat angezeigt werden. Diese Vorschläge können angeklickt werden, um schnell häufige Fragen zu stellen.
            </p>
          </div>

          <div className="px-6">
            <div className="bg-muted p-3 rounded-md text-sm flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Die Anzeige der Vorschläge kann unter "Design &amp; Erscheinungsbild" aktiviert oder deaktiviert werden (Option "Vorschläge anzeigen").
            </div>
          </div>

          <div className="p-6 pt-0 space-y-4">
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <label htmlFor="new-suggestion" className="sr-only">Neuer Vorschlag</label>
                <input
                  type="text"
                  id="new-suggestion"
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Neue Vorschlagsfrage eingeben, z.B. 'Wie sind die Öffnungszeiten?'"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSuggestion();
                    }
                  }}
                />
              </div>
              <button
                onClick={addSuggestion}
                className="px-4 py-2 h-10 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={!newSuggestion.trim() || !onSuggestionsChange}
              >
                Hinzufügen
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Vorhandene Vorschläge</h4>

              {suggestions.length === 0 && (
                <div className="text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded-md">
                  Noch keine Vorschläge vorhanden. Fügen Sie oben Ihren ersten Vorschlag hinzu.
                </div>
              )}

              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={suggestion.id} className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                    <div className="flex-1">
                      <div className={suggestion.isActive ? "font-medium" : "font-medium text-muted-foreground line-through"}>
                        {suggestion.text}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSuggestion(suggestion.id, 'up')}
                        disabled={index === 0 || !onSuggestionsChange}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30"
                        title="Nach oben"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m18 15-6-6-6 6"/>
                        </svg>
                      </button>

                      <button
                        onClick={() => moveSuggestion(suggestion.id, 'down')}
                        disabled={index === suggestions.length - 1 || !onSuggestionsChange}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30"
                        title="Nach unten"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </button>

                      <button
                        onClick={() => toggleSuggestionActive(suggestion.id)}
                        disabled={!onSuggestionsChange}
                        className={`p-1 rounded-md hover:bg-muted ${
                          suggestion.isActive
                            ? "text-green-600 hover:text-green-700"
                            : "text-muted-foreground"
                        }`}
                        title={suggestion.isActive ? "Deaktivieren" : "Aktivieren"}
                      >
                        {suggestion.isActive ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            <path d="m9 12 2 2 4-4"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            <path d="m15 9-6 6"></path>
                            <path d="m9 9 6 6"></path>
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={() => removeSuggestion(suggestion.id)}
                        disabled={!onSuggestionsChange}
                        className="p-1 rounded-md hover:bg-muted text-destructive hover:text-destructive/90"
                        title="Löschen"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}