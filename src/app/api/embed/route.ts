import { NextResponse } from "next/server"

export async function GET() {
  // Das JavaScript für das Embed-Widget
  const js = `(function() {
    // Konfiguration aus dem Container-Element auslesen
    const container = document.getElementById('brandenburg-dialog-container');
    if (!container) {
      console.error('Brandenburg Dialog: Container nicht gefunden');
      return;
    }
    
    // Parameter auslesen
    const mode = container.getAttribute('data-mode') || 'bubble';
    const color = container.getAttribute('data-color') || '#e63946';
    const position = container.getAttribute('data-position') || 'bottom-right';
    const botId = container.getAttribute('data-bot-id') || '';
    
    // CSS für das Widget erstellen
    const style = document.createElement('style');
    style.textContent = \`
      #brandenburg-dialog-container {
        position: relative;
        font-family: system-ui, sans-serif;
      }
      #brandenburg-dialog-iframe {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      #brandenburg-dialog-bubble {
        position: fixed;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: \${color};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease;
        z-index: 9999;
      }
      #brandenburg-dialog-bubble:hover {
        transform: scale(1.1);
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
        width: 380px;
        height: 600px;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 9998;
        display: none;
      }
    \`;
    document.head.appendChild(style);
    
    // Widget-URL erstellen
    // Holen Sie das aktuelle Skript, um die Basis-URL zu extrahieren
    const scriptElement = document.currentScript;
    const scriptUrl = scriptElement ? scriptElement.src : '';
    let baseUrl = '';
    
    try {
      // Ermittle die Basis-URL vom Skript-Pfad
      if (scriptUrl) {
        const urlObj = new URL(scriptUrl);
        baseUrl = urlObj.origin; // nur Origin (Protokoll + Host + Port)
      } else {
        // Fallback auf den aktuellen Seitenursprung
        baseUrl = window.location.origin;
      }
      
      // Vollständige URL mit Basis erstellen
      const chatPath = '/embed/chat';
      const widgetUrl = new URL(chatPath, baseUrl);
      
      // Parameter hinzufügen
      widgetUrl.searchParams.append('mode', mode);
      widgetUrl.searchParams.append('color', encodeURIComponent(color));
      
      // Bot-ID hinzufügen, wenn vorhanden
      if (botId) {
        widgetUrl.searchParams.append('botId', botId);
      }
      
      // Widget initialisieren
      if (mode === 'bubble') {
        // Bubble-Modus: Chat-Icon in der Ecke
        const bubble = document.createElement('div');
        bubble.id = 'brandenburg-dialog-bubble';
        bubble.className = 'brandenburg-dialog-' + position;
        bubble.innerHTML = \`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        \`;
        document.body.appendChild(bubble);
        
        // Chat-Container
        const chat = document.createElement('div');
        chat.id = 'brandenburg-dialog-chat';
        chat.innerHTML = \`<iframe id="brandenburg-dialog-iframe" src="\${widgetUrl.toString()}" title="Brandenburg Dialog Chat"></iframe>\`;
        document.body.appendChild(chat);
        
        // Klick-Event auf Bubble
        bubble.addEventListener('click', function() {
          const chatEl = document.getElementById('brandenburg-dialog-chat');
          if (chatEl.style.display === 'none' || chatEl.style.display === '') {
            chatEl.style.display = 'block';
          } else {
            chatEl.style.display = 'none';
          }
        });
      } else if (mode === 'inline') {
        // Inline-Modus: Chat direkt in der Seite eingebettet
        container.innerHTML = \`<iframe id="brandenburg-dialog-iframe" src="\${widgetUrl.toString()}" title="Brandenburg Dialog Chat"></iframe>\`;
      } else if (mode === 'fullscreen') {
        // Vollbild-Modus
        const fullscreenChat = document.createElement('div');
        fullscreenChat.style.position = 'fixed';
        fullscreenChat.style.top = '0';
        fullscreenChat.style.left = '0';
        fullscreenChat.style.width = '100%';
        fullscreenChat.style.height = '100%';
        fullscreenChat.style.zIndex = '9999';
        fullscreenChat.innerHTML = \`<iframe id="brandenburg-dialog-iframe" src="\${widgetUrl.toString()}" title="Brandenburg Dialog Chat" style="width: 100%; height: 100%; border: none;"></iframe>\`;
        container.appendChild(fullscreenChat);
      }
    } catch (error) {
      console.error('Brandenburg Dialog: Fehler bei der URL-Konstruktion', error);
      // Sicherstellen, dass der Container eine Fehlermeldung anzeigt
      container.innerHTML = '<div style="color: red; padding: 10px;">Fehler beim Laden des Brandenburg Dialog Widgets</div>';
    }
  })();`

  // Setze den Content-Type auf JavaScript
  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  })
} 