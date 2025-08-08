import { useEffect } from 'react';
import { router } from 'expo-router';
import * as QuickActions from 'expo-quick-actions';

export function useQuickActions() {
  useEffect(() => {
    const subscription = QuickActions.addListener(({ params }) => {
      if (params?.url) {
        router.push(params.url as any);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);
}