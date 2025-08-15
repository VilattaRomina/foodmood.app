import { useEffect } from 'react';

/**
 * Hook para verificar si la app esta lista
 */

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    window.frameworkReady?.();
  });
}
