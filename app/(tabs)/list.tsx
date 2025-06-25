import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Trash2, Utensils } from 'lucide-react-native';
import { Meal } from '@/types/meal';
import { StorageService } from '@/services/storage';
import { MealCard } from '@/components/MealCard';
import { useFocusEffect } from '@react-navigation/native';

export default function MealsScreen() {
   const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMeals = async () => {
    try {
      const loadedMeals = await StorageService.getAllMeals();
      setMeals(loadedMeals.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

   const renderMealItem = ({ item }: { item: Meal }) => (
    <View style={styles.mealContainer}>
      <MealCard meal={item} />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteMeal(item.id)}
      >
        <Trash2 size={18} color="#4b5563" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMeals();
  };

   const handleDeleteMeal = (mealId: string) => {
    Alert.alert(
      'Eliminar Comida',
      '¿Estás seguro de que quieres eliminar esta comida?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteMeal(mealId);
              await loadMeals();
            } catch (error) {
              console.error('Error deleting meal:', error);
            }
          },
        },
      ]
    );
  };

  // Cargar comidas cuando el componente se monta y cuando la pantalla se enfoca
  useFocusEffect(
    React.useCallback(() => {
      loadMeals();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Cargando comidas...</Text>
        </View>
      </View>
    );
  }

  if (meals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aún no tienes comidas registradas</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <FlatList
          data={meals}
          renderItem={renderMealItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#22c55e"
              colors={['#22c55e']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
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
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 16,
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