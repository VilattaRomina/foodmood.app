import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ShortcutContextType {
  isFromShortcut: boolean;
  setIsFromShortcut: (value: boolean) => void;
}

const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined);

export function ShortcutProvider({ children }: { children: ReactNode }) {
  const [isFromShortcut, setIsFromShortcut] = useState(false);

  return (
    <ShortcutContext.Provider value={{ isFromShortcut, setIsFromShortcut }}>
      {children}
    </ShortcutContext.Provider>
  );
}

export function useShortcut() {
  const context = useContext(ShortcutContext);
  if (context === undefined) {
    throw new Error('useShortcut must be used within a ShortcutProvider');
  }
  return context;
}