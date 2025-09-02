import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActionZoneResult, ActionZone, TrendDirection } from '../../lib/indicators/action-zone';

interface ActionZoneDisplayProps {
  result: ActionZoneResult | null;
  compact?: boolean;
}

// Color scheme configuration for Action Zones
const ZONE_COLORS = {
  [ActionZone.GREEN]: '#10B981', // Strong buy - green
  [ActionZone.BLUE]: '#3B82F6', // Buy - blue
  [ActionZone.LIGHT_BLUE]: '#60A5FA', // Pre-buy - light blue
  [ActionZone.GRAY]: '#6B7280', // Neutral - gray
  [ActionZone.YELLOW]: '#F59E0B', // Pre-sell - yellow
  [ActionZone.ORANGE]: '#F97316', // Sell - orange
  [ActionZone.RED]: '#EF4444', // Strong sell - red
} as const;

const TREND_COLORS = {
  [TrendDirection.BULLISH]: '#10B981',
  [TrendDirection.BEARISH]: '#EF4444',
  [TrendDirection.NEUTRAL]: '#6B7280',
} as const;

const ZONE_LABELS = {
  [ActionZone.GREEN]: 'Strong Buy',
  [ActionZone.BLUE]: 'Buy',
  [ActionZone.LIGHT_BLUE]: 'Pre-Buy',
  [ActionZone.GRAY]: 'Neutral',
  [ActionZone.YELLOW]: 'Pre-Sell',
  [ActionZone.ORANGE]: 'Sell',
  [ActionZone.RED]: 'Strong Sell',
} as const;

const TREND_LABELS = {
  [TrendDirection.BULLISH]: 'Bullish',
  [TrendDirection.BEARISH]: 'Bearish',
  [TrendDirection.NEUTRAL]: 'Neutral',
} as const;

