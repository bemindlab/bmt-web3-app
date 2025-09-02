import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { CryptoData } from '../types';
import { formatCryptoPrice, formatCompact, formatPercentage } from '../utils/formatters';
import { tradingColors, spacing, borderRadius, typography, shadows } from '../constants/theme';

interface CryptoCardProps {
  crypto: CryptoData;
  onPress?: () => void;
}

export const CryptoCard: React.FC<CryptoCardProps> = ({ crypto, onPress }) => {
  const isPositive = crypto.price_change_percentage_24h >= 0;
  const changeColor = isPositive ? tradingColors.profit : tradingColors.loss;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.coinInfo}>
          <Image source={{ uri: crypto.image }} style={styles.coinImage} />
          <View>
            <Text style={styles.coinName}>{crypto.name}</Text>
            <Text style={styles.coinSymbol}>{crypto.symbol.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.price}>{formatCryptoPrice(crypto.current_price)}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {formatPercentage(crypto.price_change_percentage_24h)}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.marketCapLabel}>Market Cap</Text>
        <Text style={styles.marketCap}>${formatCompact(crypto.market_cap)}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: tradingColors.dark.background.secondary,
    padding: spacing.trading.cardPadding,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.trading.card,
    borderWidth: 1,
    borderColor: tradingColors.dark.border.primary,
    ...shadows.trading.card,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
    backgroundColor: tradingColors.dark.surface.pressed,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.trading.componentGap,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinImage: {
    width: 32,
    height: 32,
    marginRight: spacing.trading.componentGap,
    borderRadius: borderRadius.full,
  },
  coinName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: tradingColors.dark.text.primary,
    marginBottom: spacing.xxs,
  },
  coinSymbol: {
    fontSize: typography.fontSize.xs,
    color: tradingColors.dark.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: typography.trading.balance.fontSize,
    fontWeight: typography.trading.balance.fontWeight,
    fontFamily: typography.fontFamily.mono,
    color: tradingColors.dark.text.primary,
    marginBottom: spacing.xxs,
  },
  change: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.mono,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: tradingColors.dark.border.subtle,
  },
  marketCapLabel: {
    fontSize: typography.fontSize.xs,
    color: tradingColors.dark.text.tertiary,
  },
  marketCap: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.mono,
    color: tradingColors.dark.text.secondary,
  },
});
