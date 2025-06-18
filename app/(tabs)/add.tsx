import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image } from 'react-native';
import { Platform } from 'react-native';
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
 
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Registrar Comida</Text>
          </View>
        </View>
      </View>

      {/* Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 Foto de la Comida</Text>
       
      </View>

      {/* Hunger Level Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Nivel de Hambre: </Text>
        <Text style={styles.hungerDescription}></Text>
      
      
      </View>

      {/* Motivation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💭 ¿Por qué comiste?</Text>
        <Text style={styles.sectionSubtitle}>Identifica tu motivación principal</Text>
       
      </View>

     

      {/* Save Button */}
      <TouchableOpacity
       
      >
        <Text style={styles.saveButtonText}>
          Guardar Comida
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
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
    backgroundColor: '#fff7ed',
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
    borderColor: '#f97316',
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
    color: '#f97316',
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
    backgroundColor: '#f97316',
    borderColor: '#f97316',
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
    backgroundColor: '#fff7ed',
    borderColor: '#f97316',
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
    color: '#f97316',
  },
  motivationDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 32,
  },
  motivationDescriptionActive: {
    color: '#ea580c',
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
    borderColor: '#f97316',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f97316',
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
    backgroundColor: '#f97316',
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#f97316',
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