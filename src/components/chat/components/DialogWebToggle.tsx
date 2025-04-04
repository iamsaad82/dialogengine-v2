'use client'

import { useEffect } from "react";
import { DialogWebToggleProps } from "../types/common";

export const DialogWebToggle = ({ 
  botPrimaryColor, 
  isDialogMode, 
  toggleDialogMode, 
  embedded = false,
  fixed = false
}: DialogWebToggleProps) => {
  // Dialog-Modus CSS-Klasse zum body und html hinzufügen/entfernen
  useEffect(() => {
    if (!embedded) {
      if (isDialogMode) {
        // Dialog-Modus - Fullscreen mit Hintergrund
        document.body.classList.add('dialog-mode');
        document.documentElement.classList.add('dialog-mode');
        document.body.style.background = `linear-gradient(135deg, rgba(36, 59, 85, 0.8), rgba(20, 30, 48, 0.95))`;
        
        // Chat-Container für Fullscreen
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
          chatContainer.classList.add('fullscreen-dialog');
          chatContainer.classList.remove('fullscreen-classic');
          chatContainer.classList.remove('web-mode-hidden');
        }
        
        // Toggle-Container anpassen
        const toggleContainer = document.getElementById('dialog-web-toggle');
        if (toggleContainer) {
          toggleContainer.classList.add('dialog-mode-toggle');
          toggleContainer.classList.remove('web-mode-toggle');
        }

        // Overlay für Dialog-Modus hinzufügen
        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-dialog-overlay';
        overlay.id = 'dialog-overlay';
        if (!document.getElementById('dialog-overlay')) {
          document.body.appendChild(overlay);
        }
        
        console.log("Dialog-Modus aktiviert. Body-Klassen:", document.body.className);
      } else {
        // Web-Modus - Nur Toggle sichtbar, Rest versteckt
        document.body.classList.remove('dialog-mode');
        document.documentElement.classList.remove('dialog-mode');
        document.body.style.background = 'transparent';
        
        // Chat-Container ausblenden im Web-Modus
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
          chatContainer.classList.remove('fullscreen-dialog');
          chatContainer.classList.add('fullscreen-classic');
          chatContainer.classList.add('web-mode-hidden');
        }
        
        // Toggle-Container anpassen
        const toggleContainer = document.getElementById('dialog-web-toggle');
        if (toggleContainer) {
          toggleContainer.classList.remove('dialog-mode-toggle');
          toggleContainer.classList.add('web-mode-toggle');
        }
        
        // Overlay entfernen
        const overlay = document.getElementById('dialog-overlay');
        if (overlay) {
          overlay.remove();
        }
        
        console.log("Web-Modus aktiviert. Body-Klassen:", document.body.className);
      }
    }

    // Cleanup beim Unmounten
    return () => {
      if (!embedded) {
        document.body.classList.remove('dialog-mode');
        document.documentElement.classList.remove('dialog-mode');
        document.body.style.background = '';
        
        const overlay = document.getElementById('dialog-overlay');
        if (overlay) {
          overlay.remove();
        }
      }
    };
  }, [isDialogMode, embedded]);
  
  // Debug-Ausgaben
  useEffect(() => {
    console.log("SUGGESTIONS-DEBUG: Im DialogWebToggle, botPrimaryColor:", botPrimaryColor, "isDialogMode:", isDialogMode);
  }, [botPrimaryColor, isDialogMode]);
  
  return (
    <div
      id="dialog-web-toggle"
      className={`overflow-hidden font-medium neumorphic ${isDialogMode ? 'dialog-mode-toggle' : 'web-mode-toggle'}`}
      style={{
        top: fixed ? '10px' : '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '3px',
        display: 'flex',
        position: 'fixed',
        width: '180px',
        pointerEvents: 'auto',
        zIndex: 999, // Höchster z-index, damit der Toggle immer sichtbar bleibt
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(8px)',
        borderRadius: '100px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Hintergrund-Indikator mit 3D-Effekt */}
      <div
        className="absolute toggle-indicator"
        style={{
          left: isDialogMode ? '50%' : '0',
          top: '3px',
          width: '50%',
          height: 'calc(100% - 6px)',
          borderRadius: '100px',
          backgroundColor: botPrimaryColor || 'hsl(var(--primary))',
          zIndex: 0,
          transform: isDialogMode ? 'translateX(0)' : 'translateX(0)',
        }}
      >
        {/* Oberer Highlight-Effekt */}
        <div 
          className="absolute opacity-80" 
          style={{
            top: '0',
            left: '10%',
            right: '10%',
            height: '1px',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '100px',
          }}
        />
      </div>
      
      <button
        className={`py-2 px-3 z-10 transition-all duration-300 relative flex items-center justify-center gap-1.5 neumorphic-btn ${!isDialogMode ? 'text-white font-bold' : 'text-gray-600 hover:text-gray-800'}`}
        style={{
          borderRadius: '100px',
          flex: 1,
          transform: !isDialogMode ? 'scale(1.02)' : 'scale(1)',
        }}
        onClick={() => {
          if (isDialogMode) toggleDialogMode();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm">Web</span>
      </button>
      
      <button
        className={`py-2 px-3 z-10 transition-all duration-300 relative flex items-center justify-center gap-1.5 neumorphic-btn ${isDialogMode ? 'text-white font-bold' : 'text-gray-600 hover:text-gray-800'}`}
        style={{
          borderRadius: '100px',
          flex: 1,
          transform: isDialogMode ? 'scale(1.02)' : 'scale(1)',
        }}
        onClick={() => {
          if (!isDialogMode) toggleDialogMode();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="text-sm">Dialog</span>
      </button>
    </div>
  );
}; 