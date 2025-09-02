import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTradingStore } from '../stores/tradingStore';
import { PositionsList } from '../components/PositionsList';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export const PositionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [showClosedPositions, setShowClosedPositions] = useState(false);

  const {
    positions,
    balances,
    activeExchange,
    loading,
    refreshing,
    isConnected,
    refreshAll,
    closePosition,
    setActiveExchange,
  } = useTradingStore();

  useEffect(() => {
    // Refresh positions when screen loads
    if (isConnected[activeExchange]) {
      refreshAll();
    }
  }, [activeExchange, isConnected]);

  const handleClosePosition = async (positionId: string, positionSymbol: string) => {
    const success = await closePosition(positionSymbol);
    if (success) {
      Alert.alert('Success', 'Position closed successfully');
      await refreshAll();
    }
  };

  const calculateTotalPnL = () => {
    return positions.reduce((total, position) => total + position.unrealizedPnl, 0);
  };

  const calculateTotalMargin = () => {
    return positions.reduce((total, position) => total + position.margin, 0);
  };

  const getPositionStats = () => {
    const totalPositions = positions.length;
    const profitablePositions = positions.filter((p) => p.unrealizedPnl > 0).length;
    const losingPositions = positions.filter((p) => p.unrealizedPnl < 0).length;

    return { totalPositions, profitablePositions, losingPositions };
  };

  const stats = getPositionStats();
  const totalPnL = calculateTotalPnL();
  const totalMargin = calculateTotalMargin();
  const balance = balances[activeExchange];
  const isExchangeConnected = isConnected[activeExchange];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Positions</Text>

        {/* Exchange Selector */}
        <View style={styles.exchangeTabs}>
          <TouchableOpacity
            style={[styles.exchangeTab, activeExchange === 'binance' && styles.activeTab]}
            onPress={() => setActiveExchange('binance')}
          >
            <Text style={[styles.tabText, activeExchange === 'binance' && styles.activeTabText]}>
              Binance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exchangeTab, activeExchange === 'gate' && styles.activeTab]}
            onPress={() => setActiveExchange('gate')}
          >
            <Text style={[styles.tabText, activeExchange === 'gate' && styles.activeTabText]}>
              Gate.io
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isExchangeConnected ? (
        <View style={styles.notConnectedContainer}>
          <Text style={styles.notConnectedIcon}>🔌</Text>
          <Text style={styles.notConnectedTitle}>Exchange Not Connected</Text>
          <Text style={styles.notConnectedText}>
            Connect to {activeExchange === 'binance' ? 'Binance' : 'Gate.io'} to view your positions
          </Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => navigation.navigate('Trading')}
          >
            <Text style={styles.connectButtonText}>Go to Trading</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Portfolio Summary */}
          {balance && (
            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Portfolio Summary</Text>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total P&L</Text>
                  <Text
                    style={[styles.summaryValue, { color: totalPnL >= 0 ? '#4ADE80' : '#EF4444' }]}
                  >
                    {formatCurrency(totalPnL)}
                  </Text>
                  <Text
                    style={[
                      styles.summarySubValue,
                      { color: totalPnL >= 0 ? '#4ADE80' : '#EF4444' },
                    ]}
                  >
                    {totalMargin > 0 ? formatPercentage((totalPnL / totalMargin) * 100) : '0.00%'}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Margin Used</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(totalMargin)}</Text>
                  <Text style={styles.summarySubValue}>
                    Available: {formatCurrency(balance.availableMargin)}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Open Positions</Text>
                  <Text style={styles.statValue}>{stats.totalPositions}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Profitable</Text>
                  <Text style={[styles.statValue, { color: '#4ADE80' }]}>
                    {stats.profitablePositions}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Losing</Text>
                  <Text style={[styles.statValue, { color: '#EF4444' }]}>
                    {stats.losingPositions}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Position Controls */}
          <View style={styles.controlsCard}>
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Show Closed Positions</Text>
              <Switch
                value={showClosedPositions}
                onValueChange={setShowClosedPositions}
                trackColor={{ false: '#767577', true: '#4ADE80' }}
              />
            </View>

            {positions.length > 0 && (
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => {
                  // TODO: [HIGH] - [2025-01-15] - Claude Code
                  // Implement bulk position management
                  // Features to include:
                  // - Close all positions
                  // - Close all profitable positions
                  // - Close all losing positions
                  // - Set stop loss for all positions
                  // - Set take profit for all positions
                  Alert.alert(
                    'Coming Soon',
                    'Bulk position management features will be available soon'
                  );
                }}
              >
                <Text style={styles.manageButtonText}>📊 Manage All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Positions List */}
          <View style={styles.positionsCard}>
            <PositionsList
              positions={positions}
              loading={loading}
              onClosePosition={handleClosePosition}
              onRefresh={refreshAll}
              showActions={true}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Trading')}
              >
                <Text style={styles.quickActionIcon}>📈</Text>
                <Text style={styles.quickActionText}>New Position</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => {
                  // TODO: [MEDIUM] - [2025-01-15] - Claude Code
                  // Implement position history/analytics screen
                  // Should show:
                  // - Closed positions history
                  // - Performance analytics
                  // - Trading statistics
                  // - P&L charts
                  Alert.alert(
                    'Coming Soon',
                    'Position history and analytics will be available soon'
                  );
                }}
              >
                <Text style={styles.quickActionIcon}>📊</Text>
                <Text style={styles.quickActionText}>Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Text style={styles.quickActionIcon}>⚙️</Text>
                <Text style={styles.quickActionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  exchangeTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  exchangeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notConnectedIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  notConnectedTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  notConnectedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  connectButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  summarySubValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  controlsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  manageButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  manageButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  positionsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    paddingBottom: 8,
    borderRadius: 12,
  },
  quickActionsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});

export default PositionsScreen;