export const ActionZoneDisplay: React.FC<ActionZoneDisplayProps> = ({ result, compact = false }) => {
  if (!result) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <Text style={styles.noDataText}>No Action Zone data available</Text>
      </View>
    );
  }

  const zoneColor = ZONE_COLORS[result.zone];
  const trendColor = TREND_COLORS[result.trend];
  const zoneLabel = ZONE_LABELS[result.zone];
  const trendLabel = TREND_LABELS[result.trend];

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>Action Zone</Text>
          <View style={[styles.strengthBadge, { backgroundColor: `${zoneColor}20` }]}>
            <Text style={[styles.strengthText, { color: zoneColor }]}>
              {result.strength}%
            </Text>
          </View>
        </View>
        
        <View style={styles.compactContent}>
          <View style={styles.zoneIndicator}>
            <View style={[styles.zoneDot, { backgroundColor: zoneColor }]} />
            <Text style={[styles.zoneText, { color: zoneColor }]}>{zoneLabel}</Text>
          </View>
          
          <View style={styles.trendIndicator}>
            <Text style={[styles.trendText, { color: trendColor }]}>
              {trendLabel} Trend
            </Text>
          </View>
        </View>

        {(result.isBuySignal || result.isSellSignal) && (
          <View style={[styles.signalAlert, { borderLeftColor: zoneColor }]}>
            <Text style={[styles.signalText, { color: zoneColor }]}>
              {result.isBuySignal ? '📈 BUY SIGNAL' : '📉 SELL SIGNAL'}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Action Zone Analysis</Text>
        <View style={[styles.strengthBadge, { backgroundColor: `${zoneColor}20` }]}>
          <Text style={[styles.strengthText, { color: zoneColor }]}>
            Strength: {result.strength}%
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Zone Display */}
        <View style={styles.zoneDisplay}>
          <Text style={styles.label}>Current Zone</Text>
          <View style={styles.zoneContainer}>
            <View style={[styles.zoneColorBar, { backgroundColor: zoneColor }]} />
            <View style={styles.zoneInfo}>
              <Text style={[styles.zoneName, { color: zoneColor }]}>{zoneLabel}</Text>
              <Text style={styles.zoneDescription}>
                {getZoneDescription(result.zone)}
              </Text>
            </View>
          </View>
        </View>

        {/* Trend Display */}
        <View style={styles.trendDisplay}>
          <Text style={styles.label}>Market Trend</Text>
          <View style={styles.trendContainer}>
            <View style={styles.trendIcon}>
              <Text style={styles.trendEmoji}>{getTrendEmoji(result.trend)}</Text>
            </View>
            <View style={styles.trendInfo}>
              <Text style={[styles.trendName, { color: trendColor }]}>{trendLabel}</Text>
              <Text style={styles.trendDescription}>
                {getTrendDescription(result.trend)}
              </Text>
            </View>
          </View>
        </View>

        {/* Signal Alerts */}
        {(result.isBuySignal || result.isSellSignal) && (
          <View style={[styles.signalAlert, { borderLeftColor: zoneColor }]}>
            <View style={styles.signalHeader}>
              <Text style={styles.signalEmoji}>
                {result.isBuySignal ? '📈' : '📉'}
              </Text>
              <Text style={[styles.signalTitle, { color: zoneColor }]}>
                {result.isBuySignal ? 'BUY SIGNAL DETECTED' : 'SELL SIGNAL DETECTED'}
              </Text>
            </View>
            <Text style={styles.signalDescription}>
              {result.isBuySignal 
                ? 'Price has entered a favorable buying zone with bullish momentum'
                : 'Price has entered a selling zone with bearish momentum'
              }
            </Text>
          </View>
        )}

        {/* Zone Strength Bar */}
        <View style={styles.strengthBar}>
          <Text style={styles.label}>Signal Strength</Text>
          <View style={styles.strengthBarContainer}>
            <View style={styles.strengthBarBackground}>
              <View 
                style={[
                  styles.strengthBarFill, 
                  { 
                    width: `${result.strength}%`, 
                    backgroundColor: zoneColor 
                  }
                ]} 
              />
            </View>
            <Text style={styles.strengthPercentage}>{result.strength}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Helper functions for descriptions and emojis
function getZoneDescription(zone: ActionZone): string {
  switch (zone) {
    case ActionZone.GREEN:
      return 'Strongest bullish momentum - high confidence buy zone';
    case ActionZone.BLUE:
      return 'Strong bullish momentum - good buy opportunity';
    case ActionZone.LIGHT_BLUE:
      return 'Emerging bullish momentum - watch for entry';
    case ActionZone.GRAY:
      return 'Neutral zone - no clear direction';
    case ActionZone.YELLOW:
      return 'Emerging bearish momentum - caution advised';
    case ActionZone.ORANGE:
      return 'Strong bearish momentum - consider selling';
    case ActionZone.RED:
      return 'Strongest bearish momentum - high confidence sell zone';
    default:
      return 'Unknown zone';
  }
}

function getTrendDescription(trend: TrendDirection): string {
  switch (trend) {
    case TrendDirection.BULLISH:
      return 'Upward momentum with higher highs and lows';
    case TrendDirection.BEARISH:
      return 'Downward momentum with lower highs and lows';
    case TrendDirection.NEUTRAL:
      return 'Sideways movement with no clear direction';
    default:
      return 'Unknown trend';
  }
}

function getTrendEmoji(trend: TrendDirection): string {
  switch (trend) {
    case TrendDirection.BULLISH:
      return '↗️';
    case TrendDirection.BEARISH:
      return '↘️';
    case TrendDirection.NEUTRAL:
      return '➡️';
    default:
      return '❓';
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
  strengthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    gap: 16,
  },
  compactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  zoneDisplay: {},
  zoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  zoneColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  zoneDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  zoneIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoneText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendDisplay: {},
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendEmoji: {
    fontSize: 20,
  },
  trendInfo: {
    flex: 1,
  },
  trendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  trendDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  trendIndicator: {
    alignItems: 'flex-end',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '500',
  },
  signalAlert: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  signalEmoji: {
    fontSize: 16,
  },
  signalTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  signalText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  signalDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  strengthBar: {},
  strengthBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strengthBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    minWidth: 35,
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    padding: 20,
  },
});

export default ActionZoneDisplay;