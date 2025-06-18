export type MealMotivation = 'hambre' | 'placer' | 'proximidad' | 'emocion';

export interface Meal {
  id: string;
  imageUri: string;
  hungerLevel: number; // 0-10
  motivation: MealMotivation;
  timestamp: number;
  notes?: string;
}

export interface MealStats {
  totalMeals: number;
  mealsPerDay: number;
  averageHunger: number;
  motivationBreakdown: Record<MealMotivation, number>;
  qualityScore: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}