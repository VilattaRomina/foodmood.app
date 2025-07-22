import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './storage';
import { Meal } from '@/types/meal';
import * as FileSystem from 'expo-file-system';

const MIGRATION_VERSION_KEY = '@foodmood_migration_version';
const CURRENT_VERSION = '2.0.0';

export class MigrationService {
  
  static async checkAndMigrate(): Promise<void> {
    try {
      const currentVersion = await AsyncStorage.getItem(MIGRATION_VERSION_KEY);
      
      if (currentVersion !== CURRENT_VERSION) {
        console.log('Iniciando migración de datos...');
        await this.migrateToOptimizedStorage();
        await AsyncStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_VERSION);
        console.log('Migración completada exitosamente');
      }
    } catch (error) {
      console.error('Error durante la migración:', error);
    }
  }

  private static async migrateToOptimizedStorage(): Promise<void> {
    try {
      // Obtener datos existentes en formato legacy
      const legacyData = await AsyncStorage.getItem('@foodmood_meals');
      
      if (!legacyData) {
        console.log('No hay datos legacy para migrar');
        return;
      }

      const legacyMeals: Meal[] = JSON.parse(legacyData);
      console.log(`Migrando ${legacyMeals.length} comidas...`);

      // Inicializar el nuevo almacenamiento
      await StorageService.initializeStorage();

      // Migrar cada comida al nuevo formato
      for (const meal of legacyMeals) {
        try {
          // Guardar la imagen localmente si es necesario
          let optimizedImageUri = meal.imageUri;
          const documentDir = FileSystem.documentDirectory;
          if (documentDir && !meal.imageUri.startsWith(documentDir)) {
            optimizedImageUri = await StorageService.saveImageToLocalStorage(meal.imageUri, meal.id);
          }

          // Crear versión optimizada del meal
          const mealWithoutImage = {
            id: meal.id,
            hungerLevel: meal.hungerLevel,
            motivation: meal.motivation,
            timestamp: meal.timestamp,
            notes: meal.notes
          };

          // Guardar la URI de imagen por separado
          const imageKey = `@foodmood_meals_image_${meal.id}`;
          await AsyncStorage.setItem(imageKey, optimizedImageUri);

          // Agregar a la lista de comidas optimizadas
          const existingOptimizedMeals = await this.getOptimizedMeals();
          const updatedMeals = [...existingOptimizedMeals, mealWithoutImage];
          
          // Guardar en chunks si hay muchas comidas
          if (updatedMeals.length > 100) {
            await this.saveOptimizedMealsInChunks(updatedMeals);
          } else {
            await AsyncStorage.setItem('@foodmood_meals_optimized', JSON.stringify(updatedMeals));
          }

        } catch (mealError) {
          console.error(`Error migrando comida ${meal.id}:`, mealError);
        }
      }

      // Eliminar datos legacy después de migración exitosa
      await AsyncStorage.removeItem('@foodmood_meals');
      console.log('Datos legacy eliminados');

    } catch (error) {
      console.error('Error en migración:', error);
      throw error;
    }
  }

  private static async getOptimizedMeals(): Promise<any[]> {
    try {
      // Intentar cargar desde chunks primero
      let mealsData = await this.loadOptimizedMealsFromChunks();
      
      // Si no hay chunks, cargar desde el formato optimizado
      if (mealsData.length === 0) {
        const optimizedData = await AsyncStorage.getItem('@foodmood_meals_optimized');
        if (optimizedData) {
          mealsData = JSON.parse(optimizedData);
        }
      }

      return mealsData;
    } catch (error) {
      console.error('Error getting optimized meals:', error);
      return [];
    }
  }

  private static async saveOptimizedMealsInChunks(meals: any[]): Promise<void> {
    const chunkSize = 50;
    const chunks = [];
    
    for (let i = 0; i < meals.length; i += chunkSize) {
      chunks.push(meals.slice(i, i + chunkSize));
    }

    // Guardar cada chunk por separado
    for (let i = 0; i < chunks.length; i++) {
      const chunkKey = `@foodmood_meals_optimized_chunk_${i}`;
      await AsyncStorage.setItem(chunkKey, JSON.stringify(chunks[i]));
    }

    // Guardar metadata sobre los chunks
    const metadata = {
      totalChunks: chunks.length,
      totalMeals: meals.length,
      lastUpdated: Date.now()
    };
    await AsyncStorage.setItem('@foodmood_meals_optimized_metadata', JSON.stringify(metadata));
  }

  private static async loadOptimizedMealsFromChunks(): Promise<any[]> {
    try {
      const metadataStr = await AsyncStorage.getItem('@foodmood_meals_optimized_metadata');
      if (!metadataStr) {
        return [];
      }

      const metadata = JSON.parse(metadataStr);
      const allMeals = [];

      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunkKey = `@foodmood_meals_optimized_chunk_${i}`;
        const chunkStr = await AsyncStorage.getItem(chunkKey);
        if (chunkStr) {
          const chunk = JSON.parse(chunkStr);
          allMeals.push(...chunk);
        }
      }

      return allMeals;
    } catch (error) {
      console.error('Error loading optimized meals from chunks:', error);
      return [];
    }
  }
} 