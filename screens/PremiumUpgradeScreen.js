import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import useBudgetStore from '../store/useBudgetStore';
import useThemeStore from '../store/useThemeStore';
import revenueCatService, { PRODUCT_ID_MONTHLY, PRODUCT_ID_YEARLY, PRODUCT_ID_LIFETIME } from '../services/revenueCatService';
import { getColors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const PremiumUpgradeScreen = ({ navigation }) => {
  const { isPremium, setPremiumStatus } = useBudgetStore();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const colors = getColors(isDarkMode);
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  useEffect(() => {
    initializeRevenueCat();

    return () => {
      // Cleanup is handled by service
    };
  }, []);

  const initializeRevenueCat = async () => {
    try {
      setLoading(true);
      await revenueCatService.configure();

      // Get offerings from RevenueCat
      const offering = await revenueCatService.getOfferings();

      if (offering && offering.availablePackages) {
        setPackages(offering.availablePackages);
        console.log('Available packages:', offering.availablePackages.map(p => p.identifier));
      } else {
        console.warn('No offerings available from RevenueCat');
      }

      // Check current subscription status
      const customerInfo = await revenueCatService.getCustomerInfo();
      if (customerInfo.isPremium) {
        await setPremiumStatus(true);
      }
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
      Alert.alert('Error', 'Failed to load subscription plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getPackageByPlan = (planType) => {
    if (!packages.length) return null;

    // Find package by identifier or product identifier
    return packages.find(pkg => {
      const identifier = pkg.identifier.toLowerCase();
      const productId = pkg.product?.identifier?.toLowerCase() || '';

      if (planType === 'monthly') {
        return identifier.includes('monthly') || productId.includes('monthly');
      } else if (planType === 'yearly') {
        return identifier.includes('yearly') || identifier.includes('annual') ||
               productId.includes('yearly') || productId.includes('annual');
      } else if (planType === 'lifetime') {
        return identifier.includes('lifetime') || productId.includes('lifetime');
      }
      return false;
    });
  };

  const handlePurchase = async () => {
    if (isPremium) {
      Alert.alert('Already Premium', 'You already have Premium access!');
      return;
    }

    const packageToPurchase = getPackageByPlan(selectedPlan);

    if (!packageToPurchase) {
      Alert.alert('Error', 'Selected plan is not available. Please try another plan.');
      return;
    }

    setPurchasing(true);
    try {
      const result = await revenueCatService.purchasePackage(packageToPurchase);

      if (result.success && result.isPremium) {
        await setPremiumStatus(true);
        Alert.alert(
          'Success!',
          'Welcome to Premium! You now have access to all premium features.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else if (result.cancelled) {
        // User cancelled - do nothing
        console.log('Purchase cancelled by user');
      } else {
        Alert.alert('Purchase Failed', result.error || 'Unable to complete purchase. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const result = await revenueCatService.restorePurchases();

      if (result.success && result.isPremium) {
        await setPremiumStatus(true);
        Alert.alert(
          'Restored!',
          'Your Premium subscription has been restored.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else if (result.success && !result.isPremium) {
        Alert.alert('No Subscription Found', 'No previous subscription found. Purchase premium to unlock all features!');
      } else {
        Alert.alert('Restore Failed', result.error || 'Unable to restore purchases. Please try again.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases.');
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (planType) => {
    const pkg = getPackageByPlan(planType);
    if (pkg && pkg.product) {
      return pkg.product.priceString || pkg.product.price;
    }
    // Fallback prices if package not loaded
    if (planType === 'monthly') return '$4.99';
    if (planType === 'yearly') return '$39.99';
    if (planType === 'lifetime') return '$99.99';
    return '$4.99';
  };

  const renderFeatureItem = (title, description) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>✓</Text>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading subscription plans...</Text>
      </View>
    );
  }

  if (isPremium) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          <View style={styles.premiumBadgeContainer}>
            <Text style={styles.premiumBadgeIcon}>✓</Text>
            <Text style={styles.premiumBadgeTitle}>You're Premium!</Text>
            <Text style={styles.premiumBadgeText}>
              Thank you for supporting Budget Planner
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Your Premium Features</Text>
            {renderFeatureItem('Recurring Transactions', 'Set up automatic income & expenses')}
            {renderFeatureItem('Transaction Tags', 'Organize with custom tags')}
            {renderFeatureItem('Advanced Insights', 'Detailed spending analytics')}
            {renderFeatureItem('Unlimited Categories', 'Create custom categories')}
            {renderFeatureItem('Export to CSV', 'Download your transaction history')}
            {renderFeatureItem('Priority Support', 'Get help when you need it')}
          </View>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryButtonText}>Back to Settings</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Unlock powerful features to take control of your finances
          </Text>
        </View>

        <View style={styles.plansContainer}>
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardActive
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            {selectedPlan === 'monthly' && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓</Text>
              </View>
            )}
            <Text style={styles.planName}>Monthly</Text>
            <Text style={styles.planPrice}>{getProductPrice('monthly')}</Text>
            <Text style={styles.planPeriod}>per month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardActive
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            {selectedPlan === 'yearly' && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓</Text>
              </View>
            )}
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsBadgeText}>Save 33%</Text>
            </View>
            <Text style={styles.planName}>Yearly</Text>
            <Text style={styles.planPrice}>{getProductPrice('yearly')}</Text>
            <Text style={styles.planPeriod}>per year</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          {renderFeatureItem('Recurring Transactions', 'Automate your regular income and expenses')}
          {renderFeatureItem('Transaction Tags', 'Organize transactions with custom tags')}
          {renderFeatureItem('Advanced Insights', 'Get detailed analytics and reports')}
          {renderFeatureItem('Unlimited Categories', 'Create as many categories as you need')}
          {renderFeatureItem('Export to CSV', 'Download and backup your data')}
          {renderFeatureItem('Priority Support', 'Get help from our support team')}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, purchasing && styles.primaryButtonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              Subscribe Now - {getProductPrice(selectedPlan)}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={purchasing || loading}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          {Platform.OS === 'ios'
            ? 'Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. Manage subscriptions in App Store settings.'
            : 'Payment will be charged to your Google Play account at confirmation of purchase. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. Manage subscriptions in Google Play settings.'}
        </Text>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md
  },
  content: {
    flex: 1,
    padding: spacing.lg
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  title: {
    ...typography.title,
    fontSize: 28,
    marginBottom: spacing.sm
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center'
  },
  plansContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.medium,
    position: 'relative'
  },
  planCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.cardBackground
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md
  },
  savingsBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  planName: {
    ...typography.heading,
    marginBottom: spacing.xs
  },
  planPrice: {
    ...typography.title,
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center'
  },
  planPeriod: {
    ...typography.caption,
    color: colors.textLight
  },
  featuresContainer: {
    marginBottom: spacing.xl
  },
  sectionTitle: {
    ...typography.heading,
    marginBottom: spacing.md
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  featureIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  featureContent: {
    flex: 1
  },
  featureTitle: {
    ...typography.subheading,
    fontWeight: 'bold',
    marginBottom: spacing.xs
  },
  featureDescription: {
    ...typography.caption,
    color: colors.textLight
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.medium
  },
  primaryButtonDisabled: {
    opacity: 0.6
  },
  primaryButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  restoreButton: {
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  restoreButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold'
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18
  },
  premiumBadgeContainer: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium
  },
  premiumBadgeIcon: {
    fontSize: 48,
    marginBottom: spacing.md
  },
  premiumBadgeTitle: {
    ...typography.title,
    color: '#FFFFFF',
    marginBottom: spacing.sm
  },
  premiumBadgeText: {
    ...typography.body,
    color: '#FFFFFF',
    textAlign: 'center'
  },
  secondaryButton: {
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  secondaryButtonText: {
    ...typography.subheading,
    color: colors.text,
    fontWeight: 'bold'
  }
});

export default PremiumUpgradeScreen;
