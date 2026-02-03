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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await authService.signIn(email, password);
    setLoading(false);

    if (result.success) {
      // Navigation will be handled by auth state listener in App.js
    } else {
      Alert.alert('Login Failed', result.error);
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

        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>Welcome back! Please enter your details</Text>

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
                placeholder="Enter your password"
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

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
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
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate('SignUp')}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>Create New Account</Text>
          </TouchableOpacity>
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
    paddingVertical: spacing.xxl,
    marginBottom: spacing.lg
  },
  appIcon: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg
  },
  appName: {
    ...typography.title,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textAlign: 'center'
  },
  tagline: {
    ...typography.body,
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 16,
    textAlign: 'center'
  },
  loginCard: {
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
    marginBottom: spacing.xl
  },
  inputWrapper: {
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm
  },
  forgotPasswordText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600'
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.medium
  },
  loginButtonDisabled: {
    opacity: 0.6
  },
  loginButtonText: {
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
    marginVertical: spacing.xl
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
  signUpButton: {
    backgroundColor: 'transparent',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary
  },
  signUpButtonText: {
    ...typography.subheading,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16
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

export default LoginScreen;
