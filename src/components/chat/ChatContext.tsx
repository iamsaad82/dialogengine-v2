'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface ChatContextProps {
  lastUserMessageTimestamp: number;
  updateLastUserMessageTimestamp: () => void;
  isMallMode: boolean;
  setIsMallMode: (value: boolean) => void;
  activeBotId: string | null;
  setActiveBotId: (id: string | null) => void;
}

const defaultChatContext: ChatContextProps = {
  lastUserMessageTimestamp: 0,
  updateLastUserMessageTimestamp: () => {},
  isMallMode: false,
  setIsMallMode: () => {},
  activeBotId: null,
  setActiveBotId: () => {}
};

const ChatContext = createContext<ChatContextProps>(defaultChatContext);

export const useChatContext = () => useContext(ChatContext);

export const ChatContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [lastUserMessageTimestamp, setLastUserMessageTimestamp] = useState<number>(Date.now());
  const [isMallMode, setIsMallMode] = useState<boolean>(false);
  const [activeBotId, setActiveBotId] = useState<string | null>(null);
  
  // Funktion zum Aktualisieren des Zeitstempels
  const updateLastUserMessageTimestamp = () => {
    setLastUserMessageTimestamp(Date.now());
    console.log(`🕑 ChatContext: Zeitstempel aktualisiert: ${new Date().toISOString()}`);
  };
  
  // Debug-Ausgabe
  useEffect(() => {
    console.log(`💬 ChatContext initialisiert`);
    
    return () => {
      console.log(`💬 ChatContext bereinigt`);
    };
  }, []);
  
  // Debug-Ausgabe für Mall-Modus-Änderungen
  useEffect(() => {
    console.log(`🏬 Mall-Modus geändert: ${isMallMode ? 'aktiviert' : 'deaktiviert'}`);
  }, [isMallMode]);
  
  // Debug-Ausgabe für Bot-ID-Änderungen
  useEffect(() => {
    console.log(`🤖 Aktiver Bot geändert: ${activeBotId || 'kein Bot'}`);
  }, [activeBotId]);
  
  const contextValue: ChatContextProps = {
    lastUserMessageTimestamp,
    updateLastUserMessageTimestamp,
    isMallMode,
    setIsMallMode,
    activeBotId,
    setActiveBotId
  };
  
  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}; 