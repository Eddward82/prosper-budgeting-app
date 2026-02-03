export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const formatDateInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    monthName: now.toLocaleDateString('en-US', { month: 'long' })
  };
};

export const getMonthName = (monthNumber) => {
  const date = new Date(2000, monthNumber - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long' });
};
