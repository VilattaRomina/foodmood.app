import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import * as Linking from 'expo-linking';
import { useShortcut } from '@/contexts/ShortcutContext';

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<'/camera' | '/(tabs)/list' | null>(null);

  useEffect(() => {
    // Ir por defecto a cámara - comportamiento normal de la app
    console.log('🏠 Index: Going to camera (normal app opening)');
    setInitialRoute('/camera');
  }, []);

  if (!initialRoute) {
    return null; 
  }

  console.log('🏠 Index: Redirecting to:', initialRoute);
  return <Redirect href={initialRoute} />; // se redirige a la ruta inicial
}