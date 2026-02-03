import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';

class CloudSyncService {
  constructor() {
    this.syncInProgress = false;
    this.lastSyncTime = null;
  }

  // Sync all user data to cloud
  async syncToCloud(userId, data) {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return { success: false, message: 'Sync already in progress' };
    }

    try {
      this.syncInProgress = true;
      const batch = writeBatch(db);

      // Sync categories
      if (data.categories && data.categories.length > 0) {
        for (const category of data.categories) {
          const categoryRef = doc(db, `users/${userId}/categories/${category.id}`);
          batch.set(categoryRef, {
            ...category,
            syncedAt: serverTimestamp()
          });
        }
      }

      // Sync transactions
      if (data.transactions && data.transactions.length > 0) {
        for (const transaction of data.transactions) {
          const transactionRef = doc(db, `users/${userId}/transactions/${transaction.id}`);
          batch.set(transactionRef, {
            ...transaction,
            syncedAt: serverTimestamp()
          });
        }
      }

      // Sync savings goals
      if (data.savingsGoals && data.savingsGoals.length > 0) {
        for (const goal of data.savingsGoals) {
          const goalRef = doc(db, `users/${userId}/savingsGoals/${goal.id}`);
          batch.set(goalRef, {
            ...goal,
            syncedAt: serverTimestamp()
          });
        }
      }

      // Sync settings
      if (data.settings) {
        const settingsRef = doc(db, `users/${userId}/settings/app`);
        batch.set(settingsRef, {
          ...data.settings,
          syncedAt: serverTimestamp()
        });
      }

      // Commit the batch
      await batch.commit();

      this.lastSyncTime = new Date();
      this.syncInProgress = false;

      return {
        success: true,
        message: 'Data synced successfully',
        timestamp: this.lastSyncTime
      };
    } catch (error) {
      this.syncInProgress = false;
      console.error('Cloud sync error:', error);
      throw error;
    }
  }

  // Restore data from cloud
  async restoreFromCloud(userId) {
    try {
      const restoredData = {
        categories: [],
        transactions: [],
        savingsGoals: [],
        settings: null
      };

      // Restore categories
      const categoriesSnapshot = await getDocs(
        collection(db, `users/${userId}/categories`)
      );
      categoriesSnapshot.forEach(doc => {
        const data = doc.data();
        delete data.syncedAt; // Remove sync metadata
        restoredData.categories.push(data);
      });

      // Restore transactions
      const transactionsSnapshot = await getDocs(
        collection(db, `users/${userId}/transactions`)
      );
      transactionsSnapshot.forEach(doc => {
        const data = doc.data();
        delete data.syncedAt;
        restoredData.transactions.push(data);
      });

      // Restore savings goals
      const goalsSnapshot = await getDocs(
        collection(db, `users/${userId}/savingsGoals`)
      );
      goalsSnapshot.forEach(doc => {
        const data = doc.data();
        delete data.syncedAt;
        restoredData.savingsGoals.push(data);
      });

      // Restore settings
      const settingsDoc = await getDoc(doc(db, `users/${userId}/settings/app`));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        delete data.syncedAt;
        restoredData.settings = data;
      }

      return {
        success: true,
        data: restoredData,
        message: 'Data restored successfully'
      };
    } catch (error) {
      console.error('Cloud restore error:', error);
      throw error;
    }
  }

  // Get last sync time from cloud
  async getLastSyncTime(userId) {
    try {
      const settingsDoc = await getDoc(doc(db, `users/${userId}/settings/app`));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        return data.syncedAt?.toDate() || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  // Delete all user data from cloud
  async deleteCloudData(userId) {
    try {
      const batch = writeBatch(db);

      // Delete categories
      const categoriesSnapshot = await getDocs(
        collection(db, `users/${userId}/categories`)
      );
      categoriesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete transactions
      const transactionsSnapshot = await getDocs(
        collection(db, `users/${userId}/transactions`)
      );
      transactionsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete savings goals
      const goalsSnapshot = await getDocs(
        collection(db, `users/${userId}/savingsGoals`)
      );
      goalsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete settings
      const settingsRef = doc(db, `users/${userId}/settings/app`);
      batch.delete(settingsRef);

      await batch.commit();

      return {
        success: true,
        message: 'Cloud data deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting cloud data:', error);
      throw error;
    }
  }

  // Check if cloud backup exists
  async hasCloudBackup(userId) {
    try {
      const settingsDoc = await getDoc(doc(db, `users/${userId}/settings/app`));
      return settingsDoc.exists();
    } catch (error) {
      console.error('Error checking cloud backup:', error);
      return false;
    }
  }

  // Sync single transaction (for real-time sync)
  async syncTransaction(userId, transaction) {
    try {
      const transactionRef = doc(db, `users/${userId}/transactions/${transaction.id}`);
      await setDoc(transactionRef, {
        ...transaction,
        syncedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error syncing transaction:', error);
      throw error;
    }
  }

  // Sync single category (for real-time sync)
  async syncCategory(userId, category) {
    try {
      const categoryRef = doc(db, `users/${userId}/categories/${category.id}`);
      await setDoc(categoryRef, {
        ...category,
        syncedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error syncing category:', error);
      throw error;
    }
  }

  // Sync single savings goal (for real-time sync)
  async syncSavingsGoal(userId, goal) {
    try {
      const goalRef = doc(db, `users/${userId}/savingsGoals/${goal.id}`);
      await setDoc(goalRef, {
        ...goal,
        syncedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error syncing savings goal:', error);
      throw error;
    }
  }
}

export default new CloudSyncService();
