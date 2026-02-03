import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';
import EditTransactionScreen from './screens/EditTransactionScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import SettingsScreen from './screens/SettingsScreen';
import SavingsGoalsScreen from './screens/SavingsGoalsScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';
import InsightsScreen from './screens/InsightsScreen';
import TransactionDetailScreen from './screens/TransactionDetailScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import PremiumUpgradeScreen from './screens/PremiumUpgradeScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ProfileScreen from './screens/ProfileScreen';

import useBudgetStore from './store/useBudgetStore';
import useThemeStore from './store/useThemeStore';
import authService from './services/authService';
import revenueCatService from './services/revenueCatService';
import { getColors } from './styles/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const colors = getColors(isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Goals') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Goals"
        component={SavingsGoalsScreen}
        options={{ title: 'Savings Goals' }}
      />
      <Tab.Screen
        name="History"
        component={TransactionHistoryScreen}
        options={{ title: 'Transaction History' }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Budgets' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const initializeApp = useBudgetStore((state) => state.initializeApp);
  const user = useBudgetStore((state) => state.user);
  const authLoading = useBudgetStore((state) => state.authLoading);
  const setUser = useBudgetStore((state) => state.setUser);
  const clearUser = useBudgetStore((state) => state.clearUser);

  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const colors = getColors(isDarkMode);

  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  // Use ref to track last checked user - prevents state update timing issues
  const lastCheckedUserIdRef = useRef(null);

  useEffect(() => {
    // Initialize theme on app start
    initializeTheme();
    // Initialize RevenueCat on app start
    revenueCatService.configure();

    // Auth state listener
    const unsubscribe = authService.onAuthStateChanged(async (newUser) => {
      const currentUser = user;

      if (newUser) {
        // Import database functions
        const { getSetting, setSetting, clearAllData } = await import('./database/db');
        const dbOwnerUid = await getSetting('db_owner_uid');

        // Check if we need to reset app data
        let needsReset = false;

        // Case 1: User switching (currentUser exists and is different)
        if (currentUser && currentUser.uid !== newUser.uid) {
          console.log('Different user in session detected, resetting app...');
          needsReset = true;
        }
        // Case 2: Database belongs to different user (handles new signup on device with old data)
        else if (dbOwnerUid && dbOwnerUid !== newUser.uid) {
          console.log('Database belongs to different user, resetting app...');
          needsReset = true;
        }
        // Case 3: No owner set - this is a new user on a device that may have old data
        // Always reset to ensure clean state for new users
        else if (!dbOwnerUid) {
          console.log('No database owner set, resetting for new user...');
          needsReset = true;
        }

        // Reset app if needed - clear database directly before setting user
        if (needsReset) {
          console.log('Clearing all data for new user...');
          await clearAllData();
          // Reset store state
          useBudgetStore.setState({
            categories: [],
            transactions: [],
            dashboardData: null,
            savingsGoals: [],
            isPremium: false,
            dailyLimit: 0,
            weeklyLimit: 0,
            dailySpending: 0,
            weeklySpending: 0,
            trendsData: [],
            selectedCurrency: '$'
          });
          console.log('Data cleared successfully');
        }

        // Store current user as database owner
        await setSetting('db_owner_uid', newUser.uid);

        // Login user to RevenueCat for purchase tracking
        try {
          await revenueCatService.login(newUser.uid);
          console.log('User logged into RevenueCat:', newUser.uid);
        } catch (rcError) {
          console.warn('Failed to login to RevenueCat:', rcError);
        }

        // Reset lastCheckedUserIdRef to force re-initialization
        if (needsReset) {
          lastCheckedUserIdRef.current = null;
        }

        setUser(newUser);
      } else {
        // Logout from RevenueCat when user logs out
        try {
          await revenueCatService.logout();
          console.log('User logged out from RevenueCat');
        } catch (rcError) {
          console.warn('Failed to logout from RevenueCat:', rcError);
        }
        clearUser();
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const initialize = async () => {
      console.log('Initialize effect - user:', user?.email, 'uid:', user?.uid, 'authLoading:', authLoading, 'lastChecked:', lastCheckedUserIdRef.current);

      if (user && user.uid) {
        // Only re-check if this is a different user than we last checked
        if (user.uid !== lastCheckedUserIdRef.current) {
          console.log('Checking onboarding for new/different user');
          setCheckingOnboarding(true);
          setIsReady(false);

          // Set the lastCheckedUserId using ref (immediate, no state update delay)
          lastCheckedUserIdRef.current = user.uid;

          await initializeApp();
          // Check onboarding using the user object from the effect
          const onboardingCompleted = await useBudgetStore.getState().checkOnboarding();
          console.log('Onboarding completed:', onboardingCompleted, 'for user:', user.uid);
          console.log('Setting showOnboarding to:', !onboardingCompleted);
          setShowOnboarding(!onboardingCompleted);
          setCheckingOnboarding(false);
          setIsReady(true);
          console.log('State updated - showOnboarding should be:', !onboardingCompleted);
        } else {
          console.log('Same user, skipping onboarding check');
          if (!isReady) {
            setIsReady(true);
          }
        }
      } else if (user === null) {
        // User explicitly logged out (not just undefined during state updates)
        console.log('User logged out, resetting state');
        setShowOnboarding(false);
        lastCheckedUserIdRef.current = null;
        setIsReady(true);
      }
      // If user is undefined, don't do anything - this is a temporary state during re-renders
    };

    if (!authLoading) {
      initialize();
    }
  }, [authLoading, user, isReady]);

  if (authLoading || !isReady || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  console.log('Rendering navigation - user:', user?.email, 'emailVerified:', user?.emailVerified, 'showOnboarding:', showOnboarding);

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.primary
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold'
            }
          }}

        >
          {!user ? (
            <>
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{
                  headerShown: true,
                  title: 'Reset Password'
                }}
              />
            </>
          ) : !user.emailVerified ? (
            <>
              <Stack.Screen
                name="EmailVerification"
                component={EmailVerificationScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : showOnboarding ? (
            <>
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Main"
                component={TabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddTransaction"
                component={AddTransactionScreen}
                options={{ title: 'Add Transaction' }}
              />
              <Stack.Screen
                name="EditTransaction"
                component={EditTransactionScreen}
                options={{ title: 'Edit Transaction' }}
              />
              <Stack.Screen
                name="Insights"
                component={InsightsScreen}
                options={{ title: 'Insights' }}
              />
              <Stack.Screen
                name="TransactionDetail"
                component={TransactionDetailScreen}
                options={{ title: 'Transaction Details' }}
              />
              <Stack.Screen
                name="PremiumUpgrade"
                component={PremiumUpgradeScreen}
                options={{ title: 'Upgrade to Premium' }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile & Security' }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Main"
                component={TabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddTransaction"
                component={AddTransactionScreen}
                options={{ title: 'Add Transaction' }}
              />
              <Stack.Screen
                name="EditTransaction"
                component={EditTransactionScreen}
                options={{ title: 'Edit Transaction' }}
              />
              <Stack.Screen
                name="Insights"
                component={InsightsScreen}
                options={{ title: 'Insights' }}
              />
              <Stack.Screen
                name="TransactionDetail"
                component={TransactionDetailScreen}
                options={{ title: 'Transaction Details' }}
              />
              <Stack.Screen
                name="PremiumUpgrade"
                component={PremiumUpgradeScreen}
                options={{ title: 'Upgrade to Premium' }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile & Security' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
