import React from 'react';
import useBudgetStore from '../store/useBudgetStore';
import TransactionForm from '../components/TransactionForm';

const EditTransactionScreen = ({ route, navigation }) => {
  const { transaction } = route.params;
  const updateTransaction = useBudgetStore((state) => state.updateTransaction);

  const initialValues = {
    amount: transaction.amount.toString(),
    type: transaction.type,
    categoryId: transaction.category_id,
    date: transaction.date,
    tags: transaction.tags || '',
    isRecurring: transaction.is_recurring === 1,
    frequency: transaction.frequency || 'monthly',
    excludeFromLimits: transaction.exclude_from_limits === 1
  };

  const handleSubmit = (values) =>
    updateTransaction(
      transaction.id,
      values.type,
      values.categoryId,
      values.amount,
      values.date,
      values.tags,
      transaction.receipt_uri,
      values.isRecurring,
      values.frequency,
      values.nextRunDate,
      values.excludeFromLimits
    );

  return (
    <TransactionForm
      navigation={navigation}
      initialValues={initialValues}
      submitLabel="Update Transaction"
      onSubmit={handleSubmit}
      getSuccessMessage={() => 'Transaction updated successfully'}
      errorMessage="Failed to update transaction. Please check your input and try again."
    />
  );
};

export default EditTransactionScreen;
