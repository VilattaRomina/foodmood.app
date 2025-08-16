/**
 * Contexto para saber si la app se abrio desde un shortcut

 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ShortcutContextType {
  isFromShortcut: boolean;
  setIsFromShortcut: (value: boolean) => void;
  resetShortcutFlag: () => void;
}

const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined);

export function ShortcutProvider({ children }: { children: ReactNode }) {
  const [isFromShortcut, setIsFromShortcut] = useState(false); //estado inicial de la app

  // Debug: log cuando cambia el estado
  const setShortcutWithLog = (value: boolean) => {
    console.log('🔄 ShortcutContext: Setting isFromShortcut to:', value);
    setIsFromShortcut(value);
  };

  const resetShortcutFlag = () => {
    console.log('🧹 ShortcutContext: Resetting shortcut flag to false');
    setIsFromShortcut(false);
  };

  return (
    <ShortcutContext.Provider value={{ 
      isFromShortcut, 
      setIsFromShortcut: setShortcutWithLog,
      resetShortcutFlag 
    }}>
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