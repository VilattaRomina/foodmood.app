import { Meal, MealStats } from "@/types/meal";
import AsyncStorage from '@react-native-async-storage/async-storage';
const MEALS_STORAGE_KEY = '@foodmood_meals';



export class StorageService {

   static async saveMeal(meal: Meal): Promise<void> {
    try {
      const existingMeals = await this.getAllMeals();
      const updatedMeals = [...existingMeals, meal];
      await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
    } catch (error) {
      throw error;
    }
  }

  static async getAllMeals(): Promise<Meal[]> {
    try {
      const mealsData = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
      return mealsData ? JSON.parse(mealsData) : [];
    } catch (error) {
      throw error;
    }
  }

  static async deleteMeal(mealId: string): Promise<void> {
    try {
      const existingMeals = await this.getAllMeals();
      const updatedMeals = existingMeals.filter(meal => meal.id !== mealId);
      await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
    } catch (error) {
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