import React from 'react';

// Avatar für den Bot
export const BotAvatar: React.FC<{accentColor?: string}> = ({ accentColor }) => (
  <div className="bot-avatar flex items-center justify-center w-8 h-8 text-sm font-medium mr-2 rounded-md bg-white/60 border border-primary/20 text-primary shadow-sm"
    style={{
      backgroundColor: 'var(--bot-avatar-bg, hsla(var(--background), 0.9))',
      borderColor: accentColor || 'var(--bot-accent-color, hsla(var(--border), 0.5))'
    }}
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth="2"
      style={{ color: accentColor || 'var(--bot-accent-color, currentColor)' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  </div>
);

// Avatar für den User
export const UserAvatar: React.FC = () => (
  <div className="user-avatar flex items-center justify-center w-8 h-8 text-xs font-medium ml-2 rounded-md border border-primary/20 bg-primary/90 text-white shadow-sm">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </div>
); 