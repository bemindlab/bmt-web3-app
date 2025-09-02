import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { tradingColors, typography, spacing } from '../../constants/theme';

interface PriceDisplayProps {
  price: number | string;
  change?: number;
  changePercent?: number;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  currency?: string;
  showChange?: boolean;
  style?: ViewStyle;
  precision?: number;
}

/**
 * Professional Price Display Component
 * 
 * Features:
 * - Monospace font for consistent digit alignment
 * - Professional P&L color coding (green/red/neutral)
 * - Multiple size variants for different contexts
 * - Change indicators with arrows and percentages
 * - Currency formatting with proper symbols
 * - Bloomberg Terminal inspired typography
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  change,
  changePercent,
  size = 'medium',
  currency = 'USD',
  showChange = true,
  style,
  precision = 2,
}) => {
  const formatPrice = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return '0.00';
    
    // Format with appropriate precision
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  };

  const formatChange = (value: number): string => {
    return value >= 0 ? `+${formatPrice(Math.abs(value))}` : `-${formatPrice(Math.abs(value))}`;
  };

  const formatChangePercent = (value: number): string => {
    return value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };

  const getChangeColor = (value?: number): string => {
    if (!value || value === 0) return tradingColors.neutral;
    return value > 0 ? tradingColors.profit : tradingColors.loss;
  };

  const getChangeIcon = (value?: number): string => {
    if (!value || value === 0) return '→';
    return value > 0 ? '↗' : '↘';
  };

  const getCurrencySymbol = (curr: string): string => {
    switch (curr.toLowerCase()) {
      case 'usd':
      case 'usdt':
        return '$';
      case 'btc':
        return '₿';
      case 'eth':
        return 'Ξ';
      case 'eur':
        return '€';
      default:
        return curr.toUpperCase();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Main Price */}
      <View style={styles.priceContainer}>
        <Text style={[styles.price, styles[`${size}Price` as keyof typeof styles]]}>
          <Text style={styles.currency}>{getCurrencySymbol(currency)}</Text>
          {formatPrice(price)}
        </Text>
      </View>

      {/* Change Information */}
      {showChange && (change !== undefined || changePercent !== undefined) && (
        <View style={styles.changeContainer}>
          {change !== undefined && (
            <View style={styles.changeRow}>
              <Text style={[styles.changeIcon, { color: getChangeColor(change) }]}>
                {getChangeIcon(change)}
              </Text>
              <Text style={[styles.change, { color: getChangeColor(change) }]}>
                {formatChange(change)}
              </Text>
            </View>
          )}
          
          {changePercent !== undefined && (
            <Text style={[styles.changePercent, { color: getChangeColor(changePercent) }]}>
              {formatChangePercent(changePercent)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: typography.fontFamily.mono,
    fontWeight: typography.fontWeight.bold,
    color: tradingColors.dark.text.primary,
    lineHeight: typography.lineHeight.tight,
  },
  currency: {
    opacity: 0.8,
    fontSize: '0.9em', // Slightly smaller than the price
  },
  
  // Size variants
  smallPrice: {
    fontSize: typography.fontSize.base,
  },
  mediumPrice: {
    fontSize: typography.fontSize.xl,
  },
  largePrice: {
    fontSize: typography.fontSize.xxl,
  },
  xlargePrice: {
    fontSize: typography.fontSize.xxxl,
  },
  
  // Change styling
  changeContainer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  changeIcon: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  change: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    fontWeight: typography.fontWeight.medium,
  },
  changePercent: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    fontWeight: typography.fontWeight.semibold,
    backgroundColor: tradingColors.dark.surface.elevated,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
});