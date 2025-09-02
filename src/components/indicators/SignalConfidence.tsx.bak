import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IndicatorSignal, IndicatorState } from '../../services/indicator.service';

interface SignalConfidenceProps {
  signal: IndicatorSignal | null;
  indicatorState: IndicatorState | null;
  onTradeSignal?: (signal: IndicatorSignal) => void;
  compact?: boolean;
  showActions?: boolean;
}

// Configuration constants for signal confidence
const SIGNAL_CONFIG = {
  CONFIDENCE_THRESHOLDS: {
    HIGH: 75,
    MEDIUM: 50,
    LOW: 25,
  },
  COLORS: {
    BUY: '#10B981',
    SELL: '#EF4444',
    HOLD: '#6B7280',
    HIGH_CONFIDENCE: '#059669',
    MEDIUM_CONFIDENCE: '#F59E0B',
    LOW_CONFIDENCE: '#EF4444',
    EXCELLENT: '#10B981',
    GOOD: '#3B82F6',
    FAIR: '#F59E0B',
    POOR: '#EF4444',
  },
} as const;

export const SignalConfidence: React.FC<SignalConfidenceProps> = ({
  signal,
  indicatorState,
  onTradeSignal,
  compact = false,
  showActions = true,
}) => {
  if (!signal && !indicatorState) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <Text style={styles.noDataText}>No trading signals available</Text>
      </View>
    );
  }

  const currentSignal = signal || indicatorState?.combinedSignal;
  const dataQuality = indicatorState?.dataQuality || 'POOR';
  const isAnalyzing = indicatorState?.isAnalyzing || false;
  const error = indicatorState?.error;

  if (error) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (isAnalyzing) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <View style={styles.analyzingContainer}>
          <Text style={styles.analyzingIcon}>🔄</Text>
          <Text style={styles.analyzingText}>Analyzing indicators...</Text>
        </View>
      </View>
    );
  }

  if (!currentSignal) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <Text style={styles.noDataText}>No signal data available</Text>
      </View>
    );
  }

  const signalColor = SIGNAL_CONFIG.COLORS[currentSignal.type];
  const confidenceLevel = getConfidenceLevel(currentSignal.strength);
  const confidenceColor = getConfidenceColor(currentSignal.strength);
  const dataQualityColor = getDataQualityColor(dataQuality);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>Trading Signal</Text>
          <View style={[styles.dataQualityBadge, { backgroundColor: `${dataQualityColor}20` }]}>
            <Text style={[styles.dataQualityText, { color: dataQualityColor }]}>
              {dataQuality}
            </Text>
          </View>
        </View>
        
        <View style={styles.compactSignal}>
          <View style={styles.signalTypeContainer}>
            <View style={[styles.signalTypeBadge, { backgroundColor: `${signalColor}20` }]}>
              <Text style={[styles.signalTypeText, { color: signalColor }]}>
                {getSignalEmoji(currentSignal.type)} {currentSignal.type}
              </Text>
            </View>
          </View>
          
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <View style={[styles.confidenceBadge, { backgroundColor: `${confidenceColor}20` }]}>
              <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                {currentSignal.strength}%
              </Text>
            </View>
          </View>
        </View>

        {showActions && currentSignal.type !== 'HOLD' && (
          <TouchableOpacity
            style={[styles.compactActionButton, { backgroundColor: signalColor }]}
            onPress={() => onTradeSignal?.(currentSignal)}
          >
            <Text style={styles.compactActionText}>
              {currentSignal.type === 'BUY' ? 'Execute Buy' : 'Execute Sell'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trading Signal Confidence</Text>
        <View style={[styles.dataQualityBadge, { backgroundColor: `${dataQualityColor}20` }]}>
          <Text style={[styles.dataQualityText, { color: dataQualityColor }]}>
            Data: {dataQuality}
          </Text>
        </View>
      </View>

      {/* Main Signal Display */}
      <View style={[styles.signalCard, { borderLeftColor: signalColor }]}>
        <View style={styles.signalHeader}>
          <View style={styles.signalTypeContainer}>
            <Text style={styles.signalEmoji}>{getSignalEmoji(currentSignal.type)}</Text>
            <Text style={[styles.signalType, { color: signalColor }]}>
              {currentSignal.type} SIGNAL
            </Text>
          </View>
          <Text style={styles.signalTimestamp}>
            {new Date(currentSignal.timestamp).toLocaleTimeString()}
          </Text>
        </View>

        <Text style={styles.signalMessage}>{currentSignal.message}</Text>
        
        <View style={styles.signalDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>${currentSignal.price.toFixed(2)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Source</Text>
            <Text style={styles.detailValue}>{formatSource(currentSignal.source)}</Text>
          </View>
        </View>
      </View>

      {/* Confidence Meter */}
      <View style={styles.confidenceMeter}>
        <Text style={styles.sectionTitle}>Signal Strength</Text>
        <View style={styles.confidenceDisplay}>
          <View style={styles.confidenceBar}>
            <View style={styles.confidenceBarBackground}>
              <View
                style={[
                  styles.confidenceBarFill,
                  {
                    width: `${currentSignal.strength}%`,
                    backgroundColor: confidenceColor,
                  }
                ]}
              />
            </View>
            <Text style={styles.confidencePercentage}>{currentSignal.strength}%</Text>
          </View>
          <View style={[styles.confidenceBadge, { backgroundColor: `${confidenceColor}20` }]}>
            <Text style={[styles.confidenceLevel, { color: confidenceColor }]}>
              {confidenceLevel}
            </Text>
          </View>
        </View>
      </View>

      {/* Signal Reasons */}
      {currentSignal.reasons && currentSignal.reasons.length > 0 && (
        <View style={styles.reasonsSection}>
          <Text style={styles.sectionTitle}>Analysis Factors</Text>
          {currentSignal.reasons.map((reason, index) => (
            <View key={index} style={styles.reasonItem}>
              <Text style={styles.reasonBullet}>•</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      {showActions && currentSignal.type !== 'HOLD' && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: signalColor }]}
            onPress={() => onTradeSignal?.(currentSignal)}
          >
            <Text style={styles.actionButtonText}>
              {currentSignal.type === 'BUY' ? '📈 Execute Buy Order' : '📉 Execute Sell Order'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.actionDisclaimer}>
            Always review market conditions before trading
          </Text>
        </View>
      )}

      {/* Additional Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Data Quality</Text>
          <View style={[styles.statBadge, { backgroundColor: `${dataQualityColor}20` }]}>
            <Text style={[styles.statValue, { color: dataQualityColor }]}>
              {dataQuality}
            </Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Last Update</Text>
          <Text style={styles.statValue}>
            {indicatorState ? new Date(indicatorState.lastUpdate).toLocaleTimeString() : 'Unknown'}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Helper functions
function getSignalEmoji(type: 'BUY' | 'SELL' | 'HOLD'): string {
  switch (type) {
    case 'BUY': return '📈';
    case 'SELL': return '📉';
    case 'HOLD': return '⏸️';
    default: return '❓';
  }
}

function getConfidenceLevel(strength: number): string {
  if (strength >= SIGNAL_CONFIG.CONFIDENCE_THRESHOLDS.HIGH) return 'HIGH';
  if (strength >= SIGNAL_CONFIG.CONFIDENCE_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

function getConfidenceColor(strength: number): string {
  if (strength >= SIGNAL_CONFIG.CONFIDENCE_THRESHOLDS.HIGH) return SIGNAL_CONFIG.COLORS.HIGH_CONFIDENCE;
  if (strength >= SIGNAL_CONFIG.CONFIDENCE_THRESHOLDS.MEDIUM) return SIGNAL_CONFIG.COLORS.MEDIUM_CONFIDENCE;
  return SIGNAL_CONFIG.COLORS.LOW_CONFIDENCE;
}

function getDataQualityColor(quality: string): string {
  switch (quality) {
    case 'EXCELLENT': return SIGNAL_CONFIG.COLORS.EXCELLENT;
    case 'GOOD': return SIGNAL_CONFIG.COLORS.GOOD;
    case 'FAIR': return SIGNAL_CONFIG.COLORS.FAIR;
    case 'POOR': return SIGNAL_CONFIG.COLORS.POOR;
    default: return SIGNAL_CONFIG.COLORS.POOR;
  }
}

function formatSource(source: string): string {
  switch (source) {
    case 'ACTION_ZONE': return 'Action Zone';
    case 'RSI_DIVERGENCE': return 'RSI Divergence';
    case 'COMBINED': return 'Multi-Indicator';
    default: return source;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dataQualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dataQualityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  signalCard: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signalTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalEmoji: {
    fontSize: 20,
  },
  signalType: {
    fontSize: 16,
    fontWeight: '600',
  },
  signalTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  signalTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  signalTimestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  signalMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  signalDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  compactSignal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  confidenceMeter: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  confidenceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confidenceBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidencePercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    minWidth: 35,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reasonsSection: {
    marginBottom: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  reasonBullet: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
    marginTop: 2,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionSection: {
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  compactActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  compactActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionDisclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  statBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  errorIcon: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  analyzingIcon: {
    fontSize: 20,
  },
  analyzingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default SignalConfidence;