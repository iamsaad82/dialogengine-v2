'use client'

import { motion, useReducedMotion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { MessageSquareIcon } from './ui/icons'
import { useCallback, useEffect } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

interface ChatBubbleProps {
  onClick: () => void
}

export function ChatBubble({ onClick }: ChatBubbleProps) {
  const prefersReducedMotion = useReducedMotion()
  
  // Physik-basierte Animation
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Physik-basierte Federanimation mit Dämpfung
  const springConfig = { stiffness: 300, damping: 20, mass: 0.5 }
  
  // X-Position mit Federeffekt
  const rotateX = useSpring(
    useTransform(mouseY, [-100, 100], [5, -5]), 
    springConfig
  )
  
  // Y-Position mit Federeffekt
  const rotateY = useSpring(
    useTransform(mouseX, [-100, 100], [-5, 5]), 
    springConfig
  )
  
  // Scale-Animation mit Federeffekt
  const scale = useSpring(1, { stiffness: 700, damping: 30 })
  
  // Event-Handler für Mausbewegung
  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }, [mouseX, mouseY])
  
  // Event-Handler für Mouse Enter/Leave
  const handleMouseEnter = () => scale.set(1.07)
  const handleMouseLeave = () => {
    scale.set(1)
    mouseX.set(0)
    mouseY.set(0)
  }
  
  useEffect(() => {
    // Hier könnten bei Bedarf globale Event-Listener hinzugefügt werden
    return () => {
      // Cleanup, falls nötig
    }
  }, [])

  return (
    <motion.button
      className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full shadow-lg glassmorphism-dark overflow-hidden"
      style={{
        backgroundColor: 'hsla(var(--primary), 0.9)',
        color: 'hsl(var(--primary-foreground))',
        scale,
        rotateX, 
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 800
      }}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 15,
          mass: 1,
          duration: 0.5,
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Chat öffnen"
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      title="Stadt-Assistenten öffnen"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <motion.div
        className="relative z-10"
        animate={{ 
          rotate: [0, -5, 0, 5, 0],
          transition: { 
            repeat: Infinity, 
            repeatType: "reverse",
            duration: 5,
            ease: "easeInOut"
          }
        }}
      >
        <MessageSquareIcon className="h-7 w-7" aria-hidden="true" />
      </motion.div>
      
      {!prefersReducedMotion && (
        <>
          <motion.span
            className="absolute h-full w-full rounded-full"
            style={{
              border: '1px solid hsla(var(--primary) / 0.3)',
              boxShadow: '0 0 10px 2px hsla(var(--primary) / 0.2)',
            }}
            initial={{ opacity: 0.3, scale: 1 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeOut",
            }}
            aria-hidden="true"
          />
          
          {/* Zusätzliche Lichtreflexion für 3D-Effekt */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"
            style={{
              rotate: rotateY,
              translateY: rotateX,
              transformStyle: "preserve-3d"
            }}
            aria-hidden="true"
          />
        </>
      )}
      <span className="sr-only">Stadt-Assistenten öffnen - Chatbot für Informationen zur Stadtverwaltung</span>
    </motion.button>
  )
} 