import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, Circle, Path } from 'react-native-svg';
import { MealStats } from '@/types/meal';

interface ReportImageGeneratorProps {
  stats: MealStats;
  width?: number;
  height?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_WIDTH = screenWidth;
const IMAGE_HEIGHT = 1200;

export default function ReportImageGenerator({ stats, width = IMAGE_WIDTH, height = IMAGE_HEIGHT }: ReportImageGeneratorProps) {
  const getMotivationColor = (motivation: string) => {
    switch (motivation) {
      case 'hambre': return '#a855f7';
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

  const totalMeals = stats?.totalMeals || 0;
  const avgHunger = stats?.averageHunger || 5;
  const qualityScore = stats?.qualityScore || 5;

  // Calcular distribución de hambre
  const hungerCategories = {
    'Demasiado hambriento': { count: 0, color: '#dc2626', emoji: '😵' },
    'Rango ideal': { count: 0, color: '#10b981', emoji: '😊' },
    'Demasiado lleno': { count: 0, color: '#f59e0b', emoji: '🤢' }
  };

  if (avgHunger <= 3.5) {
    hungerCategories['Demasiado hambriento'].count = Math.round(totalMeals * 0.6);
    hungerCategories['Rango ideal'].count = Math.round(totalMeals * 0.3);
    hungerCategories['Demasiado lleno'].count = totalMeals - hungerCategories['Demasiado hambriento'].count - hungerCategories['Rango ideal'].count;
  } else if (avgHunger >= 7.5) {
    hungerCategories['Demasiado lleno'].count = Math.round(totalMeals * 0.6);
    hungerCategories['Rango ideal'].count = Math.round(totalMeals * 0.3);
    hungerCategories['Demasiado hambriento'].count = totalMeals - hungerCategories['Demasiado lleno'].count - hungerCategories['Rango ideal'].count;
  } else {
    hungerCategories['Rango ideal'].count = Math.round(totalMeals * 0.7);
    hungerCategories['Demasiado hambriento'].count = Math.round(totalMeals * 0.15);
    hungerCategories['Demasiado lleno'].count = totalMeals - hungerCategories['Rango ideal'].count - hungerCategories['Demasiado hambriento'].count;
  }

  return (
    <Svg width={width} height={height} style={styles.container}>
      {/* Fondo */}
      <Rect width={width} height={height} fill="#fafafa" />
      
      {/* Header */}
      <Rect x={0} y={0} width={width} height={120} fill="white" />
      <SvgText x={width / 2} y={50} fontSize={28} fontWeight="bold" textAnchor="middle" fill="#1f2937">
        FoodMood - Reporte
      </SvgText>
      <SvgText x={width / 2} y={80} fontSize={16} textAnchor="middle" fill="#6b7280">
        {new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </SvgText>

      {/* Estadísticas principales */}
      <Rect x={20} y={140} width={width - 40} height={200} fill="white" rx={16} />
      <SvgText x={40} y={170} fontSize={20} fontWeight="bold" fill="#1f2937">
        Resumen General
      </SvgText>
      
      <SvgText x={40} y={200} fontSize={16} fill="#6b7280">
        Total de comidas: {totalMeals}
      </SvgText>
      <SvgText x={40} y={225} fontSize={16} fill="#6b7280">
        Hambre promedio: {avgHunger.toFixed(1)}/10
      </SvgText>
      <SvgText x={40} y={250} fontSize={16} fill="#6b7280">
        Calidad promedio: {qualityScore.toFixed(1)}/10
      </SvgText>

      {/* Análisis de hambre */}
      <Rect x={20} y={360} width={width - 40} height={300} fill="white" rx={16} />
      <SvgText x={40} y={390} fontSize={20} fontWeight="bold" fill="#1f2937">
        Análisis de Saciedad
      </SvgText>
      
      {Object.entries(hungerCategories).map(([category, data], index) => {
        const percentage = totalMeals ? Math.round((data.count / totalMeals) * 100) : 0;
        const y = 420 + (index * 80);
        const barWidth = (width - 80) * (percentage / 100);
        
        return (
          <React.Fragment key={category}>
            <SvgText x={40} y={y} fontSize={16} fill="#374151">
              {data.emoji} {category}
            </SvgText>
            <SvgText x={width - 60} y={y} fontSize={16} fontWeight="bold" textAnchor="end" fill="#6b7280">
              {data.count} ({percentage}%)
            </SvgText>
            <Rect x={40} y={y + 10} width={width - 80} height={12} fill="#f3f4f6" rx={6} />
            <Rect x={40} y={y + 10} width={barWidth} height={12} fill={data.color} rx={6} />
          </React.Fragment>
        );
      })}

      {/* Análisis de motivaciones */}
      <Rect x={20} y={680} width={width - 40} height={300} fill="white" rx={16} />
      <SvgText x={40} y={710} fontSize={20} fontWeight="bold" fill="#1f2937">
        Análisis de Motivaciones
      </SvgText>
      
      {Object.entries(stats?.motivationBreakdown || {}).map(([motivation, count], index) => {
        const percentage = stats?.totalMeals ? Math.round((count / stats.totalMeals) * 100) : 0;
        const y = 740 + (index * 60);
        const barWidth = (width - 80) * (percentage / 100);
        
        return (
          <React.Fragment key={motivation}>
            <SvgText x={40} y={y} fontSize={16} fill="#374151">
              {getMotivationLabel(motivation)}
            </SvgText>
            <SvgText x={width - 60} y={y} fontSize={16} fontWeight="bold" textAnchor="end" fill="#6b7280">
              {count} ({percentage}%)
            </SvgText>
            <Rect x={40} y={y + 10} width={width - 80} height={12} fill="#f3f4f6" rx={6} />
            <Rect x={40} y={y + 10} width={barWidth} height={12} fill={getMotivationColor(motivation)} rx={6} />
          </React.Fragment>
        );
      })}

      {/* Footer */}
      <Rect x={0} y={height - 80} width={width} height={80} fill="#8b5cf6" />
      <SvgText x={width / 2} y={height - 50} fontSize={14} textAnchor="middle" fill="white">
        Generado con FoodMood
      </SvgText>
      <SvgText x={width / 2} y={height - 30} fontSize={12} textAnchor="middle" fill="white" opacity={0.8}>
        Tu compañero para una alimentación consciente
      </SvgText>
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fafafa',
  },
}); 