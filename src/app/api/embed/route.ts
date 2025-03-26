import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const botId = searchParams.get('botId')
  const mode = searchParams.get('mode') || 'bubble'
  const position = searchParams.get('position') || 'bottom-right'
  const color = searchParams.get('color') || '#3b82f6'
  
  // Zusätzliche Parameter für mehr Anpassungsmöglichkeiten
  const bubbleSize = searchParams.get('bubbleSize') || '60' // Größe der Chat-Bubble in px
  const offsetX = searchParams.get('offsetX') || '20' // Horizontaler Abstand in px
  const offsetY = searchParams.get('offsetY') || '20' // Vertikaler Abstand in px
  const chatWidth = searchParams.get('chatWidth') || '350' // Breite des Chat-Fensters in px
  const chatHeight = searchParams.get('chatHeight') || '500' // Höhe des Chat-Fensters in px

  if (!botId) {
    return new Response('Bot ID erforderlich', { status: 400 })
  }

  // Bot-Daten abrufen
  const bot = await prisma.bot.findUnique({
    where: { id: botId }
  })

  if (!bot) {
    return new Response('Bot nicht gefunden', { status: 404 })
  }

  // JavaScript-Code für das Widget
  const js = `(function() {
    // Container erstellen
    const container = document.createElement('div');
    container.id = 'smg-dialog-container';
    document.body.appendChild(container);

    // Variablen für die Widget-Konfiguration
    const botId = "${botId}";
    const mode = "${mode}";
    const position = "${position}";
    const color = "${color}";
    const bubbleSize = ${bubbleSize};
    const offsetX = ${offsetX};
    const offsetY = ${offsetY};
    const chatWidth = ${chatWidth};
    const chatHeight = ${chatHeight};

    // CSS Position basierend auf der gewählten Position
    const positionCSS = {
      'bottom-right': { bottom: offsetY + 'px', right: offsetX + 'px' },
      'bottom-left': { bottom: offsetY + 'px', left: offsetX + 'px' },
      'top-right': { top: offsetY + 'px', right: offsetX + 'px' },
      'top-left': { top: offsetY + 'px', left: offsetX + 'px' }
    };

    // Chat-Position basierend auf der Bubble-Position
    const chatPositionCSS = {
      'bottom-right': { bottom: (parseInt(offsetY) + parseInt(bubbleSize) + 10) + 'px', right: offsetX + 'px' },
      'bottom-left': { bottom: (parseInt(offsetY) + parseInt(bubbleSize) + 10) + 'px', left: offsetX + 'px' },
      'top-right': { top: (parseInt(offsetY) + parseInt(bubbleSize) + 10) + 'px', right: offsetX + 'px' },
      'top-left': { top: (parseInt(offsetY) + parseInt(bubbleSize) + 10) + 'px', left: offsetX + 'px' }
    };

    // Styles hinzufügen
    const style = document.createElement('style');
    style.textContent = \`
      #smg-dialog-container {
        position: fixed;
        z-index: 9999;
      }
      #smg-dialog-iframe {
        border: none;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      #smg-dialog-bubble {
        cursor: pointer;
        width: \${bubbleSize}px;
        height: \${bubbleSize}px;
        border-radius: 50%;
        background-color: \${color};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: transform 0.2s ease-in-out;
      }
      #smg-dialog-bubble:hover {
        transform: scale(1.05);
      }
      #smg-dialog-chat {
        position: fixed;
        width: \${chatWidth}px;
        height: \${chatHeight}px;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        transition: opacity 0.3s ease, transform 0.3s ease;
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
      
      if (mode === 'bubble') {
        const bubble = document.createElement('div');
        bubble.id = 'smg-dialog-bubble';
        
        // Setze Position aus den berechneten CSS-Werten
        Object.assign(bubble.style, positionCSS[position]);
        
        bubble.innerHTML = \`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        \`;
        document.body.appendChild(bubble);
        
        const chat = document.createElement('div');
        chat.id = 'smg-dialog-chat';
        
        // Setze Position aus den berechneten CSS-Werten
        Object.assign(chat.style, chatPositionCSS[position]);
        
        chat.style.display = 'none'; // Initial verstecken
        chat.style.opacity = '0';
        chat.style.transform = 'translateY(10px)';
        chat.innerHTML = \`<iframe id="smg-dialog-iframe" src="\${widgetUrl.toString()}" title="${bot.name} Chat" style="width: 100%; height: 100%;"></iframe>\`;
        document.body.appendChild(chat);
        
        bubble.addEventListener('click', function() {
          const chatEl = document.getElementById('smg-dialog-chat');
          if (chatEl.style.display === 'none' || chatEl.style.display === '') {
            chatEl.style.display = 'block';
            // Nach einem kurzen Timeout die Animation starten
            setTimeout(() => {
              chatEl.style.opacity = '1';
              chatEl.style.transform = 'translateY(0)';
            }, 10);
          } else {
            chatEl.style.opacity = '0';
            chatEl.style.transform = 'translateY(10px)';
            // Nach der Animation ausblenden
            setTimeout(() => {
              chatEl.style.display = 'none';
            }, 300);
          }
        });
      } else if (mode === 'inline') {
        container.innerHTML = \`<iframe id="smg-dialog-iframe" src="\${widgetUrl.toString()}" title="${bot.name} Chat" style="width: 100%; height: 500px;"></iframe>\`;
      } else if (mode === 'fullscreen') {
        const fullscreenChat = document.createElement('div');
        fullscreenChat.style.position = 'fixed';
        fullscreenChat.style.top = '0';
        fullscreenChat.style.left = '0';
        fullscreenChat.style.width = '100%';
        fullscreenChat.style.height = '100%';
        fullscreenChat.style.zIndex = '9999';
        fullscreenChat.innerHTML = \`<iframe id="smg-dialog-iframe" src="\${widgetUrl.toString()}" title="${bot.name} Chat" style="width: 100%; height: 100%; border: none;"></iframe>\`;
        container.appendChild(fullscreenChat);
      }
    } catch (error) {
      console.error('Fehler bei der URL-Konstruktion', error);
      container.innerHTML = '<div style="color: red; padding: 10px;">Fehler beim Laden des Chat-Widgets</div>';
    }
  })();`

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  })
} 