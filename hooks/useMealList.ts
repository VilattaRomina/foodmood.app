import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '@/services/storage';
import { MigrationService } from '@/services/migration';
import { Meal } from '@/types/meal';

let refreshListCallbacks: (() => void)[] = [];

export const triggerMealListRefresh = () => {
  refreshListCallbacks.forEach(callback => callback());
};

export function useMealList() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMeals = useCallback(async () => {
    try {
      setError(null);
      await MigrationService.checkAndMigrate();
      
      const loadedMeals = await StorageService.getAllMeals();
      setMeals(loadedMeals.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading meals:', error);
      setError(error instanceof Error ? error : new Error('Error desconocido'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshMeals = useCallback(() => {
    setRefreshing(true);
    loadMeals();
  }, [loadMeals]);

  const clearData = useCallback(async () => {
    try {
      await StorageService.clearAllData();
      setMeals([]);
      setError(null);
    } catch (error) {
      console.error('Error clearing data:', error);
      setError(error instanceof Error ? error : new Error('Error al limpiar datos'));
    }
  }, []);

  useEffect(() => {
    loadMeals();
    
    refreshListCallbacks.push(refreshMeals);
    
    return () => {
      refreshListCallbacks = refreshListCallbacks.filter(cb => cb !== refreshMeals);
    };
  }, [loadMeals, refreshMeals]);

  return {
    meals,
    loading,
    refreshing,
    error,
    loadMeals,
    refreshMeals,
    clearData
  };
} 