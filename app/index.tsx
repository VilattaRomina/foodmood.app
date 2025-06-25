import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la pantalla about
    router.replace('/about');
  }, [router]);

  return null; // No renderizar nada mientras se hace la redirección
} 