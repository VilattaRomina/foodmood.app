import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '@/services/storage';
import { Meal } from '@/types/meal';

let refreshListCallbacks: (() => void)[] = [];

export const triggerMealListRefresh = () => {
  refreshListCallbacks.forEach(callback => callback());
};

export function useMealList() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMeals = useCallback(async () => {
    try {
      const loadedMeals = await StorageService.getAllMeals();
      setMeals(loadedMeals.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshMeals = useCallback(() => {
    setRefreshing(true);
    loadMeals();
  }, [loadMeals]);

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
    loadMeals,
    refreshMeals
  };
} 