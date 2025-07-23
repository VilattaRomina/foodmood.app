import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Utensils, Plus } from 'lucide-react-native';
import { useMealList } from '@/hooks/useMealList';
import { MealCard } from '@/components/MealCard';
import { router } from 'expo-router';
import { StorageService } from '@/services/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ListScreen() {
  const insets = useSafeAreaInsets();
  const { meals, loading, refreshing, refreshMeals } = useMealList();

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await StorageService.deleteMeal(mealId);
      // Refrescar la lista después de eliminar
      refreshMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
      Alert.alert(
        'Error',
        'No se pudo eliminar la comida. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  // Refresh meals when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshMeals();
    }, [refreshMeals])
  );

      const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Utensils size={64} color="#9ca3af" />
      <Text style={styles.emptyStateTitle}>No hay comidas registradas</Text>
      <Text style={styles.emptyStateSubtitle}>
        Usa la pestaña de cámara para agregar tu primera comida
      </Text>
    </View>
  );

    return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Cargando comidas...</Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MealCard 
              meal={item} 
              onDelete={handleDeleteMeal}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshing={refreshing}
          onRefresh={refreshMeals}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 24,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});