import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { tradingColors, typography, borderRadius, spacing, shadows } from '../../constants/theme';

interface ProfessionalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

/**
 * Professional Trading Button Component
 * 
 * Features:
 * - Multiple variants for different actions (buy/sell/neutral)
 * - Professional color scheme optimized for trading
 * - Loading states with spinners
 * - Touch-friendly sizes (minimum 44px height)
 * - Consistent styling with theme system
 * - Accessibility support
 */
export const ProfessionalButton: React.FC<ProfessionalButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
      return baseStyle;
    }
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, styles.primary];
      case 'secondary':
        return [...baseStyle, styles.secondary];
      case 'success':
        return [...baseStyle, styles.success];
      case 'danger':
        return [...baseStyle, styles.danger];
      case 'outline':
        return [...baseStyle, styles.outline];
      default:
        return [...baseStyle, styles.primary];
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text` as keyof typeof styles]];
    
    if (variant === 'outline') {
      baseTextStyle.push(styles.outlineText);
    } else {
      baseTextStyle.push(styles.solidText);
    }
    
    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? tradingColors.primary : tradingColors.dark.text.primary}
          size="small"
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.trading.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.xs,
  },
  
  // Size variants
  small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.trading.buttonPadding,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  
  // Style variants
  primary: {
    backgroundColor: tradingColors.primary,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: tradingColors.secondary,
    borderWidth: 0,
  },
  success: {
    backgroundColor: tradingColors.profit,
    borderWidth: 0,
  },
  danger: {
    backgroundColor: tradingColors.loss,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: tradingColors.primary,
  },
  
  // States
  disabled: {
    opacity: 0.5,
    ...shadows.none,
  },
  
  // Layout
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: typography.fontSize.sm,
  },
  mediumText: {
    fontSize: typography.fontSize.base,
  },
  largeText: {
    fontSize: typography.fontSize.lg,
  },
  solidText: {
    color: tradingColors.dark.text.primary,
  },
  outlineText: {
    color: tradingColors.primary,
  },
});