import React, { useEffect, useState } from 'react';
import { View,  StyleSheet,  Alert, ActivityIndicator, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { useShortcut } from '@/contexts/ShortcutContext';

export default function CameraScreen() {
  const insets = useSafeAreaInsets(); // hook para obtener el area segura de la pantalla
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isFromShortcut } = useShortcut();

  // Manejar el botón back para cerrar la app
  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true; // Prevenir el comportamiento por defecto
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  // Abrir cámara automáticamente al montar el componente
  useEffect(() => {
    console.log('📱 CameraScreen: Starting camera automatically');
    
    const openCameraOnMount = async () => {
      try {
        console.log('📱 Normal camera flow - opening camera automatically');
        setIsOpeningCamera(true);
        // Pequeño delay para asegurar que la pantalla esté lista
        setTimeout(() => {
          openCamera();
        }, 500);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error opening camera:', error);
        setIsOpeningCamera(false);
        setIsInitialized(true);
      }
    };
    
    openCameraOnMount();
  }, []);

  // función para copiar la imagen a una ubicación permanente
  const copyImageToPermanentLocation = async (originalUri: string): Promise<string> => {
    try {
      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) {
        console.warn('Document directory not available, using original URI');
        return originalUri;
      }

      // Crear directorio temporal si no existe
      const tempDir = `${documentDir}temp_images/`;
      const dirInfo = await FileSystem.getInfoAsync(tempDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
      }

      const timestamp = Date.now();
      const extension = originalUri.split('.').pop() || 'jpg';
      const permanentUri = `${tempDir}captured_${timestamp}.${extension}`;

      // Verificar que la imagen original existe
      const sourceInfo = await FileSystem.getInfoAsync(originalUri);
      if (!sourceInfo.exists) {
        console.warn('Original image file not found, using original URI:', originalUri);
        return originalUri;
      }

      // Intentar copy primero (más confiable en producción)
      try {
        await FileSystem.copyAsync({
          from: originalUri,
          to: permanentUri
        });
        
        // Verificar que el archivo se copió correctamente
        const verifyInfo = await FileSystem.getInfoAsync(permanentUri);
        if (verifyInfo.exists) {
          console.log('Image copied successfully to permanent location:', permanentUri);
          return permanentUri;
        } else {
          throw new Error('File was not copied successfully');
        }
      } catch (copyError) {
        console.log('Copy failed, trying move:', copyError);
        // Si falla el copy, intentar move
        try {
          await FileSystem.moveAsync({
            from: originalUri,
            to: permanentUri
          });
          console.log('Image moved successfully to permanent location:', permanentUri);
          return permanentUri;
        } catch (moveError) {
          console.warn('Both copy and move failed, using original URI:', moveError);
          return originalUri;
        }
      }
    } catch (error) {
      console.warn('Error copying image to permanent location, using original URI:', error);
      return originalUri;
    }
  };

  // función para abrir la cámara
  const openCamera = async () => {
    try {
      setIsOpeningCamera(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso para acceder a la cámara');
        setIsOpeningCamera(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Copiar la imagen inmediatamente a una ubicación permanente
        const permanentUri = await copyImageToPermanentLocation(result.assets[0].uri);
        
        // Redirigir al formulario en pasos con la imagen permanente
        router.push({
          pathname: '/form',
          params: { imageUri: permanentUri }
        });
        setIsOpeningCamera(false);
      } else {
        // Si se cancela la cámara, cerrar la app
        BackHandler.exitApp();
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
      setIsOpeningCamera(false);
    }
  };

  if (!isInitialized) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
        </View>

        <View style={styles.content}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
      </View>

      <View style={styles.content}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  readyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  readyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  readySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 