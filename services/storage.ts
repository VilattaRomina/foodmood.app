import { Meal, MealStats } from "@/types/meal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const MEALS_STORAGE_KEY = '@foodmood_meals';
const IMAGES_DIRECTORY = 'foodmood_images';

export class StorageService {

  static async initializeStorage(): Promise<void> {
    try {
      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) {
        throw new Error('Document directory not available');
      }
      const imagesDir = `${documentDir}${IMAGES_DIRECTORY}`;
      const dirInfo = await FileSystem.getInfoAsync(imagesDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  static async saveImageToLocalStorage(imageUri: string, mealId: string): Promise<string> {
    try {
      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) {
        throw new Error('Document directory not available');
      }
      
      const extension = imageUri.split('.').pop() || 'jpg';
      const fileName = `${mealId}.${extension}`;
      const localUri = `${documentDir}${IMAGES_DIRECTORY}/${fileName}`;
      
      await FileSystem.copyAsync({
        from: imageUri,
        to: localUri
      });
      
      return localUri;
    } catch (error) {
      console.error('Error saving image to local storage:', error);
      return imageUri;
    }
  }

  static async deleteImageFromLocalStorage(imageUri: string): Promise<void> {
    try {
      const documentDir = FileSystem.documentDirectory;
      if (imageUri && documentDir && imageUri.startsWith(documentDir)) {
        await FileSystem.deleteAsync(imageUri, { idempotent: true });
      }
    } catch (error) {
      console.error('Error deleting image from local storage:', error);
    }
  }

  static async saveMeal(meal: Meal): Promise<void> {
    try {
      await this.initializeStorage();
      
      let optimizedImageUri = meal.imageUri;
      const documentDir = FileSystem.documentDirectory;
      if (documentDir && !meal.imageUri.startsWith(documentDir)) {
        optimizedImageUri = await this.saveImageToLocalStorage(meal.imageUri, meal.id);
      }

      const mealWithoutImage = {
        id: meal.id,
        hungerLevel: meal.hungerLevel,
        motivation: meal.motivation,
        timestamp: meal.timestamp,
        notes: meal.notes
      };

      const imageKey = `${MEALS_STORAGE_KEY}_image_${meal.id}`;
      await AsyncStorage.setItem(imageKey, optimizedImageUri);

      // Obtener comidas existentes
      const existingMeals = await this.getAllMeals();
      const updatedMeals = [...existingMeals, mealWithoutImage];
      
      if (updatedMeals.length > 100) {
        await this.saveMealsInChunks(updatedMeals);
      } else {
        await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
      }
    } catch (error) {
      console.error('Error saving meal:', error);
      throw error;
    }
  }

  static async saveMealsInChunks(meals: any[]): Promise<void> {
    const chunkSize = 50;
    const chunks = [];
    
    for (let i = 0; i < meals.length; i += chunkSize) {
      chunks.push(meals.slice(i, i + chunkSize));
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunkKey = `${MEALS_STORAGE_KEY}_chunk_${i}`;
      await AsyncStorage.setItem(chunkKey, JSON.stringify(chunks[i]));
    }

    const metadata = {
      totalChunks: chunks.length,
      totalMeals: meals.length,
      lastUpdated: Date.now()
    };
    await AsyncStorage.setItem(`${MEALS_STORAGE_KEY}_metadata`, JSON.stringify(metadata));
  }

  static async loadMealsFromChunks(): Promise<any[]> {
    try {
      const metadataStr = await AsyncStorage.getItem(`${MEALS_STORAGE_KEY}_metadata`);
      if (!metadataStr) {
        return [];
      }

      const metadata = JSON.parse(metadataStr);
      const allMeals = [];

      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunkKey = `${MEALS_STORAGE_KEY}_chunk_${i}`;
        const chunkStr = await AsyncStorage.getItem(chunkKey);
        if (chunkStr) {
          const chunk = JSON.parse(chunkStr);
          allMeals.push(...chunk);
        }
      }

      return allMeals;
    } catch (error) {
      console.error('Error loading meals from chunks:', error);
      return [];
    }
  }

  static async getAllMeals(): Promise<Meal[]> {
    try {
      let mealsData = await this.loadMealsFromChunks();
      
      if (mealsData.length === 0) {
        const legacyData = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
        if (legacyData) {
          mealsData = JSON.parse(legacyData);
        }
      }

      const mealsWithImages = await Promise.all(
        mealsData.map(async (meal) => {
          const imageKey = `${MEALS_STORAGE_KEY}_image_${meal.id}`;
          const imageUri = await AsyncStorage.getItem(imageKey);
          return {
            ...meal,
            imageUri: imageUri || ''
          };
        })
      );

      return mealsWithImages;
    } catch (error) {
      console.error('Error getting all meals:', error);
      return [];
    }
  }

  static async deleteMeal(mealId: string): Promise<void> {
    try {
      const imageKey = `${MEALS_STORAGE_KEY}_image_${mealId}`;
      const imageUri = await AsyncStorage.getItem(imageKey);
      
      if (imageUri) {
        await this.deleteImageFromLocalStorage(imageUri);
      }

      await AsyncStorage.removeItem(imageKey);

      const existingMeals = await this.getAllMeals();
      const updatedMeals = existingMeals.filter(meal => meal.id !== mealId);

      if (updatedMeals.length > 100) {
        await this.saveMealsInChunks(updatedMeals);
      } else {
        await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    }
  }

  static async exportMealsAsJSON(): Promise<string> {
    const meals = await this.getAllMeals();
    return JSON.stringify(meals, null, 2);
  }

  static async exportMealsAsCSV(): Promise<string> {
    const meals = await this.getAllMeals();
    const headers = 'ID,Timestamp,Fecha,Hora,Nivel_Hambre,Motivacion,Notas\n';
    const rows = meals.map(meal => {
      const date = new Date(meal.timestamp);
      const dateStr = date.toLocaleDateString('es-ES');
      const timeStr = date.toLocaleTimeString('es-ES');
      const motivationLabels = {
        hambre: 'Hambre',
        placer: 'Placer',
        proximidad: 'Proximidad',
        emocion: 'Emoción',
      };
      return `${meal.id},${meal.timestamp},"${dateStr}","${timeStr}",${meal.hungerLevel},"${motivationLabels[meal.motivation]}","${meal.notes || ''}"`;
    });
    return headers + rows.join('\n');
  }

  static async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const mealKeys = keys.filter(key => key.startsWith(MEALS_STORAGE_KEY));
      await AsyncStorage.multiRemove(mealKeys);
      
      // Eliminar directorio de imágenes
      const documentDir = FileSystem.documentDirectory;
      if (documentDir) {
        const imagesDir = `${documentDir}${IMAGES_DIRECTORY}`;
        await FileSystem.deleteAsync(imagesDir, { idempotent: true });
      }
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  static calculateStats(meals: Meal[]): MealStats {
    if (meals.length === 0) {
      return {
        totalMeals: 0,
        mealsPerDay: 0,
        averageHunger: 0,
        motivationBreakdown: { hambre: 0, placer: 0, proximidad: 0, emocion: 0 },
        qualityScore: 0
      };
    }

    const totalMeals = meals.length;

    const motivationBreakdown = meals.reduce((breakdown, meal) => {
      breakdown[meal.motivation]++;
      return breakdown;
    }, { hambre: 0, placer: 0, proximidad: 0, emocion: 0 });

    return {
      totalMeals,
      mealsPerDay: 0,
      averageHunger: 0,
      motivationBreakdown,
      qualityScore: 0
    };
  }
}