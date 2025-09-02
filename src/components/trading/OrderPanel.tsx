/**
 * Professional Order Panel Component
 * 
 * Advanced order entry form with multiple order types, risk management,
 * and real-time validation. Provides institutional-grade trading interface.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, components } from '../../constants/theme';
import { useTradingOrders, OrderType, OrderSide } from '../../hooks';

interface OrderPanelProps {
  symbol: string;
  currentPrice?: number;
  isDarkMode?: boolean;
  onOrderSubmitted?: (orderId: string) => void;
  onOrderValidationChange?: (isValid: boolean) => void;
  showAdvancedOptions?: boolean;
}

export const OrderPanel: React.FC<OrderPanelProps> = ({
  symbol,
  currentPrice = 0,
  isDarkMode = false,
  onOrderSubmitted,
  onOrderValidationChange,
  showAdvancedOptions = true,
}) => {
  const {
    orderForm,
    updateOrderForm,
    isSubmitting,
    isValidating,
    validationErrors,
    orderPreview,
    submitOrder,
    calculateRiskReward,
    setQuickOrder,
    resetOrderForm,
  } = useTradingOrders();

  const [showRiskManagement, setShowRiskManagement] = useState(false);
  const [showOrderTypes, setShowOrderTypes] = useState(false);

  // Update symbol when prop changes
  useEffect(() => {
    updateOrderForm({ symbol });
  }, [symbol, updateOrderForm]);

  // Notify parent of validation changes
  useEffect(() => {
    if (onOrderValidationChange) {
      onOrderValidationChange(orderPreview?.canExecute || false);
    }
  }, [orderPreview?.canExecute, onOrderValidationChange]);

  const handleSubmitOrder = async () => {
    const result = await submitOrder();
    if (result.success && result.data?.orderId && onOrderSubmitted) {
      onOrderSubmitted(result.data.orderId);
    }
  };

  const handleQuickOrder = (side: OrderSide, percentage: number) => {
    setQuickOrder(side, percentage);
    updateOrderForm({ side });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getOrderTypeDisplayName = (type: OrderType) => {
    const names: Record<OrderType, string> = {
      market: 'Market',
      limit: 'Limit',
      stop: 'Stop',
      stopLimit: 'Stop Limit',
      oco: 'OCO',
      trailingStop: 'Trailing Stop',
    };
    return names[type];
  };

  const getSideButtonStyle = (side: OrderSide) => {
    const baseStyle = [styles.sideButton];
    const isSelected = orderForm.side === side;
    
    if (side === 'buy') {
      baseStyle.push(styles.longButton);
      if (isSelected) baseStyle.push(styles.selectedLong);
    } else {
      baseStyle.push(styles.shortButton);
      if (isSelected) baseStyle.push(styles.selectedShort);
    }

    if (isDarkMode) {
      baseStyle.push(styles.sideButtonDark);
    }

    return baseStyle;
  };

  const riskReward = calculateRiskReward();

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Panel Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDarkMode && styles.textDark]}>
            New Order
          </Text>
          <Text style={[styles.symbolText, isDarkMode && styles.textSecondaryDark]}>
            {symbol.replace('USDT', '/USDT')}
          </Text>
        </View>

        {/* Order Type Selection */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowOrderTypes(!showOrderTypes)}
          >
            <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
              Order Type: {getOrderTypeDisplayName(orderForm.type)}
            </Text>
            <Text style={[styles.expandIcon, isDarkMode && styles.textDark]}>
              {showOrderTypes ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          
          {showOrderTypes && (
            <View style={styles.orderTypeGrid}>
              {(['market', 'limit', 'stop'] as OrderType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.orderTypeButton,
                    orderForm.type === type && styles.orderTypeButtonSelected,
                    isDarkMode && styles.orderTypeButtonDark,
                  ]}
                  onPress={() => updateOrderForm({ type })}
                >
                  <Text
                    style={[
                      styles.orderTypeButtonText,
                      orderForm.type === type && styles.orderTypeButtonTextSelected,
                      isDarkMode && styles.orderTypeButtonTextDark,
                    ]}
                  >
                    {getOrderTypeDisplayName(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Order Side Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            Direction
          </Text>
          <View style={styles.sideButtons}>
            <TouchableOpacity
              style={getSideButtonStyle('buy')}
              onPress={() => updateOrderForm({ side: 'buy' })}
            >
              <Text style={styles.sideButtonText}>LONG</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getSideButtonStyle('sell')}
              onPress={() => updateOrderForm({ side: 'sell' })}
            >
              <Text style={styles.sideButtonText}>SHORT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Amount Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            Quick Amount
          </Text>
          <View style={styles.quickAmountButtons}>
            {[25, 50, 75, 100].map((percentage) => (
              <TouchableOpacity
                key={percentage}
                style={[styles.quickAmountButton, isDarkMode && styles.quickAmountButtonDark]}
                onPress={() => handleQuickOrder(orderForm.side, percentage)}
              >
                <Text style={[styles.quickAmountButtonText, isDarkMode && styles.quickAmountButtonTextDark]}>
                  {percentage}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={[styles.label, isDarkMode && styles.textDark]}>
            Amount (USDT)
          </Text>
          <TextInput
            style={[
              styles.input,
              isDarkMode && styles.inputDark,
              validationErrors.amount && styles.inputError,
            ]}
            value={orderForm.amount?.toString() || ''}
            onChangeText={(text) => {
              const amount = parseFloat(text) || 0;
              updateOrderForm({ amount });
            }}
            placeholder="0.00"
            placeholderTextColor={isDarkMode ? '#6E7681' : colors.text.placeholder}
            keyboardType="numeric"
          />
          {validationErrors.amount && (
            <Text style={styles.errorText}>{validationErrors.amount}</Text>
          )}
        </View>

        {/* Price Input (for limit orders) */}
        {(orderForm.type === 'limit' || orderForm.type === 'stopLimit') && (
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, isDarkMode && styles.textDark]}>
                Price (USDT)
              </Text>
              {currentPrice > 0 && (
                <TouchableOpacity
                  onPress={() => updateOrderForm({ price: currentPrice })}
                >
                  <Text style={[styles.currentPriceButton, isDarkMode && styles.currentPriceButtonDark]}>
                    Use current: ${currentPrice.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[
                styles.input,
                isDarkMode && styles.inputDark,
                validationErrors.price && styles.inputError,
              ]}
              value={orderForm.price?.toString() || ''}
              onChangeText={(text) => {
                const price = parseFloat(text) || undefined;
                updateOrderForm({ price });
              }}
              placeholder="0.00"
              placeholderTextColor={isDarkMode ? '#6E7681' : colors.text.placeholder}
              keyboardType="numeric"
            />
            {validationErrors.price && (
              <Text style={styles.errorText}>{validationErrors.price}</Text>
            )}
          </View>
        )}

        {/* Leverage Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, isDarkMode && styles.textDark]}>
            Leverage: {orderForm.leverage}x
          </Text>
          <View style={styles.leverageButtons}>
            {[1, 5, 10, 20, 50, 100].map((lev) => (
              <TouchableOpacity
                key={lev}
                style={[
                  styles.leverageButton,
                  orderForm.leverage === lev && styles.leverageButtonSelected,
                  isDarkMode && styles.leverageButtonDark,
                ]}
                onPress={() => updateOrderForm({ leverage: lev })}
              >
                <Text
                  style={[
                    styles.leverageButtonText,
                    orderForm.leverage === lev && styles.leverageButtonTextSelected,
                    isDarkMode && styles.leverageButtonTextDark,
                  ]}
                >
                  {lev}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Risk Management */}
        {showAdvancedOptions && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowRiskManagement(!showRiskManagement)}
            >
              <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
                Risk Management
              </Text>
              <Text style={[styles.expandIcon, isDarkMode && styles.textDark]}>
                {showRiskManagement ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showRiskManagement && (
              <View style={styles.riskManagementContainer}>
                {/* Stop Loss */}
                <View style={styles.riskRow}>
                  <View style={styles.switchRow}>
                    <Text style={[styles.label, isDarkMode && styles.textDark]}>
                      Stop Loss
                    </Text>
                    <Switch
                      value={orderForm.stopLoss !== undefined}
                      onValueChange={(enabled) => {
                        updateOrderForm({ 
                          stopLoss: enabled ? (currentPrice * 0.95) : undefined 
                        });
                      }}
                      trackColor={{ false: '#767577', true: colors.trading.long }}
                    />
                  </View>
                  {orderForm.stopLoss !== undefined && (
                    <TextInput
                      style={[
                        styles.input,
                        styles.riskInput,
                        isDarkMode && styles.inputDark,
                        validationErrors.stopLoss && styles.inputError,
                      ]}
                      value={orderForm.stopLoss?.toString() || ''}
                      onChangeText={(text) => {
                        const stopLoss = parseFloat(text) || undefined;
                        updateOrderForm({ stopLoss });
                      }}
                      placeholder="Stop loss price"
                      placeholderTextColor={isDarkMode ? '#6E7681' : colors.text.placeholder}
                      keyboardType="numeric"
                    />
                  )}
                  {validationErrors.stopLoss && (
                    <Text style={styles.errorText}>{validationErrors.stopLoss}</Text>
                  )}
                </View>

                {/* Take Profit */}
                <View style={styles.riskRow}>
                  <View style={styles.switchRow}>
                    <Text style={[styles.label, isDarkMode && styles.textDark]}>
                      Take Profit
                    </Text>
                    <Switch
                      value={orderForm.takeProfit !== undefined}
                      onValueChange={(enabled) => {
                        updateOrderForm({ 
                          takeProfit: enabled ? (currentPrice * 1.05) : undefined 
                        });
                      }}
                      trackColor={{ false: '#767577', true: colors.trading.long }}
                    />
                  </View>
                  {orderForm.takeProfit !== undefined && (
                    <TextInput
                      style={[
                        styles.input,
                        styles.riskInput,
                        isDarkMode && styles.inputDark,
                        validationErrors.takeProfit && styles.inputError,
                      ]}
                      value={orderForm.takeProfit?.toString() || ''}
                      onChangeText={(text) => {
                        const takeProfit = parseFloat(text) || undefined;
                        updateOrderForm({ takeProfit });
                      }}
                      placeholder="Take profit price"
                      placeholderTextColor={isDarkMode ? '#6E7681' : colors.text.placeholder}
                      keyboardType="numeric"
                    />
                  )}
                  {validationErrors.takeProfit && (
                    <Text style={styles.errorText}>{validationErrors.takeProfit}</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Risk/Reward Display */}
        {riskReward && (
          <View style={[styles.riskRewardContainer, isDarkMode && styles.riskRewardContainerDark]}>
            <View style={styles.riskRewardRow}>
              <View style={styles.riskRewardItem}>
                <Text style={[styles.riskRewardLabel, isDarkMode && styles.textTertiaryDark]}>
                  Risk
                </Text>
                <Text style={[styles.riskRewardValue, { color: colors.trading.short }]}>
                  {formatCurrency(riskReward.risk)}
                </Text>
              </View>
              <View style={styles.riskRewardItem}>
                <Text style={[styles.riskRewardLabel, isDarkMode && styles.textTertiaryDark]}>
                  Reward
                </Text>
                <Text style={[styles.riskRewardValue, { color: colors.trading.long }]}>
                  {formatCurrency(riskReward.reward)}
                </Text>
              </View>
              <View style={styles.riskRewardItem}>
                <Text style={[styles.riskRewardLabel, isDarkMode && styles.textTertiaryDark]}>
                  R:R Ratio
                </Text>
                <Text
                  style={[
                    styles.riskRewardValue,
                    { color: riskReward.isGoodRatio ? colors.trading.long : colors.warning },
                  ]}
                >
                  1:{riskReward.ratio}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Preview */}
        {orderPreview && (
          <View style={[styles.orderPreview, isDarkMode && styles.orderPreviewDark]}>
            <Text style={[styles.orderPreviewTitle, isDarkMode && styles.textDark]}>
              Order Summary
            </Text>
            <View style={styles.orderPreviewRow}>
              <Text style={[styles.orderPreviewLabel, isDarkMode && styles.textSecondaryDark]}>
                Estimated Fee:
              </Text>
              <Text style={[styles.orderPreviewValue, isDarkMode && styles.textDark]}>
                {formatCurrency(orderPreview.estimatedFee)}
              </Text>
            </View>
            <View style={styles.orderPreviewRow}>
              <Text style={[styles.orderPreviewLabel, isDarkMode && styles.textSecondaryDark]}>
                Margin Required:
              </Text>
              <Text style={[styles.orderPreviewValue, isDarkMode && styles.textDark]}>
                {formatCurrency(orderPreview.marginRequired)}
              </Text>
            </View>
            {orderPreview.riskWarnings.length > 0 && (
              <View style={styles.warningsContainer}>
                {orderPreview.riskWarnings.map((warning, index) => (
                  <Text key={index} style={styles.warningText}>
                    ⚠️ {warning}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Validation Errors */}
        {validationErrors.general && (
          <Text style={styles.errorText}>{validationErrors.general}</Text>
        )}

        {/* Submit Buttons */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              orderForm.side === 'buy' ? styles.submitButtonLong : styles.submitButtonShort,
              (!orderPreview?.canExecute || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitOrder}
            disabled={!orderPreview?.canExecute || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {orderForm.side === 'buy' ? 'Buy' : 'Sell'} {symbol.replace('USDT', '')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, isDarkMode && styles.resetButtonDark]}
            onPress={resetOrderForm}
            disabled={isSubmitting}
          >
            <Text style={[styles.resetButtonText, isDarkMode && styles.resetButtonTextDark]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        {/* Validation Status */}
        {isValidating && (
          <View style={styles.validatingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.validatingText, isDarkMode && styles.textDark]}>
              Validating order...
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

  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  symbolText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },

  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  expandIcon: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },

  orderTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  orderTypeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  orderTypeButtonDark: {
    borderColor: '#30363D',
    backgroundColor: '#21262D',
  },
  orderTypeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  orderTypeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  orderTypeButtonTextDark: {
    color: '#C9D1D9',
  },
  orderTypeButtonTextSelected: {
    color: colors.white,
  },

  sideButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sideButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: spacing.md,
    borderWidth: 2,
  },
  sideButtonDark: {
    // Dark mode handled by specific colors
  },
  longButton: {
    borderColor: colors.trading.long,
    backgroundColor: 'transparent',
  },
  selectedLong: {
    backgroundColor: colors.trading.long,
  },
  shortButton: {
    borderColor: colors.trading.short,
    backgroundColor: 'transparent',
  },
  selectedShort: {
    backgroundColor: colors.trading.short,
  },
  sideButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },

  quickAmountButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: spacing.sm,
    backgroundColor: colors.gray[100],
  },
  quickAmountButtonDark: {
    backgroundColor: '#21262D',
  },
  quickAmountButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  quickAmountButtonTextDark: {
    color: '#C9D1D9',
  },

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  currentPriceButton: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  currentPriceButtonDark: {
    color: '#58A6FF',
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: spacing.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  inputDark: {
    borderColor: '#30363D',
    backgroundColor: '#21262D',
    color: '#F0F6FC',
  },
  inputError: {
    borderColor: colors.danger,
  },
  riskInput: {
    marginTop: spacing.sm,
  },

  leverageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  leverageButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
    minWidth: 50,
    alignItems: 'center',
  },
  leverageButtonDark: {
    borderColor: '#30363D',
    backgroundColor: '#21262D',
  },
  leverageButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  leverageButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  leverageButtonTextDark: {
    color: '#C9D1D9',
  },
  leverageButtonTextSelected: {
    color: colors.white,
  },

  riskManagementContainer: {
    marginTop: spacing.sm,
  },
  riskRow: {
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  riskRewardContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  riskRewardContainerDark: {
    backgroundColor: '#0D1117',
  },
  riskRewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskRewardItem: {
    flex: 1,
    alignItems: 'center',
  },
  riskRewardLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  riskRewardValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },

  orderPreview: {
    backgroundColor: colors.gray[50],
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  orderPreviewDark: {
    backgroundColor: '#0D1117',
  },
  orderPreviewTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  orderPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  orderPreviewLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  orderPreviewValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  warningsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    marginBottom: spacing.xs,
  },

  submitSection: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  submitButton: {
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonLong: {
    backgroundColor: colors.trading.long,
  },
  submitButtonShort: {
    backgroundColor: colors.trading.short,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },

  resetButton: {
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.gray[200],
  },
  resetButtonDark: {
    backgroundColor: '#21262D',
  },
  resetButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  resetButtonTextDark: {
    color: '#F0F6FC',
  },

  validatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  validatingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },

  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.danger,
    marginTop: spacing.xs,
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