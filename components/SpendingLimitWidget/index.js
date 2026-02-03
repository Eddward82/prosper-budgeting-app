import { View, Text, StyleSheet } from 'react-native';
import useThemeStore from '../../store/useThemeStore';
import { getColors, spacing, borderRadius, shadows, typography } from '../../styles/theme';
import { formatCurrency, calculatePercentage } from '../../utils/helpers';

const SpendingLimitWidget = ({ dailyLimit, dailySpending, weeklyLimit, weeklySpending, currency }) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const colors = getColors(isDarkMode);

  const dailyPercentage = dailyLimit > 0 ? calculatePercentage(dailySpending, dailyLimit) : 0;
  const weeklyPercentage = weeklyLimit > 0 ? calculatePercentage(weeklySpending, weeklyLimit) : 0;

  const getDailyStatus = () => {
    if (dailyLimit === 0) return null;
    if (dailySpending >= dailyLimit) return 'over';
    if (dailyPercentage >= 80) return 'warning';
    return 'ok';
  };

  const getWeeklyStatus = () => {
    if (weeklyLimit === 0) return null;
    if (weeklySpending >= weeklyLimit) return 'over';
    if (weeklyPercentage >= 80) return 'warning';
    return 'ok';
  };

  const getStatusColor = (status) => {
    if (status === 'over') return colors.danger;
    if (status === 'warning') return colors.warning;
    return colors.success;
  };

  if (dailyLimit === 0 && weeklyLimit === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.title, { color: colors.text }]}>Spending Limits</Text>

      {dailyLimit > 0 && (
        <View style={styles.limitRow}>
          <View style={styles.limitInfo}>
            <Text style={[styles.label, { color: colors.textLight }]}>Today</Text>
            <Text style={[styles.amount, { color: getStatusColor(getDailyStatus()) }]}>
              {formatCurrency(dailySpending, currency)} / {formatCurrency(dailyLimit, currency)}
            </Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(dailyPercentage, 100)}%`,
                  backgroundColor: getStatusColor(getDailyStatus())
                }
              ]}
            />
          </View>
        </View>
      )}

      {weeklyLimit > 0 && (
        <View style={styles.limitRow}>
          <View style={styles.limitInfo}>
            <Text style={[styles.label, { color: colors.textLight }]}>This Week</Text>
            <Text style={[styles.amount, { color: getStatusColor(getWeeklyStatus()) }]}>
              {formatCurrency(weeklySpending, currency)} / {formatCurrency(weeklyLimit, currency)}
            </Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(weeklyPercentage, 100)}%`,
                  backgroundColor: getStatusColor(getWeeklyStatus())
                }
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small
  },
  title: {
    ...typography.subheading,
    marginBottom: spacing.md
  },
  limitRow: {
    marginBottom: spacing.md
  },
  limitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  label: {
    ...typography.body
  },
  amount: {
    ...typography.body,
    fontWeight: 'bold'
  },
  progressBarContainer: {
    height: 8,
    borderRadius: borderRadius.sm,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.sm
  }
});

export default SpendingLimitWidget;
