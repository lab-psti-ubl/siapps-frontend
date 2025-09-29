export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('id-ID');
  } catch (error) {
    return 'Invalid Date';
  }
};