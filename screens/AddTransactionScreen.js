import React from 'react';
import useBudgetStore from '../store/useBudgetStore';
import TransactionForm from '../components/TransactionForm';
import { formatDateInput } from '../utils/date';

const AddTransactionScreen = ({ navigation }) => {
  const addTransaction = useBudgetStore((state) => state.addTransaction);

  const initialValues = {
    amount: '',
    type: 'expense',
    categoryId: null,
    date: formatDateInput(new Date()),
    tags: '',
    isRecurring: false,
    frequency: 'monthly',
    excludeFromLimits: false
  };

  const handleSubmit = (values) =>
    addTransaction(
      values.type,
      values.categoryId,
      values.amount,
      values.date,
      values.tags,
      null,
      values.isRecurring,
      values.frequency,
      values.nextRunDate,
      values.excludeFromLimits
    );

  return (
    <TransactionForm
      navigation={navigation}
      initialValues={initialValues}
      submitLabel="Add Transaction"
      onSubmit={handleSubmit}
      getSuccessMessage={(type) => `${type === 'income' ? 'Income' : 'Expense'} added successfully`}
      errorMessage="Failed to add transaction. Please check your input and try again."
    />
  );
};

export default AddTransactionScreen;
