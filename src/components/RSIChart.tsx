import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Path, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { RSIDivergenceResult } from '../lib/indicators/rsi';

interface RSIChartProps {
  rsiData: RSIDivergenceResult[];
  prices: number[];
  width?: number;
  height?: number;
  showDivergences?: boolean;
  overbought?: number;
  oversold?: number;
  compactMode?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const RSIChart: React.FC<RSIChartProps> = ({
  rsiData,
  prices = [],
  width = screenWidth - 32,
  height = 120,
  showDivergences = true,
  overbought = 70,
  oversold = 30,
  compactMode = true,
}) => {
  // Calculate chart dimensions
  const chartHeight = compactMode ? height - 40 : height - 60;
  const chartWidth = width - 60; // Leave space for Y-axis labels
  const padding = 20;

  // Process RSI data
  const processedData = useMemo(() => {
    if (!rsiData || rsiData.length === 0) {
      return { rsiPoints: [], divergencePoints: [], stats: null };
    }

    // Limit data points for performance (last 50 points)
    const limitedData = rsiData.slice(-50);
    const limitedPrices = prices.slice(-50);

    // Create RSI line points
    const rsiPoints = limitedData.map((item, index) => {
      const x = (index / (limitedData.length - 1)) * chartWidth + padding;
      const y = chartHeight - ((item.rsi - 0) / 100) * chartHeight + padding;
      return { x, y, rsi: item.rsi, index };
    });

    // Find divergence points
    const divergencePoints = limitedData
      .map((item, index) => ({
        ...item,
        index,
        price: limitedPrices[index] || 0,
        x: (index / (limitedData.length - 1)) * chartWidth + padding,
        y: chartHeight - ((item.rsi - 0) / 100) * chartHeight + padding,
      }))
      .filter(item => item.bullishDivergence || item.bearishDivergence);

    // Calculate statistics
    const currentRSI = limitedData[limitedData.length - 1]?.rsi || 50;
    const prevRSI = limitedData[limitedData.length - 2]?.rsi || 50;
    const rsiChange = currentRSI - prevRSI;

    const stats = {
      current: currentRSI,
      change: rsiChange,
      trend: rsiChange > 0 ? 'up' : rsiChange < 0 ? 'down' : 'flat',
      isOverbought: currentRSI >= overbought,
      isOversold: currentRSI <= oversold,
      bullishDivergences: divergencePoints.filter(p => p.bullishDivergence).length,
      bearishDivergences: divergencePoints.filter(p => p.bearishDivergence).length,
    };

    return { rsiPoints, divergencePoints, stats };
  }, [rsiData, prices, chartWidth, chartHeight, overbought, oversold]);

  const { rsiPoints, divergencePoints, stats } = processedData;

  if (!stats || rsiPoints.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No RSI data available</Text>
      </View>
    );
  }

  // Generate SVG path for RSI line
  const rsiPath = rsiPoints.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  // Y-axis levels
  const yLevels = [
    { value: 100, y: padding },
    { value: overbought, y: chartHeight - ((overbought - 0) / 100) * chartHeight + padding },
    { value: 50, y: chartHeight - ((50 - 0) / 100) * chartHeight + padding },
    { value: oversold, y: chartHeight - ((oversold - 0) / 100) * chartHeight + padding },
    { value: 0, y: chartHeight + padding },
  ];

  // Colors based on RSI level
  const getRSIColor = (rsi: number) => {
    if (rsi >= overbought) return '#EF4444'; // Red - overbought
    if (rsi <= oversold) return '#10B981'; // Green - oversold
    if (rsi > 50) return '#3B82F6'; // Blue - bullish
    return '#F59E0B'; // Amber - bearish
  };

