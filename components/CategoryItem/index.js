import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../../styles/theme';
import { formatCurrency } from '../../utils/helpers';

const CategoryItem = ({ category, currency, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{category.name}</Text>
        </View>
        <View style={styles.budgetContainer}>
          <Text style={styles.budget}>
            {formatCurrency(category.monthly_budget, currency)}
          </Text>
          <Text style={styles.label}>Monthly Budget</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.small
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg
  },
  nameContainer: {
    flex: 1
  },
  name: {
    ...typography.subheading
  },
  budgetContainer: {
    alignItems: 'flex-end'
  },
  budget: {
    ...typography.subheading,
    color: colors.primary,
    fontWeight: 'bold'
  },
  label: {
    ...typography.caption,
    marginTop: spacing.xs
  }
});

export default CategoryItem;
