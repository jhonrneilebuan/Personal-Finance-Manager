export const formatCurrency = (value: number, currency = 'PHP') =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

