import { create } from 'zustand';
import {
  initDatabase,
  getAllCategories,
  getAllTransactions,
  getDashboardData,
  clearAllData,
  addTransaction as dbAddTransaction,
  updateTransaction as dbUpdateTransaction,
  updateCategoryBudget as dbUpdateCategoryBudget,
  toggleCategoryExcludeFromLimits as dbToggleCategoryExcludeFromLimits,
  getAllSavingsGoals,
  addSavingsGoal as dbAddSavingsGoal,
  updateGoalProgress as dbUpdateGoalProgress,
  updateGoal as dbUpdateGoal,
  deleteGoal as dbDeleteGoal,
  getSetting,
  setSetting,
  getSpendingByDateRange,
  processRecurringTransactions,
  addCategory as dbAddCategory,
  getMonthlyTrends
} from '../database/db';
import { removeDuplicateCategories } from '../database/fixDuplicates';
import revenueCatService from '../services/revenueCatService';
import notificationService from '../services/notificationService';
import cloudSyncService from '../services/cloudSyncService';

const useBudgetStore = create((set, get) => ({
  categories: [],
  transactions: [],
  dashboardData: null,
  selectedCurrency: '$',
  isLoading: false,
  savingsGoals: [],
  isPremium: false, // Set to true for dev testing
  dailyLimit: 0,
  weeklyLimit: 0,
  dailySpending: 0,
  weeklySpending: 0,
  trendsData: [],

  // Auto-sync settings
  autoSyncEnabled: true, // Auto-sync is enabled by default
  lastAutoSync: null,
  syncInProgress: false,

  // Auth state
  user: null,
  authLoading: true,

  initializeApp: async () => {
    try {
      set({ isLoading: true });
      await initDatabase();

      // Fix duplicates (runs once, safe to call every time)
      await removeDuplicateCategories();

      await get().loadCategories();
      await get().loadTransactions();
      await get().refreshDashboard();
      await get().loadSavingsGoals();
      await get().loadSettings();
      await get().calculateSpendingLimits();
      await processRecurringTransactions();

      // Sync premium status with RevenueCat
      await get().syncPremiumWithRevenueCat();

      set({ isLoading: false });
    } catch (error) {
      console.error('Error initializing app:', error);
      set({ isLoading: false });
    }
  },

  loadCategories: async () => {
    try {
      const categories = await getAllCategories();
      set({ categories });
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  },

  loadTransactions: async () => {
    try {
      const transactions = await getAllTransactions();
      set({ transactions });
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  },

  refreshDashboard: async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const data = await getDashboardData(year, month);
      const trends = await getMonthlyTrends(6);
      set({ dashboardData: data, trendsData: trends });
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    }
  },

  addTransaction: async (type, categoryId, amount, date, tags = null, receiptUri = null, isRecurring = 0, frequency = null, nextRunDate = null, excludeFromLimits = 0) => {
    try {
      await dbAddTransaction(type, categoryId, amount, date, tags, receiptUri, isRecurring, frequency, nextRunDate, excludeFromLimits);
      await get().loadTransactions();
      await get().refreshDashboard();
      await get().calculateSpendingLimits();

      // Auto-sync to cloud
      get().autoSyncToCloud();

      // Check for budget notifications if this is an expense
      if (type === 'expense' && excludeFromLimits === 0) {
        const state = get();

        // Check spending limits
        await notificationService.checkSpendingLimits(
          state.dailySpending,
          state.weeklySpending,
          state.dailyLimit,
          state.weeklyLimit,
          state.selectedCurrency
        );

        // Check category budget if applicable
        if (categoryId) {
          const now = new Date();
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          await notificationService.checkCategoryBudgets(
            state.categories,
            state.transactions,
            currentMonth,
            state.selectedCurrency
          );
        }
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  updateTransaction: async (id, type, categoryId, amount, date, tags = null, receiptUri = null, isRecurring = 0, frequency = null, nextRunDate = null, excludeFromLimits = 0) => {
    try {
      await dbUpdateTransaction(id, type, categoryId, amount, date, tags, receiptUri, isRecurring, frequency, nextRunDate, excludeFromLimits);
      await get().loadTransactions();
      await get().refreshDashboard();
      await get().calculateSpendingLimits();

      // Auto-sync to cloud
      get().autoSyncToCloud();

      // Check for budget notifications if this is an expense
      if (type === 'expense' && excludeFromLimits === 0) {
        const state = get();

        // Check spending limits
        await notificationService.checkSpendingLimits(
          state.dailySpending,
          state.weeklySpending,
          state.dailyLimit,
          state.weeklyLimit,
          state.selectedCurrency
        );

        // Check category budget if applicable
        if (categoryId) {
          const now = new Date();
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          await notificationService.checkCategoryBudgets(
            state.categories,
            state.transactions,
            currentMonth,
            state.selectedCurrency
          );
        }
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  updateCategoryBudget: async (id, budget) => {
    try {
      await dbUpdateCategoryBudget(id, budget);
      await get().loadCategories();
      await get().refreshDashboard();

      // Auto-sync to cloud
      get().autoSyncToCloud();
    } catch (error) {
      console.error('Error updating category budget:', error);
      throw error;
    }
  },

  toggleCategoryExcludeFromLimits: async (id, excludeFromLimits) => {
    try {
      await dbToggleCategoryExcludeFromLimits(id, excludeFromLimits);
      await get().loadCategories();
      await get().calculateSpendingLimits();
    } catch (error) {
      console.error('Error toggling category exclude from limits:', error);
      throw error;
    }
  },

  setCurrency: async (currency) => {
    try {
      await setSetting('currency', currency);
      set({ selectedCurrency: currency });
    } catch (error) {
      console.error('Error setting currency:', error);
      throw error;
    }
  },

  resetApp: async () => {
    try {
      set({ isLoading: true });
      await clearAllData();
      await get().loadCategories();
      await get().loadTransactions();
      await get().refreshDashboard();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error resetting app:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Savings Goals
  loadSavingsGoals: async () => {
    try {
      const goals = await getAllSavingsGoals();
      set({ savingsGoals: goals });
    } catch (error) {
      console.error('Error loading savings goals:', error);
    }
  },

  addSavingsGoal: async (name, targetAmount, deadline) => {
    try {
      await dbAddSavingsGoal(name, targetAmount, deadline);
      await get().loadSavingsGoals();

      // Auto-sync to cloud
      get().autoSyncToCloud();
    } catch (error) {
      console.error('Error adding savings goal:', error);
      throw error;
    }
  },

  updateGoalProgress: async (id, amount) => {
    try {
      await dbUpdateGoalProgress(id, amount);
      await get().loadSavingsGoals();

      // Auto-sync to cloud
      get().autoSyncToCloud();
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  },

  updateGoal: async (id, goalData) => {
    try {
      await dbUpdateGoal(id, goalData);
      await get().loadSavingsGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  deleteGoal: async (id) => {
    try {
      await dbDeleteGoal(id);
      await get().loadSavingsGoals();

      // Auto-sync to cloud
      get().autoSyncToCloud();
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  // Settings
  loadSettings: async () => {
    try {
      const isPremium = await getSetting('isPremium');
      const dailyLimit = await getSetting('dailyLimit');
      const weeklyLimit = await getSetting('weeklyLimit');
      const currency = await getSetting('currency');
      const autoSync = await getSetting('autoSyncEnabled');

      set({
        isPremium: isPremium === 'true',
        dailyLimit: parseFloat(dailyLimit || 0),
        weeklyLimit: parseFloat(weeklyLimit || 0),
        selectedCurrency: currency || '$',
        autoSyncEnabled: autoSync !== 'false' // Default to true if not set
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },

  setSetting: async (key, value) => {
    try {
      await setSetting(key, value);
    } catch (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  },

  checkOnboarding: async () => {
    try {
      const completed = await getSetting('onboarding_completed');
      const completedUserId = await getSetting('onboarding_user_id');
      const state = get();
      const currentUser = state?.user;

      console.log('Checking onboarding:', {
        completed,
        completedUserId,
        currentUserId: currentUser?.uid,
        hasUser: !!currentUser
      });

      // If no user is logged in, return false (should show onboarding)
      if (!currentUser || !currentUser.uid) {
        console.log('No current user, returning false');
        return false;
      }

      // Only return true if onboarding was completed AND it was completed by the current user
      const result = completed === '1' && completedUserId === currentUser.uid;
      console.log('Onboarding check result:', result);
      return result;
    } catch (error) {
      console.error('Error checking onboarding:', error);
      return false;
    }
  },

  setDailyLimit: async (limit) => {
    try {
      await setSetting('dailyLimit', limit.toString());
      set({ dailyLimit: limit });
    } catch (error) {
      console.error('Error setting daily limit:', error);
      throw error;
    }
  },

  setWeeklyLimit: async (limit) => {
    try {
      await setSetting('weeklyLimit', limit.toString());
      set({ weeklyLimit: limit });
    } catch (error) {
      console.error('Error setting weekly limit:', error);
      throw error;
    }
  },

  togglePremium: async () => {
    try {
      const newValue = !get().isPremium;
      await setSetting('isPremium', newValue.toString());
      set({ isPremium: newValue });
    } catch (error) {
      console.error('Error toggling premium:', error);
      throw error;
    }
  },

  setPremiumStatus: async (status) => {
    try {
      await setSetting('isPremium', status.toString());
      if (status) {
        await setSetting('premium_purchase_date', new Date().toISOString());
      }
      set({ isPremium: status });
    } catch (error) {
      console.error('Error setting premium status:', error);
      throw error;
    }
  },

  checkPremiumStatus: async () => {
    try {
      // First check RevenueCat for active subscription
      const customerInfo = await revenueCatService.getCustomerInfo();

      if (customerInfo.isPremium) {
        // User has active RevenueCat subscription
        await setSetting('isPremium', 'true');
        set({ isPremium: true });
        return true;
      }

      // Fallback to local setting (for legacy or offline support)
      const isPremiumLocal = await getSetting('isPremium');
      const isPremiumValue = isPremiumLocal === 'true';
      set({ isPremium: isPremiumValue });
      return isPremiumValue;
    } catch (error) {
      console.error('Error checking premium status:', error);
      // Fallback to local setting on error
      const isPremiumLocal = await getSetting('isPremium');
      const isPremiumValue = isPremiumLocal === 'true';
      set({ isPremium: isPremiumValue });
      return isPremiumValue;
    }
  },

  // Sync premium status with RevenueCat
  syncPremiumWithRevenueCat: async () => {
    try {
      await revenueCatService.configure();
      const customerInfo = await revenueCatService.getCustomerInfo();

      if (customerInfo.isPremium) {
        await setSetting('isPremium', 'true');
        set({ isPremium: true });
        console.log('Premium status synced from RevenueCat: active');
        return true;
      } else {
        // Check if local setting says premium but RevenueCat doesn't
        const isPremiumLocal = await getSetting('isPremium');
        if (isPremiumLocal === 'true') {
          // Subscription may have expired
          await setSetting('isPremium', 'false');
          set({ isPremium: false });
          console.log('Premium subscription expired');
        }
        return false;
      }
    } catch (error) {
      console.error('Error syncing premium with RevenueCat:', error);
      return false;
    }
  },

  // Spending Limits Calculation
  calculateSpendingLimits: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const dailySpending = await getSpendingByDateRange(today, today);
      const weeklySpending = await getSpendingByDateRange(weekAgoStr, today);

      set({ dailySpending, weeklySpending });
    } catch (error) {
      console.error('Error calculating spending limits:', error);
    }
  },

  // Category Management
  addCategory: async (name, monthlyBudget, excludeFromLimits = false) => {
    try {
      const { categories, isPremium } = get();

      if (!isPremium && categories.length >= 5) {
        throw new Error('Free users are limited to 5 categories. Upgrade to Premium for unlimited categories!');
      }

      await dbAddCategory(name, monthlyBudget, excludeFromLimits);
      await get().loadCategories();

      // Auto-sync to cloud
      get().autoSyncToCloud();
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  // Auth Management
  setUser: (user) => {
    set({ user, authLoading: false });
  },

  setAuthLoading: (loading) => {
    set({ authLoading: loading });
  },

  clearUser: () => {
    set({ user: null, authLoading: false });
  },

  // Force user refresh (creates new object reference to trigger re-renders)
  refreshUser: (user) => {
    // Create a new object to ensure React detects the change
    const refreshedUser = user ? { ...user, _lastRefresh: Date.now() } : null;
    set({ user: refreshedUser, authLoading: false });
  },

  // Reset app data when switching users
  resetApp: async () => {
    try {
      console.log('Resetting app data for new user...');
      // Clear all database data
      await clearAllData();

      // Reset all store state to initial values
      set({
        categories: [],
        transactions: [],
        dashboardData: null,
        savingsGoals: [],
        isPremium: false,
        dailyLimit: 0,
        weeklyLimit: 0,
        dailySpending: 0,
        weeklySpending: 0,
        trendsData: []
      });

      console.log('App data reset complete');
    } catch (error) {
      console.error('Error resetting app:', error);
      throw error;
    }
  },

  // Cloud Sync Functions
  syncToCloud: async () => {
    const state = get();
    if (!state.user) {
      throw new Error('User must be logged in to sync to cloud');
    }

    try {
      const data = {
        categories: state.categories,
        transactions: state.transactions,
        savingsGoals: state.savingsGoals,
        settings: {
          selectedCurrency: state.selectedCurrency,
          dailyLimit: state.dailyLimit,
          weeklyLimit: state.weeklyLimit,
          isPremium: state.isPremium,
          autoSyncEnabled: state.autoSyncEnabled
        }
      };

      const result = await cloudSyncService.syncToCloud(state.user.uid, data);
      set({ lastAutoSync: new Date() });
      return result;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      throw error;
    }
  },

  // Auto-sync helper (silent background sync)
  autoSyncToCloud: async () => {
    const state = get();

    // Don't auto-sync if disabled, no user, or sync already in progress
    if (!state.autoSyncEnabled || !state.user || state.syncInProgress) {
      return;
    }

    try {
      set({ syncInProgress: true });

      const data = {
        categories: state.categories,
        transactions: state.transactions,
        savingsGoals: state.savingsGoals,
        settings: {
          selectedCurrency: state.selectedCurrency,
          dailyLimit: state.dailyLimit,
          weeklyLimit: state.weeklyLimit,
          isPremium: state.isPremium,
          autoSyncEnabled: state.autoSyncEnabled
        }
      };

      await cloudSyncService.syncToCloud(state.user.uid, data);
      set({ lastAutoSync: new Date(), syncInProgress: false });
      console.log('Auto-sync completed successfully');
    } catch (error) {
      console.error('Auto-sync error:', error);
      set({ syncInProgress: false });
      // Don't throw error - silent failure for auto-sync
    }
  },

  // Toggle auto-sync
  toggleAutoSync: async (enabled) => {
    set({ autoSyncEnabled: enabled });
    await setSetting('autoSyncEnabled', enabled ? 'true' : 'false');
  },

  restoreFromCloud: async () => {
    const state = get();
    if (!state.user) {
      throw new Error('User must be logged in to restore from cloud');
    }

    try {
      const result = await cloudSyncService.restoreFromCloud(state.user.uid);

      if (result.success && result.data) {
        // Import categories
        if (result.data.categories && result.data.categories.length > 0) {
          for (const category of result.data.categories) {
            await dbAddCategory(category.name, category.monthly_budget || 0, category.exclude_from_limits || false);
          }
        }

        // Import transactions
        if (result.data.transactions && result.data.transactions.length > 0) {
          for (const transaction of result.data.transactions) {
            await dbAddTransaction(
              transaction.type,
              transaction.category_id,
              transaction.amount,
              transaction.date,
              transaction.tags,
              transaction.receipt_uri,
              transaction.is_recurring,
              transaction.frequency,
              transaction.next_run_date,
              transaction.exclude_from_limits
            );
          }
        }

        // Import savings goals
        if (result.data.savingsGoals && result.data.savingsGoals.length > 0) {
          for (const goal of result.data.savingsGoals) {
            await dbAddSavingsGoal(goal.name, goal.target_amount, goal.current_amount, goal.deadline);
          }
        }

        // Import settings
        if (result.data.settings) {
          if (result.data.settings.selectedCurrency) {
            await setSetting('selectedCurrency', result.data.settings.selectedCurrency);
          }
          if (result.data.settings.dailyLimit !== undefined) {
            await setSetting('dailyLimit', result.data.settings.dailyLimit.toString());
          }
          if (result.data.settings.weeklyLimit !== undefined) {
            await setSetting('weeklyLimit', result.data.settings.weeklyLimit.toString());
          }
        }

        // Reload all data
        await get().loadCategories();
        await get().loadTransactions();
        await get().loadSavingsGoals();
        await get().loadSettings();
        await get().refreshDashboard();

        return result;
      }

      return result;
    } catch (error) {
      console.error('Error restoring from cloud:', error);
      throw error;
    }
  },

  getLastSyncTime: async () => {
    const state = get();
    if (!state.user) {
      return null;
    }

    try {
      return await cloudSyncService.getLastSyncTime(state.user.uid);
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  },

  hasCloudBackup: async () => {
    const state = get();
    if (!state.user) {
      return false;
    }

    try {
      return await cloudSyncService.hasCloudBackup(state.user.uid);
    } catch (error) {
      console.error('Error checking cloud backup:', error);
      return false;
    }
  },

  deleteCloudData: async () => {
    const state = get();
    if (!state.user) {
      throw new Error('User must be logged in to delete cloud data');
    }

    try {
      return await cloudSyncService.deleteCloudData(state.user.uid);
    } catch (error) {
      console.error('Error deleting cloud data:', error);
      throw error;
    }
  }
}));

export default useBudgetStore;
