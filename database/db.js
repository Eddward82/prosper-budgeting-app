import * as SQLite from 'expo-sqlite';
import { createTables, seedDefaultCategories, migrateExistingTables } from './schema';

let db = null;
let initPromise = null;

export const initDatabase = async () => {
  // If already initialized, return the existing database
  if (db) {
    return db;
  }

  // If initialization is in progress, wait for it to complete
  if (initPromise) {
    console.log('Database initialization already in progress, waiting...');
    return await initPromise;
  }

  // Start initialization
  initPromise = (async () => {
    try {
      console.log('Starting database initialization...');
      db = await SQLite.openDatabaseAsync('budget.db');
      console.log('Database opened successfully');

      await createTables(db);
      console.log('Tables created successfully');

      await migrateExistingTables(db);
      console.log('Tables migrated successfully');

      await seedDefaultCategories(db);
      console.log('Default categories seeded successfully');

      console.log('Database initialization complete');
      return db;
    } catch (error) {
      console.error('Database initialization error:', error);
      // Reset on error so next attempt can try again
      db = null;
      initPromise = null;
      throw error;
    }
  })();

  return await initPromise;
};

export const getDatabase = async () => {
  if (!db) {
    return await initDatabase();
  }
  return db;
};

export const getAllCategories = async () => {
  const db = await getDatabase();
  return await db.getAllAsync('SELECT * FROM categories ORDER BY name');
};

export const updateCategoryBudget = async (id, budget) => {
  const db = await getDatabase();
  return await db.runAsync('UPDATE categories SET monthly_budget = ? WHERE id = ?', [budget, id]);
};

export const toggleCategoryExcludeFromLimits = async (id, excludeFromLimits) => {
  const db = await getDatabase();
  return await db.runAsync('UPDATE categories SET exclude_from_limits = ? WHERE id = ?', [excludeFromLimits ? 1 : 0, id]);
};

export const addTransaction = async (type, categoryId, amount, date, tags = null, receiptUri = null, isRecurring = 0, frequency = null, nextRunDate = null, excludeFromLimits = 0) => {
  const db = await getDatabase();
  return await db.runAsync(
    'INSERT INTO transactions (type, category_id, amount, date, tags, receipt_uri, is_recurring, frequency, next_run_date, exclude_from_limits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [type, categoryId, amount, date, tags, receiptUri, isRecurring, frequency, nextRunDate, excludeFromLimits]
  );
};

export const getAllTransactions = async () => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT t.*, c.name as category_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     ORDER BY t.date DESC`
  );
};

export const getTransactionsByMonth = async (year, month) => {
  const db = await getDatabase();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  return await db.getAllAsync(
    `SELECT t.*, c.name as category_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.date LIKE ?
     ORDER BY t.date DESC`,
    [`${monthStr}%`]
  );
};

export const updateTransaction = async (id, type, categoryId, amount, date, tags = null, receiptUri = null, isRecurring = 0, frequency = null, nextRunDate = null, excludeFromLimits = 0) => {
  const db = await getDatabase();
  return await db.runAsync(
    'UPDATE transactions SET type = ?, category_id = ?, amount = ?, date = ?, tags = ?, receipt_uri = ?, is_recurring = ?, frequency = ?, next_run_date = ?, exclude_from_limits = ? WHERE id = ?',
    [type, categoryId, amount, date, tags, receiptUri, isRecurring, frequency, nextRunDate, excludeFromLimits, id]
  );
};

export const deleteTransaction = async (id) => {
  const db = await getDatabase();
  return await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
};

export const deleteCategory = async (id) => {
  const db = await getDatabase();
  // First, update any transactions using this category to have null category_id
  await db.runAsync('UPDATE transactions SET category_id = NULL WHERE category_id = ?', [id]);
  // Then delete the category
  return await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
};

export const clearAllData = async () => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions');
  await db.runAsync('DELETE FROM categories');
  await db.runAsync('DELETE FROM savings_goals');
  // Clear all settings EXCEPT db_owner_uid (we need to preserve it for user tracking)
  await db.runAsync("DELETE FROM app_settings WHERE key != 'db_owner_uid'");
  await seedDefaultCategories(db);
};

export const getDashboardData = async (year, month) => {
  const transactions = await getTransactionsByMonth(year, month);
  const categories = await getAllCategories();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const expensesByCategory = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!expensesByCategory[t.category_id]) {
        expensesByCategory[t.category_id] = {
          categoryId: t.category_id,
          categoryName: t.category_name || 'Other',
          amount: 0
        };
      }
      expensesByCategory[t.category_id].amount += t.amount;
    });

  const totalBudget = categories.reduce((sum, cat) => sum + cat.monthly_budget, 0);
  const remainingBudget = totalBudget - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    totalBudget,
    remainingBudget,
    expensesByCategory: Object.values(expensesByCategory),
    categories
  };
};

// Savings Goals Functions
export const getAllSavingsGoals = async () => {
  const db = await getDatabase();
  return await db.getAllAsync('SELECT * FROM savings_goals ORDER BY id DESC');
};

export const addSavingsGoal = async (name, targetAmount, deadline = null) => {
  const db = await getDatabase();
  return await db.runAsync(
    'INSERT INTO savings_goals (name, target_amount, current_amount, deadline) VALUES (?, ?, 0, ?)',
    [name, targetAmount, deadline]
  );
};

export const updateGoalProgress = async (id, amount) => {
  const db = await getDatabase();
  return await db.runAsync(
    'UPDATE savings_goals SET current_amount = current_amount + ? WHERE id = ?',
    [amount, id]
  );
};

export const updateGoal = async (id, { name, target_amount, deadline }) => {
  const db = await getDatabase();
  return await db.runAsync(
    'UPDATE savings_goals SET name = ?, target_amount = ?, deadline = ? WHERE id = ?',
    [name, target_amount, deadline, id]
  );
};

export const deleteGoal = async (id) => {
  const db = await getDatabase();
  return await db.runAsync('DELETE FROM savings_goals WHERE id = ?', [id]);
};

// App Settings Functions
export const getSetting = async (key) => {
  const db = await getDatabase();
  const result = await db.getFirstAsync('SELECT value FROM app_settings WHERE key = ?', [key]);
  return result ? result.value : null;
};

export const setSetting = async (key, value) => {
  const db = await getDatabase();
  return await db.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, value]
  );
};

// Transaction Filter Functions
export const getTransactionsByDateRange = async (startDate, endDate) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT t.*, c.name as category_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.date >= ? AND t.date <= ?
     ORDER BY t.date DESC`,
    [startDate, endDate]
  );
};

