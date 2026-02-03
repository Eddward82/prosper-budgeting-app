import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import useBudgetStore from '../store/useBudgetStore';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const EmailVerificationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [user, setUserState] = useState(null);
  const refreshUser = useBudgetStore((state) => state.refreshUser);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUserState(currentUser);

    // Check if already verified
    if (currentUser?.emailVerified) {
      // User is already verified, proceed to app
      // This will be handled by the auth state listener in App.js
    }
  }, []);

  const handleResendEmail = async () => {
    setLoading(true);
    const result = await authService.sendVerificationEmail();
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', result.message);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    const isVerified = await authService.checkEmailVerified();

    if (isVerified) {
      // Get the fresh user object with emailVerified: true
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // Use refreshUser to create a new object reference
        // This ensures React detects the state change and re-renders App.js
        refreshUser(currentUser);
      }
      setChecking(false);

      Alert.alert(
        'Email Verified!',
        'Your email has been verified successfully. You can now access the app.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // The store has already been updated above with refreshUser,
              // so App.js should re-render with the new emailVerified status
            }
          }
        ]
      );
    } else {
      setChecking(false);
      Alert.alert(
        'Not Verified Yet',
        'Please check your email and click the verification link. Make sure to check your spam folder if you don\'t see it.',
        [
          { text: 'OK' }
        ]
      );
    }
  };

  const handleSignOut = async () => {
    const result = await authService.signOut();
    if (result.success) {
      // Auth state listener will handle navigation
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={100} color={colors.primary} />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification link to:
        </Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.instructionsCard}>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.instructionText}>
              Check your email inbox for the verification link
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.instructionText}>
              Click the link to verify your email address
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.instructionText}>
              Come back and click "I've Verified My Email"
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, checking && styles.buttonDisabled]}
          onPress={handleCheckVerification}
          disabled={checking || loading}
        >
          {checking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>I've Verified My Email</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, loading && styles.buttonDisabled]}
          onPress={handleResendEmail}
          disabled={loading || checking}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Ionicons name="mail" size={20} color={colors.primary} style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Resend Verification Email</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={loading || checking}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} style={styles.buttonIcon} />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textLight} />
        <Text style={styles.footerText}>
          Didn't receive the email? Check your spam folder or resend it.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
    alignItems: 'center'
  },
  iconContainer: {
    marginBottom: spacing.xl
  },
  title: {
    ...typography.title,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  email: {
    ...typography.subheading,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xl
  },
  instructionsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
    ...shadows.medium
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md
  },
  instructionText: {
    ...typography.body,
    marginLeft: spacing.md,
    flex: 1,
    lineHeight: 22
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.md,
    ...shadows.medium
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    borderWidth: 2,
    borderColor: colors.primary
  },
  buttonDisabled: {
    opacity: 0.6
  },
  primaryButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  secondaryButtonText: {
    ...typography.subheading,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16
  },
  buttonIcon: {
    marginRight: spacing.sm
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md
  },
  signOutButtonText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.sm
  },
  footerText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    flex: 1,
    lineHeight: 18
  }
});

export default EmailVerificationScreen;
