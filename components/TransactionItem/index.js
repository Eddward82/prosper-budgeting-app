import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useThemeStore from '../../store/useThemeStore';
import { getColors, spacing, borderRadius, shadows, typography } from '../../styles/theme';
import { formatCurrency } from '../../utils/helpers';
import { formatDate } from '../../utils/date';

const TransactionItem = ({ transaction, currency }) => {
  const navigation = useNavigation();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const colors = getColors(isDarkMode);

  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.income : colors.expense;
  const sign = isIncome ? '+' : '-';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
      onPress={() => navigation.navigate('TransactionDetail', { transaction })}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={[styles.indicator, { backgroundColor: amountColor }]} />
        <View style={styles.details}>
          <Text style={[styles.category, { color: colors.text }]}>
            {transaction.category_name || 'Income'}
          </Text>
          <Text style={[styles.date, { color: colors.textLight }]}>{formatDate(transaction.date)}</Text>
        </View>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {sign}{formatCurrency(transaction.amount, currency)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.small
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  indicator: {
    width: 4,
    height: 40,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md
  },
  details: {
    flex: 1
  },
  category: {
    ...typography.subheading,
    marginBottom: spacing.xs
  },
  date: {
    ...typography.caption
  },
  amount: {
    ...typography.subheading,
    fontWeight: 'bold'
  }
});

export default TransactionItem;
