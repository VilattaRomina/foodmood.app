import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,  Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StorageService } from '@/services/storage';
import { Meal, MealMotivation } from '@/types/meal';
import { Camera, Image as ImageIcon, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';

const motivationOptions: { value: MealMotivation; label: string; description: string; emoji: string }[] = [
  { value: 'hambre', label: 'Hambre', description: 'Tenía hambre genuina', emoji: '🍽️' },
  { value: 'placer', label: 'Placer', description: 'Quería disfrutar el sabor', emoji: '😋' },
  { value: 'proximidad', label: 'Proximidad', description: 'La comida estaba disponible', emoji: '🏠' },
  { value: 'emocion', label: 'Emoción', description: 'Comí por emociones', emoji: '💭' },
];

export default function AddMealScreen() {
  const [imageUri, setImageUri] = useState<string>('');
  const [hungerLevel, setHungerLevel] = useState<number>(5);
  const [motivation, setMotivation] = useState<MealMotivation>('hambre');
  const [saving, setSaving] = useState(false);


  const getHungerDescription = (level: number) => {
    if (level === 0) return 'Sin hambre';
    if (level <= 2) return 'Poco hambre';
    if (level <= 4) return 'Algo de hambre';
    if (level <= 6) return 'Hambre moderada';
    if (level <= 8) return 'Mucha hambre';
    return 'Hambre extrema';
  };

  const showImagePicker = () => {
    Alert.alert(
      'Seleccionar Foto',
      'Elige cómo quieres agregar una foto de tu comida',
      [
        { text: 'Cámara', onPress: takePhotoFromCamera },
        { text: 'Galería', onPress: selectFromGallery },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const takePhotoFromCamera = async () => {
     const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const selectFromGallery = async () => {
     const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      selectionLimit: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

   const saveMeal = async () => {
    if (!imageUri) {
      Alert.alert('Foto Requerida', 'Por favor agrega una foto de tu comida.');
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
      
      setImageUri('');
      setHungerLevel(5);
      setMotivation('hambre');
      
      Alert.alert('¡Éxito!', 'Comida guardada exitosamente', [
        { text: 'OK', onPress: () => router.push('/list') }
      ]);
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'No se pudo guardar la comida. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View >
        
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Foto de la Comida</Text>
        <TouchableOpacity style={styles.photoContainer} onPress={showImagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.mealImage} />
          ) : (
            <View style={styles.photoPlaceholder} >
              <Camera size={56} color="#22c55e" strokeWidth={2} />
              <Text style={styles.photoPlaceholderText}>Toca para agregar foto</Text>
              <Text style={styles.photoPlaceholderSubtext}>Captura o selecciona desde galería</Text>
            </View>
          )}
        </TouchableOpacity>
       
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nivel de Hambre: {hungerLevel}/10</Text>
        <Text style={styles.hungerDescription}>{getHungerDescription(hungerLevel)}</Text>
        <View style={styles.hungerContainer}>
          {[...Array(11)].map((_, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.hungerButton,
                hungerLevel === i && styles.hungerButtonActive,
              ]}
              onPress={() => setHungerLevel(i)}
            >
              <Text
                style={[
                  styles.hungerButtonText,
                  hungerLevel === i && styles.hungerButtonTextActive,
                ]}
              >
                {i}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Motivation Section */}
       <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Por qué comiste?</Text>
        <Text style={styles.sectionSubtitle}>Identifica tu motivación principal</Text>
        {motivationOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.motivationOption,
              motivation === option.value && styles.motivationOptionActive,
            ]}
            onPress={() => setMotivation(option.value)}
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
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        disabled={saving}
        onPress={saveMeal}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Guardando...' : 'Guardar Comida'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  contentContainer: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  headerIcon: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 16,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
  photoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    height: 220,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  photoPlaceholderText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  photoPlaceholderSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  mealImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  hungerDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 20,
    textAlign: 'center',
  },
  hungerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  hungerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  hungerButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
    transform: [{ scale: 1.1 }],
  },
  hungerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  hungerButtonTextActive: {
    color: 'white',
  },
  hungerScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
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
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
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
    color: '#22c55e',
  },
  motivationDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 32,
  },
  motivationDescriptionActive: {
    color: '#4b5563',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#22c55e',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  notesInput: {
    borderWidth: 2,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fafafa',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#22c55e',
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});