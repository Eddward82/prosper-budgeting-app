import { Alert, Platform } from 'react-native';

class NotificationService {
  // Show spending limit warning
  showSpendingLimitWarning(limitType, currentSpending, limit, currency) {
    const percentage = (currentSpending / limit) * 100;
    const remaining = limit - currentSpending;

    if (percentage >= 100) {
      Alert.alert(
        `${limitType} Limit Exceeded!`,
        `You've exceeded your ${limitType.toLowerCase()} spending limit!\n\n` +
        `Limit: ${currency}${limit.toFixed(2)}\n` +
        `Spent: ${currency}${currentSpending.toFixed(2)}\n` +
        `Over by: ${currency}${Math.abs(remaining).toFixed(2)}`,
        [{ text: 'OK', style: 'destructive' }]
      );
      return true;
    } else if (percentage >= 80) {
      Alert.alert(
        `${limitType} Limit Warning`,
        `You're approaching your ${limitType.toLowerCase()} spending limit!\n\n` +
        `Limit: ${currency}${limit.toFixed(2)}\n` +
        `Spent: ${currency}${currentSpending.toFixed(2)}\n` +
        `Remaining: ${currency}${remaining.toFixed(2)}\n` +
        `(${percentage.toFixed(0)}% used)`,
        [{ text: 'OK' }]
      );
      return true;
    }

    return false;
  }

  // Show category budget warning
  showCategoryBudgetWarning(categoryName, spent, budget, currency) {
    const percentage = (spent / budget) * 100;
    const remaining = budget - spent;

    if (percentage >= 100) {
      Alert.alert(
        `${categoryName} Budget Exceeded!`,
        `You've exceeded your budget for ${categoryName}!\n\n` +
        `Budget: ${currency}${budget.toFixed(2)}\n` +
        `Spent: ${currency}${spent.toFixed(2)}\n` +
        `Over by: ${currency}${Math.abs(remaining).toFixed(2)}`,
        [
          { text: 'OK', style: 'destructive' },
          { text: 'Adjust Budget', style: 'default' }
        ]
      );
      return true;
    } else if (percentage >= 90) {
      Alert.alert(
        `${categoryName} Budget Warning`,
        `You're close to exceeding your ${categoryName} budget!\n\n` +
        `Budget: ${currency}${budget.toFixed(2)}\n` +
        `Spent: ${currency}${spent.toFixed(2)}\n` +
        `Remaining: ${currency}${remaining.toFixed(2)}\n` +
        `(${percentage.toFixed(0)}% used)`,
        [{ text: 'OK' }]
      );
      return true;
    }

    return false;
  }

  // Show low savings goal warning
  showSavingsGoalReminder(goalName, currentAmount, targetAmount, currency) {
    const percentage = (currentAmount / targetAmount) * 100;
    const remaining = targetAmount - currentAmount;

    if (percentage >= 90) {
      Alert.alert(
        '🎉 Goal Almost Reached!',
        `You're almost at your ${goalName} savings goal!\n\n` +
        `Target: ${currency}${targetAmount.toFixed(2)}\n` +
        `Saved: ${currency}${currentAmount.toFixed(2)}\n` +
        `Remaining: ${currency}${remaining.toFixed(2)}\n` +
        `(${percentage.toFixed(0)}% complete)`,
        [{ text: 'Great!' }]
      );
      return true;
    }

    return false;
  }

  // Show monthly budget summary
  showMonthlyBudgetSummary(totalIncome, totalExpenses, budget, currency) {
    const remaining = totalIncome - totalExpenses;
    const spentPercentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;

    Alert.alert(
      '📊 Monthly Summary',
      `Income: ${currency}${totalIncome.toFixed(2)}\n` +
      `Expenses: ${currency}${totalExpenses.toFixed(2)}\n` +
      `Remaining: ${currency}${remaining.toFixed(2)}\n` +
      (budget > 0 ? `Budget Used: ${spentPercentage.toFixed(0)}%` : ''),
      [{ text: 'OK' }]
    );
  }

  // Check and show notifications for spending limits
  async checkSpendingLimits(dailySpending, weeklySpending, dailyLimit, weeklyLimit, currency) {
    const notifications = [];

    if (dailyLimit > 0 && dailySpending >= dailyLimit * 0.8) {
      const shown = this.showSpendingLimitWarning('Daily', dailySpending, dailyLimit, currency);
      if (shown) notifications.push('daily');
    }

    if (weeklyLimit > 0 && weeklySpending >= weeklyLimit * 0.8) {
      const shown = this.showSpendingLimitWarning('Weekly', weeklySpending, weeklyLimit, currency);
      if (shown) notifications.push('weekly');
    }

    return notifications;
  }

  // Check and show notifications for category budgets
  async checkCategoryBudgets(categories, transactions, currentMonth, currency) {
    const notifications = [];

    for (const category of categories) {
      if (category.monthly_budget > 0) {
        const categoryTransactions = transactions.filter(
          t => t.category_id === category.id &&
          t.date.startsWith(currentMonth) &&
          t.type === 'expense'
        );

        const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

        if (spent >= category.monthly_budget * 0.9) {
          const shown = this.showCategoryBudgetWarning(
            category.name,
            spent,
            category.monthly_budget,
            currency
          );
          if (shown) notifications.push(category.name);
        }
      }
    }

    return notifications;
  }
}

export default new NotificationService();
