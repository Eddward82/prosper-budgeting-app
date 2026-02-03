import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useBudgetStore from '../store/useBudgetStore';
import CurrencySelector from '../components/CurrencySelector';
import { currencies } from '../utils/currencies';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

// Feature Card Component - moved outside main component
const FeatureCard = ({ icon, title, description, index }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        {
          opacity: cardAnim,
          transform: [
            {
              translateX: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.featureIconWrapper}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.featureTextWrapper}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </Animated.View>
  );
};

// Completion Screen Component - moved outside main component
const CompletionScreen = ({ selectedCurrency, fadeAnim, scaleAnim, onComplete }) => {
  const checkAnim1 = useRef(new Animated.Value(0)).current;
  const checkAnim2 = useRef(new Animated.Value(0)).current;
  const checkAnim3 = useRef(new Animated.Value(0)).current;
  const checkAnim4 = useRef(new Animated.Value(0)).current;

  const checkmarks = [checkAnim1, checkAnim2, checkAnim3, checkAnim4];

  useEffect(() => {
    checkmarks.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 150,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const completionItems = [
    { icon: 'checkmark-circle', text: `Currency set to ${selectedCurrency}` },
    { icon: 'checkmark-circle', text: 'Spending tracker activated' },
    { icon: 'checkmark-circle', text: 'Create categories as you go' },
    { icon: 'checkmark-circle', text: 'You\'re all set!' },
  ];

  return (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.completionContent}>
        <View style={styles.successIconContainer}>
          <LinearGradient
            colors={[colors.success, colors.secondary]}
            style={styles.successIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </LinearGradient>
        </View>

        <Text style={styles.completionTitle}>You're Ready!</Text>
        <Text style={styles.completionSubtitle}>
          Start your journey to financial freedom
        </Text>

        <View style={styles.completionChecklist}>
          {completionItems.map((item, index) => (
            <Animated.View
              key={index}
              style={[
                styles.completionItem,
                {
                  opacity: checkmarks[index],
                  transform: [
                    {
                      translateX: checkmarks[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name={item.icon} size={24} color={colors.success} />
              <Text style={styles.completionItemText}>{item.text}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={onComplete}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.startButtonText}>Start Budgeting</Text>
            <Ionicons name="rocket" size={22} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const OnboardingScreen = ({ navigation }) => {
  const {
    setCurrency,
    initializeApp,
    user,
    setDailyLimit,
    setWeeklyLimit
  } = useBudgetStore();

  const [step, setStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState('$');
  const [dailyLimit, setDailyLimitValue] = useState('');
  const [weeklyLimit, setWeeklyLimitValue] = useState('');
  const [savingsGoals, setSavingsGoals] = useState([
    { id: 1, name: '', targetAmount: '', currentAmount: 0 }
  ]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currencySelectorVisible, setCurrencySelectorVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const totalSteps = 5;

  // Initialize database when component mounts
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeApp();
        setIsInitialized(true);
        animateIn();
      } catch (error) {
        console.error('Error initializing onboarding:', error);
        Alert.alert('Error', 'Failed to initialize. Please try again.');
        setIsInitialized(false);
      }
    };
    initialize();
  }, []);

  // Animate when step changes
  useEffect(() => {
    animateIn();
    Animated.timing(progressAnim, {
      toValue: step / totalSteps,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  // Start icon bounce animation
  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounce, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(iconBounce, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    bounceAnimation.start();
    return () => bounceAnimation.stop();
  }, []);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
  };

  const currentCurrency = currencies.find(c => c.symbol === selectedCurrency);

  const handleNext = () => {
    animateOut(() => {
      if (step < totalSteps) {
        setStep(step + 1);
      }
    });
  };

  const handleBack = () => {
    if (step > 1) {
      animateOut(() => {
        setStep(step - 1);
      });
    }
  };

  const handleSkip = async () => {
    try {
      await setCurrency(selectedCurrency);
      await completeOnboarding();
    } catch (error) {
      console.error('Skip onboarding error:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    }
  };

  const handleFinish = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Please wait for initialization to complete.');
      return;
    }

    try {
      await setCurrency(selectedCurrency);

      if (dailyLimit && parseFloat(dailyLimit) > 0) {
        await setDailyLimit(parseFloat(dailyLimit));
      }
      if (weeklyLimit && parseFloat(weeklyLimit) > 0) {
        await setWeeklyLimit(parseFloat(weeklyLimit));
      }

      const { addSavingsGoal } = useBudgetStore.getState();
      for (const goal of savingsGoals) {
        if (goal.name && goal.name.trim() && goal.targetAmount && parseFloat(goal.targetAmount) > 0) {
          await addSavingsGoal(goal.name.trim(), parseFloat(goal.targetAmount));
        }
      }

      setStep(5);
    } catch (error) {
      console.error('Finish onboarding error:', error);
      Alert.alert('Error', `Failed to save settings: ${error.message || 'Please try again.'}`);
    }
  };

  const completeOnboarding = async () => {
    const { setSetting } = useBudgetStore.getState();
    await setSetting('onboarding_completed', '1');
    if (user?.uid) {
      await setSetting('onboarding_user_id', user.uid);
    }
    navigation.replace('Main');
  };

  const addGoalField = () => {
    const newId = savingsGoals.length > 0 ? Math.max(...savingsGoals.map(g => g.id)) + 1 : 1;
    setSavingsGoals([...savingsGoals, { id: newId, name: '', targetAmount: '', currentAmount: 0 }]);
  };

  const removeGoalField = (id) => {
    if (savingsGoals.length > 1) {
      setSavingsGoals(savingsGoals.filter(goal => goal.id !== id));
    }
  };

  const updateGoal = (id, field, value) => {
    setSavingsGoals(savingsGoals.map(goal =>
      goal.id === id ? { ...goal, [field]: value } : goal
    ));
  };

  // Progress Indicator Component
  const ProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.dotsContainer}>
        {[1, 2, 3, 4, 5].map((dot) => (
          <View
            key={dot}
            style={[
              styles.dot,
              step >= dot && styles.dotActive,
              step === dot && styles.dotCurrent,
            ]}
          />
        ))}
      </View>
    </View>
  );

  // Animated Icon Component
  const AnimatedIcon = ({ name, size = 80 }) => (
    <Animated.View
      style={[
        styles.iconContainer,
        {
          transform: [{ translateY: iconBounce }],
        },
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        style={styles.iconGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={name} size={size} color="#FFFFFF" />
      </LinearGradient>
    </Animated.View>
  );

  // Loading Screen
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.loadingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="wallet" size={60} color="#FFFFFF" />
          <Text style={styles.loadingText}>Setting up your budget planner...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {step < 6 && <ProgressIndicator />}

      {/* Step 1: Welcome */}
      {step === 1 && (
        <Animated.View
          style={[
            styles.stepContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.welcomeScrollView}
            contentContainerStyle={styles.welcomeScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <AnimatedIcon name="wallet" size={60} />

            <Text style={styles.welcomeTitle}>Welcome to{'\n'}Prosper Budget</Text>
            <Text style={styles.welcomeSubtitle}>
              Take control of your finances with smart budgeting
            </Text>

            <View style={styles.featuresContainer}>
              <FeatureCard
                icon="trending-up"
                title="Track Expenses"
                description="Monitor where your money goes"
                index={0}
              />
              <FeatureCard
                icon="flag"
                title="Set Goals"
                description="Save for what matters most"
                index={1}
              />
              <FeatureCard
                icon="bar-chart"
                title="Get Insights"
                description="Understand your spending patterns"
                index={2}
              />
              <FeatureCard
                icon="notifications"
                title="Stay Alert"
                description="Get notified about your limits"
                index={3}
              />
            </View>

            <View style={styles.welcomeButtonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip Setup</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {/* Step 2: Currency Selection */}
      {step === 2 && (
        <Animated.View
          style={[
            styles.stepContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.stepContent}>
            <AnimatedIcon name="cash" size={50} />

            <Text style={styles.stepTitle}>Choose Your Currency</Text>
            <Text style={styles.stepSubtitle}>
              Select the currency you'll use for tracking
            </Text>

            <TouchableOpacity
              style={styles.currencyCard}
              onPress={() => setCurrencySelectorVisible(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.currencyCardGradient}
              >
                <View style={styles.currencyLeft}>
                  <View style={styles.currencySymbolContainer}>
                    <Text style={styles.currencySymbol}>{selectedCurrency}</Text>
                  </View>
                  <View style={styles.currencyDetails}>
                    <Text style={styles.currencyName}>
                      {currentCurrency?.name || 'Select Currency'}
                    </Text>
                    <Text style={styles.currencyCode}>
                      {currentCurrency?.code || 'Tap to select'}
                    </Text>
                  </View>
                </View>
                <View style={styles.currencyArrow}>
                  <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={colors.accent} />
              <Text style={styles.infoText}>
                You can change your currency anytime in Settings
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  style={styles.gradientButtonSmall}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Step 3: Savings Goals */}
      {step === 3 && (
        <Animated.View
          style={[
            styles.stepContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <AnimatedIcon name="flag" size={50} />

            <Text style={styles.stepTitle}>Set Your Goals</Text>
            <Text style={styles.stepSubtitle}>
              What are you saving for?
            </Text>

            {savingsGoals.map((goal, index) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalBadge}>
                    <Text style={styles.goalBadgeText}>Goal {index + 1}</Text>
                  </View>
                  {savingsGoals.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeGoalField(goal.id)}
                      style={styles.removeGoalButton}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Goal Name</Text>
                  <TextInput
                    style={styles.modernInput}
                    placeholder="e.g., Emergency Fund, Vacation"
                    placeholderTextColor={colors.textLight}
                    value={goal.name}
                    onChangeText={(value) => updateGoal(goal.id, 'name', value)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Target Amount</Text>
                  <View style={styles.amountInput}>
                    <Text style={styles.currencyPrefix}>{selectedCurrency}</Text>
                    <TextInput
                      style={styles.amountInputField}
                      placeholder="0.00"
                      placeholderTextColor={colors.textLight}
                      keyboardType="decimal-pad"
                      value={goal.targetAmount}
                      onChangeText={(value) => updateGoal(goal.id, 'targetAmount', value)}
                    />
                  </View>
                </View>
              </View>
            ))}

            {savingsGoals.length < 5 && (
              <TouchableOpacity style={styles.addGoalButton} onPress={addGoalField}>
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.addGoalText}>Add Another Goal</Text>
              </TouchableOpacity>
            )}

            <View style={styles.spacer} />
          </ScrollView>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  style={styles.gradientButtonSmall}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.skipStepButton} onPress={handleNext}>
              <Text style={styles.skipStepText}>Skip this step</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Step 4: Spending Limits */}
      {step === 4 && (
        <Animated.View
          style={[
            styles.stepContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <AnimatedIcon name="shield-checkmark" size={50} />

            <Text style={styles.stepTitle}>Set Spending Limits</Text>
            <Text style={styles.stepSubtitle}>
              Stay on track with daily and weekly limits
            </Text>

            <View style={styles.limitCard}>
              <View style={styles.limitHeader}>
                <Ionicons name="today" size={24} color={colors.primary} />
                <Text style={styles.limitTitle}>Daily Limit</Text>
              </View>
              <View style={styles.amountInput}>
                <Text style={styles.currencyPrefix}>{selectedCurrency}</Text>
                <TextInput
                  style={styles.amountInputField}
                  placeholder="0.00"
                  placeholderTextColor={colors.textLight}
                  keyboardType="decimal-pad"
                  value={dailyLimit}
                  onChangeText={setDailyLimitValue}
                />
              </View>
              <Text style={styles.limitHint}>Maximum you want to spend per day</Text>
            </View>

            <View style={styles.limitCard}>
              <View style={styles.limitHeader}>
                <Ionicons name="calendar" size={24} color={colors.accent} />
                <Text style={styles.limitTitle}>Weekly Limit</Text>
              </View>
              <View style={styles.amountInput}>
                <Text style={styles.currencyPrefix}>{selectedCurrency}</Text>
                <TextInput
                  style={styles.amountInputField}
                  placeholder="0.00"
                  placeholderTextColor={colors.textLight}
                  keyboardType="decimal-pad"
                  value={weeklyLimit}
                  onChangeText={setWeeklyLimitValue}
                />
              </View>
              <Text style={styles.limitHint}>Maximum you want to spend per week</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="notifications" size={20} color={colors.gold} />
              <Text style={styles.infoText}>
                You'll get alerts when approaching your limits
              </Text>
            </View>

            <View style={styles.spacer} />
          </ScrollView>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextButton} onPress={handleFinish}>
                <LinearGradient
                  colors={[colors.success, colors.secondary]}
                  style={styles.gradientButtonSmall}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextButtonText}>Complete</Text>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.skipStepButton} onPress={handleSkip}>
              <Text style={styles.skipStepText}>Skip this step</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Step 5: Completion */}
      {step === 5 && (
        <CompletionScreen
          selectedCurrency={selectedCurrency}
          fadeAnim={fadeAnim}
          scaleAnim={scaleAnim}
          onComplete={completeOnboarding}
        />
      )}

      <CurrencySelector
        visible={currencySelectorVisible}
        onClose={() => setCurrencySelectorVisible(false)}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={handleCurrencySelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: spacing.xl,
    fontWeight: '500',
  },

  // Progress Indicator
  progressContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.md,
  },
  progressBackground: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotCurrent: {
    width: 24,
    backgroundColor: colors.primary,
  },

  // Step Container
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Icon Container
  iconContainer: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },

  // Welcome Screen
  welcomeScrollView: {
    flex: 1,
  },
  welcomeScrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  welcomeButtonContainer: {
    marginTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 40,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },

  // Feature Cards
  featuresContainer: {
    marginTop: spacing.lg,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  featureIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextWrapper: {
    flex: 1,
    marginLeft: spacing.md,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.textLight,
  },

  // Step Title & Subtitle
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  // Currency Card
  currencyCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.medium,
    marginBottom: spacing.lg,
  },
  currencyCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    borderRadius: borderRadius.xl,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbolContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currencyDetails: {
    marginLeft: spacing.md,
  },
  currencyName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  currencyCode: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  currencyArrow: {
    padding: spacing.sm,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  infoText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },

  // Goals
  goalCard: {
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  goalBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  removeGoalButton: {
    padding: spacing.xs,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  addGoalText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },

  // Input Styles
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modernInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginRight: spacing.sm,
  },
  amountInputField: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    paddingVertical: spacing.lg,
  },

  // Limits
  limitCard: {
    backgroundColor: colors.cardBackground,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  limitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  limitHint: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: spacing.sm,
  },

  // Completion
  completionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: spacing.xl,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  completionSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: spacing.xxl,
  },
  completionChecklist: {
    alignSelf: 'stretch',
    backgroundColor: colors.cardBackground,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.medium,
  },
  completionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  completionItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.md,
  },

  // Buttons
  buttonContainer: {
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.medium,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  nextButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.medium,
  },
  gradientButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  skipButtonText: {
    color: colors.textLight,
    fontSize: 15,
  },
  skipStepButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  skipStepText: {
    color: colors.textLight,
    fontSize: 14,
  },
  startButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 4,
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  spacer: {
    height: spacing.xxl,
  },
});

export default OnboardingScreen;
