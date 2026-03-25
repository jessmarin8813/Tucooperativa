/**
 * DashboardConstants.js
 * Centralizes formatting and UI constants to ensure platform-wide consistency.
 */

export const formatMoney = (amount) => {
  if (amount === undefined || amount === null) return '$0.00';
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(numericAmount);
};

export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('de-DE').format(num); // Use dots for thousands
};

export const formatBs = (amount) => {
  if (amount === undefined || amount === null) return '0,00';
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const UI_CHART_HEIGHT = 350;
