// Temporarily disabled due to RN version compatibility
// import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';

// Product IDs for iOS and Android
const PRODUCT_IDS = Platform.select({
  ios: [
    'com.prosper.premium.monthly',
    'ccom.prosper.premium.yearly'
  ],
  android: [
    'com.prosper.premium.monthly',
    'com.prosper.premium.yearly'
  ]
});

// Subscription SKUs (for Android)
const SUBSCRIPTION_SKUS = Platform.select({
  ios: [],
  android: [
    'com.budgetplanner.premium.monthly',
    'com.budgetplanner.premium.yearly'
  ]
});

class IAPService {
  constructor() {
    this.products = [];
    this.subscriptions = [];
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription = null;
  }

  // Initialize IAP connection
  async initialize() {
    try {
      // Mock initialization for demo
      console.log('IAP Mock Mode - Skipping real connection');

      // Mock products
      this.products = [
        { productId: 'com.budgetplanner.premium.monthly', localizedPrice: '$4.99', price: '4.99' },
        { productId: 'com.budgetplanner.premium.yearly', localizedPrice: '$39.99', price: '39.99' }
      ];

      return true;
    } catch (error) {
      console.error('IAP initialization error:', error);
      return false;
    }
  }

  // Get available products from store
  async getProducts() {
    try {
      // Mock products - already set in initialize()
      console.log('Available products (mock):', this.products);
      return this.products;
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  // Set up purchase update listeners
  setupPurchaseListeners() {
    // Mock - no listeners needed in demo mode
    console.log('Purchase listeners setup (mock mode)');
  }

  // Request a purchase
  async requestPurchase(productId) {
    try {
      // Mock purchase - simulate success
      console.log('Mock purchase requested for:', productId);
      return { productId, transactionId: 'mock_' + Date.now() };
    } catch (error) {
      console.error('Purchase request error:', error);
      throw error;
    }
  }

  // Restore purchases (for users who already purchased)
  async restorePurchases() {
    try {
      // Mock restore - check local storage instead
      console.log('Mock restore purchases');
      return { success: true, hasPremium: false, purchases: [] };
    } catch (error) {
      console.error('Restore purchases error:', error);
      return { success: false, hasPremium: false, purchases: [] };
    }
  }

  // Validate receipt (basic client-side validation)
  async validateReceipt(purchase) {
    // In production, you should validate receipts on your backend server
    // This is a simplified client-side check
    try {
      if (Platform.OS === 'ios') {
        // iOS receipt validation would happen on your server
        return true;
      } else if (Platform.OS === 'android') {
        // Android receipt validation would happen on your server
        return true;
      }
      return false;
    } catch (error) {
      console.error('Receipt validation error:', error);
      return false;
    }
  }

  // Check if user has active subscription
  async checkSubscriptionStatus() {
    try {
      // Mock - always return false, use demo toggle instead
      console.log('Mock subscription check');
      return false;
    } catch (error) {
      console.error('Check subscription status error:', error);
      return false;
    }
  }

  // Clean up listeners
  cleanup() {
    // Mock - no cleanup needed
    console.log('IAP cleanup (mock mode)');
  }

  // Get product by ID
  getProductById(productId) {
    const allProducts = [...this.products, ...this.subscriptions];
    return allProducts.find(p => p.productId === productId);
  }

  // Format price for display
  formatPrice(product) {
    if (!product) return '';
    return product.localizedPrice || product.price || '';
  }
}

// Export singleton instance
export default new IAPService();
