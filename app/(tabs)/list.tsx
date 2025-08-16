import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { Utensils } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMealList } from '@/hooks/useMealList';
import { MealCard } from '@/components/MealCard';
import { StorageService } from '@/services/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ListScreen() {
  const insets = useSafeAreaInsets(); // hook para obtener el area segura de la pantalla
  const { meals, loading, refreshing, refreshMeals } = useMealList(); // hook para obtener la lista de comidas
  const hasMeals = meals && meals.length > 0; // se verifica si hay comidas

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

  // Función para eliminar una comida
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

  // Se actualiza la lista de comidas cuando se entra a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      refreshMeals();
    }, [refreshMeals])
  );

  // Renderizado del estado vacío
  const renderEmptyState = () => (
    <View style={styles.container}>
      <View style={styles.emptyState}>
        <Utensils size={64} color="#9ca3af" />
        <Text style={styles.emptyStateTitle}>Aún no hay comidas disponibles</Text>
      </View>
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
          ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
          contentContainerStyle={[styles.listContainer, !hasMeals && styles.listContainerEmpty]}
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
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  listContainerEmpty: {
    paddingBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSeparator: {
    height: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center'
  },
});