/**
 * Professional Balance Panel Component
 * 
 * Displays account balances, portfolio overview, and balance management controls.
 * Provides unified view of spot and futures balances with real-time updates.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, components } from '../../constants/theme';
import { useTradingBalance } from '../../hooks';

interface BalancePanelProps {
  isDarkMode?: boolean;
  onTransferPress?: () => void;
  onHistoryPress?: () => void;
  showSpotBalance?: boolean;
  showPortfolioSummary?: boolean;
  compact?: boolean;
}

export const BalancePanel: React.FC<BalancePanelProps> = ({
  isDarkMode = false,
  onTransferPress,
  onHistoryPress,
  showSpotBalance = true,
  showPortfolioSummary = true,
  compact = false,
}) => {
  const {
    spotBalance,
    futuresBalance,
    portfolioValue,
    isLoading,
    lastUpdate,
    error,
    fetchAllBalances,
    formatLastUpdate,
    toggleAutoRefresh,
    isAutoRefreshEnabled,
  } = useTradingBalance();

  const formatCurrency = (amount: number, decimals = 2) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatNumber = (num: number, decimals = 4) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const getPnLColor = (value: number) => {
    if (value > 0) return isDarkMode ? colors.trading.long : colors.pnl.positive;
    if (value < 0) return isDarkMode ? colors.trading.short : colors.pnl.negative;
    return colors.pnl.neutral;
  };

  const renderBalanceItem = (
    label: string,
    value: number,
    subtitle?: string,
    isHighlighted = false,
    isPnL = false,
  ) => (
    <View style={[styles.balanceItem, compact && styles.balanceItemCompact]}>
      <Text style={[styles.balanceLabel, isDarkMode && styles.textDark]}>
        {label}
      </Text>
      <Text
        style={[
          styles.balanceValue,
          isHighlighted && styles.balanceValueHighlighted,
          isPnL && { color: getPnLColor(value) },
          isDarkMode && !isPnL && styles.balanceValueDark,
        ]}
      >
        {formatCurrency(value)}
      </Text>
      {subtitle && (
        <Text style={[styles.balanceSubtitle, isDarkMode && styles.textTertiaryDark]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const renderPortfolioSummary = () => (
    <View style={[styles.portfolioSummary, isDarkMode && styles.portfolioSummaryDark]}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
        Portfolio Overview
      </Text>
      <View style={styles.portfolioGrid}>
        {renderBalanceItem('Total Value', portfolioValue.total, undefined, true)}
        {renderBalanceItem('Unrealized P&L', portfolioValue.unrealizedPnL, undefined, false, true)}
      </View>
      <View style={styles.portfolioBreakdown}>
        <View style={styles.portfolioBreakdownItem}>
          <View style={[styles.portfolioIndicator, { backgroundColor: colors.primary }]} />
          <Text style={[styles.portfolioBreakdownLabel, isDarkMode && styles.textDark]}>
            Futures: {formatCurrency(portfolioValue.futures)}
          </Text>
        </View>
        <View style={styles.portfolioBreakdownItem}>
          <View style={[styles.portfolioIndicator, { backgroundColor: colors.info }]} />
          <Text style={[styles.portfolioBreakdownLabel, isDarkMode && styles.textDark]}>
            Spot: {formatCurrency(portfolioValue.spot)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (error && !futuresBalance && !spotBalance) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, isDarkMode && styles.errorTextDark]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, isDarkMode && styles.retryButtonDark]}
            onPress={() => fetchAllBalances()}
          >
            <Text style={[styles.retryButtonText, isDarkMode && styles.retryButtonTextDark]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark, compact && styles.containerCompact]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.textDark]}>
          Account Balance
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, isAutoRefreshEnabled && styles.headerButtonActive]}
            onPress={toggleAutoRefresh}
          >
            <Text style={styles.headerButtonText}>
              {isAutoRefreshEnabled ? '🔄' : '⏸️'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, isDarkMode && styles.headerButtonDark]}
            onPress={() => fetchAllBalances()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.headerButtonText}>↻</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Portfolio Summary */}
        {showPortfolioSummary && !compact && renderPortfolioSummary()}

        {/* Futures Balance */}
        <View style={[styles.balanceSection, isDarkMode && styles.balanceSectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            Futures Wallet (USDT)
          </Text>
          
          {futuresBalance ? (
            <View style={styles.balanceGrid}>
              {renderBalanceItem('Available', futuresBalance.availableMargin || 0, 'For Trading')}
              {renderBalanceItem('Used Margin', futuresBalance.used || 0, 'In Positions')}
              {renderBalanceItem('Unrealized P&L', futuresBalance.unrealizedPnl || 0, undefined, false, true)}
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, isDarkMode && styles.textDark]}>
                    Loading futures balance...
                  </Text>
                </>
              ) : (
                <Text style={[styles.loadingText, isDarkMode && styles.textDark]}>
                  No futures balance available
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Spot Balance */}
        {showSpotBalance && (
          <View style={[styles.balanceSection, isDarkMode && styles.balanceSectionDark]}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
              Spot Wallet
            </Text>
            
            {spotBalance ? (
              <View style={styles.spotBalanceContainer}>
                <View style={styles.spotBalanceMain}>
                  <Text style={[styles.spotAssetName, isDarkMode && styles.textDark]}>
                    {spotBalance.asset || 'USDT'}
                  </Text>
                  <Text style={[styles.spotBalance, isDarkMode && styles.textDark]}>
                    {formatNumber(spotBalance.balance || 0, 2)}
                  </Text>
                  <Text style={[styles.spotBalanceLabel, isDarkMode && styles.textTertiaryDark]}>
                    Total Balance
                  </Text>
                </View>
                <View style={styles.spotBalanceDetails}>
                  <Text style={[styles.spotAvailable, isDarkMode && styles.textDark]}>
                    {formatNumber(spotBalance.availableBalance || 0, 2)}
                  </Text>
                  <Text style={[styles.spotAvailableLabel, isDarkMode && styles.textTertiaryDark]}>
                    Available
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, isDarkMode && styles.textDark]}>
                  {isLoading ? 'Loading spot balance...' : 'No spot balance available'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Quick Actions */}
        {!compact && (
          <View style={styles.actionsSection}>
            {onTransferPress && (
              <TouchableOpacity
                style={[styles.actionButton, isDarkMode && styles.actionButtonDark]}
                onPress={onTransferPress}
              >
                <Text style={[styles.actionButtonText, isDarkMode && styles.actionButtonTextDark]}>
                  Transfer
                </Text>
              </TouchableOpacity>
            )}
            {onHistoryPress && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary, isDarkMode && styles.actionButtonSecondaryDark]}
                onPress={onHistoryPress}
              >
                <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary, isDarkMode && styles.actionButtonTextSecondaryDark]}>
                  History
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Last Update */}
        {lastUpdate && (
          <Text style={[styles.lastUpdateText, isDarkMode && styles.textTertiaryDark]}>
            Last updated: {formatLastUpdate()}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: components.tradingPanel.borderRadius,
    padding: components.tradingPanel.padding,
    ...components.tradingPanel.shadow,
    margin: spacing.md,
    marginVertical: spacing.sm,
  },
  containerDark: {
    backgroundColor: '#161B22',
  },
  containerCompact: {
    margin: spacing.sm,
    padding: spacing.sm,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonDark: {
    backgroundColor: '#21262D',
  },
  headerButtonActive: {
    backgroundColor: colors.primary,
  },
  headerButtonText: {
    fontSize: 16,
  },

  portfolioSummary: {
    backgroundColor: colors.gray[50],
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  portfolioSummaryDark: {
    backgroundColor: '#0D1117',
  },
  portfolioGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  portfolioBreakdown: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  portfolioBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  portfolioIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  portfolioBreakdownLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },

  balanceSection: {
    backgroundColor: colors.gray[50],
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  balanceSectionDark: {
    backgroundColor: '#0D1117',
  },

  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  balanceItem: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  balanceItemCompact: {
    minWidth: 80,
  },
  balanceLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  balanceValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  balanceValueDark: {
    color: '#F0F6FC',
  },
  balanceValueHighlighted: {
    fontSize: typography.fontSize.xl,
    color: colors.primary,
  },
  balanceSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
    textAlign: 'center',
  },

  spotBalanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotBalanceMain: {
    flex: 1,
    alignItems: 'flex-start',
  },
  spotAssetName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  spotBalance: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  spotBalanceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  spotBalanceDetails: {
    alignItems: 'flex-end',
  },
  spotAvailable: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  spotAvailableLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },

  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errorTextDark: {
    color: '#F85149',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
  },
  retryButtonDark: {
    backgroundColor: '#58A6FF',
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  retryButtonTextDark: {
    color: '#0D1117',
  },

  actionsSection: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    alignItems: 'center',
  },
  actionButtonDark: {
    backgroundColor: '#58A6FF',
  },
  actionButtonSecondary: {
    backgroundColor: colors.gray[200],
  },
  actionButtonSecondaryDark: {
    backgroundColor: '#21262D',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  actionButtonTextDark: {
    color: '#0D1117',
  },
  actionButtonTextSecondary: {
    color: colors.text.primary,
  },
  actionButtonTextSecondaryDark: {
    color: '#F0F6FC',
  },

  lastUpdateText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.sm,
  },

  // Dark mode text overrides
  textDark: {
    color: '#F0F6FC',
  },
  textTertiaryDark: {
    color: '#8B949E',
  },
});