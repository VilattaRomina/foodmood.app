import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Meal } from '@/types/meal';

interface MealCardProps {
  meal: Meal;
}

const motivationLabels = {
  hambre: 'Hambre',
  placer: 'Placer',
  proximidad: 'Proximidad',
  emocion: 'Emoción',
};

const motivationColors = {
  hambre: '#10b981',
  placer: '#3b82f6',
  proximidad: '#f59e0b',
  emocion: '#ef4444',
};

const motivationEmojis = {
  hambre: '🍽️',
  placer: '😋',
  proximidad: '🏠',
  emocion: '💭',
};

export function MealCard({ meal }: MealCardProps) {
  

  return (
    <View style={styles.card}>
      <Image source={{ uri: meal.imageUri }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View 
            style={[
              styles.motivationBadge, 
              { backgroundColor: motivationColors[meal.motivation] }
            ]}
          >
            <Text style={styles.motivationEmoji}>
              {motivationEmojis[meal.motivation]}
            </Text>
            <Text style={styles.motivationText}>
              {motivationLabels[meal.motivation]}
            </Text>
          </View>
        </View>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Nivel de Hambre</Text>
            <View style={styles.hungerContainer}>
              <Text style={[styles.statValue]}>
                nivel de hambre
              </Text>

            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  motivationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  motivationEmoji: {
    fontSize: 14,
  },
  motivationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stats: {
    marginBottom: 16,
  },
  statItem: {
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hungerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 50,
  },
  hungerBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  hungerProgress: {
    height: '100%',
    borderRadius: 4,
  },
  statDescription: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  notesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  notesLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});