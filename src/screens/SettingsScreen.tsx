import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageService } from '../services/storage';
import { ApiKeys } from '../types';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { ApiKeySection } from '../components/settings/ApiKeySection';
import { SettingsActions } from '../components/settings/SettingsActions';
import { InfoSection } from '../components/settings/InfoSection';

// Hook for managing API key state
const useApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [loading, setLoading] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Individual key states
  const [binanceApiKey, setBinanceApiKey] = useState('');
  const [binanceApiSecret, setBinanceApiSecret] = useState('');
  const [gateApiKey, setGateApiKey] = useState('');
  const [gateApiSecret, setGateApiSecret] = useState('');

  // Testing states
  const [testingBinance, setTestingBinance] = useState(false);
  const [testingGate, setTestingGate] = useState(false);

  const loadApiKeys = async () => {
    try {
      const savedApiKeys = await StorageService.getApiKeys();
      if (savedApiKeys) {
        setApiKeys(savedApiKeys);

        // Parse Binance credentials
        if (savedApiKeys.binance) {
          const [key, secret] = savedApiKeys.binance.split(':');
          setBinanceApiKey(key || '');
          setBinanceApiSecret(secret || '');
        }

        // Parse Gate.io credentials
        if (savedApiKeys.gateio) {
          const [key, secret] = savedApiKeys.gateio.split(':');
          setGateApiKey(key || '');
          setGateApiSecret(secret || '');
        }
      }
    } catch (_error) {
      console.error('Error loading API keys:', _error);
      Alert.alert('Error', 'Failed to load API keys. Please try again.');
    }
  };

  const handleApiKeyChange = (key: keyof ApiKeys, value: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [key]: value,
    }));
    setUnsavedChanges(true);
  };

  const markUnsaved = () => {
    setUnsavedChanges(true);
  };

  const markSaved = () => {
    setUnsavedChanges(false);
  };

  return {
    // State
    apiKeys,
    loading,
    showApiKeys,
    unsavedChanges,
    binanceApiKey,
    binanceApiSecret,
    gateApiKey,
    gateApiSecret,
    testingBinance,
    testingGate,

    // Actions
    setLoading,
    setShowApiKeys,
    setBinanceApiKey,
    setBinanceApiSecret,
    setGateApiKey,
    setGateApiSecret,
    setTestingBinance,
    setTestingGate,
    loadApiKeys,
    handleApiKeyChange,
    markUnsaved,
    markSaved,

    // Clear all
    clearAll: () => {
      setBinanceApiKey('');
      setBinanceApiSecret('');
      setGateApiKey('');
      setGateApiSecret('');
      setApiKeys({});
      setUnsavedChanges(false);
    },
  };
};

