/**
 * Professional Trading Header Component
 * 
 * Displays exchange selection, connection status, and market information.
 * Provides quick access to trading settings and notifications.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, layout } from '../../constants/theme';
import { useTradingConnection } from '../../hooks';

interface TradingHeaderProps {
  symbol?: string;
  marketPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
  onSymbolPress?: () => void;
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
  isDarkMode?: boolean;
}

export const TradingHeader: React.FC<TradingHeaderProps> = ({
  symbol = 'BTCUSDT',
  marketPrice = 0,
  priceChange = 0,
  priceChangePercent = 0,
  onSymbolPress,
  onSettingsPress,
  onNotificationsPress,
  isDarkMode = false,
}) => {
  const {
    isConnected,
    activeExchange,
    connectionState,
    switchExchange,
  } = useTradingConnection();

  const formatPrice = (price: number) => {
    if (price === 0) return '--';
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPriceChange = (change: number, percent: number) => {
    if (change === 0) return { text: '--', color: colors.text.tertiary };
    
    const sign = change >= 0 ? '+' : '';
    const color = change >= 0 ? colors.trading.long : colors.trading.short;
    
    return {
      text: `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`,
      color,
    };
  };

  const getConnectionStatusColor = () => {
    if (connectionState.isConnecting) return colors.warning;
    return isConnected ? colors.trading.long : colors.danger;
  };

  const getConnectionStatusText = () => {
    if (connectionState.isConnecting) return 'Connecting...';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const priceChangeDisplay = formatPriceChange(priceChange, priceChangePercent);

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Top row: Exchange selection and connection status */}
      <View style={styles.topRow}>
        <View style={styles.exchangeSection}>
          <Text style={[styles.sectionLabel, isDarkMode && styles.textDark]}>Exchange</Text>
          <View style={styles.exchangeTabs}>
            <TouchableOpacity
              style={[
                styles.exchangeTab,
                activeExchange === 'binance' && styles.activeTab,
                isDarkMode && styles.exchangeTabDark,
              ]}
              onPress={() => switchExchange('binance')}
            >
              <Text
                style={[
                  styles.exchangeTabText,
                  activeExchange === 'binance' && styles.activeTabText,
                  isDarkMode && styles.exchangeTabTextDark,
                ]}
              >
                Binance
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.exchangeTab,
                activeExchange === 'gate' && styles.activeTab,
                isDarkMode && styles.exchangeTabDark,
              ]}
              onPress={() => switchExchange('gate')}
            >
              <Text
                style={[
                  styles.exchangeTabText,
                  activeExchange === 'gate' && styles.activeTabText,
                  isDarkMode && styles.exchangeTabTextDark,
                ]}
              >
                Gate.io
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusSection}>
          <View style={styles.connectionStatus}>
            {connectionState.isConnecting && (
              <ActivityIndicator size="small" color={colors.warning} style={styles.statusIcon} />
            )}
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getConnectionStatusColor() },
              ]}
            />
            <Text style={[styles.statusText, isDarkMode && styles.textDark]}>
              {getConnectionStatusText()}
            </Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          {onNotificationsPress && (
            <TouchableOpacity
              style={[styles.actionButton, isDarkMode && styles.actionButtonDark]}
              onPress={onNotificationsPress}
            >
              <Text style={styles.actionButtonText}>🔔</Text>
            </TouchableOpacity>
          )}
          {onSettingsPress && (
            <TouchableOpacity
              style={[styles.actionButton, isDarkMode && styles.actionButtonDark]}
              onPress={onSettingsPress}
            >
              <Text style={styles.actionButtonText}>⚙️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom row: Market information */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.symbolSection}
          onPress={onSymbolPress}
          disabled={!onSymbolPress}
        >
          <Text style={[styles.symbol, isDarkMode && styles.symbolDark]}>
            {symbol.replace('USDT', '/USDT')}
          </Text>
          {onSymbolPress && <Text style={styles.symbolArrow}>▼</Text>}
        </TouchableOpacity>

        <View style={styles.priceSection}>
          <Text style={[styles.price, isDarkMode && styles.priceDark]}>
            ${formatPrice(marketPrice)}
          </Text>
          <Text style={[styles.priceChange, { color: priceChangeDisplay.color }]}>
            {priceChangeDisplay.text}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    minHeight: layout.header.height,
  },
  containerDark: {
    backgroundColor: '#161B22',
    borderBottomColor: '#30363D',
  },

  // Top row styles
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  exchangeSection: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exchangeTabs: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  exchangeTab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    backgroundColor: colors.gray[100],
    minWidth: 60,
    alignItems: 'center',
  },
  exchangeTabDark: {
    backgroundColor: '#21262D',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  exchangeTabText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  exchangeTabTextDark: {
    color: '#C9D1D9',
  },
  activeTabText: {
    color: colors.white,
  },

  statusSection: {
    flex: 1,
    alignItems: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusIcon: {
    width: 12,
    height: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  actionsSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDark: {
    backgroundColor: '#21262D',
  },
  actionButtonText: {
    fontSize: 16,
  },

  // Bottom row styles
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  symbolSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  symbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  symbolDark: {
    color: '#F0F6FC',
  },
  symbolArrow: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },

  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  priceDark: {
    color: '#F0F6FC',
  },
  priceChange: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },

  // Dark mode text override
  textDark: {
    color: '#C9D1D9',
  },
});