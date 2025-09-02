import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ProfessionalCard, PriceDisplay, StatusBadge } from '../ui';
import { tradingColors, typography, spacing, borderRadius } from '../../constants/theme';

interface BalanceCardProps {
  exchange: 'binance' | 'gate';
  balance?: {
    availableMargin?: number;
    unrealizedPnl?: number;
    used?: number;
    total?: number;
  };
  spotBalance?: {
    asset: string;
    balance: number;
    availableBalance: number;
    exchange: string;
    type: string;
  };
  loading?: boolean;
  lastUpdate?: Date;
  onRefresh?: () => void;
  isConnected?: boolean;
}

/**
 * Professional Trading Balance Card
 * 
 * Features:
 * - Professional dark theme with subtle elevation
 * - Real-time balance display with monospace fonts
 * - P&L color coding (green/red) for unrealized PnL
 * - Spot and futures balance sections
 * - Refresh functionality with loading states
 * - Exchange branding and connection status
 * - Professional typography and spacing
 */
export const BalanceCard: React.FC<BalanceCardProps> = ({
  exchange,
  balance,
  spotBalance,
  loading = false,
  lastUpdate,
  onRefresh,
  isConnected = false,
}) => {
  const exchangeName = exchange === 'binance' ? 'Binance' : 'Gate.io';

  return (
    <ProfessionalCard elevated style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Account Balance</Text>
          <StatusBadge
            status={isConnected ? 'success' : 'neutral'}
            text={exchangeName}
            size="small"
            variant="subtle"
            showIcon
          />
        </View>
        
        <TouchableOpacity
          onPress={onRefresh}
          disabled={loading}
          style={styles.refreshButton}
        >
          {loading ? (
            <ActivityIndicator size="small" color={tradingColors.primary} />
          ) : (
            <Text style={styles.refreshText}>🔄 Refresh</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Futures Balance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Futures Wallet - USDT Balance</Text>
        
        {balance ? (
          <View style={styles.balanceGrid}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Available Margin</Text>
              <PriceDisplay
                price={balance.availableMargin || 0}
                size="medium"
                currency="USDT"
                showChange={false}
                precision={2}
              />
            </View>
            
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Unrealized PnL</Text>
              <PriceDisplay
                price={balance.unrealizedPnl || 0}
                size="medium"
                currency="USDT"
                showChange={false}
                precision={2}
              />
            </View>
            
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Margin Used</Text>
              <PriceDisplay
                price={balance.used || 0}
                size="medium"
                currency="USDT"
                showChange={false}
                precision={2}
              />
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            {loading ? (
              <>
                <ActivityIndicator size="small" color={tradingColors.primary} />
                <Text style={styles.emptyText}>Loading balance...</Text>
              </>
            ) : (
              <Text style={styles.emptyText}>
                No balance data available. Tap refresh to reload.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Spot Balance Section */}
      {spotBalance && (
        <View style={[styles.section, styles.spotSection]}>
          <Text style={styles.sectionTitle}>
            Spot Wallet - {spotBalance.asset} Balance
          </Text>
          
          <View style={styles.spotBalanceContainer}>
            <View style={styles.spotBalanceItem}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <PriceDisplay
                price={spotBalance.balance}
                size="medium"
                currency={spotBalance.asset}
                showChange={false}
                precision={4}
              />
            </View>
            
            <View style={styles.spotBalanceItem}>
              <Text style={styles.balanceLabel}>Available</Text>
              <PriceDisplay
                price={spotBalance.availableBalance}
                size="medium"
                currency={spotBalance.asset}
                showChange={false}
                precision={4}
              />
            </View>
            
            <View style={styles.spotBalanceItem}>
              <Text style={styles.balanceLabel}>Type</Text>
              <StatusBadge
                status="info"
                text={spotBalance.type.toUpperCase()}
                size="small"
                variant="outline"
              />
            </View>
          </View>
        </View>
      )}

      {/* Last Update */}
      {lastUpdate && (
        <Text style={styles.lastUpdate}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Text>
      )}
    </ProfessionalCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: tradingColors.dark.text.primary,
  },
  
  refreshButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: tradingColors.dark.surface.interactive,
    borderWidth: 1,
    borderColor: tradingColors.dark.border.primary,
  },
  
  refreshText: {
    fontSize: typography.fontSize.sm,
    color: tradingColors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  
  section: {
    marginBottom: spacing.lg,
  },
  
  spotSection: {
    borderTopWidth: 1,
    borderTopColor: tradingColors.dark.border.subtle,
    paddingTop: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: tradingColors.dark.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  balanceLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: tradingColors.dark.text.tertiary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  
  spotBalanceContainer: {
    backgroundColor: tradingColors.dark.surface.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  
  spotBalanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: tradingColors.dark.text.muted,
    textAlign: 'center',
  },
  
  lastUpdate: {
    fontSize: typography.fontSize.xxs,
    color: tradingColors.dark.text.muted,
    textAlign: 'right',
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.mono,
  },
});