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
  hambre: '#7c3aed',
  placer: '#3b82f6',
  proximidad: '#8b5cf6',
  emocion: '#fbbf24',
};

const motivationEmojis = {
  hambre: '🍽️',
  placer: '😋',
  proximidad: '🏠',
  emocion: '💭',
};

export function MealCard({ meal }: MealCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hungerLevels = [
    { level: 1, description: 'Desmayado, mareado de hambre', emoji: '😵', category: 'Demasiado hambriento', color: '#dc2626' },
    { level: 2, description: 'Hambre voraz', emoji: '😠', category: 'Demasiado hambriento', color: '#dc2626' },
    { level: 3, description: 'Hambriento', emoji: '😔', category: 'Demasiado hambriento', color: '#dc2626' },
    { level: 4, description: 'Ligeramente hambriento', emoji: '🙂', category: 'Rango ideal', color: '#10b981' },
    { level: 5, description: 'Ni hambriento ni lleno', emoji: '😊', category: 'Rango ideal', color: '#10b981' },
    { level: 6, description: 'Cómodamente lleno, satisfecho', emoji: '😊', category: 'Rango ideal', color: '#10b981' },
    { level: 7, description: 'Lleno', emoji: '😊', category: 'Rango ideal', color: '#10b981' },
    { level: 8, description: 'Incómodamente lleno', emoji: '😵', category: 'Demasiado lleno', color: '#f59e0b' },
    { level: 9, description: 'Hinchado, muy lleno', emoji: '🤢', category: 'Demasiado lleno', color: '#f59e0b' },
    { level: 10, description: 'Sientes náuseas', emoji: '🤮', category: 'Demasiado lleno', color: '#f59e0b' },
  ];

  const getHungerInfo = (level: number) => {
    const info = hungerLevels.find(h => h.level === level);
    return info || { level: 5, description: 'Ni hambriento ni lleno', emoji: '😊', category: 'Rango ideal', color: '#10b981' };
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: meal.imageUri }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.date}>
            {formatDate(meal.timestamp)}
          </Text>
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
            <Text style={styles.statLabel}>Nivel de Saciedad</Text>
            <View style={styles.hungerContainer}>
              <Text style={styles.hungerEmoji}>
                {getHungerInfo(meal.hungerLevel).emoji}
              </Text>
              <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: getHungerInfo(meal.hungerLevel).color }]}>
                  {meal.hungerLevel}/10
                </Text>
                <Text style={[styles.statCategory, { color: getHungerInfo(meal.hungerLevel).color }]}>
                  {getHungerInfo(meal.hungerLevel).category}
                </Text>
              </View>
              <View style={styles.hungerBar}>
                <View 
                  style={[
                    styles.hungerProgress, 
                    { 
                      width: `${(meal.hungerLevel / 10) * 100}%`,
                      backgroundColor: getHungerInfo(meal.hungerLevel).color
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={[styles.statDescription, { color: getHungerInfo(meal.hungerLevel).color }]}>
              {getHungerInfo(meal.hungerLevel).description}
            </Text>
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
  statValueContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 120,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statCategory: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
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
  hungerEmoji: {
    fontSize: 24,
    marginRight: 8,
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