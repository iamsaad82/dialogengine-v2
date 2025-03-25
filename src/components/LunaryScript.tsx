'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export function LunaryScript() {
  const [lunaryConfig, setLunaryConfig] = useState<{enabled: boolean, projectId: string | null}>({
    enabled: false,
    projectId: null
  })
  
  // Laden der Einstellungen für Lunary
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        
        if (response.ok) {
          const data = await response.json()
          setLunaryConfig({
            enabled: data.lunaryEnabled,
            projectId: data.lunaryProjectId
          })
        }
      } catch (error) {
        console.error('Fehler beim Laden der Lunary-Einstellungen:', error)
      }
    }
    
    fetchSettings()
  }, [])

  // Lunary-Skript nur rendern, wenn es aktiviert ist und eine Projekt-ID hat
  if (!lunaryConfig.enabled || !lunaryConfig.projectId) {
    return null
  }

  return (
    <Script
      id="lunary-analytics"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w) {
            w.lunary = w.lunary || function() {
              (w.lunary.q = w.lunary.q || []).push(arguments);
            };
            
            var a = document.createElement('script');
            a.async = true;
            a.src = 'https://cdn.jsdelivr.net/npm/lunary@latest/dist/lunary.umd.production.min.js';
            a.onload = function() {
              w.lunary('init', '${lunaryConfig.projectId}');
            };
            
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(a, s);
          })(window);
        `
      }}
    />
  )
} 