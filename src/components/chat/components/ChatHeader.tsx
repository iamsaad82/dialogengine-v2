'use client'

import { motion } from 'framer-motion'
import { MessageSquareIcon, XIcon, Minimize2Icon, Maximize2Icon } from './ui/icons'

interface ChatHeaderProps {
  mode: 'bubble' | 'inline' | 'fullscreen'
  onClose: () => void
  onModeChange: () => void
  setMode?: (mode: 'bubble' | 'inline' | 'fullscreen') => void
  botName?: string
  botPrimaryColor?: string
  botAccentColor?: string
  botTextColor?: string
  userTextColor?: string
  embedded?: boolean
}

export function ChatHeader({ 
  mode, 
  onClose, 
  onModeChange, 
  setMode, 
  botName,
  botPrimaryColor,
  botAccentColor,
  botTextColor = '#ffffff',
  userTextColor = '#ffffff',
  embedded = false
}: ChatHeaderProps) {
  // Fallback für fehlenden Bot-Namen
  botName = botName || 'Brandenburg Dialog';

  // Vereinfachte Stile ohne absolute Positionierung
  const headerStyle = {
    backgroundColor: botPrimaryColor || 'hsl(var(--primary))',
    color: botTextColor,
    borderRadius: mode === 'bubble' ? '12px 12px 0 0' : undefined,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    height: '48px',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    flexShrink: 0 as const
  };

  return (
    <motion.header
      className="flex items-center justify-between px-4 py-3 w-full"
      style={headerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      role="banner"
    >
      <div className="flex items-center gap-2">
        <MessageSquareIcon className="h-5 w-5" aria-hidden="true" style={{ color: '#ffffff' }} />
        <h2 className="text-lg font-medium" id="chat-dialog-title" style={{ color: userTextColor }}>{botName}</h2>
      </div>
      
      <div className="flex items-center gap-3" role="toolbar" aria-label="Chat-Steuerung">
        <motion.button
          className="p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-opacity-50"
          style={{
            backgroundColor: 'transparent',
            color: '#ffffff',
          }}
          whileHover={{
            backgroundColor: 'hsla(var(--primary-foreground) / 0.15)',
            color: '#ffffff',
          }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          aria-label="Schließen"
          title="Chat schließen"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onClose();
            }
          }}
        >
          <XIcon className="h-4.5 w-4.5" aria-hidden="true" />
        </motion.button>
      </div>
    </motion.header>
  )
} 