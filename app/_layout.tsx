import React, { useEffect } from 'react';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useQuickActions } from '@/hooks/useQuickActions';

export default function RootLayout() {
  useFrameworkReady();
  useQuickActions();

  return (
    <>
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
            headerLeft: () => (
              <Link href="/camera" asChild>
                <TouchableOpacity style={{ marginLeft: 16 }}>
                  <ArrowLeft size={24} color="#6b7280" />
                </TouchableOpacity>
              </Link>
            ),
            headerRight: () => (
              <Link href="/camera" asChild>
                <TouchableOpacity style={{ marginRight: 16 }}>
                  <Camera size={24} color="#6b7280" />
                </TouchableOpacity>
              </Link>
            ),
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}