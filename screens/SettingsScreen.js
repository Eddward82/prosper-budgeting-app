import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Share,
  Switch
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import useBudgetStore from '../store/useBudgetStore';
import useThemeStore from '../store/useThemeStore';
import authService from '../services/authService';
import pdfExportService from '../services/pdfExportService';
import CurrencySelector from '../components/CurrencySelector';
import { getColors, spacing, borderRadius, shadows } from '../styles/theme';
import { currencies } from '../utils/currencies';

const SettingsScreen = ({ navigation }) => {
  const {
    selectedCurrency,
    setCurrency,
    resetApp,
    isPremium,
    togglePremium,
    dailyLimit,
    weeklyLimit,
    setDailyLimit,
    setWeeklyLimit,
    user,
    syncToCloud,
    restoreFromCloud,
    getLastSyncTime,
    hasCloudBackup,
    transactions,
    categories,
    autoSyncEnabled,
    toggleAutoSync
  } = useBudgetStore();

  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const colors = getColors(isDarkMode);
  const styles = getStyles(colors);

  const [newDailyLimit, setNewDailyLimit] = useState(dailyLimit.toString());
  const [newWeeklyLimit, setNewWeeklyLimit] = useState(weeklyLimit.toString());
  const [currencySelectorVisible, setCurrencySelectorVisible] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
              console.error('Sign out error:', error);
            }
          }
        }
      ]
    );
  };

  const handleCurrencyChange = async (currency) => {
    try {
      await setCurrency(currency);
      Alert.alert('Success', `Currency changed to ${currency}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to change currency. Please try again.');
      console.error('Currency change error:', error);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to reset all data? This will delete all transactions and reset categories to default budgets. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetApp();
              Alert.alert('Success', 'All data has been reset successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset data. Please try again or restart the app.');
              console.error('Reset data error:', error);
            }
          }
        }
      ]
    );
  };

  const currentCurrency = currencies.find(c => c.symbol === selectedCurrency);

  return (
    <>
      <CurrencySelector
        visible={currencySelectorVisible}
        onClose={() => setCurrencySelectorVisible(false)}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={async (symbol) => {
          await handleCurrencyChange(symbol);
        }}
      />
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency</Text>
        <Text style={styles.sectionDescription}>
          Select your preferred currency
        </Text>

        <TouchableOpacity
          style={styles.currencyButton}
          onPress={() => setCurrencySelectorVisible(true)}
        >
          <View style={styles.currencyButtonContent}>
            <Text style={styles.currencyButtonSymbol}>
              {currentCurrency?.symbol || selectedCurrency}
            </Text>
            <View style={styles.currencyButtonTextContainer}>
              <Text style={styles.currencyButtonName}>
                {currentCurrency?.name || 'Select Currency'}
              </Text>
              <Text style={styles.currencyButtonCode}>
                {currentCurrency?.code || ''}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={[styles.darkModeCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.darkModeRow}>
            <View style={styles.darkModeInfo}>
              <Ionicons
                name={isDarkMode ? "moon" : "sunny"}
                size={24}
                color={isDarkMode ? colors.gold : colors.warning}
              />
              <Text style={[styles.darkModeText, { color: colors.text }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDarkMode ? colors.gold : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending Limits</Text>
        <Text style={styles.sectionDescription}>
          Set daily and weekly spending limits
        </Text>

        <Text style={styles.label}>Daily Limit ({selectedCurrency})</Text>
        <View style={styles.limitInputRow}>
          <TextInput
            style={styles.limitInput}
            placeholder="0"
            keyboardType="decimal-pad"
            value={newDailyLimit}
            onChangeText={setNewDailyLimit}
          />
          <TouchableOpacity
            style={styles.saveLimitButton}
            onPress={async () => {
              const limit = parseFloat(newDailyLimit);
              if (isNaN(limit) || limit < 0) {
                Alert.alert('Validation Error', 'Please enter a valid amount (0 or greater)');
                return;
              }
              try {
                await setDailyLimit(limit);
                Alert.alert('Success', `Daily limit set to ${limit.toFixed(2)}`);
              } catch (error) {
                Alert.alert('Error', 'Failed to update daily limit. Please try again.');
                console.error('Daily limit update error:', error);
              }
            }}
          >
            <Text style={styles.saveLimitButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Weekly Limit ({selectedCurrency})</Text>
        <View style={styles.limitInputRow}>
          <TextInput
            style={styles.limitInput}
            placeholder="0"
            keyboardType="decimal-pad"
            value={newWeeklyLimit}
            onChangeText={setNewWeeklyLimit}
          />
          <TouchableOpacity
            style={styles.saveLimitButton}
            onPress={async () => {
              const limit = parseFloat(newWeeklyLimit);
              if (isNaN(limit) || limit < 0) {
                Alert.alert('Validation Error', 'Please enter a valid amount (0 or greater)');
                return;
              }
              try {
                await setWeeklyLimit(limit);
                Alert.alert('Success', `Weekly limit set to ${limit.toFixed(2)}`);
              } catch (error) {
                Alert.alert('Error', 'Failed to update weekly limit. Please try again.');
                console.error('Weekly limit update error:', error);
              }
            }}
          >
            <Text style={styles.saveLimitButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium Features</Text>
        <View style={styles.premiumCard}>
          <Text style={styles.premiumStatus}>
            Status: {isPremium ? '✓ Premium Active' : 'Free Plan'}
          </Text>

          {!isPremium && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('PremiumUpgrade')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}

          {isPremium && (
            <View style={styles.premiumBenefits}>
              <Text style={styles.benefitsTitle}>Your Premium Benefits:</Text>
              <Text style={styles.benefitItem}>✓ Recurring Transactions</Text>
              <Text style={styles.benefitItem}>✓ Transaction Tags</Text>
              <Text style={styles.benefitItem}>✓ Advanced Insights</Text>
              <Text style={styles.benefitItem}>✓ Unlimited Categories</Text>
              <Text style={styles.benefitItem}>✓ CSV Export</Text>

              <TouchableOpacity
                style={styles.managePremiumButton}
                onPress={() => navigation.navigate('PremiumUpgrade')}
              >
                <Text style={styles.managePremiumButtonText}>Manage Subscription</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.insightsButton}
            onPress={() => navigation.navigate('Insights')}
          >
            <Text style={styles.insightsButtonText}>View Insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cloud Backup & Sync</Text>
        <Text style={styles.sectionDescription}>
          Backup your data to the cloud and sync across devices
        </Text>

        {lastSyncTime && (
          <Text style={styles.lastSyncText}>
            Last synced: {lastSyncTime.toLocaleString()}
          </Text>
        )}

        <View style={styles.autoSyncToggleContainer}>
          <View style={styles.autoSyncInfo}>
            <Ionicons name="sync-outline" size={20} color={colors.primary} />
            <View style={styles.autoSyncTextContainer}>
              <Text style={styles.autoSyncTitle}>Auto-Sync</Text>
              <Text style={styles.autoSyncDescription}>
                Automatically backup data after every change
              </Text>
            </View>
          </View>
          <Switch
            value={autoSyncEnabled}
            onValueChange={async (value) => {
              try {
                await toggleAutoSync(value);
                Alert.alert(
                  'Auto-Sync ' + (value ? 'Enabled' : 'Disabled'),
                  value
                    ? 'Your data will now automatically sync to the cloud after every change.'
                    : 'You will need to manually backup your data using the button below.'
                );
              } catch (error) {
                Alert.alert('Error', 'Failed to update auto-sync setting');
              }
            }}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={autoSyncEnabled ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <TouchableOpacity
          style={styles.syncButton}
          onPress={async () => {
            if (!user) {
              Alert.alert('Error', 'You must be logged in to sync data');
              return;
            }

            setSyncing(true);
            try {
              const result = await syncToCloud();
              if (result.success) {
                setLastSyncTime(result.timestamp);
                Alert.alert('Success', 'Data backed up to cloud successfully!');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to backup data to cloud. Please try again.');
              console.error('Sync error:', error);
            } finally {
              setSyncing(false);
            }
          }}
          disabled={syncing}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" style={{ marginRight: spacing.sm }} />
          <Text style={styles.syncButtonText}>
            {syncing ? 'Backing up...' : 'Backup to Cloud'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={async () => {
            if (!user) {
              Alert.alert('Error', 'You must be logged in to restore data');
              return;
            }

            Alert.alert(
              'Restore from Cloud',
              'This will restore your data from the last cloud backup. Your current local data will be merged with the cloud data.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Restore',
                  onPress: async () => {
                    setSyncing(true);
                    try {
                      const hasBackup = await hasCloudBackup();
                      if (!hasBackup) {
                        Alert.alert('No Backup Found', 'No cloud backup was found for your account.');
                        return;
                      }

                      const result = await restoreFromCloud();
                      if (result.success) {
                        const syncTime = await getLastSyncTime();
                        setLastSyncTime(syncTime);
                        Alert.alert('Success', 'Data restored from cloud successfully!');
                      }
                    } catch (error) {
                      Alert.alert('Error', 'Failed to restore data from cloud. Please try again.');
                      console.error('Restore error:', error);
                    } finally {
                      setSyncing(false);
                    }
                  }
                }
              ]
            );
          }}
          disabled={syncing}
        >
          <Ionicons name="cloud-download-outline" size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
          <Text style={styles.restoreButtonText}>
            {syncing ? 'Restoring...' : 'Restore from Cloud'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity
          style={styles.pdfButton}
          onPress={async () => {
            if (!isPremium) {
              Alert.alert(
                'Premium Feature',
                'PDF export is a Premium feature. Upgrade to export your financial report as PDF.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Upgrade',
                    onPress: () => navigation.navigate('PremiumUpgrade')
                  }
                ]
              );
              return;
            }

            try {
              if (!transactions || transactions.length === 0) {
                Alert.alert('No Data', 'There are no transactions to export.');
                return;
              }

              Alert.alert(
                'Generating PDF',
                'Please wait while we generate your financial report...',
                [],
                { cancelable: false }
              );

              const result = await pdfExportService.exportAndShare(
                transactions,
                categories,
                selectedCurrency,
                user
              );

              if (result.success) {
                Alert.alert('Success', 'PDF report generated and shared successfully!');
              }
            } catch (error) {
              console.error('PDF export error:', error);
              Alert.alert('Error', `Failed to export PDF: ${error.message}`);
            }
          }}
        >
          <Ionicons name="document-text-outline" size={20} color="#FFFFFF" style={{ marginRight: spacing.sm }} />
          <Text style={styles.pdfButtonText}>
            Export to PDF {!isPremium && '(Premium)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={async () => {
            if (!isPremium) {
              Alert.alert(
                'Premium Feature',
                'CSV export is a Premium feature. Upgrade to export your transaction data.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Upgrade',
                    onPress: async () => await togglePremium()
                  }
                ]
              );
              return;
            }

            try {
              const { transactions, categories } = useBudgetStore.getState();

              if (!transactions || transactions.length === 0) {
                Alert.alert('No Data', 'There are no transactions to export.');
                return;
              }

              // Create CSV content with better formatting
              const csvHeader = 'Date,Type,Category,Amount,Tags,Recurring';
              const csvRows = transactions.map(t => {
                const category = categories.find(c => c.id === t.category_id);
                const categoryName = category?.name || t.category_name || 'N/A';
                const tags = (t.tags || '').replace(/"/g, '""'); // Escape quotes
                return `${t.date},${t.type},"${categoryName}",${t.amount},"${tags}",${t.is_recurring ? 'Yes' : 'No'}`;
              });
              const csv = [csvHeader, ...csvRows].join('\n');

              // Generate filename with date
              const date = new Date().toISOString().split('T')[0];
              const filename = `prosper_transactions_${date}.csv`;

              // Try to get a valid directory
              const directory = FileSystem.cacheDirectory || FileSystem.documentDirectory;

              if (directory) {
                // File system available - use file sharing
                const filepath = `${directory}${filename}`;
                await FileSystem.writeAsStringAsync(filepath, csv);

                const isSharingAvailable = await Sharing.isAvailableAsync();
                if (isSharingAvailable) {
                  await Sharing.shareAsync(filepath, {
                    mimeType: 'text/csv',
                    UTI: 'public.comma-separated-values-text',
                    dialogTitle: 'Export Transactions'
                  });
                  return;
                }
              }

              // Fallback: Use Share API to share CSV content directly
              // User can copy/paste into a file or send via email/message
              await Share.share({
                message: csv,
                title: filename
              });

              Alert.alert(
                'Export Complete',
                'The CSV data has been shared. You can paste it into a spreadsheet app or save the message as a .csv file.'
              );
            } catch (error) {
              console.error('CSV export error:', error);
              Alert.alert('Error', `Failed to export data: ${error.message}`);
            }
          }}
        >
          <Text style={styles.exportButtonText}>
            Export to CSV {!isPremium && '(Premium)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleResetData}
        >
          <Text style={styles.dangerButtonText}>Reset All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {user && (
          <View style={styles.accountCard}>
            <Text style={styles.accountLabel}>Signed in as:</Text>
            <Text style={styles.accountEmail}>{user.email}</Text>
            {user.displayName && (
              <Text style={styles.accountName}>{user.displayName}</Text>
            )}

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle-outline" size={20} color={colors.primary} style={styles.profileButtonIcon} />
              <Text style={styles.profileButtonText}>Manage Profile & Security</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoCard}>
          <Text style={styles.appName}>Prosper</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            Your personal budget planner to help you prosper financially.
            Track your income, expenses, and achieve your financial goals.
          </Text>
        </View>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
    </>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  section: {
    padding: spacing.lg,
    marginTop: spacing.md
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: spacing.lg
  },
  option: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.small
  },
  optionActive: {
    borderWidth: 2,
    borderColor: colors.primary
  },
  currencyButton: {
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.small,
    marginTop: spacing.md
  },
  currencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  currencyButtonSymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.primary,
    width: 60,
    textAlign: 'center'
  },
  currencyButtonTextContainer: {
    marginLeft: spacing.md,
    flex: 1
  },
  currencyButtonName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2
  },
  currencyButtonCode: {
    fontSize: 12,
    color: colors.textLight
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm
  },
  limitInputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md
  },
  limitInput: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border
  },
  saveLimitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    ...shadows.small
  },
  saveLimitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  premiumCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.small
  },
  premiumStatus: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.text
  },
  upgradeButton: {
    backgroundColor: colors.warning,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.large
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  premiumBenefits: {
    backgroundColor: colors.success + '15',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.success
  },
  benefitItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm
  },
  managePremiumButton: {
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.success
  },
  managePremiumButtonText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold'
  },
  demoButton: {
    backgroundColor: colors.border,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md
  },
  demoButtonText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: 'bold'
  },
  insightsButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.small
  },
  insightsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  autoSyncToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  autoSyncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md
  },
  autoSyncTextContainer: {
    marginLeft: spacing.sm,
    flex: 1
  },
  autoSyncTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text
  },
  autoSyncDescription: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2
  },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.medium
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  restoreButton: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.small
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary
  },
  lastSyncText: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontStyle: 'italic'
  },
  pdfButton: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.medium
  },
  pdfButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  exportButton: {
    backgroundColor: colors.secondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.small
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  dangerButton: {
    backgroundColor: colors.danger,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.medium
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.small
  },
  appName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  version: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20
  },
  accountCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.small
  },
  accountLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.xs
  },
  accountEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs
  },
  accountName: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: spacing.lg
  },
  profileButton: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  profileButtonIcon: {
    marginRight: spacing.sm
  },
  profileButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    flex: 1
  },
  signOutButton: {
    backgroundColor: colors.danger,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.small
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  bottomSpace: {
    height: spacing.xl
  },
  darkModeCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.small
  },
  darkModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  darkModeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  darkModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text
  }
});

export default SettingsScreen;
