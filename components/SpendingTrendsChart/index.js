import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryLegend } from 'victory-native';
import { colors, spacing, borderRadius, shadows, typography } from '../../styles/theme';

const SpendingTrendsChart = ({ trendsData, currency }) => {
  if (!trendsData || trendsData.length === 0) {
    return null;
  }

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const expenseData = trendsData.map((item, index) => ({
    x: index + 1,
    y: item.expenses,
    label: formatMonth(item.month)
  }));

  const incomeData = trendsData.map((item, index) => ({
    x: index + 1,
    y: item.income,
    label: formatMonth(item.month)
  }));

  const maxValue = Math.max(
    ...trendsData.map(item => Math.max(item.expenses, item.income))
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>6-Month Trend</Text>

      <VictoryChart
        width={Dimensions.get('window').width - 64}
        height={200}
        theme={VictoryTheme.material}
        padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
      >
        <VictoryAxis
          tickValues={trendsData.map((_, index) => index + 1)}
          tickFormat={(t) => trendsData[t - 1] ? formatMonth(trendsData[t - 1].month) : ''}
          style={{
            axis: { stroke: colors.border },
            ticks: { stroke: colors.border },
            tickLabels: { fill: colors.textLight, fontSize: 10 }
          }}
        />

        <VictoryAxis
          dependentAxis
          tickFormat={(t) => `${currency}${t > 999 ? (t / 1000).toFixed(1) + 'k' : t}`}
          style={{
            axis: { stroke: colors.border },
            ticks: { stroke: colors.border },
            tickLabels: { fill: colors.textLight, fontSize: 10 },
            grid: { stroke: colors.border, strokeDasharray: '2,3' }
          }}
        />

        <VictoryLine
          data={expenseData}
          style={{
            data: {
              stroke: colors.expense,
              strokeWidth: 3
            }
          }}
        />

        <VictoryLine
          data={incomeData}
          style={{
            data: {
              stroke: colors.income,
              strokeWidth: 3
            }
          }}
        />
      </VictoryChart>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
          <Text style={styles.legendText}>Expenses</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small
  },
  title: {
    ...typography.heading,
    marginBottom: spacing.md
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.md
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendText: {
    ...typography.caption,
    fontWeight: 'bold'
  }
});

export default SpendingTrendsChart;
