'use client'

import { Chat } from '@/components/chat'

export default function FullscreenSearchPage() {
  return (
    <Chat 
      initialMode="fullscreenSearch"
      embedded={true}
      botId="default"
      suggestions={[
        { text: "Was ist künstliche Intelligenz?" },
        { text: "Wie kann ich meine Gesundheit verbessern?" },
        { text: "Welche Leistungen bietet die AOK an?" },
        { text: "Informationen zur professionellen Zahnreinigung" }
      ]}
    />
  )
}
