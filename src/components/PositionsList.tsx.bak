import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Position } from '../services/futuresTrading.service';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/formatters';

interface PositionsListProps {
  positions: Position[];
  loading?: boolean;
  onClosePosition: (positionId: string, symbol: string) => void;
  onRefresh?: () => void;
  showActions?: boolean;
}

export const PositionsList: React.FC<PositionsListProps> = ({
  positions,
  loading: _loading = false,
  onClosePosition,
  onRefresh,
  showActions = true,
}) => {
  const handleClosePosition = (position: Position) => {
    Alert.alert(
      'Close Position',
      `Are you sure you want to close ${position.symbol}?\n\nCurrent P&L: ${formatCurrency(position.unrealizedPnl)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Position',
          style: 'destructive',
          onPress: () => onClosePosition(position.id, position.symbol),
        },
      ]
    );
  };

  const calculateLiquidationRisk = (position: Position): string => {
    const currentPrice = position.markPrice;
    const liquidationPrice = position.liquidationPrice;
    const riskPercent = Math.abs((currentPrice - liquidationPrice) / currentPrice) * 100;

    if (riskPercent > 50) return 'Low';
    if (riskPercent > 20) return 'Medium';
    if (riskPercent > 10) return 'High';
    return 'Critical';
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'Low':
        return '#4ADE80';
      case 'Medium':
        return '#FBBF24';
      case 'High':
        return '#F97316';
      case 'Critical':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  if (positions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📈</Text>
        <Text style={styles.emptyTitle}>No Open Positions</Text>
        <Text style={styles.emptyText}>
          Your open positions will appear here once you start trading
        </Text>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {positions.map((position: Position) => {
        const isProfit = position.unrealizedPnl >= 0;
        const liquidationRisk = calculateLiquidationRisk(position);
        const riskColor = getRiskColor(liquidationRisk);

        return (
          <View key={position.id} style={styles.positionCard}>
            {/* Header */}
            <View style={styles.positionHeader}>
              <View style={styles.symbolContainer}>
                <Text style={styles.positionSymbol}>{position.symbol}</Text>
                <View style={styles.badgeContainer}>
                  <View
                    style={[
                      styles.sideBadge,
                      position.side === 'long' ? styles.longBadge : styles.shortBadge,
                    ]}
                  >
                    <Text style={styles.badgeText}>{position.side.toUpperCase()}</Text>
                  </View>
                  <View style={styles.leverageBadge}>
                    <Text style={styles.leverageText}>{position.leverage}x</Text>
                  </View>
                </View>
              </View>

              <View style={styles.pnlContainer}>
                <Text style={[styles.pnlAmount, { color: isProfit ? '#4ADE80' : '#EF4444' }]}>
                  {formatCurrency(position.unrealizedPnl)}
                </Text>
                <Text style={[styles.pnlPercentage, { color: isProfit ? '#4ADE80' : '#EF4444' }]}>
                  {formatPercentage(position.percentage)}
                </Text>
              </View>
            </View>

            {/* Position Details */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Size</Text>
                <Text style={styles.detailValue}>{formatNumber(position.contracts, 4)}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Entry Price</Text>
                <Text style={styles.detailValue}>{formatCurrency(position.entryPrice)}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Mark Price</Text>
                <Text style={styles.detailValue}>{formatCurrency(position.markPrice)}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Margin</Text>
                <Text style={styles.detailValue}>{formatCurrency(position.margin)}</Text>
              </View>
            </View>

            {/* Risk Information */}
            <View style={styles.riskContainer}>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Liquidation</Text>
                <Text style={styles.riskValue}>{formatCurrency(position.liquidationPrice)}</Text>
              </View>

              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Risk Level</Text>
                <View style={[styles.riskBadge, { backgroundColor: riskColor + '20' }]}>
                  <Text style={[styles.riskText, { color: riskColor }]}>{liquidationRisk}</Text>
                </View>
              </View>
            </View>

            {/* Position Time */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                Opened: {new Date(position.timestamp).toLocaleDateString()} at{' '}
                {new Date(position.timestamp).toLocaleTimeString()}
              </Text>
            </View>

            {/* Actions */}
            {showActions && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    // TODO: [MEDIUM] - [2025-01-15] - Claude Code
                    // Implement modify position functionality
                    // Should allow users to:
                    // - Add/reduce position size
                    // - Update stop loss and take profit levels
                    // - Adjust leverage (if supported by exchange)
                    Alert.alert(
                      'Coming Soon',
                      'Position modification feature will be available soon'
                    );
                  }}
                >
                  <Text style={styles.actionButtonText}>📝 Modify</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.closeActionButton]}
                  onPress={() => handleClosePosition(position)}
                >
                  <Text style={styles.closeActionText}>❌ Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  positionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  symbolContainer: {
    flex: 1,
  },
  positionSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  longBadge: {
    backgroundColor: '#D1FAE5',
  },
  shortBadge: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  leverageBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leverageText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  pnlContainer: {
    alignItems: 'flex-end',
  },
  pnlAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  pnlPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  riskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 12,
  },
  riskItem: {
    flex: 1,
  },
  riskLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  riskValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeContainer: {
    marginBottom: 16,
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  closeActionButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  closeActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});
