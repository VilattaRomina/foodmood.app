import { useEffect } from 'react';
import { router } from 'expo-router';
import * as QuickActions from 'expo-quick-actions';
import { useShortcut } from '@/contexts/ShortcutContext';

export function useQuickActions() {
  const { setIsFromShortcut } = useShortcut();

  useEffect(() => {
    const subscription = QuickActions.addListener(({ params }) => {
      if (params?.url) {
        setIsFromShortcut(true);
        router.push(params.url as any);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [setIsFromShortcut]);
}