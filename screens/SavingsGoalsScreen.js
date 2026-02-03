import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import useBudgetStore from '../store/useBudgetStore';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import { formatCurrency, calculatePercentage } from '../utils/helpers';
import { formatDate } from '../utils/date';

const SavingsGoalsScreen = () => {
  const {
    savingsGoals,
    selectedCurrency,
    addSavingsGoal,
    updateGoalProgress,
    deleteGoal,
    loadSavingsGoals
  } = useBudgetStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [contributeModalVisible, setContributeModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadSavingsGoals();
      } catch (error) {
        Alert.alert('Error', 'Failed to load savings goals. Please try again.');
        console.error('Load goals error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSavingsGoals();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh goals');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddGoal = async () => {
    if (!goalName.trim()) {
      Alert.alert('Validation Error', 'Please enter a goal name');
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid target amount greater than 0');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode && selectedGoal) {
        // Update existing goal
        const { updateGoal } = useBudgetStore.getState();
        await updateGoal(selectedGoal.id, {
          name: goalName.trim(),
          target_amount: parseFloat(targetAmount),
          deadline: deadline || null
        });
        Alert.alert('Success', 'Goal updated successfully');
      } else {
        // Create new goal
        await addSavingsGoal(goalName.trim(), parseFloat(targetAmount), deadline || null);
        Alert.alert('Success', 'Savings goal created successfully');
      }
      setModalVisible(false);
      setGoalName('');
      setTargetAmount('');
      setDeadline('');
      setIsEditMode(false);
      setSelectedGoal(null);
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} savings goal. Please try again.`);
      console.error('Save goal error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
    setGoalName(goal.name);
    setTargetAmount(goal.target_amount.toString());
    setDeadline(goal.deadline || '');
    setIsEditMode(true);
    setModalVisible(true);
  };

  const handleContribute = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid contribution amount greater than 0');
      return;
    }

    setIsSaving(true);
    try {
      await updateGoalProgress(selectedGoal.id, parseFloat(contributionAmount));
      setContributeModalVisible(false);
      setContributionAmount('');
      setSelectedGoal(null);
      Alert.alert('Success', 'Contribution added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add contribution. Please try again.');
      console.error('Contribute error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = (goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goal.id);
              Alert.alert('Success', 'Goal deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
              console.error('Delete goal error:', error);
            }
          }
        }
      ]
    );
  };

  const renderGoalCard = (goal) => {
    const progress = calculatePercentage(goal.current_amount, goal.target_amount);
    const isComplete = goal.current_amount >= goal.target_amount;

    return (
      <View key={goal.id} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalName}>{goal.name}</Text>
          <View style={styles.goalActions}>
            <TouchableOpacity onPress={() => handleEditGoal(goal)} style={styles.actionButton}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteGoal(goal)} style={styles.actionButton}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.goalAmounts}>
          <Text style={styles.currentAmount}>
            {formatCurrency(goal.current_amount, selectedCurrency)}
          </Text>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.targetAmount}>
            {formatCurrency(goal.target_amount, selectedCurrency)}
          </Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: isComplete ? colors.success : colors.primary
              }
            ]}
          />
        </View>

        <View style={styles.goalFooter}>
          <Text style={styles.progressText}>{progress}% Complete</Text>
          {goal.deadline && (
            <Text style={styles.deadline}>Due: {formatDate(goal.deadline)}</Text>
          )}
        </View>

        {!isComplete && (
          <TouchableOpacity
            style={styles.contributeButton}
            onPress={() => {
              setSelectedGoal(goal);
              setContributeModalVisible(true);
            }}
          >
            <Text style={styles.contributeButtonText}>Add Contribution</Text>
          </TouchableOpacity>
        )}

        {isComplete && (
          <View style={styles.completeBadge}>
            <Text style={styles.completeText}> Goal Achieved!</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading savings goals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {savingsGoals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Savings Goals Yet</Text>
            <Text style={styles.emptyText}>
              Create a savings goal to start tracking your progress
            </Text>
          </View>
        ) : (
          savingsGoals.map(renderGoalCard)
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setIsEditMode(false);
          setSelectedGoal(null);
          setGoalName('');
          setTargetAmount('');
          setDeadline('');
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Create New Goal</Text>
      </TouchableOpacity>

      {/* Create Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditMode ? 'Edit Savings Goal' : 'Create Savings Goal'}
            </Text>

            <Text style={styles.label}>Goal Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Vacation, Emergency Fund"
              value={goalName}
              onChangeText={setGoalName}
            />

            <Text style={styles.label}>Target Amount ({selectedCurrency})</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />

            <Text style={styles.label}>Deadline (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={deadline}
              onChangeText={setDeadline}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setGoalName('');
                  setTargetAmount('');
                  setDeadline('');
                  setIsEditMode(false);
                  setSelectedGoal(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddGoal}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditMode ? 'Update' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contributeModalVisible}
        onRequestClose={() => setContributeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add Contribution to {selectedGoal?.name}
            </Text>

            <Text style={styles.label}>Amount ({selectedCurrency})</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={contributionAmount}
              onChangeText={setContributionAmount}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setContributeModalVisible(false);
                  setContributionAmount('');
                  setSelectedGoal(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleContribute}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md
  },
  content: {
    flex: 1,
    padding: spacing.lg
  },
  emptyState: {
    alignItems: 'center',
    marginTop: spacing.xxl * 2
  },
  emptyTitle: {
    ...typography.heading,
    marginBottom: spacing.md
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center'
  },
  goalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  goalName: {
    ...typography.heading,
    flex: 1
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  editButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600'
  },
  deleteButton: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600'
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md
  },
  currentAmount: {
    ...typography.title,
    color: colors.primary,
    fontWeight: 'bold'
  },
  separator: {
    ...typography.heading,
    color: colors.textLight,
    marginHorizontal: spacing.sm
  },
  targetAmount: {
    ...typography.heading,
    color: colors.textLight
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.md
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  progressText: {
    ...typography.caption,
    fontWeight: 'bold'
  },
  deadline: {
    ...typography.caption
  },
  contributeButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center'
  },
  contributeButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  completeBadge: {
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center'
  },
  completeText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.medium
  },
  addButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  bottomSpace: {
    height: spacing.xl
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '85%',
    ...shadows.large
  },
  modalTitle: {
    ...typography.heading,
    marginBottom: spacing.lg,
    textAlign: 'center'
  },
  label: {
    ...typography.subheading,
    marginBottom: spacing.sm,
    marginTop: spacing.md
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.md
  },
  button: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: colors.border
  },
  cancelButtonText: {
    ...typography.subheading,
    color: colors.text
  },
  saveButton: {
    backgroundColor: colors.primary,
    ...shadows.small
  },
  saveButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  }
});

export default SavingsGoalsScreen;
