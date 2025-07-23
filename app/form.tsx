import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { StorageService } from '@/services/storage';
import { Meal, MealMotivation } from '@/types/meal';
import { router, useLocalSearchParams } from 'expo-router';

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

type FormStep = 'photo' | 'hunger' | 'motivation';

export default function FormScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState<FormStep>('photo');
  const [imageUri, setImageUri] = useState<string>('');
  const [hungerLevel, setHungerLevel] = useState<number>(5);
  const [motivation, setMotivation] = useState<MealMotivation>('hambre');
  const [saving, setSaving] = useState(false);
  const [hasInteractedWithHunger, setHasInteractedWithHunger] = useState(false);
  const [hasInteractedWithMotivation, setHasInteractedWithMotivation] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Obtener la imagen de los parámetros de la URL
  useEffect(() => {
    if (params.imageUri) {
      const originalUri = params.imageUri as string;
      console.log('Setting image URI:', originalUri);
      setImageUri(originalUri);
    }
  }, [params.imageUri]);



  const steps: { key: FormStep; title: string; description: string }[] = [
    { key: 'photo', title: 'Foto', description: 'Agregar foto' },
    { key: 'hunger', title: 'Hambre', description: 'Nivel de saciedad' },
    { key: 'motivation', title: 'Motivación', description: '¿Por qué comiste?' },
  ];

  const getHungerInfo = (level: number) => {
    const info = hungerLevels.find(h => h.level === level);
    return info || { level: 5, description: 'Ni hambriento ni lleno', emoji: '😊', category: 'Rango ideal' };
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'photo':
        // Permitir continuar si hay una URI de imagen, incluso si hay problemas
        return imageUri.trim() !== '';
      case 'hunger':
        return hasInteractedWithHunger;
      case 'motivation':
        return hasInteractedWithMotivation;
      default:
        return false;
    }
  };

  const canGoBack = () => {
    return currentStep !== 'photo';
  };

  const goToNextStep = () => {
    if (!canGoNext()) return;

    const currentIndex = steps.findIndex(step => step.key === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const handleSave = async () => {
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
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => {
        const isActive = currentStep === step.key;
        const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
        
        return (
          <View key={step.key} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              isActive && styles.stepCircleActive,
              isCompleted && styles.stepCircleCompleted
            ]}>
              {isCompleted ? (
                <Check size={16} color="white" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  isActive && styles.stepNumberActive
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.stepTitle,
              isActive && styles.stepTitleActive,
              isCompleted && styles.stepTitleCompleted
            ]}>
              {step.title}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderPhotoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Revisa la foto de tu comida antes de continuar
      </Text>
      
      {imageUri ? (
        <View style={styles.photoPreview}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.photoImage}
            resizeMode="cover"
            onError={(error) => {
              console.error('Image loading error for URI:', imageUri);
              console.error('Error details:', {
                message: error?.nativeEvent?.error || 'Unknown error',
                uri: imageUri
              });
              setImageLoadError(true);
            }}
            onLoad={() => {
              console.log('Image loaded successfully for URI:', imageUri);
              setImageLoadError(false);
            }}
            onLoadStart={() => {
              console.log('Image load started for URI:', imageUri);
            }}
            onLoadEnd={() => {
              console.log('Image load ended for URI:', imageUri);
            }}
            fadeDuration={0}
            progressiveRenderingEnabled={false}
          />
          {imageLoadError && (
            <Text style={styles.photoErrorText}>
              ⚠️ Error al cargar la imagen
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>
            No se encontró la foto. Regresa a la cámara.
          </Text>
        </View>
      )}
    </View>
  );

  const renderHungerStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        ¿Cuál era tu nivel de saciedad cuando comiste?
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
  );

  const renderMotivationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Identifica tu motivación principal para comer
      </Text>
      
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
  );



  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'photo':
        return renderPhotoStep();
      case 'hunger':
        return renderHungerStep();
      case 'motivation':
        return renderMotivationStep();
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/camera')}
        >
          <ArrowLeft size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Comida</Text>
        <View style={styles.placeholder} />
      </View>

      {renderStepIndicator()}

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.footerButton, !canGoBack() && styles.footerButtonDisabled]}
          disabled={!canGoBack()}
          onPress={goToPreviousStep}
        >
          <ArrowLeft size={20} color={canGoBack() ? "#6b7280" : "#d1d5db"} />
          <Text style={[styles.footerButtonText, !canGoBack() && styles.footerButtonTextDisabled]}>
            Anterior
          </Text>
        </TouchableOpacity>

        {currentStep === 'motivation' ? (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            disabled={saving}
            onPress={handleSave}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Check size={20} color="white" />
            )}
            <Text style={styles.saveButtonText}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.footerButton, styles.footerButtonPrimary, !canGoNext() && styles.footerButtonDisabled]}
            disabled={!canGoNext()}
            onPress={goToNextStep}
          >
            <Text style={[styles.footerButtonText, styles.footerButtonTextPrimary, !canGoNext() && styles.footerButtonTextDisabled]}>
              Siguiente
            </Text>
            <ArrowRight size={20} color={canGoNext() ? "white" : "#d1d5db"} />
          </TouchableOpacity>
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#8b5cf6',
  },
  stepCircleCompleted: {
    backgroundColor: '#10b981',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepTitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  stepTitleActive: {
    color: '#8b5cf6',
    fontWeight: 'bold',
  },
  stepTitleCompleted: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  photoPreview: {
    alignItems: 'center',
  },
  photoImage: {
    width: 280,
    height: 280,
    borderRadius: 12,
    marginBottom: 16,
  },
  photoImagePlaceholder: {
    width: 280,
    height: 280,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  photoPreviewText: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: 'bold',
  },
  photoPreviewSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  photoPlaceholder: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
    minWidth: 120,
    justifyContent: 'center',
  },
  footerButtonPrimary: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  footerButtonDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#f3f4f6',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginHorizontal: 8,
  },
  footerButtonTextPrimary: {
    color: 'white',
  },
  footerButtonTextDisabled: {
    color: '#d1d5db',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  photoErrorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 10,
    textAlign: 'center',
  },

}); 