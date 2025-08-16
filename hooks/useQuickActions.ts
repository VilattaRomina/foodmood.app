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
    console.log('🎯 useQuickActions: Effect started');
    
    // PRIMERO registrar el listener antes de setup
    console.log('📡 Registering QuickAction listener...');
    const subscription = QuickActions.addListener((action) => {
      console.log('🚀🚀🚀 SHORTCUT ACTIVATED! 🚀🚀🚀');
      console.log('Full action object:', JSON.stringify(action, null, 2));
      console.log('Action id:', action.id);
      console.log('Action title:', action.title);
      console.log('Action params:', action.params);
      
      // Detectar CUALQUIER activación y navegar
      console.log('🔄 NAVEGANDO AL LISTADO INMEDIATAMENTE');
      
      try {
        // Navegación súper directa
        router.replace('/(tabs)/list');
        console.log('✅ Navegación ejecutada');
      } catch (error) {
        console.error('❌ Error en navegación:', error);
      }
    });
    console.log('✅ QuickAction listener registered');

    // DESPUÉS hacer el setup
    const setupQuickActions = async () => {
      try {
        console.log('🔧 Setting up QuickActions...');
        await QuickActions.setItems([
          {
            id: 'view_records',
            title: 'Ver Mis Registros',
            subtitle: 'Acceso rápido a tus comidas',
            icon: 'ic_shortcut_records',
            params: { 
              target: 'list',
              source: 'shortcut'
            }
          }
        ]);
        console.log('✅ QuickActions setup completed');
      } catch (error) {
        console.log('❌ Error setting up quick actions:', error);
      }
    };

    setupQuickActions();

    return () => {
      console.log('🧹 Cleaning up QuickAction listener');
      subscription?.remove();
    };
  }, [setIsFromShortcut]);
}