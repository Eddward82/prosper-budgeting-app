import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VictoryPie, VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory-native';
import useBudgetStore from '../store/useBudgetStore';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import { formatCurrency } from '../utils/helpers';
import { getMonthlyTrends, getTopCategoriesBySpending } from '../database/db';

const screenWidth = Dimensions.get('window').width;

const InsightsScreen = ({ navigation }) => {
  const { isPremium, selectedCurrency, transactions, categories } = useBudgetStore();
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [averageSpending, setAverageSpending] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState([]);

  useEffect(() => {
    if (isPremium) {
      loadInsights();
    }
  }, [isPremium]);

  const loadInsights = async () => {
    try {
      const trends = await getMonthlyTrends(6);
      setMonthlyTrends(trends);

      const totalExpenses = trends.reduce((sum, t) => sum + (t.expenses || 0), 0);
      setAverageSpending(totalExpenses / trends.length);

      const topCats = await getTopCategoriesBySpending(3);
      setTopCategories(topCats);

      // Calculate category breakdown for pie chart
      const categoryTotals = {};
      const currentMonth = new Date().toISOString().slice(0, 7);

      transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .forEach(t => {
          const catName = t.category_name || 'Uncategorized';
          categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
        });

      const breakdown = Object.entries(categoryTotals)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      setCategoryBreakdown(breakdown);

      // Calculate income vs expenses for last 6 months
      const incomeExpenseData = trends.map(t => ({
        month: formatMonth(t.month),
        income: t.income || 0,
        expenses: t.expenses || 0
      }));

      setIncomeVsExpenses(incomeExpenseData);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  if (!isPremium) {
    return (
      <View style={styles.paywallContainer}>
        <Text style={styles.paywallTitle}>Premium Feature</Text>
        <Text style={styles.paywallText}>
          Upgrade to Premium to access advanced insights
        </Text>
        <View style={styles.featuresList}>
          <Text style={styles.featureItem}>Monthly spending trends</Text>
          <Text style={styles.featureItem}>Top spending categories</Text>
          <Text style={styles.featureItem}>Average monthly spending</Text>
        </View>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => navigation.navigate('PremiumUpgrade')}
        >
          <Text style={styles.upgradeButtonText}>Unlock Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get max spending for progress bar calculation
  const maxSpending = Math.max(...monthlyTrends.map(t => t.expenses || 0), 1);

  // Format month name from the trend data
  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Calculate percentage change between two values
  const getPercentChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  // Generate colors for pie chart
  const pieColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Average Monthly Spending</Text>
        <Text style={styles.averageAmount}>
          {formatCurrency(averageSpending, selectedCurrency)}
        </Text>
        <Text style={styles.averageSubtext}>Based on last {monthlyTrends.length} months</Text>
      </View>

      {/* Category Breakdown Pie Chart */}
      {categoryBreakdown.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Month's Spending by Category</Text>
          <View style={styles.chartContainer}>
            <VictoryPie
              data={categoryBreakdown}
              x="name"
              y="amount"
              colorScale={pieColors}
              width={screenWidth - 80}
              height={250}
              labelRadius={({ innerRadius }) => innerRadius + 40}
              style={{
                labels: {
                  fill: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 'bold'
                }
              }}
              labels={({ datum }) => `${datum.name}\n${((datum.amount / categoryBreakdown.reduce((sum, c) => sum + c.amount, 0)) * 100).toFixed(0)}%`}
            />
          </View>
          <View style={styles.legendContainer}>
            {categoryBreakdown.map((cat, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: pieColors[index] }]} />
                <Text style={styles.legendText}>{cat.name}</Text>
                <Text style={styles.legendAmount}>{formatCurrency(cat.amount, selectedCurrency)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Income vs Expenses Bar Chart */}
      {incomeVsExpenses.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Income vs Expenses (Last 6 Months)</Text>
          <View style={styles.chartContainer}>
            <VictoryChart
              width={screenWidth - 80}
              height={300}
              theme={VictoryTheme.material}
              domainPadding={{ x: 20 }}
            >
              <VictoryAxis
                style={{
                  tickLabels: { fontSize: 10, angle: -45, textAnchor: 'end' }
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(tick) => `${selectedCurrency}${tick / 1000}k`}
                style={{
                  tickLabels: { fontSize: 10 }
                }}
              />
              <VictoryBar
                data={incomeVsExpenses.flatMap(d => [
                  { month: d.month, value: d.income, type: 'Income' },
                  { month: d.month, value: d.expenses, type: 'Expenses' }
                ])}
                x="month"
                y="value"
                style={{
                  data: {
                    fill: ({ datum }) => datum.type === 'Income' ? colors.income : colors.expense
                  }
                }}
                barWidth={15}
              />
            </VictoryChart>
          </View>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.income }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.expense }]} />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Spending Trend</Text>
        {monthlyTrends.length === 0 ? (
          <Text style={styles.noDataText}>No spending data yet</Text>
        ) : (
          monthlyTrends.map((trend, index) => {
            const prevTrend = monthlyTrends[index + 1];
            const percentChange = getPercentChange(trend.expenses, prevTrend?.expenses);
            const progressWidth = ((trend.expenses || 0) / maxSpending) * 100;

            return (
              <View key={trend.month} style={styles.trendRow}>
                <View style={styles.trendHeader}>
                  <Text style={styles.trendMonth}>{formatMonth(trend.month)}</Text>
                  <View style={styles.trendAmountRow}>
                    <Text style={styles.trendAmount}>
                      {formatCurrency(trend.expenses || 0, selectedCurrency)}
                    </Text>
                    {percentChange !== null && (
                      <View style={[
                        styles.changeBadge,
                        percentChange > 0 ? styles.changeBadgeUp : styles.changeBadgeDown
                      ]}>
                        <Ionicons
                          name={percentChange > 0 ? "arrow-up" : "arrow-down"}
                          size={12}
                          color={percentChange > 0 ? colors.expense : colors.success}
                        />
                        <Text style={[
                          styles.changeText,
                          percentChange > 0 ? styles.changeTextUp : styles.changeTextDown
                        ]}>
                          {Math.abs(percentChange).toFixed(0)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${progressWidth}%` }
                    ]}
                  />
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Spending Categories</Text>
        {topCategories.length === 0 ? (
          <Text style={styles.noDataText}>No category data yet</Text>
        ) : (
          topCategories.map((cat, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={styles.categoryRank}>
                <Text style={styles.categoryRankText}>{index + 1}</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryAmount}>
                {formatCurrency(cat.total, selectedCurrency)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg
  },
  paywallContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center'
  },
  paywallTitle: {
    ...typography.title,
    marginBottom: spacing.lg
  },
  paywallText: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl
  },
  featuresList: {
    marginBottom: spacing.xl
  },
  featureItem: {
    ...typography.subheading,
    marginBottom: spacing.md
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium
  },
  upgradeButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: spacing.md
  },
  legendContainer: {
    marginTop: spacing.md
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.sm
  },
  legendText: {
    ...typography.body,
    flex: 1
  },
  legendAmount: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text
  },
  cardTitle: {
    ...typography.heading,
    marginBottom: spacing.md
  },
  averageAmount: {
    ...typography.title,
    fontSize: 32,
    color: colors.primary,
    fontWeight: 'bold'
  },
  averageSubtext: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs
  },
  noDataText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: spacing.lg
  },
  trendRow: {
    marginBottom: spacing.md
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  trendMonth: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500'
  },
  trendAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  trendAmount: {
    ...typography.subheading,
    color: colors.text,
    fontWeight: '600'
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2
  },
  changeBadgeUp: {
    backgroundColor: colors.expense + '20'
  },
  changeBadgeDown: {
    backgroundColor: colors.success + '20'
  },
  changeText: {
    ...typography.caption,
    fontWeight: '600'
  },
  changeTextUp: {
    color: colors.expense
  },
  changeTextDown: {
    color: colors.success
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm
  },
  categoryRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  categoryRankText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold'
  },
  categoryName: {
    ...typography.subheading,
    flex: 1
  },
  categoryAmount: {
    ...typography.subheading,
    color: colors.primary,
    fontWeight: 'bold'
  }
});

export default InsightsScreen;
