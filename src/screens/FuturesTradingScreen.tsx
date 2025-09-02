import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTradingStore } from '../stores/tradingStore';
import ccxtExchangeService from '../services/ccxtExchange.service';
import exchangeApiService from '../services/exchangeApi.service';
import { StorageService } from '../services/storage';
import { TradingViewChart } from '../components/TradingViewChart';
import { PositionsList } from '../components/PositionsList';
import { ActionZoneDisplay, RSIChart, SignalConfidence } from '../components/indicators';
import { MarketCandle } from '../services/indicator.service';
import { tradingColors, spacing, typography } from '../constants/theme';
// Professional Trading Components
import { BalanceCard } from '../components/trading/BalanceCard';
import { TradingForm } from '../components/trading/TradingForm';
// Indicator strategy configurations
const INDICATOR_STRATEGIES = {
  'Action Zone': {
    name: 'Action Zone Strategy',
    description: 'EMA-based trend analysis with 7-zone color system',
    enabled: true,
  },
  'RSI Divergence': {
    name: 'RSI Divergence',
    description: 'Bullish/bearish divergence detection with OHLC4 analysis',
    enabled: true,
  },
  'Combined Analysis': {
    name: 'Multi-Indicator Analysis',
    description: 'Combined signals from all active indicators',
    enabled: true,
  },
} as const;

const FuturesTradingScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const {
    isConnected,
    activeExchange,
    positions,
    balances,
    loading,
    error,
    refreshing,
    initializeExchange,
    refreshAll,
    openPosition,
    closePosition,
    clearError,
    setActiveExchange,
    // Indicator methods
    subscribeToIndicators,
    getIndicatorState,
    getTradingSignal,
    executeSignalTrade,
    autoTradingEnabled,
    setAutoTrading,
  } = useTradingStore();

  // Balance states
  const [spotBalance, setSpotBalance] = useState<any>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<Date | null>(null);
  const [showApiKeysWarning, setShowApiKeysWarning] = useState(false);

  // Connection modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);

  // Trading form state
  const [symbol, setSymbol] = useState('BTCUSDT'); // Default to BTCUSDT without slash
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState('10');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [useStopLoss, setUseStopLoss] = useState(false);
  const [useTakeProfit, setUseTakeProfit] = useState(false);

  // Strategy states
  const [selectedStrategy, setSelectedStrategy] = useState<keyof typeof INDICATOR_STRATEGIES>('Combined Analysis');
  const [showIndicatorDetails, setShowIndicatorDetails] = useState(true);
  
  // Get real-time indicator data from the store
  const currentIndicatorState = getIndicatorState(symbol);
  const currentTradingSignal = getTradingSignal(symbol);

  // Subscribe to indicators when symbol changes
  useEffect(() => {
    if (symbol && isConnected[activeExchange]) {
      subscribeToIndicators(symbol);
      
      // Generate and update mock market data for development
      const generateMockCandles = (): MarketCandle[] => {
        const data = [];
        let basePrice = 42000;
        for (let i = 0; i < 100; i++) {
          const change = (Math.random() - 0.5) * 0.02; // ±1% random change
          const open = basePrice;
          const close = open * (1 + change);
          const high = Math.max(open, close) * (1 + Math.random() * 0.01);
          const low = Math.min(open, close) * (1 - Math.random() * 0.01);
          const volume = 1000000 + Math.random() * 500000;

          data.push({
            symbol,
            open,
            high,
            low,
            close,
            volume,
            timestamp: Date.now() - (100 - i) * 300000, // 5-minute intervals
          });

          basePrice = close;
        }
        return data;
      };

      // Note: In production, market data would come from real API
    }

    return () => {
      if (symbol) {
        // Don't unsubscribe immediately as other components might need it
        // unsubscribeFromIndicators(symbol);
      }
    };
  }, [symbol, isConnected, activeExchange]);

  // Handle indicator-based trade execution
  const handleExecuteSignalTrade = async (signal: any, amount: number) => {
    if (!signal || signal.type === 'HOLD') return;

    const success = await executeSignalTrade(signal, amount);
    if (success) {
      Alert.alert(
        'Trade Executed',
        `${signal.type} order placed successfully based on ${signal.source} signal`,
        [{ text: 'OK' }]
      );
    }
  };

  // Load saved default symbol on mount
  useEffect(() => {
    const loadDefaultSymbol = async () => {
      try {
        const savedSymbol = await AsyncStorage.getItem('defaultTradingSymbol');
        if (savedSymbol) {
          console.log('📊 Loaded saved default symbol:', savedSymbol);
          setSymbol(savedSymbol);
        }
      } catch (error) {
        console.error('Error loading default symbol:', error);
      }
    };
    loadDefaultSymbol();
  }, []);

  // Handle navigation params for selected coin and save as default
  useEffect(() => {
    const handleNavigationParams = async () => {
      const selectedCoin = route.params?.selectedCoin;
      if (selectedCoin) {
        // Map the coin symbol to a trading pair (without slash for consistency)
        const mappedSymbol = `${selectedCoin.symbol}USDT`;
        console.log(
          '🎯 Navigation param - selected coin:',
          selectedCoin.symbol,
          '-> mapped to:',
          mappedSymbol
        );

        // Update the symbol
        setSymbol(mappedSymbol);

        // Save as default for future use
        try {
          await AsyncStorage.setItem('defaultTradingSymbol', mappedSymbol);
          console.log('💾 Saved', mappedSymbol, 'as default trading symbol');
        } catch (error) {
          console.error('Error saving default symbol:', error);
        }
      }
    };
    handleNavigationParams();
  }, [route.params]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  // Check for API keys on mount and redirect to settings if none found
  useEffect(() => {
    checkForApiKeysAndRedirect();
  }, []);

  // Check for stored credentials on mount and exchange change
  useEffect(() => {
    checkStoredCredentials();
  }, [activeExchange]);

  // Fetch balances when connected
  useEffect(() => {
    if (isConnected[activeExchange]) {
      console.log(`🔗 Exchange ${activeExchange} connected, fetching balances...`);
      fetchBalances();
    } else {
      console.log(`❌ Exchange ${activeExchange} not connected`);
    }
  }, [isConnected, activeExchange]);

  // Listen for focus events to recheck API keys when returning from settings
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Recheck API keys when screen comes into focus
      checkForApiKeysAndRedirect();
    });

    return unsubscribe;
  }, [navigation]);

  const checkForApiKeysAndRedirect = async () => {
    try {
      const savedApiKeys = await StorageService.getApiKeys();

      // Check if any exchange API keys are configured
      const hasBinanceKeys = savedApiKeys?.binance && savedApiKeys.binance.includes(':');
      const hasGateKeys = savedApiKeys?.gateio && savedApiKeys.gateio.includes(':');

      if (!hasBinanceKeys && !hasGateKeys) {
        // Show API keys warning instead of immediate redirect
        setShowApiKeysWarning(true);
        return false;
      }

      // Hide warning if keys are found
      setShowApiKeysWarning(false);

      return true;
    } catch (error) {
      console.error('Error checking API keys:', error);
      return false;
    }
  };

  const checkStoredCredentials = async () => {
    try {
      const savedApiKeys = await StorageService.getApiKeys();
      const exchangeKey = activeExchange === 'binance' ? 'binance' : 'gateio';

      if (savedApiKeys && savedApiKeys[exchangeKey]) {
        const credentials = savedApiKeys[exchangeKey];
        if (credentials && credentials.includes(':')) {
          const [key, secret] = credentials.split(':');
          if (key && secret) {
            setHasStoredCredentials(true);
            // Auto-connect if not already connected
            if (!isConnected[activeExchange]) {
              await initializeExchange({
                exchange: activeExchange,
                apiKey: key,
                apiSecret: secret,
              });
            }
          }
        }
      } else {
        setHasStoredCredentials(false);
      }

      // Also check if we should show the warning
      await checkForApiKeysAndRedirect();
    } catch (error) {
      console.error('Error checking stored credentials:', error);
      setHasStoredCredentials(false);
    }
  };

  const loadStoredCredentials = async () => {
    try {
      const savedApiKeys = await StorageService.getApiKeys();
      const exchangeKey = activeExchange === 'binance' ? 'binance' : 'gateio';

      if (savedApiKeys && savedApiKeys[exchangeKey]) {
        const credentials = savedApiKeys[exchangeKey];
        if (credentials && credentials.includes(':')) {
          const [key, secret] = credentials.split(':');
          if (key && secret) {
            setApiKey(key);
            setApiSecret(secret);
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading stored credentials:', error);
      return false;
    }
  };

  const fetchBalances = async () => {
    console.log(`🔄 Fetching balances for ${activeExchange} using CCXT service...`);
    setBalanceLoading(true);
    try {
      // Get saved credentials
      const savedApiKeys = await StorageService.getApiKeys();
      const exchangeKey = activeExchange === 'binance' ? 'binance' : 'gateio';

      if (!savedApiKeys || !savedApiKeys[exchangeKey]) {
        throw new Error(`No API keys found for ${activeExchange}`);
      }

      const credentials = savedApiKeys[exchangeKey];
      if (!credentials || !credentials.includes(':')) {
        throw new Error(`Invalid API credentials format for ${activeExchange}`);
      }

      const [apiKey, apiSecret] = credentials.split(':');

      // ADDED: [HIGH] - [2025-09-01] - Claude Code
      // Refactored to use CCXT service directly instead of legacy service calls
      // This provides unified API access and better error handling

      // Fetch USDT spot balance using CCXT service
      console.log(`📊 Fetching USDT spot balance from ${activeExchange} via CCXT...`);
      const spotResult = await ccxtExchangeService.getBalance(
        {
          exchange: activeExchange,
          apiKey,
          apiSecret,
          testnet: false,
        },
        'spot'
      );

      if (spotResult.success && spotResult.data) {
        console.log('✅ USDT spot balance loaded via CCXT:', spotResult.data);
        setSpotBalance({
          asset: spotResult.data.asset,
          balance: spotResult.data.balance,
          availableBalance: spotResult.data.availableBalance,
          exchange: activeExchange,
          type: 'spot',
          timestamp: spotResult.data.timestamp,
        });
      } else {
        console.warn('⚠️ Spot balance failed:', spotResult.error);
        // Set empty balance to show connection status
        setSpotBalance(null);
      }

      // Fetch USDT futures balance using CCXT service
      console.log(`📈 Fetching USDT futures balance from ${activeExchange} via CCXT...`);
      const futuresResult = await ccxtExchangeService.getBalance(
        {
          exchange: activeExchange,
          apiKey,
          apiSecret,
          testnet: false,
        },
        'futures'
      );

      if (futuresResult.success && futuresResult.data) {
        console.log('✅ USDT futures balance loaded via CCXT:', futuresResult.data);
        // Update the trading store with futures balance
        // This replaces the refreshAll() call with direct CCXT integration
      } else {
        console.warn('⚠️ Futures balance failed:', futuresResult.error);
      }

      // Also refresh positions using CCXT
      console.log(`📊 Fetching positions from ${activeExchange} via CCXT...`);
      const positionsResult = await ccxtExchangeService.getPositions({
        exchange: activeExchange,
        apiKey,
        apiSecret,
        testnet: false,
      });

      if (positionsResult.success && positionsResult.data) {
        console.log('✅ Positions loaded via CCXT:', positionsResult.data.length, 'positions');
      } else {
        console.warn('⚠️ Positions failed:', positionsResult.error);
      }

      setLastBalanceUpdate(new Date());
      console.log(`✅ CCXT balance refresh completed at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('❌ Error fetching balances via CCXT:', error);
      Alert.alert(
        'Balance Error',
        error instanceof Error
          ? error.message
          : 'Failed to fetch balances. Please check your API keys.',
        [
          { text: 'Settings', onPress: () => navigation.navigate('Settings') },
          { text: 'Retry', onPress: fetchBalances },
          { text: 'Cancel' },
        ]
      );
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey || !apiSecret) {
      Alert.alert('Error', 'Please enter API key and secret');
      return;
    }

    try {
      console.log(`🔗 Testing connection to ${activeExchange} via CCXT service...`);

      // ADDED: [HIGH] - [2025-09-01] - Claude Code
      // Test signature implementations first to debug authentication issues
      console.log('🧪 Testing signature implementations...');
      const signatureTest = await exchangeApiService.testSignatureImplementations();
      console.log('📊 Signature test result:', signatureTest);

      // Test real signature with API call for Gate.io
      if (activeExchange === 'gate') {
        console.log('🧪 Testing Gate.io signature with real API call...');
        const gateSignatureTest = await exchangeApiService.testGateSignatureWithRealCall(
          apiKey,
          apiSecret
        );
        console.log('📊 Gate.io signature test result:', gateSignatureTest);
      }

      // Use CCXT service for connection testing instead of legacy service
      const connectionTest = await ccxtExchangeService.testConnection({
        exchange: activeExchange,
        apiKey,
        apiSecret,
        testnet: false,
      });

      if (connectionTest.success) {
        console.log('✅ CCXT connection test successful:', connectionTest.message);

        // Also initialize the legacy store for compatibility
        const success = await initializeExchange({
          exchange: activeExchange,
          apiKey,
          apiSecret,
        });

        if (success) {
          setShowConnectModal(false);
          setApiKey('');
          setApiSecret('');
          Alert.alert('Success', connectionTest.message || 'Connected successfully!');
          // Automatically fetch balances after successful connection
          fetchBalances();
        }
      } else {
        console.error('❌ CCXT connection test failed:', connectionTest.error);
        Alert.alert('Connection Failed', connectionTest.error || 'Unable to connect to exchange', [
          { text: 'Check Keys', onPress: () => navigation.navigate('Settings') },
          { text: 'Retry' },
          { text: 'Cancel' },
        ]);
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      Alert.alert(
        'Connection Error',
        error instanceof Error ? error.message : 'Failed to connect to exchange'
      );
    }
  };

  const handleOpenPosition = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }

    if (!isConnected[activeExchange]) {
      Alert.alert('Error', 'Please connect to exchange first');
      return;
    }

    try {
      // Get saved credentials
      const savedApiKeys = await StorageService.getApiKeys();
      const exchangeKey = activeExchange === 'binance' ? 'binance' : 'gateio';

      if (!savedApiKeys || !savedApiKeys[exchangeKey]) {
        throw new Error(`No API keys found for ${activeExchange}`);
      }

      const credentials = savedApiKeys[exchangeKey];
      if (!credentials || !credentials.includes(':')) {
        throw new Error(`Invalid API credentials format for ${activeExchange}`);
      }

      const [apiKey, apiSecret] = credentials.split(':');

      // ADDED: [HIGH] - [2025-09-01] - Claude Code
      // Use CCXT service for order placement instead of legacy store
      console.log(`📝 Placing ${orderSide} order via CCXT service...`);

      const orderResult = await ccxtExchangeService.placeOrder(
        {
          exchange: activeExchange,
          apiKey,
          apiSecret,
          testnet: false,
        },
        {
          symbol,
          side: orderSide,
          amount: parseFloat(amount),
          type: 'market', // Using market orders for now
        }
      );

      if (orderResult.success && orderResult.data) {
        console.log('✅ Order placed successfully via CCXT:', orderResult.data);

        // Also use legacy store method for compatibility
        const params: {
          symbol: string;
          side: 'buy' | 'sell';
          amount: number;
          leverage: number;
          stopLoss?: number;
          takeProfit?: number;
        } = {
          symbol,
          side: orderSide,
          amount: parseFloat(amount),
          leverage: parseInt(leverage),
        };

        if (useStopLoss && stopLoss) {
          params.stopLoss = parseFloat(stopLoss);
        }

        if (useTakeProfit && takeProfit) {
          params.takeProfit = parseFloat(takeProfit);
        }

        const success = await openPosition(params);

        if (success) {
          // Reset form
          setAmount('');
          setStopLoss('');
          setTakeProfit('');
          Alert.alert(
            'Success',
            `Order placed successfully!\nOrder ID: ${orderResult.data.orderId}\nSymbol: ${orderResult.data.symbol}\nSide: ${orderResult.data.side}\nAmount: ${orderResult.data.amount}`
          );
          // Refresh balances after order
          fetchBalances();
        }
      } else {
        console.error('❌ Order placement failed:', orderResult.error);
        Alert.alert('Order Failed', orderResult.error || 'Unable to place order', [
          { text: 'Retry' },
          { text: 'Cancel' },
        ]);
      }
    } catch (error) {
      console.error('❌ Order placement error:', error);
      Alert.alert('Order Error', error instanceof Error ? error.message : 'Failed to place order');
    }
  };

  const handleClosePosition = async (positionId: string, positionSymbol: string) => {
    const success = await closePosition(positionSymbol);
    if (success) {
      Alert.alert('Success', 'Position closed successfully');
      // Refresh balances and positions after closing
      await refreshAll();
    }
  };

  // Strategy handlers temporarily removed

  const balance = balances[activeExchange];
  const isExchangeConnected = isConnected[activeExchange];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Futures Trading</Text>
            <View style={styles.exchangeTabs}>
              <TouchableOpacity
                style={[styles.exchangeTab, activeExchange === 'binance' && styles.activeTab]}
                onPress={() => setActiveExchange('binance')}
              >
                <Text
                  style={[styles.tabText, activeExchange === 'binance' && styles.activeTabText]}
                >
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

          {/* API Keys Warning */}
          {showApiKeysWarning && (
            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>API Keys Required</Text>
                <Text style={styles.warningText}>
                  To use futures trading, configure your exchange API keys in Settings.
                </Text>
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <Text style={styles.settingsButtonText}>Go to Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Connection Status */}
          {!showApiKeysWarning && !isExchangeConnected ? (
            <View style={styles.connectCard}>
              <Text style={styles.connectText}>
                Connect to {activeExchange === 'binance' ? 'Binance' : 'Gate.io'} to start trading
              </Text>
              <TouchableOpacity
                style={styles.connectButton}
                onPress={async () => {
                  const hasKeys = await checkForApiKeysAndRedirect();
                  if (hasKeys) {
                    setShowConnectModal(true);
                  }
                }}
              >
                <Text style={styles.connectButtonText}>Connect Exchange</Text>
              </TouchableOpacity>
            </View>
          ) : !showApiKeysWarning && isExchangeConnected ? (
            <>
              {/* Professional Account Balance */}
              <BalanceCard
                exchange={activeExchange}
                balance={balance}
                spotBalance={spotBalance}
                loading={balanceLoading}
                lastUpdate={lastBalanceUpdate}
                onRefresh={fetchBalances}
                isConnected={isExchangeConnected}
              />

              {/* Professional TradingView Chart */}
              <ProfessionalCard elevated style={{ marginHorizontal: spacing.md, marginBottom: spacing.sm }}>
                <Text style={styles.sectionTitle}>Price Chart - {symbol}</Text>
                <View style={styles.chartContainer}>
                  <TradingViewChart
                    symbol={symbol}
                    theme="dark"
                    interval="15"
                    compact={true}
                    height={240}
                    showFullScreenButton={true}
                  />
                </View>
              </ProfessionalCard>

              {/* Trading Signal Confidence */}
              <SignalConfidence
                signal={currentTradingSignal}
                indicatorState={currentIndicatorState}
                onTradeSignal={(signal) => handleExecuteSignalTrade(signal, parseFloat(amount) || 10)}
                compact={!showIndicatorDetails}
                showActions={true}
              />

              {/* Indicator Strategy Selection */}
              <View style={styles.tradingCard}>
                <View style={styles.strategyHeader}>
                  <Text style={styles.sectionTitle}>Indicator Analysis</Text>
                  <TouchableOpacity
                    onPress={() => setShowIndicatorDetails(!showIndicatorDetails)}
                    style={styles.toggleButton}
                  >
                    <Text style={styles.toggleButtonText}>
                      {showIndicatorDetails ? 'Hide Details' : 'Show Details'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.strategyContainer}>
                  {Object.entries(INDICATOR_STRATEGIES).map(([key, strategy]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.strategyButton,
                        selectedStrategy === key && styles.selectedStrategy,
                      ]}
                      onPress={() => setSelectedStrategy(key as keyof typeof INDICATOR_STRATEGIES)}
                    >
                      <Text
                        style={[
                          styles.strategyButtonText,
                          selectedStrategy === key && styles.selectedStrategyText,
                        ]}
                      >
                        {strategy.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.strategyStatus}>
                  <Text style={styles.strategyStatusText}>
                    {INDICATOR_STRATEGIES[selectedStrategy].description}
                  </Text>
                  
                  {/* Auto-Trading Toggle */}
                  <View style={styles.autoTradingToggle}>
                    <Text style={styles.autoTradingLabel}>Auto Trading</Text>
                    <Switch
                      value={autoTradingEnabled}
                      onValueChange={setAutoTrading}
                      trackColor={{ false: '#767577', true: '#4ADE80' }}
                      thumbColor={autoTradingEnabled ? '#10B981' : '#f4f3f4'}
                    />
                  </View>
                </View>
              </View>

              {/* Detailed Indicator Views */}
              {showIndicatorDetails && (
                <>
                  {(selectedStrategy === 'Action Zone' || selectedStrategy === 'Combined Analysis') && currentIndicatorState?.actionZone && (
                    <ActionZoneDisplay
                      result={currentIndicatorState.actionZone}
                      compact={false}
                    />
                  )}
                  
                  {(selectedStrategy === 'RSI Divergence' || selectedStrategy === 'Combined Analysis') && currentIndicatorState?.rsiDivergence && (
                    <RSIChart
                      results={[currentIndicatorState.rsiDivergence]} // Convert single result to array
                      compact={false}
                      showDivergences={true}
                    />
                  )}
                </>
              )}

              {/* Professional Trading Form */}
              <TradingForm
                symbol={symbol}
                onSymbolChange={setSymbol}
                orderSide={orderSide}
                onOrderSideChange={setOrderSide}
                amount={amount}
                onAmountChange={setAmount}
                leverage={leverage}
                onLeverageChange={setLeverage}
                stopLoss={stopLoss}
                onStopLossChange={setStopLoss}
                takeProfit={takeProfit}
                onTakeProfitChange={setTakeProfit}
                useStopLoss={useStopLoss}
                onUseStopLossChange={setUseStopLoss}
                useTakeProfit={useTakeProfit}
                onUseTakeProfitChange={setUseTakeProfit}
                onSubmit={handleOpenPosition}
                loading={loading}
                disabled={!amount}
              />

              {/* Professional Open Positions */}
              <ProfessionalCard elevated style={{ marginHorizontal: spacing.md, marginBottom: spacing.xl }}>
                <Text style={styles.sectionTitle}>Open Positions ({positions.length})</Text>
                <PositionsList
                  positions={positions}
                  loading={loading}
                  onClosePosition={handleClosePosition}
                  onRefresh={refreshAll}
                  showActions={true}
                />
              </ProfessionalCard>
            </>
          ) : null}
        </ScrollView>

        {/* Connection Modal */}
        <Modal visible={showConnectModal} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Connect to {activeExchange === 'binance' ? 'Binance' : 'Gate.io'}
              </Text>

              {hasStoredCredentials ? (
                <TouchableOpacity
                  style={styles.loadCredentialsButton}
                  onPress={async () => {
                    const loaded = await loadStoredCredentials();
                    if (!loaded) {
                      Alert.alert(
                        'Info',
                        'No stored credentials found. Please configure them in Settings.'
                      );
                    }
                  }}
                >
                  <Text style={styles.loadCredentialsText}>📥 Load from Settings</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.noCredentialsInfo}>
                  <Text style={styles.noCredentialsText}>
                    No saved credentials. Configure in Settings tab first.
                  </Text>
                </View>
              )}

              <View style={styles.modalForm}>
                <Text style={styles.label}>API Key</Text>
                <TextInput
                  style={styles.input}
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="Enter API key"
                  placeholderTextColor="#999"
                  secureTextEntry
                />

                <Text style={styles.label}>API Secret</Text>
                <TextInput
                  style={styles.input}
                  value={apiSecret}
                  onChangeText={setApiSecret}
                  placeholder="Enter API secret"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowConnectModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConnect}
                >
                  <Text style={styles.confirmButtonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tradingColors.dark.background.primary,
  },
  header: {
    backgroundColor: tradingColors.dark.background.header,
    padding: spacing.trading.headerPadding,
    borderBottomWidth: 1,
    borderBottomColor: tradingColors.dark.border.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: tradingColors.dark.text.primary,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
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
  warningCard: {
    backgroundColor: '#FEF3CD',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#B45309',
    marginBottom: 12,
    lineHeight: 20,
  },
  settingsButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  settingsButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  connectCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  connectButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  balanceCard: {
    backgroundColor: '#FFF',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  balanceTypeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  spotBalanceRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  spotBalanceItem: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  spotAssetName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  spotAssetValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginTop: 2,
  },
  lastUpdateText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: tradingColors.dark.text.primary,
    marginBottom: spacing.md,
    letterSpacing: -0.25,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  balanceLoadingText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  debugContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  tradingCard: {
    backgroundColor: '#FFF',
    margin: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
  },
  chartCard: {
    backgroundColor: '#FFF',
    margin: 16,
    marginVertical: 8,
    padding: 12,
    paddingBottom: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.trading.chart,
    overflow: 'hidden',
    backgroundColor: tradingColors.dark.surface.elevated,
    minHeight: 240,
    borderWidth: 1,
    borderColor: tradingColors.dark.border.subtle,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  symbolButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  symbolButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  selectedSymbol: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  symbolButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedSymbolText: {
    color: '#FFF',
  },
  sideButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sideButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  longButton: {
    borderColor: '#10B981',
  },
  selectedLong: {
    backgroundColor: '#10B981',
  },
  shortButton: {
    borderColor: '#EF4444',
  },
  selectedShort: {
    backgroundColor: '#EF4444',
  },
  sideButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  leverageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  leverageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  selectedLeverage: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  leverageButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedLeverageText: {
    color: '#FFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  positionsCard: {
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 8,
    padding: 16,
    paddingBottom: 8,
    borderRadius: 12,
  },
  signalCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  signalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  signalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signalAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  signalActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  signalConfidence: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  signalReasons: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalForm: {
    marginBottom: 20,
  },
  loadCredentialsButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadCredentialsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noCredentialsInfo: {
    backgroundColor: '#FEF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noCredentialsText: {
    color: '#92400E',
    fontSize: 14,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  // Trading Strategy Styles
  strategyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  strategyButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedStrategy: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  strategyButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedStrategyText: {
    color: '#FFF',
  },
  strategyStatus: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  strategyStatusText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  signalText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  
  // ADDED: [HIGH] - [2025-09-02] - Claude Code
  // New styles for indicator integration
  indicatorCard: {
    backgroundColor: '#FFF',
    margin: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  indicatorControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  modeToggleText: {
    fontSize: 16,
  },
  indicatorPanelContainer: {
    backgroundColor: 'transparent',
    margin: 0,
  },
  currentSignalContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  buySignalContainer: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  sellSignalContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  signalTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  signalDetails: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  signalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalMetric: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  strategySection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  strategyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  
  // ADDED: [HIGH] - [2025-09-01] - Claude Code
  // New styles for CCXT-powered balance display
  ccxtSpotBalanceContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  ccxtBalanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  
  // New indicator component styles
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  autoTradingToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  autoTradingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

export default FuturesTradingScreen;
