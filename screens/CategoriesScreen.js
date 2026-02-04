import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  TouchableOpacity,
  Switch
} from 'react-native';
import useBudgetStore from '../store/useBudgetStore';
import CategoryItem from '../components/CategoryItem';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const CategoriesScreen = () => {
  const { categories, selectedCurrency, updateCategoryBudget, toggleCategoryExcludeFromLimits, addCategory, deleteCategory, isPremium } = useBudgetStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newBudget, setNewBudget] = useState('');
  const [excludeFromLimits, setExcludeFromLimits] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [newCategoryExcludeFromLimits, setNewCategoryExcludeFromLimits] = useState(false);

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setNewBudget(category.monthly_budget.toString());
    setExcludeFromLimits(category.exclude_from_limits === 1);
    setModalVisible(true);
  };

  const handleUpdateBudget = async () => {
    if (!newBudget || parseFloat(newBudget) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid budget amount (must be 0 or greater)');
      return;
    }

    try {
      await updateCategoryBudget(selectedCategory.id, parseFloat(newBudget));
      await toggleCategoryExcludeFromLimits(selectedCategory.id, excludeFromLimits);
      Alert.alert('Success', `Budget for ${selectedCategory.name} updated successfully`);
      setModalVisible(false);
      setSelectedCategory(null);
      setNewBudget('');
      setExcludeFromLimits(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update budget. Please try again.');
      console.error('Update budget error:', error);
    }
  };

  const handleDeleteCategory = () => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${selectedCategory?.name}"? Any transactions in this category will be uncategorized.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(selectedCategory.id);
              Alert.alert('Success', `Category "${selectedCategory.name}" deleted successfully`);
              setModalVisible(false);
              setSelectedCategory(null);
              setNewBudget('');
              setExcludeFromLimits(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete category. Please try again.');
              console.error('Delete category error:', error);
            }
          }
        }
      ]
    );
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Validation Error', 'Please enter a category name');
      return;
    }

    if (newCategoryName.trim().length > 50) {
      Alert.alert('Validation Error', 'Category name must be 50 characters or less');
      return;
    }

    if (!newCategoryBudget || parseFloat(newCategoryBudget) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid budget amount (must be 0 or greater)');
      return;
    }

    try {
      await addCategory(newCategoryName.trim(), parseFloat(newCategoryBudget), newCategoryExcludeFromLimits);
      Alert.alert('Success', `Category "${newCategoryName.trim()}" added successfully`);
      setAddModalVisible(false);
      setNewCategoryName('');
      setNewCategoryBudget('');
      setNewCategoryExcludeFromLimits(false);
    } catch (error) {
      const errorMessage = error.message || 'Failed to add category. Please try again.';
      Alert.alert('Error', errorMessage);
      console.error('Add category error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Tap on a category to edit its monthly budget
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Custom Category</Text>
          {!isPremium && (
            <Text style={styles.categoryLimitText}>
              {categories.length}/5 categories (Free Plan)
            </Text>
          )}
        </TouchableOpacity>

        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            currency={selectedCurrency}
            onPress={() => handleCategoryPress(category)}
          />
        ))}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit Budget for {selectedCategory?.name}
            </Text>

            <Text style={styles.label}>Monthly Budget ({selectedCurrency})</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={newBudget}
              onChangeText={setNewBudget}
            />

            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Exclude from spending limits</Text>
                <Text style={styles.switchDescription}>
                  Fixed expenses like rent won't count toward daily/weekly limits
                </Text>
              </View>
              <Switch
                value={excludeFromLimits}
                onValueChange={setExcludeFromLimits}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={excludeFromLimits ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteCategory}
            >
              <Text style={styles.deleteButtonText}>Delete Category</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedCategory(null);
                  setNewBudget('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleUpdateBudget}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Category</Text>

            {!isPremium && (
              <View style={styles.limitWarning}>
                <Text style={styles.limitWarningText}>
                  Free Plan: {categories.length}/5 categories used
                </Text>
              </View>
            )}

            <Text style={styles.label}>Category Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Healthcare, Entertainment"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />

            <Text style={styles.label}>Monthly Budget ({selectedCurrency})</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={newCategoryBudget}
              onChangeText={setNewCategoryBudget}
            />

            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Exclude from spending limits</Text>
                <Text style={styles.switchDescription}>
                  Fixed expenses like rent won't count toward daily/weekly limits
                </Text>
              </View>
              <Switch
                value={newCategoryExcludeFromLimits}
                onValueChange={setNewCategoryExcludeFromLimits}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={newCategoryExcludeFromLimits ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setAddModalVisible(false);
                  setNewCategoryName('');
                  setNewCategoryBudget('');
                  setNewCategoryExcludeFromLimits(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddCategory}
              >
                <Text style={styles.saveButtonText}>Create</Text>
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
  content: {
    flex: 1,
    padding: spacing.lg
  },
  header: {
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.small
  },
  headerText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center'
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
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.medium
  },
  addButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  categoryLimitText: {
    ...typography.caption,
    color: '#FFFFFF',
    marginTop: spacing.xs,
    opacity: 0.9
  },
  limitWarning: {
    backgroundColor: colors.warning,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    alignItems: 'center'
  },
  limitWarningText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.md
  },
  switchLabel: {
    ...typography.subheading,
    marginBottom: spacing.xs,
    fontWeight: '600'
  },
  switchDescription: {
    ...typography.caption,
    color: colors.textLight,
    lineHeight: 16
  },
  deleteButton: {
    backgroundColor: colors.expense,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg
  },
  deleteButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  }
});

export default CategoriesScreen;
