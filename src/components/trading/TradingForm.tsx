import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { ProfessionalCard, ProfessionalButton, ProfessionalInput, StatusBadge } from '../ui';
import { tradingColors, typography, spacing, borderRadius } from '../../constants/theme';

interface TradingFormProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  orderSide: 'buy' | 'sell';
  onOrderSideChange: (side: 'buy' | 'sell') => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  leverage: string;
  onLeverageChange: (leverage: string) => void;
  stopLoss: string;
  onStopLossChange: (stopLoss: string) => void;
  takeProfit: string;
  onTakeProfitChange: (takeProfit: string) => void;
  useStopLoss: boolean;
  onUseStopLossChange: (use: boolean) => void;
  useTakeProfit: boolean;
  onUseTakeProfitChange: (use: boolean) => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Professional Trading Form Component
 * 
 * Features:
 * - Professional dark theme with consistent styling
 * - Symbol selection with popular trading pairs
 * - Long/Short position buttons with color coding
 * - Leverage selection with common values
 * - Risk management with stop-loss and take-profit
 * - Real-time validation and error handling
 * - Professional typography with monospace for numbers
 * - Touch-friendly interface design
 */
export const TradingForm: React.FC<TradingFormProps> = ({
  symbol,
  onSymbolChange,
  orderSide,
  onOrderSideChange,
  amount,
  onAmountChange,
  leverage,
  onLeverageChange,
  stopLoss,
  onStopLossChange,
  takeProfit,
  onTakeProfitChange,
  useStopLoss,
  onUseStopLossChange,
  useTakeProfit,
  onUseTakeProfitChange,
  onSubmit,
  loading = false,
  disabled = false,
}) => {
  const [amountError, setAmountError] = useState<string>('');

  const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
  const leverageOptions = ['1', '5', '10', '20', '50', '100'];

  const handleAmountChange = (value: string) => {
    onAmountChange(value);
    
    // Validate amount
    const numValue = parseFloat(value);
    if (value && (isNaN(numValue) || numValue <= 0)) {
      setAmountError('Amount must be a positive number');
    } else if (numValue < 10) {
      setAmountError('Minimum order size is $10 USDT');
    } else {
      setAmountError('');
    }
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) < 10) {
      Alert.alert('Minimum Order Size', 'Minimum order size is $10 USDT');
      return;
    }
    
    onSubmit();
  };

  return (
    <ProfessionalCard elevated style={styles.card}>
      <Text style={styles.title}>New Position</Text>

      {/* Symbol Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Trading Pair</Text>
        <View style={styles.symbolGrid}>
          {popularSymbols.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.symbolButton,
                symbol === s && styles.selectedSymbol,
              ]}
              onPress={() => onSymbolChange(s)}
            >
              <Text
                style={[
                  styles.symbolText,
                  symbol === s && styles.selectedSymbolText,
                ]}
              >
                {s.replace('USDT', '')}
              </Text>
              <Text style={styles.pairSuffix}>/USDT</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Order Direction */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Position Direction</Text>
        <View style={styles.directionButtons}>
          <TouchableOpacity
            style={[
              styles.directionButton,
              styles.longButton,
              orderSide === 'buy' && styles.selectedLong,
            ]}
            onPress={() => onOrderSideChange('buy')}
          >
            <Text style={styles.directionText}>
              LONG {orderSide === 'buy' ? '↗' : ''}
            </Text>
            <Text style={styles.directionSubtext}>Buy / Bullish</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.directionButton,
              styles.shortButton,
              orderSide === 'sell' && styles.selectedShort,
            ]}
            onPress={() => onOrderSideChange('sell')}
          >
            <Text style={styles.directionText}>
              SHORT {orderSide === 'sell' ? '↘' : ''} 
            </Text>
            <Text style={styles.directionSubtext}>Sell / Bearish</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Position Size */}
      <View style={styles.section}>
        <ProfessionalInput
          label="Position Size"
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          rightIcon="💰"
          error={amountError}
          helperText="Minimum: $10 USDT"
          required
        />
      </View>

      {/* Leverage Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Leverage: {leverage}x</Text>
        <View style={styles.leverageGrid}>
          {leverageOptions.map((lev) => (
            <TouchableOpacity
              key={lev}
              style={[
                styles.leverageButton,
                leverage === lev && styles.selectedLeverage,
              ]}
              onPress={() => onLeverageChange(lev)}
            >
              <Text
                style={[
                  styles.leverageText,
                  leverage === lev && styles.selectedLeverageText,
                ]}
              >
                {lev}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Risk Warning */}
        {parseInt(leverage) > 10 && (
          <View style={styles.riskWarning}>
            <Text style={styles.riskWarningText}>
              ⚠️ High leverage increases both potential profits and losses
            </Text>
          </View>
        )}
      </View>

      {/* Risk Management */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Risk Management</Text>
        
        {/* Stop Loss */}
        <View style={styles.riskControl}>
          <View style={styles.riskToggle}>
            <Text style={styles.riskLabel}>Stop Loss</Text>
            <Switch
              value={useStopLoss}
              onValueChange={onUseStopLossChange}
              trackColor={{
                false: tradingColors.dark.surface.disabled,
                true: tradingColors.loss,
              }}
              thumbColor={useStopLoss ? tradingColors.lossLight : tradingColors.dark.text.muted}
            />
          </View>
          
          {useStopLoss && (
            <ProfessionalInput
              value={stopLoss}
              onChangeText={onStopLossChange}
              keyboardType="decimal-pad"
              placeholder="Stop loss price"
              variant="filled"
              size="small"
            />
          )}
        </View>

        {/* Take Profit */}
        <View style={styles.riskControl}>
          <View style={styles.riskToggle}>
            <Text style={styles.riskLabel}>Take Profit</Text>
            <Switch
              value={useTakeProfit}
              onValueChange={onUseTakeProfitChange}
              trackColor={{
                false: tradingColors.dark.surface.disabled,
                true: tradingColors.profit,
              }}
              thumbColor={useTakeProfit ? tradingColors.profitLight : tradingColors.dark.text.muted}
            />
          </View>
          
          {useTakeProfit && (
            <ProfessionalInput
              value={takeProfit}
              onChangeText={onTakeProfitChange}
              keyboardType="decimal-pad"
              placeholder="Take profit price"
              variant="filled"
              size="small"
            />
          )}
        </View>
      </View>

      {/* Submit Button */}
      <ProfessionalButton
        title={loading ? 'Placing Order...' : 'Open Position'}
        onPress={handleSubmit}
        variant={orderSide === 'buy' ? 'success' : 'danger'}
        size="large"
        fullWidth
        loading={loading}
        disabled={disabled || !amount || !!amountError}
        style={styles.submitButton}
      />
      
      {/* Order Summary */}
      {amount && !amountError && (
        <View style={styles.orderSummary}>
          <StatusBadge
            status={orderSide === 'buy' ? 'profit' : 'loss'}
            text={`${orderSide.toUpperCase()} ${symbol} • ${leverage}x Leverage • $${amount} USDT`}
            variant="subtle"
            size="medium"
          />
        </View>
      )}
    </ProfessionalCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: tradingColors.dark.text.primary,
    marginBottom: spacing.lg,
  },
  
  section: {
    marginBottom: spacing.lg,
  },
  
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: tradingColors.dark.text.secondary,
    marginBottom: spacing.sm,
  },
  
  // Symbol Selection
  symbolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  
  symbolButton: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: tradingColors.dark.surface.elevated,
    borderRadius: borderRadius.trading.button,
    borderWidth: 1,
    borderColor: tradingColors.dark.border.primary,
    alignItems: 'center',
  },
  
  selectedSymbol: {
    backgroundColor: tradingColors.primary,
    borderColor: tradingColors.primary,
  },
  
  symbolText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: tradingColors.dark.text.primary,
    fontFamily: typography.fontFamily.mono,
  },
  
  selectedSymbolText: {
    color: tradingColors.dark.text.primary,
  },
  
  pairSuffix: {
    fontSize: typography.fontSize.xs,
    color: tradingColors.dark.text.tertiary,
    marginTop: 2,
  },
  
  // Direction Buttons
  directionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  directionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.trading.button,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  longButton: {
    backgroundColor: 'transparent',
    borderColor: tradingColors.profit,
  },
  
  selectedLong: {
    backgroundColor: tradingColors.profit,
  },
  
  shortButton: {
    backgroundColor: 'transparent',
    borderColor: tradingColors.loss,
  },
  
  selectedShort: {
    backgroundColor: tradingColors.loss,
  },
  
  directionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: tradingColors.dark.text.primary,
  },
  
  directionSubtext: {
    fontSize: typography.fontSize.xs,
    color: tradingColors.dark.text.tertiary,
    marginTop: 2,
  },
  
  // Leverage Selection
  leverageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  
  leverageButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: tradingColors.dark.surface.elevated,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: tradingColors.dark.border.primary,
    minWidth: 60,
    alignItems: 'center',
  },
  
  selectedLeverage: {
    backgroundColor: tradingColors.secondary,
    borderColor: tradingColors.secondary,
  },
  
  leverageText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: tradingColors.dark.text.secondary,
    fontFamily: typography.fontFamily.mono,
  },
  
  selectedLeverageText: {
    color: tradingColors.dark.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  
  // Risk Management
  riskControl: {
    marginBottom: spacing.md,
  },
  
  riskToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  riskLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: tradingColors.dark.text.secondary,
  },
  
  riskWarning: {
    backgroundColor: 'rgba(255, 167, 38, 0.1)',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: tradingColors.warning,
  },
  
  riskWarningText: {
    fontSize: typography.fontSize.xs,
    color: tradingColors.warning,
    textAlign: 'center',
  },
  
  // Submit Button
  submitButton: {
    marginTop: spacing.md,
  },
  
  // Order Summary
  orderSummary: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
});