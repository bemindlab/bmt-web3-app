/**
 * Professional Trading Connection Hook
 * 
 * Handles exchange connection logic, API key management, and connection status.
 * Separates connection concerns from UI components.
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTradingStore } from '../stores/tradingStore';
import { StorageService } from '../services/storage';
import ccxtExchangeService from '../services/ccxtExchange.service';
import exchangeApiService from '../services/exchangeApi.service';

interface ConnectionCredentials {
  apiKey: string;
  apiSecret: string;
}

interface ConnectionState {
  isConnecting: boolean;
  hasStoredCredentials: boolean;
  showApiKeysWarning: boolean;
  lastConnectionAttempt: Date | null;
  connectionError: string | null;
}

export const useTradingConnection = () => {
  const {
    isConnected,
    activeExchange,
    initializeExchange,
    setActiveExchange,
  } = useTradingStore();

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false,
    hasStoredCredentials: false,
    showApiKeysWarning: false,
    lastConnectionAttempt: null,
    connectionError: null,
  });

  const [credentials, setCredentials] = useState<ConnectionCredentials>({
    apiKey: '',
    apiSecret: '',
  });

  // Check for stored API keys on mount and exchange change
  useEffect(() => {
    checkStoredCredentials();
  }, [activeExchange]);

  const checkStoredCredentials = useCallback(async () => {
    try {
      const savedApiKeys = await StorageService.getApiKeys();
      const exchangeKey = activeExchange === 'binance' ? 'binance' : 'gateio';

      if (savedApiKeys && savedApiKeys[exchangeKey]) {
        const credentials = savedApiKeys[exchangeKey];
        if (credentials && credentials.includes(':')) {
          const [key, secret] = credentials.split(':');
          if (key && secret) {
            setConnectionState(prev => ({
              ...prev,
              hasStoredCredentials: true,
              showApiKeysWarning: false,
            }));

            // Auto-connect if not already connected
            if (!isConnected[activeExchange]) {
              await handleAutoConnect(key, secret);
            }
            return;
          }
        }
      }

      // No valid credentials found
      setConnectionState(prev => ({
        ...prev,
        hasStoredCredentials: false,
        showApiKeysWarning: true,
      }));
    } catch (error) {
      console.error('Error checking stored credentials:', error);
      setConnectionState(prev => ({
        ...prev,
        hasStoredCredentials: false,
        showApiKeysWarning: true,
      }));
    }
  }, [activeExchange, isConnected]);

  const handleAutoConnect = async (apiKey: string, apiSecret: string) => {
    try {
      const success = await initializeExchange({
        exchange: activeExchange,
        apiKey,
        apiSecret,
      });

      if (success) {
        setConnectionState(prev => ({
          ...prev,
          connectionError: null,
          lastConnectionAttempt: new Date(),
        }));
      }
    } catch (error) {
      console.error('Auto-connect failed:', error);
      setConnectionState(prev => ({
        ...prev,
        connectionError: error instanceof Error ? error.message : 'Auto-connect failed',
      }));
    }
  };

  const loadStoredCredentials = useCallback(async (): Promise<boolean> => {
    try {
      const savedApiKeys = await StorageService.getApiKeys();
      const exchangeKey = activeExchange === 'binance' ? 'binance' : 'gateio';

      if (savedApiKeys && savedApiKeys[exchangeKey]) {
        const storedCredentials = savedApiKeys[exchangeKey];
        if (storedCredentials && storedCredentials.includes(':')) {
          const [key, secret] = storedCredentials.split(':');
          if (key && secret) {
            setCredentials({ apiKey: key, apiSecret: secret });
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading stored credentials:', error);
      return false;
    }
  }, [activeExchange]);

  const testConnection = useCallback(async (testCredentials?: ConnectionCredentials) => {
    const testCreds = testCredentials || credentials;
    
    if (!testCreds.apiKey || !testCreds.apiSecret) {
      throw new Error('Please enter API key and secret');
    }

    setConnectionState(prev => ({
      ...prev,
      isConnecting: true,
      connectionError: null,
    }));

    try {
      console.log(`🔗 Testing connection to ${activeExchange} via CCXT service...`);

      // Test signature implementations for debugging
      const signatureTest = await exchangeApiService.testSignatureImplementations();
      console.log('📊 Signature test result:', signatureTest);

      // Test real signature for Gate.io
      if (activeExchange === 'gate') {
        const gateSignatureTest = await exchangeApiService.testGateSignatureWithRealCall(
          testCreds.apiKey,
          testCreds.apiSecret
        );
        console.log('📊 Gate.io signature test result:', gateSignatureTest);
      }

      // Test connection with CCXT service
      const connectionTest = await ccxtExchangeService.testConnection({
        exchange: activeExchange,
        apiKey: testCreds.apiKey,
        apiSecret: testCreds.apiSecret,
        testnet: false,
      });

      if (connectionTest.success) {
        console.log('✅ CCXT connection test successful:', connectionTest.message);
        
        setConnectionState(prev => ({
          ...prev,
          isConnecting: false,
          connectionError: null,
          lastConnectionAttempt: new Date(),
        }));

        return connectionTest;
      } else {
        throw new Error(connectionTest.error || 'Connection test failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: errorMessage,
        lastConnectionAttempt: new Date(),
      }));

      throw error;
    }
  }, [credentials, activeExchange]);

  const connectToExchange = useCallback(async (connectCredentials?: ConnectionCredentials) => {
    const connectCreds = connectCredentials || credentials;
    
    try {
      // First test the connection
      await testConnection(connectCreds);

      // If test passes, initialize the exchange in the store
      const success = await initializeExchange({
        exchange: activeExchange,
        apiKey: connectCreds.apiKey,
        apiSecret: connectCreds.apiSecret,
      });

      if (success) {
        // Clear credentials from state for security
        setCredentials({ apiKey: '', apiSecret: '' });
        
        setConnectionState(prev => ({
          ...prev,
          hasStoredCredentials: true,
          showApiKeysWarning: false,
        }));

        return true;
      } else {
        throw new Error('Failed to initialize exchange connection');
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to exchange';
      
      Alert.alert('Connection Failed', errorMessage, [
        { text: 'Check Keys', onPress: () => {} }, // Could navigate to settings
        { text: 'Retry', onPress: () => connectToExchange(connectCreds) },
        { text: 'Cancel' },
      ]);

      return false;
    }
  }, [credentials, activeExchange, testConnection, initializeExchange]);

  const switchExchange = useCallback((exchange: 'binance' | 'gate') => {
    setActiveExchange(exchange);
    // Clear any existing credentials when switching
    setCredentials({ apiKey: '', apiSecret: '' });
    setConnectionState(prev => ({
      ...prev,
      connectionError: null,
    }));
  }, [setActiveExchange]);

  const updateCredentials = useCallback((newCredentials: Partial<ConnectionCredentials>) => {
    setCredentials(prev => ({ ...prev, ...newCredentials }));
    
    // Clear connection error when user starts typing
    if (connectionState.connectionError) {
      setConnectionState(prev => ({ ...prev, connectionError: null }));
    }
  }, [connectionState.connectionError]);

  const clearCredentials = useCallback(() => {
    setCredentials({ apiKey: '', apiSecret: '' });
  }, []);

  return {
    // Connection state
    isConnected: isConnected[activeExchange],
    activeExchange,
    connectionState,
    credentials,

    // Connection actions
    connectToExchange,
    testConnection,
    switchExchange,
    loadStoredCredentials,
    checkStoredCredentials,

    // Credential management
    updateCredentials,
    clearCredentials,
    
    // Computed properties
    canConnect: Boolean(credentials.apiKey && credentials.apiSecret && !connectionState.isConnecting),
    needsCredentials: !connectionState.hasStoredCredentials && !isConnected[activeExchange],
  };
};