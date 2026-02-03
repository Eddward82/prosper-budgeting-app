# Email Verification Setup Guide

This guide explains how email verification works in your Prosper Budget Planner app.

## Overview

Email verification has been implemented to ensure users have valid email addresses. This improves security and allows for password reset functionality.

## Features Implemented

### 1. **Automatic Email Verification on Sign Up**
- When a user signs up with email/password, a verification email is automatically sent
- Users see a success message prompting them to check their email

### 2. **Email Verification Screen**
- New users are directed to a dedicated verification screen after sign up
- Screen provides clear instructions on what to do
- Users cannot access the app until they verify their email

### 3. **Verification Actions**
- **"I've Verified My Email"** button: Checks if email is verified and allows access
- **"Resend Verification Email"** button: Sends a new verification link if needed
- **"Sign Out"** button: Allows user to sign out and try a different account

### 4. **Google Sign-In Users**
- Users who sign in with Google are automatically verified
- Google accounts have verified email addresses by default
- These users skip the email verification screen

## How It Works

### User Flow

```
1. User signs up with email/password
   ↓
2. Firebase sends verification email
   ↓
3. User sees "Account Created!" alert
   ↓
4. User is directed to Email Verification Screen
   ↓
5. User checks email and clicks verification link
   ↓
6. User returns to app and clicks "I've Verified My Email"
   ↓
7. App checks verification status with Firebase
   ↓
8. If verified: User proceeds to onboarding
   If not verified: User sees "Not Verified Yet" message
```

### Navigation Flow

```
App.js checks user authentication state:

- No user → Show Welcome/Login/SignUp screens
- User exists but email not verified → Show EmailVerificationScreen
- User exists and email verified, no onboarding → Show OnboardingScreen
- User exists, email verified, onboarding complete → Show Main App
```

## Files Modified/Created

### New Files

1. **screens/EmailVerificationScreen.js**
   - Main verification screen UI
   - Handles verification checks and resending emails

### Modified Files

1. **services/authService.js**
   - Added `sendEmailVerification` import
   - Updated `signUp()` to send verification email
   - Added `sendVerificationEmail()` method
   - Added `checkEmailVerified()` method

2. **screens/SignUpScreen.js**
   - Shows success alert with verification message after sign up

3. **App.js**
   - Added EmailVerificationScreen import
   - Added email verification check to navigation logic
   - Users with unverified emails are directed to verification screen

## Firebase Configuration

Email verification is automatically enabled in Firebase Authentication. No additional configuration is needed.

### Customizing Verification Email (Optional)

You can customize the verification email template in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Templates**
4. Click on **Email address verification**
5. Customize the email template:
   - Edit subject line
   - Customize email body
   - Add your app name and branding
6. Click **Save**

### Email Sender Configuration (Optional)

By default, emails are sent from `noreply@<your-project-id>.firebaseapp.com`. To use a custom domain:

1. In Firebase Console, go to **Authentication** → **Templates**
2. Click **Customize action URL**
3. Enter your custom domain
4. Set up SPF and DKIM records in your domain's DNS settings

## Testing Email Verification

### Test Flow

1. **Sign Up**:
   ```
   - Open app
   - Click "Create New Account"
   - Fill in name, email, password
   - Click "Create Account"
   - See success alert
   ```

2. **Check Email**:
   ```
   - Open email inbox
   - Look for "Verify your email" message from Firebase
   - Check spam folder if not in inbox
   - Click verification link
   ```

3. **Verify in App**:
   ```
   - Return to app
   - You should be on Email Verification Screen
   - Click "I've Verified My Email"
   - If verified: proceed to onboarding
   - If not: see "Not Verified Yet" message
   ```

### Resending Verification Email

If user doesn't receive the email:
1. Click "Resend Verification Email" button
2. Check email again (including spam folder)
3. New verification link will be sent

### Email Verification States

| State | Screen Shown | Actions Available |
|-------|--------------|-------------------|
| Not signed in | Welcome/Login/SignUp | Sign up or sign in |
| Signed in, not verified | EmailVerificationScreen | Verify, resend, or sign out |
| Signed in, verified, no onboarding | OnboardingScreen | Complete setup |
| Signed in, verified, onboarding complete | Main App | Full app access |

## Security Considerations

1. **Email Verification Required**: Users cannot access the app without verifying their email (unless they sign in with Google)

2. **Verified Status Check**: App checks `user.emailVerified` property from Firebase

3. **Reload Before Check**: When checking verification status, the app calls `user.reload()` to get fresh data from Firebase

4. **Google Sign-In**: Google users are considered verified automatically since Google verifies email addresses

## Troubleshooting

### Email Not Received

**Problem**: User doesn't receive verification email

**Solutions**:
1. Check spam/junk folder
2. Verify email address is correct
3. Click "Resend Verification Email"
4. Wait a few minutes (emails may be delayed)
5. Check if email provider is blocking Firebase emails

### Already Verified But Shows Unverified

**Problem**: User verified email but app still shows verification screen

**Solutions**:
1. Click "I've Verified My Email" button to refresh
2. Sign out and sign in again
3. Restart the app
4. Check Firebase Console to confirm verification status

### Can't Resend Verification Email

**Problem**: "Resend Verification Email" button doesn't work

**Solutions**:
1. Check error message in alert
2. Ensure user is still signed in
3. Wait a minute and try again (rate limiting)
4. Sign out and sign in again

### Verification Link Expired

**Problem**: Verification link says "expired" or doesn't work

**Solution**:
- Verification links expire after 3 days (Firebase default)
- Request a new verification email using "Resend" button

## Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Email is already verified" | Email already verified | Proceed to app |
| "No user is currently signed in" | User session expired | Sign in again |
| "Failed to send verification email" | Network or server error | Try again later |
| "Not Verified Yet" | Email not yet verified | Check email and click link |

## Future Enhancements (Optional)

Consider implementing these features:

1. **Email Verification Reminder**: Show notification after X hours if still unverified
2. **Custom Email Template**: Add app logo and branding to verification emails
3. **Verification Expiry Warning**: Notify user if verification link is about to expire
4. **Auto-Refresh**: Automatically check verification status every 30 seconds
5. **Deep Linking**: Allow verification link to open the app directly

## Summary

✅ Email verification automatically sent on sign up
✅ Dedicated Email Verification Screen with instructions
✅ Resend verification email functionality
✅ Check verification status
✅ Google Sign-In users automatically verified
✅ Navigation flow handles all verification states
✅ User-friendly error messages and alerts

Email verification is now fully functional in your app!
