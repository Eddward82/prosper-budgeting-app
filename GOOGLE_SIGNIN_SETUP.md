# Google Sign-In Setup Guide

This guide will help you set up Google Sign-In for your Prosper Budget Planner app.

## Prerequisites

- Firebase project already created (you have this)
- Google Cloud Console access

## Step 1: Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **trusty-pixel-379821**
3. Navigate to **Authentication** > **Sign-in method**
4. Click on **Google** in the providers list
5. Click the **Enable** toggle
6. Click **Save**

## Step 2: Get Your Web Client ID

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. You should see your web app configuration
4. Copy the **Web Client ID** (it looks like: `683993869050-XXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`)

## Step 3: Configure the Web Client ID in Your App

1. Open `services/authService.js`
2. Find line 19 where it says:
   ```javascript
   webClientId: '683993869050-XXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com',
   ```
3. Replace the placeholder with your actual Web Client ID from Step 2

## Step 4: Configure Android (for Expo Go or Standalone Build)

### For Expo Go Testing:
Google Sign-In **does not work with Expo Go** because it requires native configuration. You'll need to:

**Option A: Use EAS Build (Recommended)**
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile development
```

**Option B: Eject to Bare Workflow** (if you need full control)
```bash
npx expo prebuild
```

### For Production Android Build:

1. Get your Android SHA-1 certificate fingerprint:
   ```bash
   # For debug keystore
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

   # For release keystore (when you create one)
   keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
   ```

2. Add the SHA-1 fingerprint to Firebase:
   - Go to Firebase Console > Project Settings
   - Scroll to **Your apps** section
   - Click on your Android app (or add one if you haven't)
   - Click **Add fingerprint**
   - Paste your SHA-1 fingerprint
   - Click **Save**

3. Download the updated `google-services.json`:
   - In Firebase Console, go to Project Settings
   - Click the download icon next to your Android app
   - Save `google-services.json` to your project root or `android/app/` directory

## Step 5: Update app.json for Expo

Add the following to your `app.json`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "com.yourcompany.budgetplanner"
    },
    "plugins": [
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

## Step 6: Test Google Sign-In

### Testing Flow:
1. **Build a development app** using EAS Build or create a standalone build
2. Install the app on your Android device
3. Click "Sign in with Google" on the login screen
4. Select your Google account
5. Grant permissions
6. You should be signed in and redirected to the app

### Troubleshooting:

**Error: "Sign in cancelled"**
- User cancelled the sign-in process
- This is normal user behavior

**Error: "Google Play Services not available"**
- Device doesn't have Google Play Services installed
- Update Google Play Services on the device

**Error: "DEVELOPER_ERROR" or "API not enabled"**
- Web Client ID is incorrect
- SHA-1 fingerprint not added to Firebase
- Google Sign-In not enabled in Firebase Console

**Error: "Network error"**
- Check internet connection
- Firebase configuration might be incorrect

## Step 7: iOS Configuration (Optional - for future)

For iOS, you'll need to:
1. Add iOS app to Firebase project
2. Download `GoogleService-Info.plist`
3. Configure URL schemes in `app.json`
4. Add iOS Client ID to the GoogleSignin configuration

## Important Notes

1. **Expo Go Limitation**: Google Sign-In will NOT work in Expo Go. You must use:
   - EAS Build development build
   - Standalone build
   - Bare workflow

2. **Web Client ID**: Make sure you use the **Web Client ID** from Firebase, NOT the Android Client ID

3. **Testing**: Always test on a real device with Google Play Services installed

4. **Email Verification**: Google Sign-In automatically verifies email addresses, so users who sign in with Google will have verified accounts

## Current Status

✅ Google Sign-In package installed
✅ Auth service updated with Google Sign-In functionality
✅ Login screen updated with Google button
✅ Sign-up screen updated with Google button
✅ Web Client ID configured in authService.js
✅ app.json updated with Google Sign-In plugin
⏳ Pending: Enable Google Sign-In in Firebase Console
⏳ Pending: Add Android SHA-1 fingerprint to Firebase
⏳ Pending: Build and test with EAS Build or standalone app

## Next Steps to Complete Setup

### Step A: Enable Google Sign-In in Firebase (REQUIRED)
1. Go to Firebase Console → Authentication → Sign-in method
2. Click on Google provider
3. Toggle Enable ON
4. Click Save

### Step B: Testing Options

**IMPORTANT:** Google Sign-In will NOT work in Expo Go. You have two options:

#### Option 1: Quick Testing with EAS Build (Recommended)
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure EAS
eas build:configure

# Build a development APK for testing
eas build --platform android --profile development
```

After the build completes, download the APK to your Android device and install it. Then you can test Google Sign-In.

#### Option 2: Create APK Build for Testing
```bash
# Create a standalone build
eas build --platform android --profile preview
```

### Step C: Get SHA-1 Fingerprint and Add to Firebase

For Google Sign-In to work, you need to add your app's SHA-1 fingerprint to Firebase:

1. **For EAS Build**, run this command to get your SHA-1:
   ```bash
   eas credentials
   ```
   Select your Android app, then view your keystore and copy the SHA-1 fingerprint.

2. **Add SHA-1 to Firebase**:
   - Go to Firebase Console → Project Settings
   - Scroll to "Your apps" section
   - Click on your Android app (or add one with package: `com.prosper.budgetplanner`)
   - Click "Add fingerprint"
   - Paste your SHA-1 fingerprint
   - Click Save

3. **Download google-services.json** (if prompted):
   - In Firebase Console, download the updated `google-services.json`
   - This file will be automatically handled by EAS Build

### Step D: Test Google Sign-In

1. Install the built APK on your Android device
2. Open the app
3. Click "Sign in with Google" button
4. Select your Google account
5. You should be signed in and taken to the onboarding or dashboard

## Troubleshooting

**"Sign in cancelled"**: User cancelled - this is normal

**"DEVELOPER_ERROR"**:
- Web Client ID is incorrect
- SHA-1 fingerprint not added to Firebase
- Google Sign-In not enabled in Firebase Console

**"Google Play Services not available"**:
- Device doesn't have Google Play Services
- Update Google Play Services on device

**"Network error"**: Check internet connection and Firebase config
o i 