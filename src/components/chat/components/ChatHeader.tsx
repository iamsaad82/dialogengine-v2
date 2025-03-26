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
}

export function ChatHeader({ 
  mode, 
  onClose, 
  onModeChange, 
  setMode, 
  botName = 'SMG Dialog Engine', 
  botPrimaryColor 
}: ChatHeaderProps) {
  // Dynamische Styling basierend auf der Bot-Primärfarbe
  const headerStyle = botPrimaryColor 
    ? {
        backgroundColor: botPrimaryColor,
        color: 'white', // Weißer Text auf der Primärfarbe für guten Kontrast
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      }
    : {
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      };

  return (
    <motion.header
      className="flex items-center justify-between px-4 py-3"
      style={headerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      role="banner"
    >
      <div className="flex items-center gap-2">
        <MessageSquareIcon className="h-5 w-5" aria-hidden="true" />
        <h2 className="text-lg font-medium" id="chat-dialog-title">{botName}</h2>
      </div>
      
      <div className="flex items-center gap-3" role="toolbar" aria-label="Chat-Steuerung">
        <motion.button
          className="p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-opacity-50"
          style={{
            backgroundColor: 'transparent',
            color: 'hsl(var(--primary-foreground) / 0.8)',
          }}
          whileHover={{
            backgroundColor: 'hsla(var(--primary-foreground) / 0.15)',
            color: 'hsl(var(--primary-foreground))',
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