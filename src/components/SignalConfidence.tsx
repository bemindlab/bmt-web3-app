import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SignalStrength } from '../services/indicator.service';

interface SignalConfidenceProps {
  signalStrength: SignalStrength;
  size?: 'compact' | 'full';
  showDetails?: boolean;
  onPress?: () => void;
  style?: any;
}

// Confidence level colors and styles
const CONFIDENCE_STYLES = {
  HIGH: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    textColor: '#047857',
    icon: '🟢',
  },
  MEDIUM: {
    backgroundColor: '#FEF3CD',
    borderColor: '#F59E0B',
    textColor: '#92400E',
    icon: '🟡',
  },
  LOW: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    textColor: '#DC2626',
    icon: '🔴',
  },
} as const;

// Recommendation styles
const RECOMMENDATION_STYLES = {
  STRONG_BUY: {
    backgroundColor: '#064E3B',
    textColor: '#FFF',
    icon: '🚀',
    label: 'Strong Buy',
  },
  BUY: {
    backgroundColor: '#10B981',
    textColor: '#FFF',
    icon: '📈',
    label: 'Buy',
  },
  NEUTRAL: {
    backgroundColor: '#6B7280',
    textColor: '#FFF',
    icon: '➡️',
    label: 'Neutral',
  },
  SELL: {
    backgroundColor: '#F97316',
    textColor: '#FFF',
    icon: '📉',
    label: 'Sell',
  },
  STRONG_SELL: {
    backgroundColor: '#7F1D1D',
    textColor: '#FFF',
    icon: '⬇️',
    label: 'Strong Sell',
  },
} as const;

// Signal strength color gradient
const getStrengthColor = (strength: number): string => {
  if (strength >= 80) return '#10B981'; // Strong green
  if (strength >= 70) return '#059669'; // Medium green
  if (strength >= 60) return '#3B82F6'; // Blue
  if (strength >= 40) return '#F59E0B'; // Amber
  if (strength >= 30) return '#F97316'; // Orange
  return '#EF4444'; // Red
};

// Get strength description
const getStrengthDescription = (strength: number): string => {
  if (strength >= 80) return 'Very Strong';
  if (strength >= 60) return 'Strong';
  if (strength >= 40) return 'Moderate';
  if (strength >= 20) return 'Weak';
  return 'Very Weak';
};

const SignalConfidence: React.FC<SignalConfidenceProps> = ({
  signalStrength,
  size = 'full',
  showDetails = true,
  onPress,
  style,
}) => {
  const confidenceStyle = CONFIDENCE_STYLES[signalStrength.confidence];
  const recommendationStyle = RECOMMENDATION_STYLES[signalStrength.recommendation];
  const strengthColor = getStrengthColor(signalStrength.overall);
  const strengthDescription = getStrengthDescription(signalStrength.overall);

  const isCompact = size === 'compact';

  const containerStyle = [
    styles.container,
    isCompact ? styles.compactContainer : styles.fullContainer,
    style,
  ];

  const content = (
    <>
      {/* Header Section */}
      <View style={[styles.header, isCompact && styles.compactHeader]}>
        <View style={styles.confidenceContainer}>
          <Text style={[styles.confidenceIcon, isCompact && styles.compactIcon]}>
            {confidenceStyle.icon}
          </Text>
          <View>
            <Text style={[styles.confidenceLabel, isCompact && styles.compactLabel]}>
              Confidence
            </Text>
            <Text style={[
              styles.confidenceValue,
              { color: confidenceStyle.textColor },
              isCompact && styles.compactValue,
            ]}>
              {signalStrength.confidence}
            </Text>
          </View>
        </View>

        <View style={styles.recommendationContainer}>
          <View style={[
            styles.recommendationBadge,
            { backgroundColor: recommendationStyle.backgroundColor },
            isCompact && styles.compactRecommendationBadge,
          ]}>
            <Text style={[styles.recommendationIcon, isCompact && styles.compactIcon]}>
              {recommendationStyle.icon}
            </Text>
            <Text style={[
              styles.recommendationText,
              { color: recommendationStyle.textColor },
              isCompact && styles.compactRecommendationText,
            ]}>
              {recommendationStyle.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Overall Strength Bar */}
      <View style={[styles.strengthSection, isCompact && styles.compactStrengthSection]}>
        <View style={styles.strengthHeader}>
          <Text style={[styles.strengthLabel, isCompact && styles.compactLabel]}>
            Overall Strength
          </Text>
          <Text style={[
            styles.strengthValue,
            { color: strengthColor },
            isCompact && styles.compactValue,
          ]}>
            {Math.round(signalStrength.overall)}%
          </Text>
        </View>
        
        <View style={[styles.strengthBarContainer, isCompact && styles.compactStrengthBar]}>
          <View style={styles.strengthBarBg}>
            <View
              style={[
                styles.strengthBarFill,
                {
                  width: `${signalStrength.overall}%`,
                  backgroundColor: strengthColor,
                },
              ]}
            />
          </View>
          {!isCompact && (
            <Text style={[styles.strengthDescription, { color: strengthColor }]}>
              {strengthDescription}
            </Text>
          )}
        </View>
      </View>

      {/* Individual Indicator Breakdown */}
      {showDetails && !isCompact && (
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Indicator Breakdown</Text>
          
          <View style={styles.indicatorRow}>
            <View style={styles.indicatorInfo}>
              <View style={[styles.indicatorDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.indicatorName}>Action Zone</Text>
            </View>
            <Text style={[styles.indicatorValue, { color: getStrengthColor(signalStrength.actionZone) }]}>
              {Math.round(signalStrength.actionZone)}%
            </Text>
          </View>

          <View style={styles.indicatorRow}>
            <View style={styles.indicatorInfo}>
              <View style={[styles.indicatorDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.indicatorName}>RSI Divergence</Text>
            </View>
            <Text style={[styles.indicatorValue, { color: getStrengthColor(signalStrength.rsi) }]}>
              {Math.round(signalStrength.rsi)}%
            </Text>
          </View>
        </View>
      )}

      {/* Compact Details */}
      {isCompact && showDetails && (
        <View style={styles.compactDetails}>
          <Text style={styles.compactDetailText}>
            AZ: {Math.round(signalStrength.actionZone)}% | RSI: {Math.round(signalStrength.rsi)}%
          </Text>
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullContainer: {
    padding: 16,
  },
  compactContainer: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  compactHeader: {
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceIcon: {
    fontSize: 20,
  },
  compactIcon: {
    fontSize: 16,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  compactLabel: {
    fontSize: 10,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  compactValue: {
    fontSize: 12,
  },
  recommendationContainer: {
    alignItems: 'flex-end',
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  compactRecommendationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 2,
  },
  recommendationIcon: {
    fontSize: 16,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '700',
  },
  compactRecommendationText: {
    fontSize: 10,
  },
  strengthSection: {
    marginBottom: 16,
  },
  compactStrengthSection: {
    marginBottom: 8,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  strengthValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  strengthBarContainer: {
    gap: 4,
  },
  compactStrengthBar: {
    gap: 2,
  },
  strengthBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthDescription: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  detailsTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  indicatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  indicatorValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  compactDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    alignItems: 'center',
  },
  compactDetailText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default memo(SignalConfidence);