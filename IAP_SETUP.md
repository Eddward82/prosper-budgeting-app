# In-App Purchases (IAP) Setup Guide

This guide explains how to set up and test the In-App Purchase functionality in the Budget Planner app.

## Overview

The app now includes real In-App Purchase integration using `react-native-iap` library, supporting both iOS (App Store) and Android (Google Play) platforms.

## Features Implemented

### 1. **IAP Service Module** (`services/iapService.js`)
- Singleton service handling all IAP operations
- Connection to App Store/Google Play
- Product fetching and price retrieval
- Purchase processing and receipt validation
- Restore purchases functionality
- Subscription status checking

### 2. **Premium Upgrade Screen** (`screens/PremiumUpgradeScreen.js`)
- Beautiful subscription plan selection (Monthly/Yearly)
- Real-time pricing from stores
- Purchase flow integration
- Restore purchases button
- Premium benefits display
- Platform-specific disclaimers

### 3. **Updated Settings Screen**
- "Upgrade to Premium" button for free users
- Premium benefits display for premium users
- "Manage Subscription" button
- Demo toggle (for testing, can be removed in production)

### 4. **Store Integration** (`store/useBudgetStore.js`)
- `setPremiumStatus(status)` - Set premium status after purchase
- `checkPremiumStatus()` - Check current premium status
- Automatic saving of purchase date

## Subscription Plans

The app offers two subscription tiers:

### Monthly Plan
- Product ID: `com.budgetplanner.premium.monthly`
- Price: $4.99/month (configurable in App Store Connect / Google Play Console)

### Yearly Plan
- Product ID: `com.budgetplanner.premium.yearly`
- Price: $39.99/year (33% savings)
- Recommended plan with savings badge

## Premium Features

Users with premium subscription get access to:
- ✓ Recurring Transactions
- ✓ Transaction Tags
- ✓ Advanced Insights
- ✓ Unlimited Categories
- ✓ CSV Export
- ✓ Priority Support

## Setup Instructions

### Prerequisites
1. Expo/React Native project set up
2. Developer accounts for both platforms:
   - Apple Developer Program ($99/year)
   - Google Play Console ($25 one-time)

### iOS Setup (App Store)

1. **Create App in App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Create a new app
   - Fill in app information

2. **Configure In-App Purchases**
   - Navigate to "Features" → "In-App Purchases"
   - Click "+" to create new subscription
   - Add two subscriptions:
     - Product ID: `com.budgetplanner.premium.monthly`
     - Product ID: `com.budgetplanner.premium.yearly`
   - Set pricing for each subscription
   - Add subscription group (e.g., "Premium Plans")
   - Configure auto-renewable subscription details

3. **Set Up Sandbox Testing**
   - Go to "Users and Access" → "Sandbox Testers"
   - Add test accounts for testing purchases
   - Use these accounts to test on physical device

4. **Configure App Capabilities**
   - In Xcode, enable "In-App Purchase" capability
   - Add necessary entitlements

### Android Setup (Google Play)

1. **Create App in Google Play Console**
   - Go to https://play.google.com/console
   - Create a new app
   - Fill in app details

2. **Configure In-App Products**
   - Navigate to "Monetize" → "Products" → "Subscriptions"
   - Create two subscriptions:
     - Product ID: `com.budgetplanner.premium.monthly`
     - Product ID: `com.budgetplanner.premium.yearly`
   - Set pricing for each subscription
   - Configure billing periods

3. **Set Up Testing**
   - Navigate to "Setup" → "License Testing"
   - Add test Google accounts
   - Create a closed testing track
   - Upload an APK/AAB to closed testing

4. **Configure App Permissions**
   - Ensure BILLING permission is in AndroidManifest.xml (handled by react-native-iap)

### Code Configuration

The product IDs are already configured in `services/iapService.js`:

```javascript
const PRODUCT_IDS = Platform.select({
  ios: [
    'com.budgetplanner.premium.monthly',
    'com.budgetplanner.premium.yearly'
  ],
  android: [
    'com.budgetplanner.premium.monthly',
    'com.budgetplanner.premium.yearly'
  ]
});
```

**Important:** Update these IDs to match your actual App Store Connect and Google Play Console product IDs.

## Testing

### Testing on iOS
1. Sign out of your Apple ID in Settings
2. Build and run app on physical device (IAP doesn't work in simulator)
3. When prompted to sign in, use sandbox test account
4. Make test purchases (you won't be charged)
5. Test "Restore Purchases" functionality

### Testing on Android
1. Add your Google account to license testing
2. Install app from internal/closed testing track
3. Make test purchases (you won't be charged)
4. Test "Restore Purchases" functionality

### Demo Mode (Development Only)
For development/testing without connecting to stores:
- Use the "Enable Premium (Demo)" button in Settings
- This bypasses IAP and toggles premium status locally
- **Remove this button before production release**

## Important Notes

### Receipt Validation
The current implementation includes basic client-side validation. For production:

1. **Set up backend server** for receipt validation
2. **Validate iOS receipts** with Apple's verification endpoint
3. **Validate Android receipts** with Google Play Developer API
4. **Never trust client-side validation** alone

Example backend validation flow:
```
Client → Purchase → Receive Receipt → Send to Backend
Backend → Verify with Apple/Google → Return Status → Update Database
Client → Receive Confirmation → Update UI
```

### Security Considerations
1. Always validate receipts on your backend server
2. Never store sensitive data in client app
3. Implement proper error handling
4. Handle subscription status changes (cancellation, renewal failure)
5. Implement subscription grace periods

### Subscription Management
Users can manage their subscriptions through:
- **iOS:** Settings → Apple ID → Subscriptions
- **Android:** Google Play Store → Subscriptions

The app includes a "Manage Subscription" button that redirects to platform settings.

## Production Checklist

Before releasing to production:

- [ ] Replace product IDs with your actual IDs
- [ ] Set up backend receipt validation
- [ ] Remove demo toggle button from SettingsScreen
- [ ] Test on physical devices (iOS and Android)
- [ ] Test restore purchases flow
- [ ] Test subscription renewal/cancellation
- [ ] Add proper error handling for network failures
- [ ] Implement analytics for purchase events
- [ ] Add customer support contact for purchase issues
- [ ] Set up webhooks for subscription events (iOS/Android)
- [ ] Test refund scenarios
- [ ] Implement subscription status polling

## Troubleshooting

### "Unable to connect to store"
- Check internet connection
- Verify app is properly configured in App Store Connect / Google Play Console
- Ensure product IDs match exactly

### "Products not available"
- Wait 2-24 hours after creating products in console
- Verify product status is "Ready to Submit" or "Approved"
- Check that app bundle ID matches console

### "Purchase failed"
- Check sandbox/test account is properly configured
- Verify payment method is set up (even for sandbox)
- Check console logs for specific error messages

### "Restore purchases not working"
- Ensure user is signed in with correct Apple ID / Google account
- Check that purchases were completed (not just initiated)
- Verify receipt validation is working

## Support

For issues with IAP implementation:
1. Check `react-native-iap` documentation: https://github.com/dooboolab/react-native-iap
2. Check Apple's IAP documentation: https://developer.apple.com/in-app-purchase/
3. Check Google Play Billing documentation: https://developer.android.com/google/play/billing

## License & Legal

Remember to:
- Add privacy policy explaining subscription terms
- Add terms of service
- Include refund policy
- Comply with App Store / Google Play guidelines
- Display subscription terms clearly before purchase
