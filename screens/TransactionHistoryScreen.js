import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import useBudgetStore from '../store/useBudgetStore';
import TransactionItem from '../components/TransactionItem';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import { getTransactionsByDateRange, getTransactionsByCategory, getTransactionsByTag } from '../database/db';

const TransactionHistoryScreen = () => {
  const { transactions, categories, selectedCurrency } = useBudgetStore();
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tagSearch, setTagSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [transactions, filterType, selectedCategory, tagSearch, dateFilter]);

  const applyFilters = async () => {
    setIsLoading(true);
    try {
      let filtered = [...transactions];

    if (dateFilter === 'this_month') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;
      filtered = await getTransactionsByDateRange(startDate, endDate);
    } else if (dateFilter === 'last_month') {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;
      filtered = await getTransactionsByDateRange(startDate, endDate);
    }

    if (filterType === 'income') {
      filtered = filtered.filter(t => t.type === 'income');
    } else if (filterType === 'expense') {
      filtered = filtered.filter(t => t.type === 'expense');
    }

    if (selectedCategory) {
      filtered = filtered.filter(t => t.category_id === selectedCategory);
    }

      if (tagSearch) {
        filtered = filtered.filter(t => t.tags && t.tags.toLowerCase().includes(tagSearch.toLowerCase()));
      }

      setFilteredTransactions(filtered);
    } catch (error) {
      Alert.alert('Error', 'Failed to filter transactions. Please try again.');
      console.error('Filter transactions error:', error);
      setFilteredTransactions(transactions);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.filtersSection} contentContainerStyle={styles.filtersSectionContent}>
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
            <TouchableOpacity
              style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filterType === 'income' && styles.filterChipActive]}
              onPress={() => setFilterType('income')}
            >
              <Text style={[styles.filterText, filterType === 'income' && styles.filterTextActive]}>
                Income
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filterType === 'expense' && styles.filterChipActive]}
              onPress={() => setFilterType('expense')}
            >
              <Text style={[styles.filterText, filterType === 'expense' && styles.filterTextActive]}>
                Expenses
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
            <TouchableOpacity
              style={[styles.filterChip, dateFilter === 'all' && styles.filterChipActive]}
              onPress={() => setDateFilter('all')}
            >
              <Text style={[styles.filterText, dateFilter === 'all' && styles.filterTextActive]}>
                All Time
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, dateFilter === 'this_month' && styles.filterChipActive]}
              onPress={() => setDateFilter('this_month')}
            >
              <Text style={[styles.filterText, dateFilter === 'this_month' && styles.filterTextActive]}>
                This Month
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, dateFilter === 'last_month' && styles.filterChipActive]}
              onPress={() => setDateFilter('last_month')}
            >
              <Text style={[styles.filterText, dateFilter === 'last_month' && styles.filterTextActive]}>
                Last Month
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <Text style={styles.label}>Filter by Category</Text>
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
            <TouchableOpacity
              style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>
                All
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.label}>Search by Tag</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter tag (e.g. #kids, #work)"
          value={tagSearch}
          onChangeText={setTagSearch}
        />
      </ScrollView>

      <ScrollView style={styles.transactionsList}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Filtering transactions...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.countText}>{filteredTransactions.length} transactions found</Text>

            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                currency={selectedCurrency}
              />
            ))}

            {filteredTransactions.length === 0 && (
              <Text style={styles.emptyText}>No transactions match your filters</Text>
            )}

            <View style={styles.bottomSpace} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  filtersSection: {
    maxHeight: 280,
    backgroundColor: colors.cardBackground,
    ...shadows.small
  },
  filtersSectionContent: {
    padding: spacing.lg
  },
  filterRow: {
    marginBottom: spacing.md
  },
  chipContainer: {
    paddingRight: spacing.lg
  },
  filterChip: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    marginRight: spacing.sm
  },
  filterChipActive: {
    backgroundColor: colors.primary
  },
  filterText: {
    ...typography.body,
    color: colors.text
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  label: {
    ...typography.subheading,
    marginTop: spacing.md,
    marginBottom: spacing.sm
  },
  categoryChip: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryText: {
    ...typography.body,
    color: colors.text
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border
  },
  transactionsList: {
    flex: 1,
    padding: spacing.lg
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md
  },
  countText: {
    ...typography.caption,
    marginBottom: spacing.md,
    fontWeight: 'bold'
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xl
  },
  bottomSpace: {
    height: spacing.xl
  }
});

export default TransactionHistoryScreen;
