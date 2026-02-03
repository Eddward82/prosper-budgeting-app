import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import useBudgetStore from '../store/useBudgetStore';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import { formatCurrency } from '../utils/helpers';
import { formatDate } from '../utils/date';
import { deleteTransaction } from '../database/db';

const TransactionDetailScreen = ({ route, navigation }) => {
  const { transaction } = route.params;
  const { selectedCurrency, loadTransactions, refreshDashboard } = useBudgetStore();

  const isIncome = transaction.type === 'income';
  const tags = transaction.tags ? transaction.tags.split(',').map(t => t.trim()) : [];

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
              await loadTransactions();
              await refreshDashboard();
              Alert.alert('Success', 'Transaction deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
              console.error('Delete transaction error:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.amountCard, { backgroundColor: isIncome ? colors.income : colors.expense }]}>
          <Text style={styles.amountLabel}>{isIncome ? 'Income' : 'Expense'}</Text>
          <Text style={styles.amount}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, selectedCurrency)}
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
          </View>

          {transaction.category_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{transaction.category_name}</Text>
            </View>
          )}

          {tags.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tags</Text>
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {transaction.is_recurring === 1 && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recurring</Text>
                <Text style={styles.detailValue}>
                  {transaction.frequency ? transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1) : 'Yes'}
                </Text>
              </View>

              {transaction.next_run_date && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Next Occurrence</Text>
                  <Text style={styles.detailValue}>{formatDate(transaction.next_run_date)}</Text>
                </View>
              )}
            </>
          )}

          {transaction.receipt_uri && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Receipt</Text>
              <Text style={styles.detailValue}>Attached</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditTransaction', { transaction })}
        >
          <Text style={styles.editButtonText}>Edit Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete Transaction</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg
  },
  amountCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.medium
  },
  amountLabel: {
    ...typography.body,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: spacing.sm
  },
  amount: {
    ...typography.title,
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  detailsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  detailLabel: {
    ...typography.subheading,
    color: colors.textLight
  },
  detailValue: {
    ...typography.subheading,
    fontWeight: 'bold'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    flex: 1,
    justifyContent: 'flex-end'
  },
  tagChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md
  },
  tagText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  editButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.medium
  },
  editButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  deleteButton: {
    backgroundColor: colors.danger,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.medium
  },
  deleteButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  }
});

export default TransactionDetailScreen;
