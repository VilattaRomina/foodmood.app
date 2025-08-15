/**
 * Este hook permite que tu app responda a acciones rápidas del sistema, como cuando 
 * el usuario mantiene presionado el icono de la app y aparece un menú con opciones.
 */
import { useEffect } from 'react';
import { router } from 'expo-router';
import * as QuickActions from 'expo-quick-actions';
import { useShortcut } from '@/contexts/ShortcutContext';

export function useQuickActions() {
  const { setIsFromShortcut } = useShortcut();

  useEffect(() => {
    // se escucha el evento de acciones rápidas
    const subscription = QuickActions.addListener(({ params }) => {
      if (params?.url) {
        setIsFromShortcut(true); //marca que la app se abrio desde un shortcut
        router.push(params.url as any);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [setIsFromShortcut]);
}