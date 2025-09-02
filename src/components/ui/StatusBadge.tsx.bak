import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { tradingColors, typography, spacing, borderRadius } from '../../constants/theme';

interface StatusBadgeProps {
  status: 'profit' | 'loss' | 'neutral' | 'warning' | 'info' | 'success';
  text: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'solid' | 'outline' | 'subtle';
  style?: ViewStyle;
  showIcon?: boolean;
}

/**
 * Professional Status Badge Component
 * 
 * Features:
 * - Trading-specific status colors (profit/loss/neutral)
 * - Multiple variants (solid, outline, subtle)
 * - Professional typography with consistent sizing
 * - Optional status icons for quick recognition
 * - Accessible color contrast
 * - Consistent with institutional trading interfaces
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'medium',
  variant = 'solid',
  style,
  showIcon = false,
}) => {
  const getStatusConfig = (status: StatusBadgeProps['status']) => {
    switch (status) {
      case 'profit':
        return {
          color: tradingColors.profit,
          backgroundColor: tradingColors.pnl.positiveBg,
          icon: '↗',
        };
      case 'loss':
        return {
          color: tradingColors.loss,
          backgroundColor: tradingColors.pnl.negativeBg,
          icon: '↘',
        };
      case 'neutral':
        return {
          color: tradingColors.neutral,
          backgroundColor: tradingColors.pnl.neutralBg,
          icon: '→',
        };
      case 'warning':
        return {
          color: tradingColors.warning,
          backgroundColor: 'rgba(255, 167, 38, 0.1)',
          icon: '⚠',
        };
      case 'info':
        return {
          color: tradingColors.info,
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          icon: 'ℹ',
        };
      case 'success':
        return {
          color: tradingColors.success,
          backgroundColor: 'rgba(102, 187, 106, 0.1)',
          icon: '✓',
        };
      default:
        return {
          color: tradingColors.neutral,
          backgroundColor: tradingColors.pnl.neutralBg,
          icon: '→',
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  const getContainerStyle = () => {
    const baseStyle = [styles.container, styles[size]];
    
    switch (variant) {
      case 'solid':
        return [
          ...baseStyle,
          {
            backgroundColor: statusConfig.color,
            borderColor: statusConfig.color,
          },
          styles.solid,
        ];
      case 'outline':
        return [
          ...baseStyle,
          {
            backgroundColor: 'transparent',
            borderColor: statusConfig.color,
          },
          styles.outline,
        ];
      case 'subtle':
        return [
          ...baseStyle,
          {
            backgroundColor: statusConfig.backgroundColor,
            borderColor: statusConfig.color,
          },
          styles.subtle,
        ];
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text` as keyof typeof styles]];
    
    switch (variant) {
      case 'solid':
        return [...baseTextStyle, { color: tradingColors.dark.text.primary }];
      case 'outline':
      case 'subtle':
        return [...baseTextStyle, { color: statusConfig.color }];
      default:
        return baseTextStyle;
    }
  };

  return (
    <View style={[...getContainerStyle(), style]}>
      {showIcon && (
        <Text style={[styles.icon, { color: variant === 'solid' ? tradingColors.dark.text.primary : statusConfig.color }]}>
          {statusConfig.icon}
        </Text>
      )}
      <Text style={getTextStyle()}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.trading.chip,
    borderWidth: 1,
  },
  
  // Size variants
  small: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    gap: spacing.xxs,
  },
  medium: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  large: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  
  // Variant styles
  solid: {
    borderWidth: 0,
  },
  outline: {
    borderWidth: 1.5,
  },
  subtle: {
    borderWidth: 1,
    borderStyle: 'solid',
  },
  
  // Text styles
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: typography.fontSize.xs,
  },
  mediumText: {
    fontSize: typography.fontSize.sm,
  },
  largeText: {
    fontSize: typography.fontSize.base,
  },
  
  // Icon styles
  icon: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});