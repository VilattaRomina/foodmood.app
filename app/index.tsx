import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import * as Linking from 'expo-linking';
import { useShortcut } from '@/contexts/ShortcutContext';

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<'/camera' | '/list' | null>(null);
  const { setIsFromShortcut } = useShortcut();

  useEffect(() => {
    const checkInitialURL = async () => {
      const url = await Linking.getInitialURL();
      
      if (url && (url.includes('/list') || url.includes('shortcut=true'))) {
        setIsFromShortcut(true);
        setInitialRoute('/list');
      } else {
        setInitialRoute('/camera');
      }
    };

    checkInitialURL();
  }, [setIsFromShortcut]);

  if (!initialRoute) {
    return null; 
  }

  return <Redirect href={initialRoute} />;
}