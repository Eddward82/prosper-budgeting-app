import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import useBudgetStore from '../store/useBudgetStore';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const ProfileScreen = ({ navigation }) => {
  const user = useBudgetStore((state) => state.user);
  const refreshUser = useBudgetStore((state) => state.refreshUser);
  const resetApp = useBudgetStore((state) => state.resetApp);

  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const [loadingName, setLoadingName] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const isGoogleUser = user?.providerData?.some(
    provider => provider.providerId === 'google.com'
  );

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleUpdateName = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    if (displayName === user?.displayName) {
      Alert.alert('No Changes', 'Display name is already set to this value');
      return;
    }

    setLoadingName(true);
    const result = await authService.updateDisplayName(displayName.trim());
    setLoadingName(false);

    if (result.success) {
      // Refresh user to update display name in UI
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        refreshUser(currentUser);
      }
      Alert.alert('Success', result.message);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setLoadingPassword(true);
    const result = await authService.changePassword(currentPassword, newPassword);
    setLoadingPassword(false);

    if (result.success) {
      Alert.alert('Success', result.message);
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount
        }
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    // For email users, require password confirmation
    if (!isGoogleUser && !deletePassword) {
      Alert.alert('Password Required', 'Please enter your password to confirm account deletion');
      return;
    }

    setLoadingDelete(true);

    // Clear all local data first
    await resetApp();

    // Then delete Firebase account
    const result = await authService.deleteAccount(deletePassword);
    setLoadingDelete(false);

    if (result.success) {
      // Account deleted, user will be automatically signed out
      // Navigation will be handled by auth state listener
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-circle" size={60} color={colors.primary} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || 'No name set'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {isGoogleUser && (
              <View style={styles.googleBadge}>
                <Ionicons name="logo-google" size={14} color="#DB4437" />
                <Text style={styles.googleBadgeText}>Google Account</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Update Display Name */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Display Name</Text>
        <Text style={styles.cardSubtitle}>Update your name shown in the app</Text>

        <View style={styles.inputWrapper}>
          <View style={styles.inputWithIcon}>
            <Ionicons name="person-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={colors.textLight}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              editable={!loadingName}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, loadingName && styles.buttonDisabled]}
          onPress={handleUpdateName}
          disabled={loadingName}
        >
          {loadingName ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Update Name</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Change Password - Only for email users */}
      {!isGoogleUser && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <Text style={styles.cardSubtitle}>Update your account password</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor={colors.textLight}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                editable={!loadingPassword}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textLight}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                editable={!loadingPassword}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                placeholderTextColor={colors.textLight}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loadingPassword}
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
            style={[styles.button, styles.primaryButton, loadingPassword && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={loadingPassword}
          >
            {loadingPassword ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="key" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Change Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Account */}
      <View style={[styles.card, styles.dangerCard]}>
        <Text style={[styles.cardTitle, styles.dangerText]}>Danger Zone</Text>
        <Text style={styles.cardSubtitle}>
          Permanently delete your account and all associated data
        </Text>

        {!isGoogleUser && (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textLight}
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry={!showDeletePassword}
                autoCapitalize="none"
                editable={!loadingDelete}
              />
              <TouchableOpacity
                onPress={() => setShowDeletePassword(!showDeletePassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showDeletePassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.dangerButton, loadingDelete && styles.buttonDisabled]}
          onPress={handleDeleteAccount}
          disabled={loadingDelete}
        >
          {loadingDelete ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="trash" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.warningBox}>
          <Ionicons name="warning" size={20} color={colors.warning} />
          <Text style={styles.warningText}>
            This action is permanent and cannot be undone. All your transactions, budgets, and goals will be lost.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: colors.danger
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  userInfo: {
    marginLeft: spacing.md,
    flex: 1
  },
  userName: {
    ...typography.heading,
    marginBottom: spacing.xs
  },
  userEmail: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.xs
  },
  googleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start'
  },
  googleBadgeText: {
    ...typography.caption,
    color: '#DB4437',
    marginLeft: 4,
    fontWeight: '600'
  },
  cardTitle: {
    ...typography.heading,
    marginBottom: spacing.xs
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
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
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
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.small
  },
  primaryButton: {
    backgroundColor: colors.primary
  },
  dangerButton: {
    backgroundColor: colors.danger,
    marginBottom: spacing.md
  },
  buttonDisabled: {
    opacity: 0.6
  },
  primaryButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  dangerButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  buttonIcon: {
    marginRight: spacing.sm
  },
  dangerText: {
    color: colors.danger
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning
  },
  warningText: {
    ...typography.caption,
    color: '#856404',
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18
  }
});

export default ProfileScreen;
