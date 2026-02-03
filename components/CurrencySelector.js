import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import { currencies } from '../utils/currencies';

// Popular currencies that appear at the top
const popularCurrencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'NGN', 'ZAR'];

const CurrencySelector = ({ visible, onClose, selectedCurrency, onSelectCurrency }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter currencies based on search
  const filteredCurrencies = currencies.filter(currency => {
    const query = searchQuery.toLowerCase();
    return (
      currency.name.toLowerCase().includes(query) ||
      currency.code.toLowerCase().includes(query) ||
      currency.symbol.toLowerCase().includes(query)
    );
  });

  // Separate popular and other currencies
  const popularCurrencies = currencies.filter(c => popularCurrencyCodes.includes(c.code));
  const otherCurrencies = filteredCurrencies.filter(c => !popularCurrencyCodes.includes(c.code));

  // Show popular currencies only if there's no search query
  const displayCurrencies = searchQuery
    ? filteredCurrencies
    : [...popularCurrencies, ...otherCurrencies];

  const handleSelect = (currency) => {
    onSelectCurrency(currency.symbol);
    setSearchQuery('');
    onClose();
  };

  const renderCurrencyItem = ({ item, index }) => {
    const isPopular = !searchQuery && popularCurrencyCodes.includes(item.code);
    const isSelected = selectedCurrency === item.symbol;
    const showDivider = !searchQuery && index === popularCurrencies.length - 1;

    return (
      <>
        <TouchableOpacity
          style={[styles.currencyItem, isSelected && styles.currencyItemSelected]}
          onPress={() => handleSelect(item)}
        >
          <View style={styles.currencyInfo}>
            <Text style={styles.currencySymbol}>{item.symbol}</Text>
            <View style={styles.currencyDetails}>
              <Text style={styles.currencyName}>{item.name}</Text>
              <Text style={styles.currencyCode}>{item.code}</Text>
            </View>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
          {isPopular && !isSelected && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
        </TouchableOpacity>
        {showDivider && (
          <View style={styles.divider}>
            <Text style={styles.dividerText}>All Currencies</Text>
          </View>
        )}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Currency</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search currency name or code..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {displayCurrencies.length > 0 ? (
          <FlatList
            data={displayCurrencies}
            renderItem={renderCurrencyItem}
            keyExtractor={(item, index) => `${item.code}-${index}`}
            style={styles.list}
            showsVerticalScrollIndicator={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>No currencies found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xxl
  },
  closeButton: {
    padding: spacing.xs
  },
  headerTitle: {
    ...typography.title,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  placeholder: {
    width: 28
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small
  },
  searchIcon: {
    marginRight: spacing.sm
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.md,
    color: colors.text
  },
  clearButton: {
    padding: spacing.xs
  },
  list: {
    flex: 1
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.small
  },
  currencyItemSelected: {
    borderWidth: 2,
    borderColor: colors.primary
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  currencySymbol: {
    ...typography.heading,
    fontSize: 28,
    color: colors.primary,
    width: 50,
    textAlign: 'center'
  },
  currencyDetails: {
    marginLeft: spacing.md,
    flex: 1
  },
  currencyName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2
  },
  currencyCode: {
    ...typography.caption,
    color: colors.textLight
  },
  popularBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm
  },
  popularText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  divider: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm
  },
  dividerText: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl
  },
  emptyText: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center'
  }
});

export default CurrencySelector;
