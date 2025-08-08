import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import * as Linking from 'expo-linking';

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<'/camera' | '/list' | null>(null);

  useEffect(() => {
    const checkInitialURL = async () => {
      const url = await Linking.getInitialURL();
      
      if (url && (url.includes('/list') || url.includes('shortcut=true'))) {
        setInitialRoute('/list');
      } else {
        setInitialRoute('/camera');
      }
    };

    checkInitialURL();
  }, []);

  if (!initialRoute) {
    return null; 
  }

  return <Redirect href={initialRoute} />;
}