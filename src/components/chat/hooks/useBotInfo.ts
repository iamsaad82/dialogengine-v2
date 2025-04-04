'use client'

import { useState, useEffect } from 'react';
import type { Bot, BotSettings } from '@/types/bot';

// Cache für bereits geladene Bots, um wiederholte API-Anfragen zu vermeiden
const botCache: Record<string, {
  name: string;
  primaryColor: string;
  botBgColor: string;
  botTextColor: string;
  botAccentColor: string;
  userBgColor: string;
  userTextColor: string;
  showCopyButton: boolean;
  enableFeedback: boolean;
  showSuggestions: boolean;
  showNameInHeader?: boolean;
  avatarUrl?: string;
  welcomeMessage?: string;
  messageTemplate?: string;
}> = {};

export interface UseBotInfoProps {
  botId?: string;
  initialSettings?: BotSettings;
}

/**
 * Hook für das Laden und Verwalten von Bot-Informationen.
 * Vermeidet doppelte API-Aufrufe durch Caching und bietet eine einheitliche Schnittstelle.
 */
export function useBotInfo({ botId, initialSettings }: UseBotInfoProps) {
  const [botName, setBotName] = useState<string>('');
  const [botPrimaryColor, setBotPrimaryColor] = useState<string>('#3b82f6');
  const [botBgColor, setBotBgColor] = useState<string>('rgba(248, 250, 252, 0.8)');
  const [botTextColor, setBotTextColor] = useState<string>('#000000');
  const [botAccentColor, setBotAccentColor] = useState<string>('#3b82f6');
  const [userBgColor, setUserBgColor] = useState<string>('');
  const [userTextColor, setUserTextColor] = useState<string>('#ffffff');
  const [showCopyButton, setShowCopyButton] = useState<boolean>(true);
  const [enableFeedback, setEnableFeedback] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [showNameInHeader, setShowNameInHeader] = useState<boolean>(true);
  const [botAvatarUrl, setBotAvatarUrl] = useState<string | undefined>(undefined);
  const [welcomeMessage, setWelcomeMessage] = useState<string | undefined>(undefined);
  const [messageTemplate, setMessageTemplate] = useState<string>('default');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'initialSettings' | 'api' | 'cache' | 'default'>('default');

  // Setzt den Standardnamen als Fallback
  useEffect(() => {
    console.log("USEBOTINFO-DEBUG-001: Initialer botName:", botName);
  }, []);

  // Initialisiere Bot-Einstellungen aus initialSettings, wenn vorhanden
  useEffect(() => {
    if (!initialSettings) return;

    console.log("USEBOTINFO-DEBUG-001: Verwende initialSettings:", initialSettings);
    setDataSource('initialSettings');

    // Bot-Name aus initialSettings setzen, falls vorhanden (z.B. aus Embed-Code)
    if ('name' in initialSettings && initialSettings.name && typeof initialSettings.name === 'string') {
      console.log("USEBOTINFO-DEBUG-001: Setze botName aus initialSettings:", initialSettings.name);
      setBotName(initialSettings.name);
    }

    // Welcome Message aus initialSettings setzen
    if ('welcomeMessage' in initialSettings && initialSettings.welcomeMessage && typeof initialSettings.welcomeMessage === 'string') {
      console.log("USEBOTINFO-DEBUG-001: Setze welcomeMessage aus initialSettings");
      setWelcomeMessage(initialSettings.welcomeMessage);
    }

    // Avatar URL aus initialSettings setzen
    if ('avatarUrl' in initialSettings && initialSettings.avatarUrl) {
      console.log("USEBOTINFO-DEBUG-001: Setze avatarUrl aus initialSettings");
      setBotAvatarUrl(initialSettings.avatarUrl);
    }

    // Spezielle Debug-Ausgabe für Vorschläge und deren Anzeige
    console.log("USEBOTINFO-DEBUG-001: initialSettings.showSuggestions:",
      initialSettings.showSuggestions === true ? "true" :
      initialSettings.showSuggestions === false ? "false" : "nicht gesetzt");

    // Bot-Einstellungen aus initialSettings setzen
    if (initialSettings.primaryColor) {
      console.log("USEBOTINFO-DEBUG-001: Setze primaryColor aus initialSettings:", initialSettings.primaryColor);
      setBotPrimaryColor(initialSettings.primaryColor);
    }

    if (initialSettings.botBgColor) {
      console.log("USEBOTINFO-DEBUG-001: Setze botBgColor aus initialSettings:", initialSettings.botBgColor);
      setBotBgColor(initialSettings.botBgColor);
    }

    if (initialSettings.botTextColor) {
      console.log("USEBOTINFO-DEBUG-001: Setze botTextColor aus initialSettings:", initialSettings.botTextColor);
      setBotTextColor(initialSettings.botTextColor);
    }

    if (initialSettings.botAccentColor) {
      console.log("USEBOTINFO-DEBUG-001: Setze botAccentColor aus initialSettings:", initialSettings.botAccentColor);
      setBotAccentColor(initialSettings.botAccentColor);
    }

    if (initialSettings.userBgColor) {
      console.log("USEBOTINFO-DEBUG-001: Setze userBgColor aus initialSettings:", initialSettings.userBgColor);
      setUserBgColor(initialSettings.userBgColor);
    }

    if (initialSettings.userTextColor) {
      console.log("USEBOTINFO-DEBUG-001: Setze userTextColor aus initialSettings:", initialSettings.userTextColor);
      setUserTextColor(initialSettings.userTextColor);
    }

    if (typeof initialSettings.showCopyButton === 'boolean') {
      console.log("USEBOTINFO-DEBUG-001: Setze showCopyButton aus initialSettings:", initialSettings.showCopyButton);
      setShowCopyButton(initialSettings.showCopyButton);
    }

    if (typeof initialSettings.enableFeedback === 'boolean') {
      console.log("USEBOTINFO-DEBUG-001: Setze enableFeedback aus initialSettings:", initialSettings.enableFeedback);
      setEnableFeedback(initialSettings.enableFeedback);
    }

    if (typeof initialSettings.showSuggestions === 'boolean') {
      console.log("USEBOTINFO-DEBUG-001: Setze showSuggestions aus initialSettings:", initialSettings.showSuggestions);
      setShowSuggestions(initialSettings.showSuggestions);
    }

    if (typeof initialSettings.showNameInHeader === 'boolean') {
      console.log("USEBOTINFO-DEBUG-001: Setze showNameInHeader aus initialSettings:", initialSettings.showNameInHeader);
      setShowNameInHeader(initialSettings.showNameInHeader);
    }

    // Messagetemplate setzen, wenn vorhanden
    if (initialSettings.messageTemplate !== undefined && initialSettings.messageTemplate !== null) {
      console.log("USEBOTINFO-DEBUG-001: Setze messageTemplate aus initialSettings:", initialSettings.messageTemplate);
      setMessageTemplate(initialSettings.messageTemplate === '' ? 'default' : initialSettings.messageTemplate);
    }

    // Cache aktualisieren, wenn botId vorhanden
    if (botId) {
      console.log("USEBOTINFO-DEBUG-001: Aktualisiere Cache mit initialSettings für ID:", botId);
      const existingCache = botCache[botId] || {};
      botCache[botId] = {
        ...existingCache,
        primaryColor: initialSettings.primaryColor || existingCache.primaryColor || '#3b82f6',
        botBgColor: initialSettings.botBgColor || existingCache.botBgColor || 'rgba(248, 250, 252, 0.8)',
        botTextColor: initialSettings.botTextColor || existingCache.botTextColor || '#000000',
        botAccentColor: initialSettings.botAccentColor || existingCache.botAccentColor || '#3b82f6',
        userBgColor: initialSettings.userBgColor || existingCache.userBgColor || '',
        userTextColor: initialSettings.userTextColor || existingCache.userTextColor || '#ffffff',
        showCopyButton: initialSettings.showCopyButton ?? existingCache.showCopyButton ?? true,
        enableFeedback: initialSettings.enableFeedback ?? existingCache.enableFeedback ?? false,
        showSuggestions: initialSettings.showSuggestions ?? existingCache.showSuggestions ?? true,
        showNameInHeader: initialSettings.showNameInHeader ?? existingCache.showNameInHeader ?? true,
        avatarUrl: initialSettings.avatarUrl || existingCache.avatarUrl,
        welcomeMessage: existingCache.welcomeMessage,
        messageTemplate: initialSettings.messageTemplate === null || initialSettings.messageTemplate === ''
          ? 'default'
          : initialSettings.messageTemplate || existingCache.messageTemplate || 'default'
      };
    }
  }, [initialSettings, botId]);

  // Bot-Informationen aus der API laden, wenn botId vorhanden ist
  useEffect(() => {
    if (!botId) return;

    const fetchBotInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("USEBOTINFO-DEBUG-001: Lade Bot-Daten von API für ID:", botId);
        const response = await fetch(`/api/bots/${botId}`);

        if (!response.ok) {
          throw new Error(`API-Fehler: ${response.status}`);
        }

        const botData = await response.json();
        console.log("USEBOTINFO-DEBUG-001: API-Antwort erhalten:", {
          id: botData.id,
          name: botData.name,
          hasSettings: !!botData.settings,
          settingsKeys: botData.settings ? Object.keys(botData.settings) : []
        });

        if (botData) {
          setDataSource('api');

          // Bot-Name setzen
          if (botData.name) {
            console.log("USEBOTINFO-DEBUG-001: Setze botName aus API:", botData.name);
            setBotName(botData.name);
          }

          // Bot-Einstellungen setzen, wenn vorhanden
          if (botData.settings) {
            // Farben setzen
            if (botData.settings.primaryColor) {
              console.log("USEBOTINFO-DEBUG-001: Setze primaryColor aus API:", botData.settings.primaryColor);
              setBotPrimaryColor(botData.settings.primaryColor);
            }

            if (botData.settings.botBgColor) {
              console.log("USEBOTINFO-DEBUG-001: Setze botBgColor aus API:", botData.settings.botBgColor);
              setBotBgColor(botData.settings.botBgColor);
            }

            if (botData.settings.botTextColor) {
              console.log("USEBOTINFO-DEBUG-001: Setze botTextColor aus API:", botData.settings.botTextColor);
              setBotTextColor(botData.settings.botTextColor);
            }

            if (botData.settings.botAccentColor) {
              console.log("USEBOTINFO-DEBUG-001: Setze botAccentColor aus API:", botData.settings.botAccentColor);
              setBotAccentColor(botData.settings.botAccentColor);
            }

            if (botData.settings.userBgColor) {
              console.log("USEBOTINFO-DEBUG-001: Setze userBgColor aus API:", botData.settings.userBgColor);
              setUserBgColor(botData.settings.userBgColor);
            }

            if (botData.settings.userTextColor) {
              console.log("USEBOTINFO-DEBUG-001: Setze userTextColor aus API:", botData.settings.userTextColor);
              setUserTextColor(botData.settings.userTextColor);
            }

            // Kopier-Button-Einstellung übernehmen
            const showCopy = typeof botData.settings.showCopyButton === 'boolean'
              ? botData.settings.showCopyButton
              : true;
            console.log("USEBOTINFO-DEBUG-001: Setze showCopyButton aus API:", showCopy);
            setShowCopyButton(showCopy);

            // Feedback-Button-Einstellung übernehmen
            const enableFeed = typeof botData.settings.enableFeedback === 'boolean'
              ? botData.settings.enableFeedback
              : false;
            console.log("USEBOTINFO-DEBUG-001: Setze enableFeedback aus API:", enableFeed);
            setEnableFeedback(enableFeed);

            // Bot-Namen im Header anzeigen
            const showNameHeader = typeof botData.settings.showNameInHeader === 'boolean'
              ? botData.settings.showNameInHeader
              : true;
            console.log("USEBOTINFO-DEBUG-001: Setze showNameInHeader aus API:", showNameHeader);
            setShowNameInHeader(showNameHeader);

            // Avatar-URL setzen, zuerst aus den Settings, dann aus dem Bot-Objekt
            const avatarUrl = botData.settings.avatarUrl || botData.avatarUrl || undefined;
            console.log("USEBOTINFO-DEBUG-001: Setze avatarUrl:", avatarUrl ? "vorhanden" : "nicht vorhanden");
            setBotAvatarUrl(avatarUrl);

            // Neue Einstellung: messageTemplate
            const messageTempl = botData.settings.messageTemplate === null || botData.settings.messageTemplate === ''
              ? 'default'
              : botData.settings.messageTemplate;
            console.log("USEBOTINFO-DEBUG-001: Setze messageTemplate aus API:", messageTempl);
            setMessageTemplate(messageTempl);
          } else {
            console.log("USEBOTINFO-DEBUG-001: Keine settings in API-Daten gefunden!");

            // Fallback: Avatar-URL direkt aus dem Bot-Objekt
            if (botData.avatarUrl) {
              console.log("USEBOTINFO-DEBUG-001: Setze avatarUrl aus Bot-Objekt");
              setBotAvatarUrl(botData.avatarUrl);
            }
          }

          // Willkommensnachricht setzen
          if (botData.welcomeMessage) {
            console.log("USEBOTINFO-DEBUG-001: Setze welcomeMessage aus Bot-Objekt:", botData.welcomeMessage.substring(0, 30) + "...");
            setWelcomeMessage(botData.welcomeMessage);
          }

          // Bot im Cache speichern
          const existingCache = botCache[botId] || {};
          botCache[botId] = {
            name: botData.name,
            primaryColor: botData.settings?.primaryColor || existingCache.primaryColor || '#3b82f6',
            botBgColor: botData.settings?.botBgColor || existingCache.botBgColor || 'rgba(248, 250, 252, 0.8)',
            botTextColor: botData.settings?.botTextColor || existingCache.botTextColor || '#000000',
            botAccentColor: botData.settings?.botAccentColor || existingCache.botAccentColor || '#3b82f6',
            userBgColor: botData.settings?.userBgColor || existingCache.userBgColor || '',
            userTextColor: botData.settings?.userTextColor || existingCache.userTextColor || '#ffffff',
            showCopyButton: botData.settings?.showCopyButton ?? existingCache.showCopyButton ?? true,
            enableFeedback: botData.settings?.enableFeedback ?? existingCache.enableFeedback ?? false,
            showSuggestions: botData.settings?.showSuggestions ?? existingCache.showSuggestions ?? true,
            avatarUrl: botData.settings?.avatarUrl || botData.avatarUrl || existingCache.avatarUrl,
            welcomeMessage: botData.welcomeMessage,
            messageTemplate: botData.settings?.messageTemplate === null || botData.settings?.messageTemplate === ''
              ? 'default'
              : botData.settings?.messageTemplate || existingCache.messageTemplate || 'default'
          };
        }
      } catch (err) {
        console.error('USEBOTINFO-DEBUG-001: Fehler beim Laden der Bot-Informationen:', err);
        setError('Bot-Informationen konnten nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    };

    // Prüfen, ob Bot bereits im Cache ist
    if (botCache[botId]) {
      console.log("USEBOTINFO-DEBUG-001: Verwende gecachte Bot-Daten für ID:", botId);
      setDataSource('cache');

      const cachedBot = botCache[botId];
      setBotName(cachedBot.name);
      setBotPrimaryColor(cachedBot.primaryColor);
      setBotBgColor(cachedBot.botBgColor || 'rgba(248, 250, 252, 0.8)');
      setBotTextColor(cachedBot.botTextColor || '#000000');
      setBotAccentColor(cachedBot.botAccentColor || '#3b82f6');
      setUserBgColor(cachedBot.userBgColor || '');
      setUserTextColor(cachedBot.userTextColor || '#ffffff');
      setShowCopyButton(cachedBot.showCopyButton);
      setEnableFeedback(cachedBot.enableFeedback);
      setShowSuggestions(cachedBot.showSuggestions);
      setShowNameInHeader(cachedBot.showNameInHeader !== undefined ? cachedBot.showNameInHeader : true);
      setBotAvatarUrl(cachedBot.avatarUrl);
      setWelcomeMessage(cachedBot.welcomeMessage);
      setMessageTemplate(cachedBot.messageTemplate || 'default');
    } else {
      fetchBotInfo();
    }
  }, [botId]);

  // Debug-Ausgabe für die finalen Werte
  useEffect(() => {
    console.log("USEBOTINFO-DEBUG-001: Finale Bot-Einstellungen:", {
      botName,
      botPrimaryColor,
      botBgColor,
      botTextColor,
      botAccentColor,
      userBgColor,
      userTextColor,
      showCopyButton,
      enableFeedback,
      showSuggestions,
      botAvatarUrl: botAvatarUrl ? "vorhanden" : "nicht vorhanden",
      welcomeMessage: welcomeMessage ? "vorhanden" : "nicht vorhanden",
      messageTemplate,
      dataSource
    });
  }, [botName, botPrimaryColor, botBgColor, botTextColor, botAccentColor, userBgColor, userTextColor, showCopyButton, enableFeedback, showSuggestions, botAvatarUrl, welcomeMessage, messageTemplate, dataSource]);

  return {
    botName,
    botPrimaryColor,
    botBgColor,
    botTextColor,
    botAccentColor,
    userBgColor,
    userTextColor,
    showCopyButton,
    enableFeedback,
    showSuggestions,
    showNameInHeader,
    botAvatarUrl,
    welcomeMessage,
    messageTemplate,
    isLoading,
    error,
    dataSource
  };
}