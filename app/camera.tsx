import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';



export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);

  // Abrir cámara automáticamente al ingresar
  useEffect(() => {
    const openCameraOnMount = async () => {
      setIsOpeningCamera(true);
      // Pequeño delay para asegurar que la pantalla esté lista
      setTimeout(() => {
        openCamera();
      }, 500);
    };
    
    openCameraOnMount();
  }, []);

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

      // Intentar mover primero (más eficiente para archivos temporales)
      try {
        await FileSystem.moveAsync({
          from: originalUri,
          to: permanentUri
        });
        console.log('Image moved successfully to permanent location:', permanentUri);
        return permanentUri;
      } catch (moveError) {
        console.log('Move failed, trying copy:', moveError);
        // Si falla el move, intentar copy
        try {
          await FileSystem.copyAsync({
            from: originalUri,
            to: permanentUri
          });
          console.log('Image copied successfully to permanent location:', permanentUri);
          return permanentUri;
        } catch (copyError) {
          console.warn('Both move and copy failed, using original URI:', copyError);
          return originalUri;
        }
      }
    } catch (error) {
      console.warn('Error copying image to permanent location, using original URI:', error);
      return originalUri;
    }
  };

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
        setIsOpeningCamera(false);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
      setIsOpeningCamera(false);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Seleccionar Foto',
      'Elige cómo quieres agregar una foto de tu comida',
      [
        { text: 'Cámara', onPress: openCamera, style: 'default' },
        { text: 'Galería', onPress: openGallery, style: 'default' },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { 
        cancelable: true,
        userInterfaceStyle: 'light'
      }
    );
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Copiar la imagen inmediatamente a una ubicación permanente
        const permanentUri = await copyImageToPermanentLocation(result.assets[0].uri);
        
        // Redirigir al formulario en pasos con la imagen permanente
        router.push({
          pathname: '/form',
          params: { imageUri: permanentUri }
        });
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/(tabs)/list')}
        >
          <ArrowLeft size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Comida</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {isOpeningCamera && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>Abriendo cámara...</Text>
          </View>
        )}
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
}); 