import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl
} from 'react-native';
import { VictoryPie } from 'victory-native';
import useBudgetStore from '../store/useBudgetStore';
import useThemeStore from '../store/useThemeStore';
import BudgetCard from '../components/BudgetCard';
import TransactionItem from '../components/TransactionItem';
import SpendingLimitWidget from '../components/SpendingLimitWidget';
import SpendingTrendsChart from '../components/SpendingTrendsChart';
import { getColors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import { getCurrentMonth } from '../utils/date';
import { getColorForCategory } from '../utils/helpers';

const HomeScreen = ({ navigation }) => {
  const {
    dashboardData,
    transactions,
    selectedCurrency,
    isLoading,
    refreshDashboard,
    dailyLimit,
    weeklyLimit,
    dailySpending,
    weeklySpending,
    trendsData
  } = useBudgetStore();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const colors = getColors(isDarkMode);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshDashboard();
      } catch (error) {
        Alert.alert('Error', 'Failed to load dashboard data. Please restart the app.');
      }
    };
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDashboard();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const { monthName } = getCurrentMonth();
  const recentTransactions = transactions.slice(0, 5);

  const chartData = dashboardData.expensesByCategory.length > 0
    ? dashboardData.expensesByCategory.map((item, index) => ({
        x: item.categoryName,
        y: item.amount,
        color: getColorForCategory(index)
      }))
    : [{ x: 'No expenses', y: 1, color: colors.border }];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Budget Overview</Text>
        <Text style={styles.headerSubtitle}>{monthName}</Text>
      </View>

      <View style={styles.cardsContainer}>
        <SpendingLimitWidget
          dailyLimit={dailyLimit}
          dailySpending={dailySpending}
          weeklyLimit={weeklyLimit}
          weeklySpending={weeklySpending}
          currency={selectedCurrency}
        />
        <BudgetCard
          title="Current Balance"
          amount={dashboardData.totalIncome - dashboardData.totalExpenses}
          currency={selectedCurrency}
          color={(dashboardData.totalIncome - dashboardData.totalExpenses) >= 0 ? colors.success : colors.danger}
          subtitle="Total Money Available"
        />
        <BudgetCard
          title="Total Income"
          amount={dashboardData.totalIncome}
          currency={selectedCurrency}
          color={colors.income}
        />
        <BudgetCard
          title="Total Expenses"
          amount={dashboardData.totalExpenses}
          currency={selectedCurrency}
          color={colors.expense}
        />
        <BudgetCard
          title="Remaining Budget"
          amount={dashboardData.remainingBudget}
          currency={selectedCurrency}
          color={dashboardData.remainingBudget >= 0 ? colors.success : colors.danger}
          subtitle={`Budget: ${selectedCurrency}${dashboardData.totalBudget.toFixed(2)}`}
        />
      </View>

      <SpendingTrendsChart trendsData={trendsData} currency={selectedCurrency} />

      {dashboardData.expensesByCategory.length > 0 && (
        <View style={[styles.chartContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Expenses by Category</Text>
          <View style={styles.chartWrapper}>
            <VictoryPie
              data={chartData}
              width={Dimensions.get('window').width - 48}
              height={250}
              innerRadius={60}
              padAngle={2}
              colorScale={chartData.map(d => d.color)}
              labels={() => null}
            />
          </View>
          <View style={styles.legendContainer}>
            {dashboardData.expensesByCategory.map((item, index) => (
              <View key={`category-${item.categoryId || item.categoryName}-${index}`} style={[styles.legendItem, { borderBottomColor: colors.border }]}>
                <View style={[styles.legendColor, { backgroundColor: getColorForCategory(index) }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>{item.categoryName}</Text>
                <Text style={[styles.legendAmount, { color: colors.text }]}>{selectedCurrency}{item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
        </View>
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              currency={selectedCurrency}
            />
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textLight }]}>No transactions yet</Text>
        )}
      </View>


      <View style={styles.bottomSpace} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl
  },
  headerTitle: {
    ...typography.title,
    color: '#FFFFFF',
    fontSize: 28
  },
  headerSubtitle: {
    ...typography.body,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: spacing.xs
  },
  cardsContainer: {
    padding: spacing.lg
  },
  chartContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.small
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: spacing.md
  },
  legendContainer: {
    marginTop: spacing.lg
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.md
  },
  legendText: {
    ...typography.body,
    flex: 1
  },
  legendAmount: {
    ...typography.body,
    fontWeight: '600'
  },
  transactionsSection: {
    padding: spacing.lg
  },
  sectionHeader: {
    marginBottom: spacing.md
  },
  sectionTitle: {
    ...typography.heading
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xl
  },
  quickAddSection: {
    padding: spacing.lg
  },
  quickAddButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md
  },
  quickAddButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.small
  },
  quickAddAmount: {
    ...typography.heading,
    fontWeight: 'bold',
    marginBottom: spacing.xs
  },
  quickAddLabel: {
    ...typography.caption
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xxl,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
    elevation: 8
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 36
  },
  bottomSpace: {
    height: 100
  }
});

export default HomeScreen;
