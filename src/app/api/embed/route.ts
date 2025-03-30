import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const botId = searchParams.get('botId')
  const mode = searchParams.get('mode') || 'bubble'
  const position = searchParams.get('position') || 'bottom-right'
  const color = searchParams.get('color') || '#3b82f6'
  const streaming = searchParams.get('streaming') !== 'false' // Standardmäßig true, außer bei explizitem "false"
  
  // Zusätzliche Parameter für mehr Anpassungsmöglichkeiten
  const bubbleSize = searchParams.get('bubbleSize') || '60' // Größe der Chat-Bubble in px
  const offsetX = searchParams.get('offsetX') || '20' // Horizontaler Abstand in px
  const offsetY = searchParams.get('offsetY') || '20' // Vertikaler Abstand in px
  const chatWidth = searchParams.get('chatWidth') || '480' // Standardbreite - etwas größer als typische Bots
  const chatHeight = searchParams.get('chatHeight') || '700' // Standardhöhe - etwas größer als typische Bots
  // Neue Parameter für verbesserte Anpassbarkeit
  const zIndex = searchParams.get('zIndex') || '' // Konfigurierbarer Z-Index

  if (!botId) {
    return new Response('Bot ID erforderlich', { status: 400 })
  }

  // Bot-Daten abrufen
  const bot = await prisma.bot.findUnique({
    where: { id: botId },
    include: {
      settings: true
    }
  })

  if (!bot) {
    return new Response('Bot nicht gefunden', { status: 404 })
  }

  // Bot-Farbe aus den Einstellungen oder aus dem Query-Parameter verwenden
  const botColor = bot.settings?.primaryColor || color

  // JavaScript-Code für das Widget
  const js = `(function() {
    // Bestehenden Container finden statt neuen zu erstellen
    const targetContainerSelector = '#dialog-container';
    const targetContainer = document.querySelector(targetContainerSelector);
    
    if (!targetContainer) {
      console.error('Target container ' + targetContainerSelector + ' not found');
      return;
    }
    
    // Konfigurationsdaten aus Datenattributen auslesen
    const configMode = targetContainer.getAttribute('data-mode') || "${mode}";
    const configPosition = targetContainer.getAttribute('data-position') || "${position}";
    const configColor = targetContainer.getAttribute('data-color') || "${botColor}";
    const configBotId = targetContainer.getAttribute('data-bot-id') || "${botId}";
    const configZIndex = targetContainer.getAttribute('data-z-index') || "${zIndex}";
    const configStreaming = targetContainer.getAttribute('data-streaming') !== "false" ? true : false; // Standardmäßig true
    
    // Erweiterte Einstellungen aus Datenattributen oder Standardwerten
    const configBubbleSize = parseInt(targetContainer.getAttribute('data-bubble-size') || "${bubbleSize}");
    const configOffsetX = parseInt(targetContainer.getAttribute('data-offset-x') || "${offsetX}");
    const configOffsetY = parseInt(targetContainer.getAttribute('data-offset-y') || "${offsetY}");
    const configChatWidth = parseInt(targetContainer.getAttribute('data-chat-width') || "${chatWidth}");
    const configChatHeight = parseInt(targetContainer.getAttribute('data-chat-height') || "${chatHeight}");
    
    // Variablen für die Widget-Konfiguration
    const botId = configBotId;
    const mode = configMode;
    const position = configPosition;
    const color = configColor;
    const streaming = configStreaming;
    const bubbleSize = configBubbleSize;
    const offsetX = configOffsetX;
    const offsetY = configOffsetY;
    const chatWidth = configChatWidth;
    const chatHeight = configChatHeight;

    // CSS Position basierend auf der gewählten Position
    const positionCSS = {
      'bottom-right': { bottom: offsetY + 'px', right: offsetX + 'px' },
      'bottom-left': { bottom: offsetY + 'px', left: offsetX + 'px' },
      'top-right': { top: offsetY + 'px', right: offsetX + 'px' },
      'top-left': { top: offsetY + 'px', left: offsetX + 'px' }
    };

    // Chat-Position basierend auf der Bubble-Position
    const chatPositionCSS = {
      'bottom-right': { bottom: (offsetY + 20) + 'px', right: offsetX + 'px' },
      'bottom-left': { bottom: (offsetY + 20) + 'px', left: offsetX + 'px' },
      'top-right': { top: (offsetY + bubbleSize + 20) + 'px', right: offsetX + 'px' },
      'top-left': { top: (offsetY + bubbleSize + 20) + 'px', left: offsetX + 'px' }
    };

    console.log('Dialog Widget: Initializing with color=' + color + ', mode=' + mode + ', position=' + position);
    console.log('Dialog Widget: Size settings - bubble=' + bubbleSize + ', chat=' + chatWidth + 'x' + chatHeight);

    // Styles hinzufügen
    const style = document.createElement('style');
    style.textContent = \`
      #dialog-container.dialog-bubble-mode {
        position: fixed;
        z-index: 9999;
      }
      .dialog-iframe {
        border: none;
        border-radius: 8px;
        width: 100%;
        height: 100%;
        background-color: white;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .dialog-bubble {
        cursor: pointer;
        width: \${bubbleSize}px;
        height: \${bubbleSize}px;
        border-radius: 50%;
        background-color: \${color} !important;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: transform 0.2s ease-in-out;
        position: fixed;
        z-index: 9999;
      }
      .dialog-bubble:hover {
        transform: scale(1.05);
      }
      .dialog-bubble-icon {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dialog-chat {
        position: fixed;
        width: \${chatWidth}px;
        height: \${chatHeight}px; 
        overflow: visible !important;
        background-color: transparent !important;
        border-radius: 12px !important;
        border: none !important;
        box-shadow: none !important;
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 9999;
      }
      
      .dialog-iframe {
        border: none !important;
        border-radius: 12px !important;
        width: 100% !important;
        height: 100% !important;
        background-color: white;
        box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
        overflow: hidden !important;
        display: block !important;
      }
      
      .dialog-inline-container {
        width: 100%;
        height: 100%;
        position: relative;
      }
      
      /* Responsive Anpassungen für den Chat */
      @media (max-width: 768px) {
        .dialog-chat {
          width: calc(100vw - 32px) !important;
          height: calc(100vh - 100px) !important;
          max-height: calc(100vh - 100px);
          left: 16px;
          right: 16px;
          bottom: 80px;
        }
        
        .dialog-iframe {
          width: 100% !important;
          height: 100% !important;
        }
      }
    \`;
    document.head.appendChild(style);

    // Widget-URL erstellen
    const scriptElement = document.currentScript;
    const scriptUrl = scriptElement ? scriptElement.src : '';
    let baseUrl = '';
    
    try {
      if (scriptUrl) {
        const urlObj = new URL(scriptUrl);
        baseUrl = urlObj.origin;
      } else {
        baseUrl = window.location.origin;
      }
      
      const chatPath = '/embed/chat';
      const widgetUrl = new URL(chatPath, baseUrl);
      
      widgetUrl.searchParams.append('mode', mode);
      widgetUrl.searchParams.append('color', encodeURIComponent(color));
      widgetUrl.searchParams.append('botId', botId);
      widgetUrl.searchParams.append('streaming', streaming.toString()); // Streaming-Parameter hinzufügen
      
      // Z-Index Parameter hinzufügen, wenn gesetzt
      if (configZIndex) {
        widgetUrl.searchParams.append('zIndex', configZIndex);
      }
      
      if (mode === 'bubble') {
        // Erstelle einen neuen Container für die Bubble
        const bubbleContainer = document.createElement('div');
        bubbleContainer.className = 'dialog-bubble';
        bubbleContainer.id = 'dialog-bubble-container';
        
        // Farbe und Position explizit setzen
        bubbleContainer.style.backgroundColor = color;
        bubbleContainer.style.position = 'fixed';
        
        // Positionierung
        if (position.includes('bottom')) {
          bubbleContainer.style.bottom = offsetY + 'px';
        } else {
          bubbleContainer.style.top = offsetY + 'px';
        }
        
        if (position.includes('right')) {
          bubbleContainer.style.right = offsetX + 'px';
        } else {
          bubbleContainer.style.left = offsetX + 'px';
        }
        
        // HTML für Bubble mit Chat und Close Icon
        bubbleContainer.innerHTML = \`
          <div class="dialog-bubble-icon dialog-chat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="dialog-bubble-icon dialog-close-icon" style="display: none;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        \`;
        document.body.appendChild(bubbleContainer);
        
        // Chat-Container erstellen
        const chat = document.createElement('div');
        chat.className = 'dialog-chat';
        chat.id = 'dialog-chat-container';
        
        // Korrekte Positionierung des Chat-Fensters
        chat.style.position = 'fixed';
        chat.style.boxSizing = 'border-box'; 
        chat.style.background = 'transparent';
        chat.style.border = 'none';
        chat.style.boxShadow = 'none';
        chat.style.overflow = 'hidden';
        
        // Berechne Position basierend auf Bubble-Position
        const calcPosition = () => {
          if (window.innerWidth <= 768) {
            // Mobile Darstellung
            chat.style.width = 'calc(100vw - 32px)';
            chat.style.height = 'calc(100vh - 160px)';
            chat.style.bottom = '80px';
            chat.style.left = '16px';
            chat.style.right = '16px';
            chat.style.maxHeight = 'calc(100vh - 160px)';
          } else {
            // Desktop-Darstellung
            chat.style.width = chatWidth + 'px';
            chat.style.height = chatHeight + 'px';
            chat.style.maxHeight = 'none'; // Kein MaxHeight auf Desktop
            
            // Position relativ zur Bubble berechnen
            if (position.includes('bottom')) {
              chat.style.bottom = (parseInt(offsetY) + bubbleSize + 10) + 'px';
              chat.style.top = 'auto'; // Top-Wert zurücksetzen
            } else {
              chat.style.top = (parseInt(offsetY) + bubbleSize + 10) + 'px';
              chat.style.bottom = 'auto'; // Bottom-Wert zurücksetzen
            }
            
            if (position.includes('right')) {
              chat.style.right = offsetX + 'px';
              chat.style.left = 'auto';
            } else {
              chat.style.left = offsetX + 'px';
              chat.style.right = 'auto';
            }
          }
        };
        
        chat.style.display = 'none'; // Initial verstecken
        chat.style.opacity = '0';
        chat.style.transform = 'translateY(10px)';
        
        // Sorge für korrekte Anzeige des iframes - mit direkter Style-Anweisung
        const iframeSrc = widgetUrl.toString();
        chat.innerHTML = \`<iframe class="dialog-iframe" src="\${iframeSrc}" frameBorder="0" title="Chat" style="position:absolute; top:0; left:0; right:0; bottom:0; border:none; border-radius:12px; width:100%; height:100%; background:white; box-shadow:0 6px 30px rgba(0,0,0,0.2); overflow:hidden; display:block;"></iframe>\`;
        document.body.appendChild(chat);
        
        // Initialisiere Position
        calcPosition();
        
        // Event-Listener für Viewport-Änderungen
        window.addEventListener('resize', function() {
          calcPosition();
        });
        
        // Größenanpassung des iframes, um Abschneiden zu verhindern
        const handleFrameLoad = function() {
          const chatFrame = chat.querySelector('iframe');
          if (chatFrame) {
            try {
              // Versuche, die Höhe dynamisch anzupassen
              chatFrame.style.height = '100%';
              chatFrame.style.minHeight = '100%';
              
              // Optional: Nachrichtenweiterleitung für Größenänderungen
              window.addEventListener('message', function(event) {
                if (event.data && event.data.type === 'dialog-resize') {
                  const newHeight = event.data.height;
                  // Hier könnte man die Höhe dynamisch anpassen
                  if (newHeight && newHeight > 0) {
                    chat.style.height = Math.min(newHeight + 50, window.innerHeight - 100) + 'px';
                  }
                }
              });
            } catch (e) {
              console.error('Fehler bei der iframe-Anpassung:', e);
            }
          }
        };
        
        // Event-Listener für das Laden des iframes
        setTimeout(function() {
          const chatFrame = chat.querySelector('iframe');
          if (chatFrame) {
            chatFrame.addEventListener('load', handleFrameLoad);
          }
        }, 100);
        
        // Referenzen zu den Icons
        const chatIcon = bubbleContainer.querySelector('.dialog-chat-icon');
        const closeIcon = bubbleContainer.querySelector('.dialog-close-icon');
        
        // Toggle-Funktion für den Chat
        const toggleChat = function() {
          const isVisible = chat.style.display !== 'none';
          
          if (!isVisible) {
            // Chat öffnen
            calcPosition(); // Position neu berechnen
            chat.style.display = 'block';
            
            // Icons umschalten
            chatIcon.style.display = 'none';
            closeIcon.style.display = 'flex';
            
            // Animation starten
            setTimeout(() => {
              chat.style.opacity = '1';
              chat.style.transform = 'translateY(0)';
            }, 10);
          } else {
            // Chat schließen
            chat.style.opacity = '0';
            chat.style.transform = 'translateY(10px)';
            
            // Icons umschalten
            chatIcon.style.display = 'flex';
            closeIcon.style.display = 'none';
            
            // Nach der Animation ausblenden
            setTimeout(() => {
              chat.style.display = 'none';
            }, 300);
          }
        };
        
        // Click-Handler für die Bubble
        bubbleContainer.addEventListener('click', toggleChat);
        
        // Beim Klick außerhalb des Chats diesen schließen (aber nicht bei Klick auf die Bubble)
        document.addEventListener('click', function(event) {
          const chatContainer = document.getElementById('dialog-chat-container');
          const bubbleContainer = document.getElementById('dialog-bubble-container');
          
          if (chatContainer && chatContainer.style.display !== 'none') {
            if (!chatContainer.contains(event.target) && event.target !== bubbleContainer && !bubbleContainer.contains(event.target)) {
              toggleChat(); // Chat schließen
            }
          }
        });
      } else if (mode === 'inline') {
        // Inline-Modus: Embed direkt in den Container
        const targetContainer = document.getElementById('dialog-container');
        
        // Passe den Container-Stil an
        targetContainer.style.position = 'relative';
        targetContainer.style.overflow = 'hidden';
        targetContainer.style.display = 'flex';
        targetContainer.style.flexDirection = 'column';
        
        // Nehme die Dimensionen aus dem Container selbst
        targetContainer.style.width = targetContainer.getAttribute('data-width') || '100%';
        targetContainer.style.height = targetContainer.getAttribute('data-height') || '100%';
        
        const iframeEl = document.createElement('iframe');
        iframeEl.className = 'dialog-iframe';
        iframeEl.src = widgetUrl.toString();
        iframeEl.title = 'Chat';
        iframeEl.style.border = 'none';
        iframeEl.style.width = '100%';
        iframeEl.style.height = '100%';
        iframeEl.style.flex = '1 1 auto';
        iframeEl.style.minHeight = '0';
        iframeEl.style.borderRadius = '12px';
        iframeEl.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        iframeEl.style.background = 'white';
        iframeEl.style.overflow = 'hidden';
        iframeEl.style.display = 'block';
        
        targetContainer.innerHTML = '';
        targetContainer.appendChild(iframeEl);
      } else if (mode === 'fullscreen') {
        const fullscreenChat = document.createElement('div');
        fullscreenChat.style.position = 'fixed';
        fullscreenChat.style.top = '0';
        fullscreenChat.style.left = '0';
        fullscreenChat.style.width = '100%';
        fullscreenChat.style.height = '100%';
        fullscreenChat.style.zIndex = configZIndex || '9999';
        fullscreenChat.id = 'dialog-fullscreen-container';
        
        // Toggle-Button für den Wechsel zwischen Chat und Website hinzufügen
        const toggleButton = document.createElement('div');
        toggleButton.style.position = 'fixed';
        toggleButton.style.bottom = '20px';
        toggleButton.style.right = '20px';
        toggleButton.style.width = '50px';
        toggleButton.style.height = '50px';
        toggleButton.style.borderRadius = '50%';
        toggleButton.style.backgroundColor = color;
        toggleButton.style.color = 'white';
        toggleButton.style.display = 'flex';
        toggleButton.style.alignItems = 'center';
        toggleButton.style.justifyContent = 'center';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        toggleButton.style.zIndex = '10000';
        toggleButton.innerHTML = \`
          <div class="toggle-chat-icon" style="display: none;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="toggle-web-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
        \`;
        
        // Website-Container zum Anzeigen der ursprünglichen Website
        const websiteContainer = document.createElement('div');
        websiteContainer.style.position = 'fixed';
        websiteContainer.style.top = '0';
        websiteContainer.style.left = '0';
        websiteContainer.style.width = '100%';
        websiteContainer.style.height = '100%';
        websiteContainer.style.zIndex = configZIndex ? (parseInt(configZIndex) - 1).toString() : '9998';
        websiteContainer.style.display = 'none';
        websiteContainer.style.backgroundColor = '#f8f9fa';
        websiteContainer.style.overflow = 'auto';
        websiteContainer.id = 'dialog-website-container';
        
        // Füge den Inhalt der ursprünglichen Webseite in den Container ein
        websiteContainer.innerHTML = \`
          <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
            <h2 style="margin-bottom: 16px; color: #333;">Du befindest dich im Chat-Modus</h2>
            <p style="margin-bottom: 16px; color: #555; line-height: 1.5;">
              Der Chat ist im Vollbildmodus geöffnet. Du kannst mit dem Button unten rechts 
              zwischen dem Chat und dieser Informationsseite wechseln.
            </p>
            <div style="background-color: #e9ecef; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <p style="color: #495057;">Klicke auf das Web-Symbol <span style="display: inline-block; border-radius: 50%; width: 24px; height: 24px; background-color: ${color}; text-align: center; color: white;">🌐</span>, um zurück zum Chat zu gelangen.</p>
            </div>
          </div>
        \`;
        
        // Chat-iframe erstellen
        fullscreenChat.innerHTML = \`<iframe class="dialog-iframe" src="\${widgetUrl.toString()}" title="Chat" style="border: none; width: 100%; height: 100%"></iframe>\`;
        
        // Elemente zum DOM hinzufügen
        document.body.appendChild(fullscreenChat);
        document.body.appendChild(websiteContainer);
        document.body.appendChild(toggleButton);
        
        // Toggle-Funktionalität
        let chatVisible = true;
        toggleButton.addEventListener('click', function() {
          chatVisible = !chatVisible;
          
          if (chatVisible) {
            // Zeige Chat, verstecke Website
            fullscreenChat.style.display = 'block';
            websiteContainer.style.display = 'none';
            document.querySelector('.toggle-chat-icon').style.display = 'none';
            document.querySelector('.toggle-web-icon').style.display = 'block';
          } else {
            // Verstecke Chat, zeige Website
            fullscreenChat.style.display = 'none';
            websiteContainer.style.display = 'block';
            document.querySelector('.toggle-chat-icon').style.display = 'block';
            document.querySelector('.toggle-web-icon').style.display = 'none';
          }
        });
      }
    } catch (error) {
      console.error('Fehler bei der URL-Konstruktion', error);
      targetContainer.innerHTML = '<div style="color: red; padding: 10px;">Fehler beim Laden des Chat-Widgets</div>';
    }
  })();`

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  })
} 