export const getTransactionsByCategory = async (categoryId) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT t.*, c.name as category_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.category_id = ?
     ORDER BY t.date DESC`,
    [categoryId]
  );
};

export const getTransactionsByTag = async (tag) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT t.*, c.name as category_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.tags LIKE ?
     ORDER BY t.date DESC`,
    [`%${tag}%`]
  );
};

// Daily/Weekly Spending (excludes categories marked as exclude_from_limits)
export const getSpendingByDateRange = async (startDate, endDate) => {
  const db = await getDatabase();
  const result = await db.getFirstAsync(
    `SELECT SUM(t.amount) as total
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.type = 'expense'
     AND t.date >= ?
     AND t.date <= ?
     AND (c.exclude_from_limits IS NULL OR c.exclude_from_limits = 0)
     AND (t.exclude_from_limits IS NULL OR t.exclude_from_limits = 0)`,
    [startDate, endDate]
  );
  return result ? result.total || 0 : 0;
};

// Recurring Transactions
export const getRecurringTransactions = async () => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT t.*, c.name as category_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.is_recurring = 1
     ORDER BY t.date DESC`
  );
};

export const processRecurringTransactions = async () => {
  const recurring = await getRecurringTransactions();
  const today = new Date().toISOString().split('T')[0];
  const db = await getDatabase();

  for (const trans of recurring) {
    if (trans.next_run_date && trans.next_run_date <= today) {
      await addTransaction(
        trans.type,
        trans.category_id,
        trans.amount,
        today,
        trans.tags,
        null,
        1,
        trans.frequency,
        calculateNextRunDate(today, trans.frequency)
      );

      await db.runAsync(
        'UPDATE transactions SET next_run_date = ? WHERE id = ?',
        [calculateNextRunDate(today, trans.frequency), trans.id]
      );
    }
  }
};

const calculateNextRunDate = (currentDate, frequency) => {
  const date = new Date(currentDate);
  if (frequency === 'daily') {
    date.setDate(date.getDate() + 1);
  } else if (frequency === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (frequency === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString().split('T')[0];
};

// Monthly Trends for Insights
export const getMonthlyTrends = async (monthsBack = 6) => {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    `SELECT
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income
     FROM transactions
     GROUP BY month
     ORDER BY month DESC
     LIMIT ?`,
    [monthsBack]
  );
  return result.reverse();
};

export const getTopCategoriesBySpending = async (limit = 3) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT c.name, SUM(t.amount) as total
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE t.type = 'expense'
     GROUP BY c.name
     ORDER BY total DESC
     LIMIT ?`,
    [limit]
  );
};

// Category Management
export const addCategory = async (name, monthlyBudget, excludeFromLimits = 0) => {
  const db = await getDatabase();
  return await db.runAsync(
    'INSERT INTO categories (name, monthly_budget, exclude_from_limits) VALUES (?, ?, ?)',
    [name, monthlyBudget, excludeFromLimits ? 1 : 0]
  );
};
