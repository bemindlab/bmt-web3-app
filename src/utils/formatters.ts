import numeral from 'numeral';

/**
 * Format a number as currency with proper decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 */
export const formatCurrency = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }

  const format = decimals === 0 ? '$0,0' : `$0,0.${'0'.repeat(decimals)}`;
  return numeral(value).format(format);
};

/**
 * Format a number with specific decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 */
export const formatNumber = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }

  const format = decimals === 0 ? '0,0' : `0,0.${'0'.repeat(decimals)}`;
  return numeral(value).format(format);
};

/**
 * Format a percentage value
 * @param value - The percentage value
 * @param includeSign - Whether to include + sign for positive values
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | null | undefined, includeSign = true): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }

  const formatted = numeral(value).format('0,0.00');
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
};

/**
 * Format large numbers with K, M, B suffixes
 * @param value - The number to format
 * @returns Formatted string with suffix
 */
export const formatCompact = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  if (value >= 1e9) {
    return numeral(value / 1e9).format('0.00') + 'B';
  } else if (value >= 1e6) {
    return numeral(value / 1e6).format('0.00') + 'M';
  } else if (value >= 1e3) {
    return numeral(value / 1e3).format('0.00') + 'K';
  }

  return numeral(value).format('0,0');
};

/**
 * Format cryptocurrency price based on its value
 * @param price - The price to format
 * @returns Formatted price string
 */
export const formatCryptoPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined || isNaN(price)) {
    return '$0.00';
  }

  if (price < 0.01) {
    return formatCurrency(price, 6);
  } else if (price < 1) {
    return formatCurrency(price, 4);
  } else if (price < 100) {
    return formatCurrency(price, 2);
  } else {
    return formatCurrency(price, 0);
  }
};
