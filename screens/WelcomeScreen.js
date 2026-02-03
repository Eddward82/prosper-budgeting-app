import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.appIcon}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Prosper Budget Planner</Text>
        <Text style={styles.tagline}>Take control of your finances and achieve your financial goals</Text>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet" size={32} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Track Expenses</Text>
          <Text style={styles.featureDescription}>
            Monitor your daily spending and categorize expenses effortlessly
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="trending-up" size={32} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Set Budgets</Text>
          <Text style={styles.featureDescription}>
            Create budgets for different categories and stay within limits
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="trophy" size={32} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Achieve Goals</Text>
          <Text style={styles.featureDescription}>
            Set financial goals and track your progress towards them
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="pie-chart" size={32} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Visual Insights</Text>
          <Text style={styles.featureDescription}>
            Get detailed insights with charts and reports
          </Text>
        </View>
      </View>

      {/* CTA Buttons */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Free to use • Secure • Private
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    marginBottom: spacing.xl
  },
  appIcon: {
    width: 120,
    height: 120,
    marginBottom: spacing.xl
  },
  appName: {
    ...typography.title,
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  tagline: {
    ...typography.body,
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md
  },
  featuresSection: {
    marginBottom: spacing.xxl
  },
  featureCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadows.small
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  featureTitle: {
    ...typography.subheading,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  featureDescription: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20
  },
  ctaSection: {
    marginBottom: spacing.xl
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
    ...shadows.medium
  },
  primaryButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18
  },
  buttonIcon: {
    marginLeft: spacing.sm
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary
  },
  secondaryButtonText: {
    ...typography.subheading,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg
  },
  footerText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center'
  }
});

export default WelcomeScreen;
