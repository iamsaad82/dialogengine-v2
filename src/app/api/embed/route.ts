import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const botId = searchParams.get('botId')
  const mode = searchParams.get('mode') || 'bubble'
  const position = searchParams.get('position') || 'bottom-right'
  const color = searchParams.get('color') || '#3b82f6'

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
    container.id = 'brandenburg-dialog-container';
    document.body.appendChild(container);

    // Styles hinzufügen
    const style = document.createElement('style');
    style.textContent = \`
      #brandenburg-dialog-container {
        position: fixed;
        z-index: 9999;
      }
      #brandenburg-dialog-iframe {
        border: none;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      #brandenburg-dialog-bubble {
        cursor: pointer;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: \${color};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      #brandenburg-dialog-bubble:hover {
        transform: scale(1.05);
        transition: transform 0.2s;
      }
      .brandenburg-dialog-bottom-right {
        bottom: 20px;
        right: 20px;
      }
      .brandenburg-dialog-bottom-left {
        bottom: 20px;
        left: 20px;
      }
      .brandenburg-dialog-top-right {
        top: 20px;
        right: 20px;
      }
      .brandenburg-dialog-top-left {
        top: 20px;
        left: 20px;
      }
      #brandenburg-dialog-chat {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 8px;
        overflow: hidden;
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
        bubble.id = 'brandenburg-dialog-bubble';
        bubble.className = 'brandenburg-dialog-' + position;
        bubble.innerHTML = \`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        \`;
        document.body.appendChild(bubble);
        
        const chat = document.createElement('div');
        chat.id = 'brandenburg-dialog-chat';
        chat.innerHTML = \`<iframe id="brandenburg-dialog-iframe" src="\${widgetUrl.toString()}" title="${bot.name} Chat"></iframe>\`;
        document.body.appendChild(chat);
        
        bubble.addEventListener('click', function() {
          const chatEl = document.getElementById('brandenburg-dialog-chat');
          if (chatEl.style.display === 'none' || chatEl.style.display === '') {
            chatEl.style.display = 'block';
          } else {
            chatEl.style.display = 'none';
          }
        });
      } else if (mode === 'inline') {
        container.innerHTML = \`<iframe id="brandenburg-dialog-iframe" src="\${widgetUrl.toString()}" title="${bot.name} Chat"></iframe>\`;
      } else if (mode === 'fullscreen') {
        const fullscreenChat = document.createElement('div');
        fullscreenChat.style.position = 'fixed';
        fullscreenChat.style.top = '0';
        fullscreenChat.style.left = '0';
        fullscreenChat.style.width = '100%';
        fullscreenChat.style.height = '100%';
        fullscreenChat.style.zIndex = '9999';
        fullscreenChat.innerHTML = \`<iframe id="brandenburg-dialog-iframe" src="\${widgetUrl.toString()}" title="${bot.name} Chat" style="width: 100%; height: 100%; border: none;"></iframe>\`;
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