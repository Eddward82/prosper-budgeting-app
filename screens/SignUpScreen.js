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

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await authService.signUp(email, password, name);
    setLoading(false);

    if (result.success) {
      // Show success message with verification instructions
      Alert.alert(
        'Account Created!',
        result.message || 'Please check your email to verify your account.',
        [{ text: 'OK' }]
      );
      // Firebase auth state listener will handle navigation to EmailVerificationScreen
    } else {
      Alert.alert('Sign Up Failed', result.error);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const result = await authService.signInWithGoogle();
    setLoading(false);

    if (result.success) {
      // Navigation will be handled by auth state listener in App.js
    } else {
      Alert.alert('Google Sign In Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.appIcon}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Prosper Budget Planner</Text>
          <Text style={styles.tagline}>Take control of your finances</Text>
        </View>

        <View style={styles.signUpCard}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>Start your financial journey today</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="person-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </View>

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

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.textLight}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.signUpButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Sign up with Google</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg
  },
  appIcon: {
    width: 80,
    height: 80,
    marginBottom: spacing.md
  },
  appName: {
    ...typography.title,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textAlign: 'center'
  },
  tagline: {
    ...typography.body,
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 14,
    textAlign: 'center'
  },
  signUpCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.large
  },
  cardTitle: {
    ...typography.title,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    color: colors.text
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.lg
  },
  inputWrapper: {
    marginBottom: spacing.md
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
    paddingHorizontal: spacing.md
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
  eyeIcon: {
    padding: spacing.sm
  },
  signUpButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: spacing.lg,
    ...shadows.medium
  },
  signUpButtonDisabled: {
    opacity: 0.6
  },
  signUpButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  buttonIcon: {
    marginLeft: spacing.sm
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  dividerText: {
    ...typography.body,
    color: colors.textLight,
    paddingHorizontal: spacing.md
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.small
  },
  googleIcon: {
    marginRight: spacing.sm
  },
  googleButtonText: {
    ...typography.subheading,
    color: colors.text,
    fontWeight: '600',
    fontSize: 16
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loginText: {
    ...typography.body,
    color: colors.textLight
  },
  loginLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold'
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center'
  },
  footerText: {
    ...typography.caption,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 18
  }
});

export default SignUpScreen;
