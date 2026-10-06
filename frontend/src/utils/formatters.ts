/**
 * Centralized formatting utilities for currency, dates, and numbers
 */

/**
 * Formats numeric amounts into Indian Rupee (₹) layout
 * @param amount Number to format
 * @param isMinorUnit Set to true if the number is in paise (minor units, e.g. 100 paise = ₹1)
 * @param includeDecimals Whether to include decimal fractions (default false if whole number)
 */
export const formatINR = (
  amount: number,
  isMinorUnit: boolean = false,
  includeDecimals: boolean = false
): string => {
  const value = isMinorUnit ? (amount || 0) / 100 : amount || 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals || value % 1 !== 0 ? 2 : 0,
  }).format(value);
};

/**
 * Formats a Date object or ISO string into localized human-readable date
 */
export const formatDate = (
  date: string | Date,
  formatStyle: 'short' | 'medium' | 'full' = 'medium'
): string => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  if (formatStyle === 'short') {
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }

  if (formatStyle === 'full') {
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats relative time (e.g. "Just now", "10m ago", "2h ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return formatDate(date, 'short');
};
