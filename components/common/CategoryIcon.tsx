import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScrapCategory } from '../../types';
import { SCRAP_CATEGORIES } from '../../constants/ScrapCategories';

interface CategoryIconProps {
  category: ScrapCategory;
  size?: 'small' | 'medium' | 'large';
}

export default function CategoryIcon({ category, size = 'medium' }: CategoryIconProps) {
  const categoryData = SCRAP_CATEGORIES.find(cat => cat.key === category);
  
  if (!categoryData) return null;

  const sizeStyles = {
    small: { width: 32, height: 32, fontSize: 16 },
    medium: { width: 48, height: 48, fontSize: 24 },
    large: { width: 64, height: 64, fontSize: 32 }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: categoryData.color + '20',
        borderColor: categoryData.color,
        width: sizeStyles[size].width,
        height: sizeStyles[size].height,
      }
    ]}>
      <Text style={[styles.icon, { fontSize: sizeStyles[size].fontSize }]}>
        {categoryData.icon}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});