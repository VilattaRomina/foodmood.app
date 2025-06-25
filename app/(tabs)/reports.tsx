import { StorageService } from '@/services/storage';
import { MealStats } from '@/types/meal';
import { Download, TrendingUp } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';

export default function ReportsScreen() {
  const [stats, setStats] = useState<MealStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const meals = await StorageService.getAllMeals();
      const calculatedStats = StorageService.calculateStats(meals);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const getMotivationColor = (motivation: string) => {
    switch (motivation) {
      case 'hambre': return '#10b981';
      case 'placer': return '#3b82f6';
      case 'proximidad': return '#f59e0b';
      case 'emocion': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getMotivationLabel = (motivation: string) => {
    switch (motivation) {
      case 'hambre': return 'Hambre';
      case 'placer': return 'Placer';
      case 'proximidad': return 'Proximidad';
      case 'emocion': return 'Emoción';
      default: return motivation;
    }
  };

  const exportCSV = async () => {
    try {
      const csvData = await StorageService.exportMealsAsCSV();
      const fileName = `foodmood-datos-${new Date().toISOString().split('T')[0]}.csv`;
      
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Compartir no disponible', 'La función de compartir no está disponible en este dispositivo');
        return;
      }

      await Sharing.shareAsync(`data:text/csv;base64,${btoa(csvData)}`, {
        mimeType: 'text/csv',
        dialogTitle: 'Exportar Datos de FoodMood',
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error de Exportación', 'No se pudieron exportar los datos');
    }
  };

  const exportJSON = async () => {
    try {
      const jsonData = await StorageService.exportMealsAsJSON();
      const fileName = `foodmood-datos-${new Date().toISOString().split('T')[0]}.json`;
      
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Compartir no disponible', 'La función de compartir no está disponible en este dispositivo');
        return;
      }

      await Sharing.shareAsync(`data:application/json;base64,${btoa(jsonData)}`, {
        mimeType: 'application/json',
        dialogTitle: 'Exportar Datos de FoodMood',
      });
    } catch (error) {
      console.error('Error exporting JSON:', error);
      Alert.alert('Error de Exportación', 'No se pudieron exportar los datos');
    }
  };

  const showExportOptions = () => {
    Alert.alert(
      'Exportar Datos',
      'Elige el formato de exportación',
      [
        { text: 'CSV (Excel)', onPress: exportCSV },
        { text: 'JSON (Programadores)', onPress: exportJSON },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Cargando estadísticas...</Text>
        </View>
      </View>
    );
  }

  if (stats === null || stats.totalMeals === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aún no tienes reportes disponibles</Text>
          <Text style={styles.emptySubtitle}>
            Una vez que registres algunas comidas, aquí verás estadísticas detalladas sobre tus hábitos alimentarios.
          </Text>
        </View>
      </View>
    );
  }

  return (
     <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Análisis</Text>
            <Text style={styles.subtitle}>Últimos 30 días</Text>
          </View>
        </View>
      </View>

     
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Análisis de Motivaciones</Text>
            <Text style={styles.sectionSubtitle}>¿Qué te impulsa a comer?</Text>
            <View style={styles.motivationContainer}>
              {Object.entries(stats?.motivationBreakdown || {}).map(([motivation, count]) => {
                const percentage = stats?.totalMeals ? Math.round((count / stats.totalMeals) * 100) : 0;
                return (
                  <View key={motivation} style={styles.motivationItem}>
                    <View style={styles.motivationHeader}>
                      <View style={styles.motivationInfo}>
                        <Text style={styles.motivationName}>
                          {getMotivationLabel(motivation)}
                        </Text>
                      </View>
                      <Text style={styles.motivationCount}>{count} ({percentage}%)</Text>
                    </View>
                    <View style={styles.motivationBar}>
                      <View 
                        style={[
                          styles.motivationProgress, 
                          { 
                            width: `${percentage}%`,
                            backgroundColor: getMotivationColor(motivation)
                          }
                        ]} 
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Exportar Datos</Text>
            <Text style={styles.exportDescription}>
              Exporta tus datos para análisis externos, respaldo o para compartir con profesionales de la salud.
            </Text>
            <TouchableOpacity style={styles.exportButton} onPress={showExportOptions}>
              <Download size={20} color="white" strokeWidth={2} />
              <Text style={styles.exportButtonText}>Exportar Mis Datos</Text>
            </TouchableOpacity>
          </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
    contentContainer: {
    paddingBottom: 40,
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
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
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
  headerIcon: {
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyImage: {
    width: 200,
    height: 150,
    borderRadius: 16,
    marginBottom: 32,
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
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  qualityContainer: {
    alignItems: 'center',
  },
  qualityScore: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qualityNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  qualityDescription: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  qualityExplanation: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  motivationContainer: {
    gap: 20,
  },
  motivationItem: {
    gap: 12,
  },
  motivationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  motivationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  motivationEmoji: {
    fontSize: 20,
  },
  motivationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  motivationCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  motivationBar: {
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  motivationProgress: {
    height: '100%',
    borderRadius: 6,
  },
  insightsContainer: {
    gap: 16,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  exportDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

