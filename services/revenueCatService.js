import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Keys - Replace with your actual keys from RevenueCat dashboard
const REVENUECAT_API_KEY_IOS = 'YOUR_IOS_API_KEY';
const REVENUECAT_API_KEY_ANDROID = 'goog_TIsPZPfmLWxupBfcMptubiEzwIo';

// Product/Entitlement identifiers - Set these up in RevenueCat dashboard
export const ENTITLEMENT_ID = 'Prosper Budget Planner Pro';
export const PRODUCT_ID_MONTHLY = 'prosper_premium_monthly';
export const PRODUCT_ID_YEARLY = 'prosper_premium_yearly';
export const PRODUCT_ID_LIFETIME = 'prosper_premium_lifetime';

class RevenueCatService {
  isConfigured = false;

  /**
   * Initialize RevenueCat SDK
   * Call this once when the app starts
   */
  async configure() {
    if (this.isConfigured) {
      console.log('RevenueCat already configured');
      return;
    }

    try {
      const apiKey = Platform.OS === 'ios'
        ? REVENUECAT_API_KEY_IOS
        : REVENUECAT_API_KEY_ANDROID;

      if (apiKey === 'YOUR_IOS_API_KEY' || apiKey === 'YOUR_ANDROID_API_KEY') {
        console.warn('RevenueCat: Using placeholder API key. Replace with your actual key.');
        return;
      }

      await Purchases.configure({ apiKey });
      this.isConfigured = true;
      console.log('RevenueCat configured successfully');
    } catch (error) {
      console.error('Error configuring RevenueCat:', error);
    }
  }

  /**
   * Set the user ID for RevenueCat (call after user logs in)
   */
  async login(userId) {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      if (this.isConfigured) {
        const { customerInfo } = await Purchases.logIn(userId);
        return customerInfo;
      }
    } catch (error) {
      console.error('Error logging in to RevenueCat:', error);
      throw error;
    }
  }

  /**
   * Log out user from RevenueCat (call when user logs out)
   */
  async logout() {
    try {
      if (this.isConfigured) {
        await Purchases.logOut();
        console.log('RevenueCat user logged out');
      }
    } catch (error) {
      console.error('Error logging out from RevenueCat:', error);
    }
  }

  /**
   * Get available packages/products for purchase
   */
  async getOfferings() {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      if (!this.isConfigured) {
        console.warn('RevenueCat not configured, returning empty offerings');
        return null;
      }

      const offerings = await Purchases.getOfferings();

      if (offerings.current) {
        console.log('Current offering:', offerings.current.identifier);
        return offerings.current;
      }

      console.log('No current offering available');
      return null;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      throw error;
    }
  }

  /**
   * Purchase a package
   */
  async purchasePackage(packageToPurchase) {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

      // Check if the premium entitlement is active
      const isPremium = this.checkPremiumEntitlement(customerInfo);

      return {
        success: true,
        isPremium,
        customerInfo
      };
    } catch (error) {
      if (error.userCancelled) {
        return {
          success: false,
          cancelled: true,
          error: 'Purchase cancelled'
        };
      }

      console.error('Error purchasing package:', error);
      return {
        success: false,
        cancelled: false,
        error: error.message || 'Purchase failed'
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases() {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      const customerInfo = await Purchases.restorePurchases();
      const isPremium = this.checkPremiumEntitlement(customerInfo);

      return {
        success: true,
        isPremium,
        customerInfo
      };
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return {
        success: false,
        error: error.message || 'Failed to restore purchases'
      };
    }
  }

  /**
   * Get current customer info and subscription status
   */
  async getCustomerInfo() {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      if (!this.isConfigured) {
        return { isPremium: false };
      }

      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = this.checkPremiumEntitlement(customerInfo);

      return {
        isPremium,
        customerInfo,
        activeSubscriptions: customerInfo.activeSubscriptions,
        entitlements: customerInfo.entitlements
      };
    } catch (error) {
      console.error('Error getting customer info:', error);
      return { isPremium: false };
    }
  }

  /**
   * Check if user has premium entitlement
   */
  checkPremiumEntitlement(customerInfo) {
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  }

  /**
   * Add listener for customer info updates
   */
  addCustomerInfoUpdateListener(callback) {
    if (this.isConfigured) {
      return Purchases.addCustomerInfoUpdateListener(callback);
    }
    return () => {}; // Return empty cleanup function
  }
}

export default new RevenueCatService();
