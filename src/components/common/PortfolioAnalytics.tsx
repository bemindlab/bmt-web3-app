/**
 * Professional Portfolio Analytics Component
 * 
 * Advanced portfolio performance tracking, P&L analysis, and trading statistics.
 * Provides institutional-grade analytics for professional traders.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, components, getPnLColor } from '../../constants/theme';
import { useTradingStore } from '../../stores/tradingStore';
import { useTradingBalance } from '../../hooks';

interface PortfolioAnalyticsProps {
  isDarkMode?: boolean;
  timeframe?: 'day' | 'week' | 'month' | 'all';
  showCharts?: boolean;
  compact?: boolean;
}

interface PortfolioMetrics {
  // Performance metrics
  totalPnL: number;
  totalPnLPercentage: number;
  realizedPnL: number;
  unrealizedPnL: number;
  
  // Trading statistics
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  avgTrade: number;
  
  // Risk metrics
  sharpeRatio: number;
  maxDrawdown: number;
  recoveryFactor: number;
  profitFactor: number;
  
  // Volume metrics
  totalVolume: number;
  avgPositionSize: number;
  largestWin: number;
  largestLoss: number;
  
  // Time-based metrics
  avgHoldingTime: number;
  tradesPerDay: number;
  bestTradingDay: number;
  worstTradingDay: number;
}



export const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({
  isDarkMode = false,
  timeframe = 'week',
  _showCharts = true,
  compact = false,
}) => {
  const { tradeHistory, positions } = useTradingStore();
  const { portfolioValue } = useTradingBalance();

  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [activeMetricTab, setActiveMetricTab] = useState<'performance' | 'risk' | 'volume'>('performance');

  // Calculate portfolio metrics
  const metrics = useMemo((): PortfolioMetrics => {
    // Filter trades by timeframe
    const now = Date.now();
    const timeframeDays = {
      day: 1,
      week: 7,
      month: 30,
      all: 365 * 10, // 10 years
    };
    
    const cutoffTime = now - (timeframeDays[selectedTimeframe] * 24 * 60 * 60 * 1000);
    const filteredTrades = tradeHistory.filter(trade => trade.timestamp >= cutoffTime);
    
    if (filteredTrades.length === 0) {
      return {
        totalPnL: portfolioValue.unrealizedPnL,
        totalPnLPercentage: 0,
        realizedPnL: 0,
        unrealizedPnL: portfolioValue.unrealizedPnL,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        avgTrade: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        recoveryFactor: 0,
        profitFactor: 0,
        totalVolume: 0,
        avgPositionSize: 0,
        largestWin: 0,
        largestLoss: 0,
        avgHoldingTime: 0,
        tradesPerDay: 0,
        bestTradingDay: 0,
        worstTradingDay: 0,
      };
    }

    // Basic P&L calculations
    const realizedPnL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const unrealizedPnL = positions.reduce((sum, pos) => sum + (pos.unrealizedPnl || 0), 0);
    const totalPnL = realizedPnL + unrealizedPnL;
    
    // Trading statistics
    const winningTrades = filteredTrades.filter(trade => (trade.pnl || 0) > 0);
    const losingTrades = filteredTrades.filter(trade => (trade.pnl || 0) < 0);
    const winRate = filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0;
    
    const avgWin = winningTrades.length > 0 ? 
      winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? 
      Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losingTrades.length) : 0;
    const avgTrade = filteredTrades.length > 0 ? realizedPnL / filteredTrades.length : 0;

    // Risk metrics
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
    const sharpeRatio = calculateSharpeRatio(filteredTrades);
    const maxDrawdown = calculateMaxDrawdown(filteredTrades);
    const recoveryFactor = maxDrawdown > 0 ? totalPnL / Math.abs(maxDrawdown) : 0;

    // Volume metrics
    const totalVolume = filteredTrades.reduce((sum, trade) => sum + (trade.amount * trade.entryPrice), 0);
    const avgPositionSize = filteredTrades.length > 0 ? totalVolume / filteredTrades.length : 0;
    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl || 0)) : 0;
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl || 0)) : 0;

    // Time-based metrics
    const avgHoldingTime = calculateAvgHoldingTime(filteredTrades);
    const tradesPerDay = filteredTrades.length / timeframeDays[selectedTimeframe];
    const dailyPnL = calculateDailyPnL(filteredTrades);
    const bestTradingDay = dailyPnL.length > 0 ? Math.max(...dailyPnL) : 0;
    const worstTradingDay = dailyPnL.length > 0 ? Math.min(...dailyPnL) : 0;

    // Portfolio percentage calculation
    const initialBalance = portfolioValue.total - totalPnL;
    const totalPnLPercentage = initialBalance > 0 ? (totalPnL / initialBalance) * 100 : 0;

    return {
      totalPnL,
      totalPnLPercentage,
      realizedPnL,
      unrealizedPnL,
      totalTrades: filteredTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      avgWin,
      avgLoss,
      avgTrade,
      sharpeRatio,
      maxDrawdown,
      recoveryFactor,
      profitFactor,
      totalVolume,
      avgPositionSize,
      largestWin,
      largestLoss,
      avgHoldingTime,
      tradesPerDay,
      bestTradingDay,
      worstTradingDay,
    };
  }, [tradeHistory, positions, portfolioValue, selectedTimeframe]);

  const calculateSharpeRatio = (trades: any[]): number => {
    if (trades.length < 2) return 0;
    
    const returns = trades.map(trade => (trade.pnl || 0) / (trade.amount * trade.entryPrice) * 100);
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? (avgReturn * Math.sqrt(252)) / (stdDev * Math.sqrt(252)) : 0; // Annualized
  };

  const calculateMaxDrawdown = (trades: any[]): number => {
    if (trades.length === 0) return 0;
    
    let peak = 0;
    let maxDrawdown = 0;
    let runningPnL = 0;
    
    for (const trade of trades.sort((a, b) => a.timestamp - b.timestamp)) {
      runningPnL += trade.pnl || 0;
      if (runningPnL > peak) {
        peak = runningPnL;
      }
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  };

  const calculateAvgHoldingTime = (trades: any[]): number => {
    const completedTrades = trades.filter(trade => trade.exitTime);
    if (completedTrades.length === 0) return 0;
    
    const totalHoldingTime = completedTrades.reduce((sum, trade) => {
      return sum + (trade.exitTime - trade.timestamp);
    }, 0);
    
    return totalHoldingTime / completedTrades.length / (1000 * 60 * 60); // Convert to hours
  };

  const calculateDailyPnL = (trades: any[]): number[] => {
    const dailyMap = new Map<string, number>();
    
    trades.forEach(trade => {
      const date = new Date(trade.timestamp).toDateString();
      dailyMap.set(date, (dailyMap.get(date) || 0) + (trade.pnl || 0));
    });
    
    return Array.from(dailyMap.values());
  };

  const formatCurrency = (amount: number, decimals = 2) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatPercentage = (value: number, showSign = true) => {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${(hours * 60).toFixed(0)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  const renderMetricCard = (
    title: string,
    value: string,
    subtitle?: string,
    color?: string,
    size: 'small' | 'medium' | 'large' = 'medium'
  ) => {
    const cardStyle = [
      styles.metricCard,
      size === 'small' && styles.metricCardSmall,
      size === 'large' && styles.metricCardLarge,
      isDarkMode && styles.metricCardDark,
    ];

    return (
      <View style={cardStyle}>
        <Text style={[styles.metricTitle, isDarkMode && styles.textTertiaryDark]}>
          {title}
        </Text>
        <Text
          style={[
            styles.metricValue,
            size === 'large' && styles.metricValueLarge,
            color && { color },
            isDarkMode && !color && styles.textDark,
          ]}
        >
          {value}
        </Text>
        {subtitle && (
          <Text style={[styles.metricSubtitle, isDarkMode && styles.textTertiaryDark]}>
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  const renderTimeframeButtons = () => (
    <View style={styles.timeframeButtons}>
      {(['day', 'week', 'month', 'all'] as const).map((tf) => (
        <TouchableOpacity
          key={tf}
          style={[
            styles.timeframeButton,
            selectedTimeframe === tf && styles.timeframeButtonActive,
            isDarkMode && styles.timeframeButtonDark,
          ]}
          onPress={() => setSelectedTimeframe(tf)}
        >
          <Text
            style={[
              styles.timeframeButtonText,
              selectedTimeframe === tf && styles.timeframeButtonTextActive,
              isDarkMode && styles.timeframeButtonTextDark,
            ]}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPerformanceMetrics = () => (
    <View style={styles.metricsGrid}>
      {renderMetricCard(
        'Total P&L',
        formatCurrency(metrics.totalPnL),
        formatPercentage(metrics.totalPnLPercentage),
        getPnLColor(metrics.totalPnL, isDarkMode ? 'dark' : 'light'),
        'large'
      )}
      {renderMetricCard(
        'Realized P&L',
        formatCurrency(metrics.realizedPnL),
        undefined,
        getPnLColor(metrics.realizedPnL, isDarkMode ? 'dark' : 'light')
      )}
      {renderMetricCard(
        'Unrealized P&L',
        formatCurrency(metrics.unrealizedPnL),
        undefined,
        getPnLColor(metrics.unrealizedPnL, isDarkMode ? 'dark' : 'light')
      )}
      {renderMetricCard(
        'Win Rate',
        formatPercentage(metrics.winRate, false),
        `${metrics.winningTrades}W / ${metrics.losingTrades}L`,
        metrics.winRate >= 60 ? colors.success : metrics.winRate >= 40 ? colors.warning : colors.danger
      )}
      {renderMetricCard(
        'Avg Win',
        formatCurrency(metrics.avgWin),
        undefined,
        colors.success
      )}
      {renderMetricCard(
        'Avg Loss',
        formatCurrency(metrics.avgLoss),
        undefined,
        colors.danger
      )}
    </View>
  );

  const renderRiskMetrics = () => (
    <View style={styles.metricsGrid}>
      {renderMetricCard(
        'Sharpe Ratio',
        metrics.sharpeRatio.toFixed(2),
        'Risk-adjusted return',
        metrics.sharpeRatio >= 1 ? colors.success : metrics.sharpeRatio >= 0.5 ? colors.warning : colors.danger,
        'large'
      )}
      {renderMetricCard(
        'Max Drawdown',
        formatCurrency(metrics.maxDrawdown),
        'Peak-to-trough',
        colors.danger
      )}
      {renderMetricCard(
        'Recovery Factor',
        metrics.recoveryFactor.toFixed(2),
        'Return/Drawdown',
        metrics.recoveryFactor >= 2 ? colors.success : colors.warning
      )}
      {renderMetricCard(
        'Profit Factor',
        metrics.profitFactor.toFixed(2),
        'Avg Win/Avg Loss',
        metrics.profitFactor >= 2 ? colors.success : metrics.profitFactor >= 1.5 ? colors.warning : colors.danger
      )}
      {renderMetricCard(
        'Largest Win',
        formatCurrency(metrics.largestWin),
        undefined,
        colors.success
      )}
      {renderMetricCard(
        'Largest Loss',
        formatCurrency(metrics.largestLoss),
        undefined,
        colors.danger
      )}
    </View>
  );

  const renderVolumeMetrics = () => (
    <View style={styles.metricsGrid}>
      {renderMetricCard(
        'Total Volume',
        formatCurrency(metrics.totalVolume, 0),
        `${metrics.totalTrades} trades`,
        undefined,
        'large'
      )}
      {renderMetricCard(
        'Avg Position',
        formatCurrency(metrics.avgPositionSize),
        'Per trade'
      )}
      {renderMetricCard(
        'Avg Trade',
        formatCurrency(metrics.avgTrade),
        'P&L per trade',
        getPnLColor(metrics.avgTrade, isDarkMode ? 'dark' : 'light')
      )}
      {renderMetricCard(
        'Trades/Day',
        metrics.tradesPerDay.toFixed(1),
        'Activity level'
      )}
      {renderMetricCard(
        'Avg Hold Time',
        formatTime(metrics.avgHoldingTime),
        'Per position'
      )}
      {renderMetricCard(
        'Best Day',
        formatCurrency(metrics.bestTradingDay),
        'Single day P&L',
        colors.success
      )}
    </View>
  );

  if (compact) {
    return (
      <View style={[styles.container, styles.containerCompact, isDarkMode && styles.containerDark]}>
        <View style={styles.compactHeader}>
          <Text style={[styles.title, isDarkMode && styles.textDark]}>
            Portfolio
          </Text>
          <Text style={[styles.compactPnL, { color: getPnLColor(metrics.totalPnL, isDarkMode ? 'dark' : 'light') }]}>
            {formatCurrency(metrics.totalPnL)} ({formatPercentage(metrics.totalPnLPercentage)})
          </Text>
        </View>
        <View style={styles.compactMetrics}>
          {renderMetricCard('Win Rate', formatPercentage(metrics.winRate, false), undefined, undefined, 'small')}
          {renderMetricCard('Trades', metrics.totalTrades.toString(), undefined, undefined, 'small')}
          {renderMetricCard('Sharpe', metrics.sharpeRatio.toFixed(2), undefined, undefined, 'small')}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDarkMode && styles.textDark]}>
            Portfolio Analytics
          </Text>
          {renderTimeframeButtons()}
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
          <View style={styles.summaryMain}>
            <Text style={[styles.summaryLabel, isDarkMode && styles.textTertiaryDark]}>
              Total P&L ({selectedTimeframe})
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: getPnLColor(metrics.totalPnL, isDarkMode ? 'dark' : 'light') },
              ]}
            >
              {formatCurrency(metrics.totalPnL)}
            </Text>
            <Text
              style={[
                styles.summaryPercentage,
                { color: getPnLColor(metrics.totalPnL, isDarkMode ? 'dark' : 'light') },
              ]}
            >
              {formatPercentage(metrics.totalPnLPercentage)}
            </Text>
          </View>
          <View style={styles.summaryStats}>
            <Text style={[styles.summaryStatText, isDarkMode && styles.textSecondaryDark]}>
              {metrics.totalTrades} trades
            </Text>
            <Text style={[styles.summaryStatText, isDarkMode && styles.textSecondaryDark]}>
              {formatPercentage(metrics.winRate, false)} win rate
            </Text>
          </View>
        </View>

        {/* Metric Tabs */}
        <View style={styles.metricTabs}>
          {[
            { key: 'performance', label: 'Performance', icon: '📈' },
            { key: 'risk', label: 'Risk', icon: '⚖️' },
            { key: 'volume', label: 'Volume', icon: '📊' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.metricTab,
                activeMetricTab === tab.key && styles.metricTabActive,
                isDarkMode && styles.metricTabDark,
              ]}
              onPress={() => setActiveMetricTab(tab.key as any)}
            >
              <Text style={styles.metricTabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.metricTabText,
                  activeMetricTab === tab.key && styles.metricTabTextActive,
                  isDarkMode && styles.metricTabTextDark,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Metrics Content */}
        {activeMetricTab === 'performance' && renderPerformanceMetrics()}
        {activeMetricTab === 'risk' && renderRiskMetrics()}
        {activeMetricTab === 'volume' && renderVolumeMetrics()}

        {/* No Data Message */}
        {metrics.totalTrades === 0 && (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, isDarkMode && styles.textSecondaryDark]}>
              No trading data available for {selectedTimeframe}
            </Text>
            <Text style={[styles.noDataSubtext, isDarkMode && styles.textTertiaryDark]}>
              Start trading to see your performance analytics
            </Text>
          </View>
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
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  compactHeader: {
    marginBottom: spacing.sm,
  },
  compactPnL: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
  },
  compactMetrics: {
    flexDirection: 'row',
    gap: spacing.xs,
  },

  timeframeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timeframeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    backgroundColor: colors.gray[100],
  },
  timeframeButtonDark: {
    backgroundColor: '#21262D',
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeframeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  timeframeButtonTextDark: {
    color: '#C9D1D9',
  },
  timeframeButtonTextActive: {
    color: colors.white,
  },

  summaryCard: {
    backgroundColor: colors.gray[50],
    borderRadius: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryCardDark: {
    backgroundColor: '#0D1117',
  },
  summaryMain: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  summaryValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  summaryPercentage: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },

  metricTabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  metricTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: spacing.md,
  },
  metricTabDark: {
    backgroundColor: '#21262D',
  },
  metricTabActive: {
    backgroundColor: colors.primary,
  },
  metricTabIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  metricTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  metricTabTextDark: {
    color: '#C9D1D9',
  },
  metricTabTextActive: {
    color: colors.white,
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.gray[50],
    borderRadius: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  metricCardDark: {
    backgroundColor: '#0D1117',
  },
  metricCardSmall: {
    minWidth: '28%',
    padding: spacing.sm,
  },
  metricCardLarge: {
    minWidth: '100%',
    padding: spacing.lg,
  },
  metricTitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  metricValueLarge: {
    fontSize: typography.fontSize.xl,
  },
  metricSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  noDataContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  noDataText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  noDataSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },

  // Dark mode text overrides
  textDark: {
    color: '#F0F6FC',
  },
  textSecondaryDark: {
    color: '#C9D1D9',
  },
  textTertiaryDark: {
    color: '#8B949E',
  },
});