export const SettingsScreen: React.FC = () => {
  const {
    loading,
    showApiKeys,
    unsavedChanges,
    binanceApiKey,
    binanceApiSecret,
    gateApiKey,
    gateApiSecret,
    testingBinance,
    testingGate,
    setLoading,
    setShowApiKeys,
    setBinanceApiKey,
    setBinanceApiSecret,
    setGateApiKey,
    setGateApiSecret,
    setTestingBinance,
    setTestingGate,
    loadApiKeys,
    markUnsaved,
    markSaved,
    clearAll,
  } = useApiKeyManagement();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const saveApiKeysInternal = async (): Promise<void> => {
    // Create a complete replacement object - this will overwrite all existing keys
    const keysToSave: ApiKeys = {
      binance: undefined,
      gateio: undefined,
    };

    // Only set values if both key and secret are provided
    if (binanceApiKey.trim() && binanceApiSecret.trim()) {
      keysToSave.binance = `${binanceApiKey.trim()}:${binanceApiSecret.trim()}`;
    }

    if (gateApiKey.trim() && gateApiSecret.trim()) {
      keysToSave.gateio = `${gateApiKey.trim()}:${gateApiSecret.trim()}`;
    }

    // This will completely replace the stored keys
    await StorageService.saveApiKeys(keysToSave);
  };

  const saveApiKeys = async () => {
    try {
      setLoading(true);
      await saveApiKeysInternal();
      markSaved();
      Alert.alert('✅ Success', 'API keys saved successfully!');
    } catch (error) {
      console.error('Error saving API keys:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        '❌ Save Failed',
        `Failed to save API keys.\n\nError: ${errorMessage}\n\n💡 This might be due to:\n• Storage permission issues\n• Insufficient device storage`,
        [{ text: 'Try Again', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const clearApiKeys = () => {
    Alert.alert(
      'Clear All API Keys',
      'Are you sure you want to clear all API keys? This action cannot be undone and will log you out of all exchanges.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearApiKeys();
              clearAll();
              Alert.alert('✅ Success', 'All API keys cleared successfully!');
            } catch {
              Alert.alert('❌ Error', 'Failed to clear API keys.');
            }
          },
        },
      ]
    );
  };

  // Test connection functions (CoinGecko removed as it's optional)

  const testExchangeConnection = async (exchange: 'binance' | 'gate') => {
    const isBinance = exchange === 'binance';
    const apiKey = isBinance ? binanceApiKey.trim() : gateApiKey.trim();
    const apiSecret = isBinance ? binanceApiSecret.trim() : gateApiSecret.trim();
    const setTesting = isBinance ? setTestingBinance : setTestingGate;
    const exchangeName = isBinance ? 'Binance' : 'Gate.io';

    if (!apiKey || !apiSecret) {
      Alert.alert(
        '⚠️ Missing Credentials',
        `Please enter both API key and secret for ${exchangeName} before testing the connection.\n\n💡 You can find your API credentials in your ${exchangeName} account settings.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      setTesting(true);

      // Import the futures trading service dynamically
      const { default: FuturesTradingService } = await import('../services/futuresTrading.service');

      // Test connection by attempting to initialize the exchange
      const result = await FuturesTradingService.initializeExchange({
        exchange,
        apiKey,
        apiSecret,
      });

      if (result.success) {
        // Connection successful - auto-save the API keys
        try {
          await saveApiKeysInternal();
          markSaved();
          Alert.alert(
            '🎉 Connection Successful!',
            `✅ ${exchangeName} API connection verified successfully!\n\n💾 Your API keys have been automatically saved.\n\n💡 You're now ready to start trading!${result.message ? '\n\nDetails: ' + result.message : ''}`,
            [{ text: 'Got it!', style: 'default' }]
          );
        } catch (saveError) {
          // Connection successful but save failed
          console.error('Auto-save failed after successful connection test:', saveError);
          const saveErrorMessage =
            saveError instanceof Error ? saveError.message : 'Unknown save error';
          Alert.alert(
            '✅ Connection Successful',
            `🎉 ${exchangeName} API connection verified successfully!${result.message ? '\n\nDetails: ' + result.message : ''}\n\n⚠️ However, auto-save failed:\n${saveErrorMessage}\n\nPlease use the "Save Keys" button to save manually.`,
            [
              { text: 'Save Manually', style: 'default' },
              { text: 'OK', style: 'cancel' },
            ]
          );
        }
      } else {
        Alert.alert(
          '❌ Connection Failed',
          `Unable to connect to ${exchangeName}.\n\n${result.message || 'Please check your API credentials and try again.'}\n\n💡 Make sure:\n• API key and secret are correct\n• API has required permissions\n• Network connection is stable`,
          [{ text: 'Try Again', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        '🔧 Connection Test Failed',
        `Unable to test ${exchangeName} API connection.\n\n${error instanceof Error ? error.message : 'An unexpected error occurred.'}\n\n💡 This might be due to:\n• Network connectivity issues\n• API service temporarily unavailable\n• Invalid API credentials format`,
        [{ text: 'Try Again', style: 'default' }]
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SettingsHeader
          showApiKeys={showApiKeys}
          onToggleVisibility={setShowApiKeys}
          unsavedChanges={unsavedChanges}
        />

        {/* Binance API Section */}
        <ApiKeySection
          title="Binance"
          subtitle="Optional - For Binance futures trading"
          apiKey={binanceApiKey}
          apiSecret={binanceApiSecret}
          onApiKeyChange={(value) => {
            setBinanceApiKey(value);
            markUnsaved();
          }}
          onApiSecretChange={(value) => {
            setBinanceApiSecret(value);
            markUnsaved();
          }}
          showApiKeys={showApiKeys}
          testing={testingBinance}
          onTest={() => testExchangeConnection('binance')}
          helpText="Configure API keys with Futures and Reading permissions. Connection test uses safe read-only calls."
        />

        {/* Gate.io API Section */}
        <ApiKeySection
          title="Gate.io"
          subtitle="Optional - For Gate.io futures trading"
          apiKey={gateApiKey}
          apiSecret={gateApiSecret}
          onApiKeyChange={(value) => {
            setGateApiKey(value);
            markUnsaved();
          }}
          onApiSecretChange={(value) => {
            setGateApiSecret(value);
            markUnsaved();
          }}
          showApiKeys={showApiKeys}
          testing={testingGate}
          onTest={() => testExchangeConnection('gate')}
          helpText="Configure API keys with Futures trading permissions. Spot trading permissions also recommended."
        />

        {/* Action Buttons */}
        <SettingsActions
          loading={loading}
          unsavedChanges={unsavedChanges}
          onSave={saveApiKeys}
          onClear={clearApiKeys}
        />

        {/* Information Section */}
        <InfoSection />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
