import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Switch,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useBudgetStore from '../store/useBudgetStore';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import { formatDateInput } from '../utils/date';
import { parseAmount, sanitizeAmountInput } from '../utils/helpers';

const AddTransactionScreen = ({ navigation }) => {
  const { categories, selectedCurrency, addTransaction, isPremium, addCategory } = useBudgetStore();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [tags, setTags] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [excludeFromLimits, setExcludeFromLimits] = useState(false);

  // Add category modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    // Check if category already exists
    const exists = categories.some(
      cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    if (exists) {
      Alert.alert('Error', 'A category with this name already exists');
      return;
    }

    try {
      const budget = newCategoryBudget ? parseFloat(newCategoryBudget) : 0;
      await addCategory(newCategoryName.trim(), budget, false);

      // Get updated categories from store to find the new one
      const updatedCategories = useBudgetStore.getState().categories;
      const newCategory = updatedCategories.find(
        cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      );
      if (newCategory) {
        setSelectedCategory(newCategory.id);
      }

      setNewCategoryName('');
      setNewCategoryBudget('');
      setShowAddCategoryModal(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add category');
    }
  };

  const calculateNextRunDate = (currentDate, freq) => {
    const d = new Date(currentDate);
    if (freq === 'daily') {
      d.setDate(d.getDate() + 1);
    } else if (freq === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else if (freq === 'monthly') {
      d.setMonth(d.getMonth() + 1);
    }
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    const parsedAmount = parseAmount(amount);
    if (!amount || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0');
      return;
    }

    if (type === 'expense' && !selectedCategory) {
      Alert.alert('Validation Error', 'Please select a category for this expense');
      return;
    }

    if (isRecurring && !isPremium) {
      Alert.alert('Premium Feature', 'Recurring transactions require Premium. Please upgrade to use this feature.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Validation Error', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    try {
      const nextRunDate = isRecurring ? calculateNextRunDate(date, frequency) : null;

      await addTransaction(
        type,
        type === 'expense' ? selectedCategory : null,
        parsedAmount,
        date,
        tags.trim() || null,
        null,
        isRecurring ? 1 : 0,
        isRecurring ? frequency : null,
        nextRunDate,
        excludeFromLimits ? 1 : 0
      );
      Alert.alert('Success', `${type === 'income' ? 'Income' : 'Expense'} added successfully`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction. Please check your input and try again.');
      console.error('Add transaction error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Transaction Type</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.typeButtonActive,
              { backgroundColor: type === 'expense' ? colors.expense : colors.border }
            ]}
            onPress={() => setType('expense')}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === 'expense' && styles.typeButtonTextActive
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.typeButtonActive,
              { backgroundColor: type === 'income' ? colors.income : colors.border }
            ]}
            onPress={() => setType('income')}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === 'income' && styles.typeButtonTextActive
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Amount ({selectedCurrency})</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={(text) => setAmount(sanitizeAmountInput(text))}
        />

        {type === 'expense' && (
          <>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.categoryChipActive
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.id && styles.categoryChipTextActive
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addCategoryChip}
                onPress={() => {
                  if (!isPremium && categories.length >= 5) {
                    Alert.alert(
                      'Premium Feature',
                      'Free users are limited to 5 categories. Upgrade to Premium for unlimited categories!',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Upgrade', onPress: () => navigation.navigate('PremiumUpgrade') }
                      ]
                    );
                    return;
                  }
                  setShowAddCategoryModal(true);
                }}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addCategoryChipText}>Add New</Text>
              </TouchableOpacity>
            </View>

            {/* Exclude from spending limits toggle */}
            <View style={styles.excludeToggleContainer}>
              <View style={styles.excludeToggleInfo}>
                <Ionicons name="shield-outline" size={20} color={colors.primary} />
                <View style={styles.excludeToggleTextContainer}>
                  <Text style={styles.excludeToggleTitle}>Exclude from spending limits</Text>
                  <Text style={styles.excludeToggleDescription}>
                    Won't count towards daily/weekly limits (e.g., savings, rent)
                  </Text>
                </View>
              </View>
              <Switch
                value={excludeFromLimits}
                onValueChange={setExcludeFromLimits}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={excludeFromLimits ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </>
        )}

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        <View style={styles.tagsLabelRow}>
          <Text style={styles.tagsLabel}>Tags (Optional)</Text>
          {!isPremium && <Text style={styles.premiumBadge}>Premium</Text>}
        </View>
        <TextInput
          style={[styles.input, !isPremium && styles.inputDisabled]}
          placeholder={isPremium ? "e.g. #work, #kids, #personal" : "Upgrade to Premium to use tags"}
          value={tags}
          onChangeText={(text) => {
            if (!isPremium) {
              Alert.alert('Premium Feature', 'Tags require Premium membership. Upgrade to organize your transactions with custom tags.');
              return;
            }
            setTags(text);
          }}
          editable={isPremium}
        />
        {isPremium && <Text style={styles.hint}>Separate multiple tags with commas</Text>}

        <View style={styles.premiumSection}>
          <View style={styles.recurringRow}>
            <View style={styles.recurringLabel}>
              <Text style={styles.label}>Make Recurring</Text>
              {!isPremium && <Text style={styles.premiumBadge}>Premium</Text>}
            </View>
            <Switch
              value={isRecurring}
              onValueChange={(value) => {
                if (!isPremium && value) {
                  Alert.alert('Premium Feature', 'Recurring transactions require Premium membership.');
                  return;
                }
                setIsRecurring(value);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isRecurring ? colors.primary : colors.textLight}
            />
          </View>

          {isRecurring && isPremium && (
            <>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.frequencyContainer}>
                {['daily', 'weekly', 'monthly'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      frequency === freq && styles.frequencyButtonActive
                    ]}
                    onPress={() => setFrequency(freq)}
                  >
                    <Text
                      style={[
                        styles.frequencyButtonText,
                        frequency === freq && styles.frequencyButtonTextActive
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.hint}>
                Next occurrence: {calculateNextRunDate(date, frequency)}
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Category</Text>
              <TouchableOpacity onPress={() => setShowAddCategoryModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Category Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Groceries, Healthcare, Shopping"
              placeholderTextColor={colors.textLight}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus={true}
            />

            <Text style={styles.modalLabel}>Monthly Budget (Optional)</Text>
            <View style={styles.budgetInputWrapper}>
              <Text style={styles.currencySymbol}>{selectedCurrency}</Text>
              <TextInput
                style={styles.budgetModalInput}
                placeholder="0"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
                value={newCategoryBudget}
                onChangeText={setNewCategoryBudget}
              />
            </View>
            <Text style={styles.modalHint}>You can set or change the budget later in Categories</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setNewCategoryName('');
                  setNewCategoryBudget('');
                  setShowAddCategoryModal(false);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddCategory}
              >
                <Text style={styles.modalAddButtonText}>Add Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  label: {
    ...typography.subheading,
    marginBottom: spacing.sm,
    marginTop: spacing.lg
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small
  },
  typeContainer: {
    flexDirection: 'row',
    gap: spacing.md
  },
  typeButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.small
  },
  typeButtonActive: {
    ...shadows.medium
  },
  typeButtonText: {
    ...typography.subheading,
    color: colors.text
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  categoryChip: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryChipText: {
    ...typography.body,
    color: colors.text
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  hint: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
    marginBottom: spacing.md
  },
  tagsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm
  },
  inputDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6
  },
  tagsLabel: {
    ...typography.subheading
  },
  premiumSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  recurringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  recurringLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  premiumBadge: {
    ...typography.caption,
    backgroundColor: colors.warning,
    color: '#FFFFFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    fontWeight: 'bold'
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center'
  },
  frequencyButtonActive: {
    backgroundColor: colors.primary
  },
  frequencyButtonText: {
    ...typography.body,
    color: colors.text
  },
  frequencyButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
    ...shadows.medium
  },
  submitButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  addCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: spacing.xs
  },
  addCategoryChipText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600'
  },
  excludeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  excludeToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md
  },
  excludeToggleTextContainer: {
    marginLeft: spacing.sm,
    flex: 1
  },
  excludeToggleTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text
  },
  excludeToggleDescription: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.large
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  modalTitle: {
    ...typography.heading,
    fontSize: 20
  },
  modalLabel: {
    ...typography.subheading,
    marginBottom: spacing.sm,
    marginTop: spacing.md
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border
  },
  budgetInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md
  },
  currencySymbol: {
    ...typography.subheading,
    color: colors.textLight,
    marginRight: spacing.sm
  },
  budgetModalInput: {
    flex: 1,
    padding: spacing.lg,
    ...typography.body
  },
  modalHint: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs
  },
  modalExcludeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  modalExcludeInfo: {
    flex: 1,
    marginRight: spacing.md
  },
  modalExcludeTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text
  },
  modalExcludeDescription: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl
  },
  modalCancelButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: colors.border
  },
  modalCancelButtonText: {
    ...typography.subheading,
    color: colors.text
  },
  modalAddButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: colors.primary
  },
  modalAddButtonText: {
    ...typography.subheading,
    color: '#FFFFFF',
    fontWeight: 'bold'
  }
});

export default AddTransactionScreen;
