import { View, Text, StyleSheet } from 'react-native';
import useThemeStore from '../../store/useThemeStore';
import { getColors, spacing, borderRadius, shadows, typography } from '../../styles/theme';
import { formatCurrency } from '../../utils/helpers';

const BudgetCard = ({ title, amount, currency, color, subtitle }) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const colors = getColors(isDarkMode);

  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4, backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.title, { color: colors.textLight }]}>{title}</Text>
      <Text style={[styles.amount, { color }]}>
        {formatCurrency(amount, currency)}
      </Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textLight }]}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small
  },
  title: {
    ...typography.caption,
    textTransform: 'uppercase',
    marginBottom: spacing.xs
  },
  amount: {
    ...typography.title,
    fontSize: 28,
    fontWeight: 'bold'
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs
  }
});

export default BudgetCard;
