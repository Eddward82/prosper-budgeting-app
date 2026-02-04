export const formatCurrency = (amount, currency = '$') => {
  const formatted = Math.abs(amount).toFixed(2);
  return `${currency}${formatted}`;
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};

export const truncateText = (text, maxLength = 20) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getColorForCategory = (index) => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#FFD93D',
    '#6BCF7F',
    '#C77DFF',
    '#FF9FF3',
    '#54A0FF'
  ];
  return colors[index % colors.length];
};

// Parse amount string handling different locale formats
// Handles: 150,000 | 150.000 | 150,000.50 | 150.000,50
export const parseAmount = (text) => {
  if (!text || typeof text !== 'string') return 0;

  // Remove any spaces
  let cleaned = text.replace(/\s/g, '');

  // Count occurrences of comma and period
  const commaCount = (cleaned.match(/,/g) || []).length;
  const periodCount = (cleaned.match(/\./g) || []).length;

  // Determine the decimal separator
  // If there's only one separator at the end with 1-2 digits after, it's likely decimal
  const lastComma = cleaned.lastIndexOf(',');
  const lastPeriod = cleaned.lastIndexOf('.');

  // Check if last separator has 1-2 digits after it (decimal indicator)
  const digitsAfterComma = lastComma >= 0 ? cleaned.length - lastComma - 1 : -1;
  const digitsAfterPeriod = lastPeriod >= 0 ? cleaned.length - lastPeriod - 1 : -1;

  // If comma is last and has 1-2 digits after (European format: 150.000,50)
  if (lastComma > lastPeriod && digitsAfterComma <= 2 && digitsAfterComma >= 1) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  // If period is last and has 1-2 digits after (US format: 150,000.50)
  else if (lastPeriod > lastComma && digitsAfterPeriod <= 2 && digitsAfterPeriod >= 1) {
    cleaned = cleaned.replace(/,/g, '');
  }
  // No decimal part - just remove all separators (150,000 or 150.000 = 150000)
  else {
    cleaned = cleaned.replace(/[,\.]/g, '');
  }

  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
};

// Sanitize amount input - only allow digits, comma, and period
export const sanitizeAmountInput = (text) => {
  return text.replace(/[^0-9.,]/g, '');
};
