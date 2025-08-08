import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useQuickActions } from '@/hooks/useQuickActions';
import { ShortcutProvider, useShortcut } from '@/contexts/ShortcutContext';
import { BackHandler } from 'react-native';

function StackNavigator() {
  const { isFromShortcut } = useShortcut();

  useEffect(() => {
    if (isFromShortcut) {
      const backAction = () => {
        BackHandler.exitApp();
        return true; 
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }
  }, [isFromShortcut]);



  return (
    <Stack 
      initialRouteName="camera"
      screenOptions={{
        headerStyle: { backgroundColor: "white" },
        headerTintColor: "black",
      }}>
      <Stack.Screen 
        name="camera" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="form" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: true,
          headerTitle: "FoodMood",
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerStyle: {
            backgroundColor: "white",
          },

        }} 
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ShortcutProvider>
      <AppContent />
    </ShortcutProvider>
  );
}

function AppContent() {
  useFrameworkReady();
  useQuickActions();

  return (
    <>
      <StackNavigator />
      <StatusBar style="auto" />
    </>
  );
}