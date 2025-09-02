import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { tradingColors, shadows, borderRadius, spacing } from '../../constants/theme';

interface ProfessionalCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  interactive?: boolean;
  noPadding?: boolean;
}

/**
 * Professional Trading Card Component
 * 
 * Features:
 * - Dark theme optimized for trading interfaces
 * - Subtle elevation with professional shadows
 * - Interactive states for hover/press
 * - Consistent spacing and borders
 * - Bloomberg Terminal inspired design
 */
export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  children,
  style,
  elevated = false,
  interactive = false,
  noPadding = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        interactive && styles.interactive,
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: tradingColors.dark.background.secondary,
    borderRadius: borderRadius.trading.card,
    borderWidth: 1,
    borderColor: tradingColors.dark.border.subtle,
    padding: spacing.trading.cardPadding,
    marginVertical: spacing.xs,
    ...shadows.sm,
  },
  elevated: {
    backgroundColor: tradingColors.dark.background.tertiary,
    borderColor: tradingColors.dark.border.primary,
    ...shadows.md,
  },
  interactive: {
    backgroundColor: tradingColors.dark.surface.interactive,
    borderColor: tradingColors.dark.border.primary,
  },
  noPadding: {
    padding: 0,
  },
});