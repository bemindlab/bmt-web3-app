import React, { memo, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useTradingStore } from '../stores/tradingStore';
import IndicatorService, { MarketDataPoint } from '../services/indicator.service';
import ActionZoneDisplay from './ActionZoneDisplay';
import RSIChart from './RSIChart';
import SignalConfidence from './SignalConfidence';

interface IndicatorPanelProps {
  symbol: string;
  marketData?: MarketDataPoint[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  compactMode?: boolean;
  onSignalGenerated?: (signal: 'BUY' | 'SELL', confidence: number) => void;
  style?: any;
}

const IndicatorPanel: React.FC<IndicatorPanelProps> = ({
  symbol,
  marketData,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  compactMode = false,
  onSignalGenerated,
  style,
}) => {
  const {
    updateMarketDataForIndicators,
    getIndicatorSignals,
    refreshIndicators,
    indicatorLoading,
    lastIndicatorUpdate,
  } = useTradingStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current signals from store
  const signals = getIndicatorSignals(symbol);
  const lastUpdate = lastIndicatorUpdate.get(symbol);

  // Initialize with mock data if no market data provided
  useEffect(() => {
    if (!hasData && !marketData?.length) {
      console.log(`📊 Generating mock data for indicators (${symbol})`);
      const mockData = IndicatorService.generateMockData(symbol, 100);
      updateMarketDataForIndicators(symbol, mockData);
      setHasData(true);
      setError(null);
    } else if (marketData?.length) {
      console.log(`📊 Updating indicators with real data (${symbol}): ${marketData.length} candles`);
      updateMarketDataForIndicators(symbol, marketData);
      setHasData(true);
      setError(null);
    }
  }, [symbol, marketData, updateMarketDataForIndicators, hasData]);

  // Auto-refresh indicators
  useEffect(() => {
    if (!autoRefresh || !hasData) return;

    const interval = setInterval(() => {
      console.log(`🔄 Auto-refreshing indicators for ${symbol}`);
      refreshIndicators(symbol);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, hasData, symbol, refreshIndicators]);

  // Handle signal generation callback
  useEffect(() => {
    if (!signals || !onSignalGenerated) return;

    const { actionZone, combinedSignal } = signals;
    
    if (actionZone.isBuySignal) {
      onSignalGenerated('BUY', combinedSignal.overall);
    } else if (actionZone.isSellSignal) {
      onSignalGenerated('SELL', combinedSignal.overall);
    }
  }, [signals, onSignalGenerated]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Generate new mock data if no real data
      if (!marketData?.length) {
        const mockData = IndicatorService.generateMockData(symbol, 100);
        updateMarketDataForIndicators(symbol, mockData);
      }
      
      refreshIndicators(symbol);
      setHasData(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh indicators');
      console.error('Error refreshing indicators:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [symbol, marketData, updateMarketDataForIndicators, refreshIndicators]);

  // Get RSI data array for chart
  const getRSIDataForChart = useCallback(() => {
    if (!signals) return [];
    
    // For now, return single point. In real implementation, 
    // you'd want historical RSI data from the service
    return [signals.rsiDivergence];
  }, [signals]);

  // Get price data for RSI chart
  const getPriceDataForChart = useCallback(() => {
    const data = IndicatorService.getMarketData(symbol);
    return data ? data.map(d => d.close) : [];
  }, [symbol]);

  // Loading state
  if (indicatorLoading && !signals) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading indicators...</Text>
      </View>
    );
  }

  // Error state
  if (error && !signals) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No data state
  if (!signals) {
    return (
      <View style={[styles.container, styles.noDataContainer, style]}>
        <Text style={styles.noDataText}>No indicator data available</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Load Indicators</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rsiData = getRSIDataForChart();
  const priceData = getPriceDataForChart();

  return (
    <ScrollView
      style={[styles.container, style]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#3B82F6']}
          tintColor="#3B82F6"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, compactMode && styles.compactTitle]}>
          Trading Indicators
        </Text>
        <View style={styles.headerRight}>
          {lastUpdate && (
            <Text style={styles.lastUpdateText}>
              {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
          <TouchableOpacity
            style={styles.refreshIconButton}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <Text style={styles.refreshIcon}>
              {isRefreshing ? '⏳' : '🔄'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Signal Confidence - Always at top for quick reference */}
      <View style={[styles.section, compactMode && styles.compactSection]}>
        <SignalConfidence
          signalStrength={signals.combinedSignal}
          size={compactMode ? 'compact' : 'full'}
          showDetails={!compactMode}
        />
      </View>

      {/* Action Zone Display */}
      <View style={[styles.section, compactMode && styles.compactSection]}>
        <ActionZoneDisplay
          result={signals.actionZone}
          size={compactMode ? 'small' : 'medium'}
          showDetails={!compactMode}
        />
      </View>

      {/* RSI Chart */}
      {(!compactMode || rsiData.length > 0) && (
        <View style={[styles.section, compactMode && styles.compactSection]}>
          <RSIChart
            rsiData={rsiData}
            prices={priceData}
            height={compactMode ? 80 : 120}
            showDivergences={!compactMode}
            compactMode={compactMode}
          />
        </View>
      )}

      {/* Signal Summary - Compact mode only */}
      {compactMode && (
        <View style={styles.compactSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Latest Signals:</Text>
            <View style={styles.signalIndicators}>
              {signals.actionZone.isBuySignal && (
                <Text style={styles.buySignalIndicator}>📈 BUY</Text>
              )}
              {signals.actionZone.isSellSignal && (
                <Text style={styles.sellSignalIndicator}>📉 SELL</Text>
              )}
              {signals.rsiDivergence.bullishDivergence && (
                <Text style={styles.bullishDivergenceIndicator}>🟢 Bull Div</Text>
              )}
              {signals.rsiDivergence.bearishDivergence && (
                <Text style={styles.bearishDivergenceIndicator}>🔴 Bear Div</Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Debug info (development only) */}
      {__DEV__ && !compactMode && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text style={styles.debugText}>Symbol: {symbol}</Text>
          <Text style={styles.debugText}>Data Points: {priceData.length}</Text>
          <Text style={styles.debugText}>
            Service Diagnostics: {JSON.stringify(IndicatorService.getDiagnostics(), null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  compactTitle: {
    fontSize: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  refreshIconButton: {
    padding: 4,
  },
  refreshIcon: {
    fontSize: 16,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  compactSection: {
    marginVertical: 6,
  },
  compactSummary: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  signalIndicators: {
    flexDirection: 'row',
    gap: 8,
  },
  buySignalIndicator: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sellSignalIndicator: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bullishDivergenceIndicator: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bearishDivergenceIndicator: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  debugContainer: {
    backgroundColor: '#F3F4F6',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

export default memo(IndicatorPanel);