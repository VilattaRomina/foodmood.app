import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StorageService } from '@/services/storage';
import { Meal } from '@/types/meal';
import { MealCard } from '@/components/MealCard';
import { Trash2, Utensils } from 'lucide-react-native';

export default function MealsScreen() {
  

  return (
    <View style={styles.container}>
    
      

        <View style={styles.emptyContainer}>
          {/* <Image 
            source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400' }}
            style={styles.emptyImage}
          /> */}
          <Text style={styles.emptyTitle}>¡Bienvenido a FoodMood!</Text>
          <Text style={styles.emptySubtitle}>
            Comienza a registrar tus comidas para entender mejor tus hábitos alimentarios y emociones.
          </Text>
          <View style={styles.emptyFeatures}>
            <Text style={styles.featureText}>📸 Fotografía tus comidas</Text>
            <Text style={styles.featureText}>🎯 Registra tu nivel de hambre</Text>
            <Text style={styles.featureText}>💭 Identifica tus motivaciones</Text>
            <Text style={styles.featureText}>📊 Analiza tus patrones</Text>
          </View>
        </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
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
  logoContainer: {
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyImage: {
    width: 200,
    height: 150,
    borderRadius: 16,
    marginBottom: 32,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyFeatures: {
    gap: 12,
    alignItems: 'flex-start',
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  mealContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
});