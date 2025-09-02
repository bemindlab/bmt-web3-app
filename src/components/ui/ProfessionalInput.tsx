import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { tradingColors, typography, spacing, borderRadius } from '../../constants/theme';

interface ProfessionalInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'default' | 'filled' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  required?: boolean;
  showFloatingLabel?: boolean;
}

/**
 * Professional Trading Input Component
 * 
 * Features:
 * - Professional dark theme optimized for trading
 * - Floating label animation for space efficiency
 * - Clear error states with descriptive messages
 * - Icon support for enhanced UX
 * - Multiple variants (default, filled, outline)
 * - Monospace font for numerical inputs
 * - Touch-friendly sizing (minimum 48px height)
 * - Consistent with institutional trading forms
 */
export const ProfessionalInput: React.FC<ProfessionalInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  size = 'medium',
  style,
  required = false,
  showFloatingLabel = true,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');

  const hasValue = internalValue.length > 0;
  const showFloatingLabelState = showFloatingLabel && (isFocused || hasValue);

  const handleChangeText = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container, styles[size]];
    
    if (error) {
      baseStyle.push(styles.errorContainer);
    }
    
    if (isFocused) {
      baseStyle.push(styles.focusedContainer);
    }
    
    switch (variant) {
      case 'filled':
        return [...baseStyle, styles.filled];
      case 'outline':
        return [...baseStyle, styles.outline];
      default:
        return [...baseStyle, styles.default];
    }
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input, styles[`${size}Input` as keyof typeof styles]];
    
    // Use monospace font for numeric inputs
    if (keyboardType === 'numeric' || keyboardType === 'decimal-pad') {
      baseStyle.push(styles.numericInput);
    }
    
    return baseStyle;
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Static Label */}
      {label && !showFloatingLabel && (
        <Text style={styles.staticLabel}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View style={getContainerStyle()}>
        {/* Left Icon */}
        {leftIcon && (
          <Text style={styles.leftIcon}>{leftIcon}</Text>
        )}

        {/* Input Field */}
        <TextInput
          style={getInputStyle()}
          value={internalValue}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={showFloatingLabelState ? placeholder : (placeholder || label)}
          placeholderTextColor={tradingColors.dark.text.muted}
          keyboardType={keyboardType}
          {...props}
        />

        {/* Floating Label */}
        {label && showFloatingLabel && (
          <Text
            style={[
              styles.floatingLabel,
              showFloatingLabelState && styles.floatingLabelActive,
              error && styles.floatingLabelError,
            ]}
          >
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}

        {/* Right Icon */}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            disabled={!onRightIconPress}
          >
            <Text style={styles.rightIcon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.xs,
  },
  
  // Container styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.trading.input,
    borderWidth: 1,
    position: 'relative',
  },
  
  // Size variants
  small: {
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  medium: {
    minHeight: 48,
    paddingHorizontal: spacing.trading.inputPadding,
  },
  large: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  
  // Variant styles
  default: {
    backgroundColor: tradingColors.dark.surface.elevated,
    borderColor: tradingColors.dark.border.primary,
  },
  filled: {
    backgroundColor: tradingColors.dark.surface.interactive,
    borderColor: tradingColors.dark.border.subtle,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: tradingColors.dark.border.primary,
    borderWidth: 2,
  },
  
  // State styles
  focusedContainer: {
    borderColor: tradingColors.primary,
    borderWidth: 2,
  },
  errorContainer: {
    borderColor: tradingColors.loss,
    borderWidth: 2,
  },
  
  // Input styles
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: tradingColors.dark.text.primary,
    paddingVertical: 0, // Remove default padding
  },
  smallInput: {
    fontSize: typography.fontSize.sm,
  },
  mediumInput: {
    fontSize: typography.fontSize.base,
  },
  largeInput: {
    fontSize: typography.fontSize.lg,
  },
  numericInput: {
    fontFamily: typography.fontFamily.mono,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Label styles
  staticLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: tradingColors.dark.text.secondary,
    marginBottom: spacing.xs,
  },
  floatingLabel: {
    position: 'absolute',
    left: spacing.trading.inputPadding,
    fontSize: typography.fontSize.base,
    color: tradingColors.dark.text.muted,
    backgroundColor: tradingColors.dark.surface.elevated,
    paddingHorizontal: spacing.xs,
    zIndex: 1,
  },
  floatingLabelActive: {
    top: -8,
    fontSize: typography.fontSize.xs,
    color: tradingColors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  floatingLabelError: {
    color: tradingColors.loss,
  },
  
  // Icon styles
  leftIcon: {
    fontSize: typography.fontSize.lg,
    color: tradingColors.dark.text.tertiary,
    marginRight: spacing.sm,
  },
  rightIconContainer: {
    padding: spacing.xs,
  },
  rightIcon: {
    fontSize: typography.fontSize.lg,
    color: tradingColors.dark.text.tertiary,
  },
  
  // Text styles
  required: {
    color: tradingColors.loss,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: tradingColors.loss,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: tradingColors.dark.text.muted,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});