  const currentRSIColor = getRSIColor(stats.current);

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>RSI (14)</Text>
          {!compactMode && (
            <View style={styles.statsContainer}>
              {stats.bullishDivergences > 0 && (
                <Text style={styles.divergenceStat}>
                  🟢 {stats.bullishDivergences}
                </Text>
              )}
              {stats.bearishDivergences > 0 && (
                <Text style={styles.divergenceStat}>
                  🔴 {stats.bearishDivergences}
                </Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.valueContainer}>
          <Text style={[styles.currentValue, { color: currentRSIColor }]}>
            {stats.current.toFixed(1)}
          </Text>
          <Text style={[
            styles.changeValue,
            { color: stats.trend === 'up' ? '#10B981' : stats.trend === 'down' ? '#EF4444' : '#6B7280' }
          ]}>
            {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <Svg width={width} height={chartHeight + 40}>
          <Defs>
            <LinearGradient id="overboughtZone" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FEE2E2" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#FEE2E2" stopOpacity="0.3" />
            </LinearGradient>
            <LinearGradient id="oversoldZone" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#D1FAE5" stopOpacity="0.8" />
            </LinearGradient>
          </Defs>

          {/* Background zones */}
          {/* Overbought zone */}
          <Path
            d={`M ${padding} ${padding} L ${chartWidth + padding} ${padding} L ${chartWidth + padding} ${yLevels.find(l => l.value === overbought)?.y} L ${padding} ${yLevels.find(l => l.value === overbought)?.y} Z`}
            fill="url(#overboughtZone)"
          />
          
          {/* Oversold zone */}
          <Path
            d={`M ${padding} ${yLevels.find(l => l.value === oversold)?.y} L ${chartWidth + padding} ${yLevels.find(l => l.value === oversold)?.y} L ${chartWidth + padding} ${chartHeight + padding} L ${padding} ${chartHeight + padding} Z`}
            fill="url(#oversoldZone)"
          />

          {/* Horizontal grid lines */}
          {yLevels.map((level, _index) => (
            <React.Fragment key={level.value}>
              <Line
                x1={padding}
                y1={level.y}
                x2={chartWidth + padding}
                y2={level.y}
                stroke={level.value === overbought || level.value === oversold ? '#9CA3AF' : '#E5E7EB'}
                strokeWidth={level.value === overbought || level.value === oversold ? 1.5 : 1}
                strokeDasharray={level.value === 50 ? '4,4' : undefined}
              />
              <SvgText
                x={padding - 5}
                y={level.y + 4}
                fontSize="10"
                fill="#6B7280"
                textAnchor="end"
              >
                {level.value}
              </SvgText>
            </React.Fragment>
          ))}

          {/* RSI line */}
          <Path
            d={rsiPath}
            stroke={currentRSIColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current RSI point */}
          {rsiPoints.length > 0 && (
            <Circle
              cx={rsiPoints[rsiPoints.length - 1].x}
              cy={rsiPoints[rsiPoints.length - 1].y}
              r="4"
              fill={currentRSIColor}
              stroke="#FFF"
              strokeWidth="2"
            />
          )}

          {/* Divergence markers */}
          {showDivergences && divergencePoints.map((point, index) => (
            <React.Fragment key={`divergence-${index}`}>
              {point.bullishDivergence && (
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                />
              )}
              {point.bearishDivergence && (
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                />
              )}
            </React.Fragment>
          ))}
        </Svg>
      </View>

      {/* Status indicators */}
      {!compactMode && (
        <View style={styles.statusContainer}>
          {stats.isOverbought && (
            <View style={[styles.statusBadge, styles.overboughtBadge]}>
              <Text style={styles.statusText}>Overbought</Text>
            </View>
          )}
          {stats.isOversold && (
            <View style={[styles.statusBadge, styles.oversoldBadge]}>
              <Text style={styles.statusText}>Oversold</Text>
            </View>
          )}
          {divergencePoints.length > 0 && (
            <View style={[styles.statusBadge, styles.divergenceBadge]}>
              <Text style={styles.statusText}>Divergence Detected</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  divergenceStat: {
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  changeValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overboughtBadge: {
    backgroundColor: '#FEE2E2',
  },
  oversoldBadge: {
    backgroundColor: '#D1FAE5',
  },
  divergenceBadge: {
    backgroundColor: '#DBEAFE',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  noDataText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    marginTop: 20,
  },
});

export default memo(RSIChart);