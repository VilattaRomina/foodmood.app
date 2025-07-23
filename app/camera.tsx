import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, X, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { StorageService } from '@/services/storage';
import { Meal, MealMotivation } from '@/types/meal';
import { router } from 'expo-router';

const motivationOptions: { value: MealMotivation; label: string; description: string; emoji: string }[] = [
  { value: 'hambre', label: 'Hambre', description: 'Tenía hambre genuina', emoji: '🍽️' },
  { value: 'placer', label: 'Placer', description: 'Quería disfrutar el sabor', emoji: '😋' },
  { value: 'proximidad', label: 'Proximidad', description: 'La comida estaba disponible', emoji: '🏠' },
  { value: 'emocion', label: 'Emoción', description: 'Comí por emociones', emoji: '💭' },
];

const hungerLevels = [
  { level: 1, description: 'Desmayado, mareado de hambre', emoji: '😵', category: 'Demasiado hambriento' },
  { level: 2, description: 'Hambre voraz', emoji: '😠', category: 'Demasiado hambriento' },
  { level: 3, description: 'Hambriento', emoji: '😔', category: 'Demasiado hambriento' },
  { level: 4, description: 'Ligeramente hambriento', emoji: '🙂', category: 'Rango ideal' },
  { level: 5, description: 'Ni hambriento ni lleno', emoji: '😊', category: 'Rango ideal' },
  { level: 6, description: 'Cómodamente lleno, satisfecho', emoji: '😊', category: 'Rango ideal' },
  { level: 7, description: 'Lleno', emoji: '😊', category: 'Rango ideal' },
  { level: 8, description: 'Incómodamente lleno', emoji: '😵', category: 'Demasiado lleno' },
  { level: 9, description: 'Hinchado, muy lleno', emoji: '🤢', category: 'Demasiado lleno' },
  { level: 10, description: 'Sientes náuseas', emoji: '🤮', category: 'Demasiado lleno' },
];

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string>('');
  const [hungerLevel, setHungerLevel] = useState<number>(5);
  const [motivation, setMotivation] = useState<MealMotivation>('hambre');
  const [saving, setSaving] = useState(false);
  const [hasInteractedWithHunger, setHasInteractedWithHunger] = useState(false);
  const [hasInteractedWithMotivation, setHasInteractedWithMotivation] = useState(false);
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

  const getHungerInfo = (level: number) => {
    const info = hungerLevels.find(h => h.level === level);
    return info || { level: 5, description: 'Ni hambriento ni lleno', emoji: '😊', category: 'Rango ideal' };
  };

  const isFormValid = () => {
    return imageUri.trim() !== '' && hasInteractedWithHunger && hasInteractedWithMotivation;
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
        setImageUri(result.assets[0].uri);
        setModalVisible(true);
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
        setImageUri(result.assets[0].uri);
        setModalVisible(true);
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
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Nivel de Saciedad: {hungerLevel}/10 
                  {!hasInteractedWithHunger && <Text style={styles.requiredIndicator}> *</Text>}
                </Text>
              
                <View style={styles.hungerInfoContainer}>
                  <Text style={styles.hungerEmoji}>{getHungerInfo(hungerLevel).emoji}</Text>
                  <Text style={styles.hungerDescription}>{getHungerInfo(hungerLevel).description}</Text>
                  <Text style={styles.hungerCategory}>{getHungerInfo(hungerLevel).category}</Text>
                </View>

                <View style={styles.hungerContainer}>
                  {[...Array(10)].map((_, i) => {
                    const level = i + 1;
                    const isActive = hungerLevel === level;
                    const hungerInfo = getHungerInfo(level);
                    return (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.hungerButton,
                          isActive && styles.hungerButtonActive,
                          hungerInfo.category === 'Rango ideal' && styles.hungerButtonIdeal,
                          hungerInfo.category === 'Demasiado hambriento' && styles.hungerButtonHungry,
                          hungerInfo.category === 'Demasiado lleno' && styles.hungerButtonFull,
                        ]}
                        onPress={() => {
                          setHungerLevel(level);
                          setHasInteractedWithHunger(true);
                        }}
                      >
                        <Text style={styles.hungerButtonEmoji}>{hungerInfo.emoji}</Text>
                        <Text
                          style={[
                            styles.hungerButtonText,
                            isActive && styles.hungerButtonTextActive,
                          ]}
                        >
                          {level}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  ¿Por qué comiste?
                  {!hasInteractedWithMotivation && <Text style={styles.requiredIndicator}> *</Text>}
                </Text>
                <Text style={styles.sectionSubtitle}>Identifica tu motivación principal</Text>
                
                {motivationOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.motivationOption,
                      motivation === option.value && styles.motivationOptionActive,
                    ]}
                    onPress={() => {
                      setMotivation(option.value);
                      setHasInteractedWithMotivation(true);
                    }}
                  >
                    <View style={styles.motivationContent}>
                      <View style={styles.motivationHeader}>
                        <Text style={styles.motivationEmoji}>{option.emoji}</Text>
                        <Text
                          style={[
                            styles.motivationLabel,
                            motivation === option.value && styles.motivationLabelActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.motivationDescription,
                          motivation === option.value && styles.motivationDescriptionActive,
                        ]}
                      >
                        {option.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioButton,
                        motivation === option.value && styles.radioButtonActive,
                      ]}
                    >
                      {motivation === option.value && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton, 
                  (saving || !isFormValid()) && styles.saveButtonDisabled
                ]}
                disabled={saving || !isFormValid()}
                onPress={async () => {
                  if (!imageUri) {
                    Alert.alert(
                      'Foto Requerida', 
                      'Por favor agrega una foto de tu comida.'
                    );
                    return;
                  }

                  if (!hasInteractedWithHunger) {
                    Alert.alert(
                      'Nivel de Hambre Requerido', 
                      'Por favor selecciona tu nivel de hambre antes de guardar.'
                    );
                    return;
                  }

                  if (!hasInteractedWithMotivation) {
                    Alert.alert(
                      'Motivación Requerida', 
                      'Por favor selecciona por qué comiste antes de guardar.'
                    );
                    return;
                  }

                  setSaving(true);
                  try {
                    const meal: Meal = {
                      id: Date.now().toString(),
                      imageUri,
                      hungerLevel,
                      motivation,
                      timestamp: Date.now(),
                    };

                    await StorageService.saveMeal(meal);
                    
                    // Reset form
                    setImageUri('');
                    setHungerLevel(5);
                    setMotivation('hambre');
                    setHasInteractedWithHunger(false);
                    setHasInteractedWithMotivation(false);
                    setModalVisible(false);
                    
                    Alert.alert('¡Éxito!', 'Comida guardada exitosamente', [
                      {
                        text: 'Ver Mis Comidas',
                        onPress: () => router.push('/(tabs)/list')
                      }
                    ]);
                  } catch (error) {
                    console.error('Error saving meal:', error);
                    Alert.alert('Error', 'No se pudo guardar la comida. Inténtalo de nuevo.');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Guardando...' : 'Guardar Comida'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    height: '90%',
  },
  modalScroll: {
    flex: 1,
    maxHeight: '100%',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#f9fafb',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  requiredIndicator: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hungerInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  hungerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  hungerDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  hungerCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8b5cf6',
    textAlign: 'center',
  },
  hungerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  hungerButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  hungerButtonIdeal: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  hungerButtonHungry: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  hungerButtonFull: {
    backgroundColor: '#fefce8',
    borderColor: '#fcd34d',
  },
  hungerButtonActive: {
    backgroundColor: '#1f2937',
    borderColor: '#1f2937',
    transform: [{ scale: 1.1 }],
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  hungerButtonEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  hungerButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  hungerButtonTextActive: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '900',
  },
  motivationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f3f4f6',
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  motivationOptionActive: {
    backgroundColor: '#f5f3ff',
    borderColor: '#8b5cf6',
  },
  motivationContent: {
    flex: 1,
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  motivationEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  motivationLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  motivationLabelActive: {
    color: '#8b5cf6',
  },
  motivationDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginLeft: 32,
  },
  motivationDescriptionActive: {
    color: '#8b5cf6',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#8b5cf6',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8b5cf6',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 