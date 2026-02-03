import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    // Validation
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await authService.resetPassword(email);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Email Sent!',
        'We have sent a password reset link to your email address. Please check your inbox and follow the instructions.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={80} color={colors.primary} />
          </View>

          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email address and we'll send you a link to reset your password.
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="mail-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="mail" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} style={styles.buttonIcon} />
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <Text style={styles.infoText}>
              1. Check your email for a password reset link{'\n'}
              2. Click the link to reset your password{'\n'}
              3. Create a new password{'\n'}
              4. Sign in with your new password
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Didn't receive the email? Check your spam folder or make sure you entered the correct email address.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  iconContainer: {
    marginBottom: spacing.lg,
    marginTop: spacing.xl
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
    marginBottom: spacing.xl,
    lineHeight: 22,
    paddingHorizontal: spacing.md
  },
  inputWrapper: {
    width: '100%',
    marginBottom: spacing.lg
  },
  label: {
    ...typography.body,
    marginBottom: spacing.sm,
    fontWeight: '600',
    color: colors.text
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...shadows.small
  },
  inputIcon: {
    marginRight: spacing.sm
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text
  },
  resetButton: {
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
  resetButtonDisabled: {
    opacity: 0.6
  },
  resetButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  buttonIcon: {
    marginRight: spacing.sm
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md
  },
  backToLoginText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600'
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: spacing.md
  },
  infoTitle: {
    ...typography.subheading,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.text
  },
  infoText: {
    ...typography.body,
    color: colors.textLight,
    lineHeight: 22
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md
  },
  footerText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18
  }
});

export default ForgotPasswordScreen;
