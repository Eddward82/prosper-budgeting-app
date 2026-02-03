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
