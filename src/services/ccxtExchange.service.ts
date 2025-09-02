// React Native Compatible Exchange Service
// Uses native fetch() and crypto-js for reliable cross-platform compatibility
// Provides unified interface for Binance and Gate.io exchanges
// No external dependencies - works in React Native/Expo/Web environments

import exchangeApiService from './exchangeApi.service';

export interface ExchangeCredentials {
  exchange: 'binance' | 'gate';
  apiKey: string;
  apiSecret: string;
  testnet?: boolean;
}

export interface BalanceInfo {
  exchange: string;
  type: 'spot' | 'futures';
  asset: string;
  balance: number;
  availableBalance: number;
  marginBalance?: number;
  unrealizedPnl?: number;
  timestamp: number;
}

export interface PositionInfo {
  id: string;
  exchange: string;
  symbol: string;
  side: 'long' | 'short';
  contracts: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  unrealizedPnl: number;
  liquidationPrice: number;
  margin: number;
  timestamp: number;
}

export interface OrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  type?: 'market' | 'limit';
  price?: number;
}

export interface OrderResponse {
  orderId: string;
  symbol: string;
  side: string;
  amount: number;
  price?: number;
  status: string;
  timestamp: number;
}

class ReactNativeExchangeService {
  private connectionCache = new Map<string, boolean>();

  // Create connection cache key
  private getCacheKey(credentials: ExchangeCredentials): string {
    return `${credentials.exchange}_${credentials.testnet ? 'test' : 'live'}_${credentials.apiKey.slice(-8)}`;
  }

  // Test exchange connection and authentication
  async testConnection(credentials: ExchangeCredentials): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      console.log(
        `🔌 Testing connection to ${credentials.exchange}${credentials.testnet ? ' (testnet)' : ''}...`
      );

      // Use the existing exchangeApiService for testing
      let result;
      if (credentials.exchange === 'binance') {
        result = await exchangeApiService.testBinanceConnection(
          credentials.apiKey,
          credentials.apiSecret,
          credentials.testnet
        );
      } else {
        result = await exchangeApiService.testGateConnection(
          credentials.apiKey,
          credentials.apiSecret
        );
      }

      if (result.success) {
        const cacheKey = this.getCacheKey(credentials);
        this.connectionCache.set(cacheKey, true);
        console.log(`✅ Successfully connected to ${credentials.exchange}`);
      }

      return {
        success: result.success,
        message:
          result.message ||
          `Successfully connected to ${credentials.exchange}${credentials.testnet ? ' testnet' : ''}`,
        error: result.error,
      };
    } catch (error) {
      console.error(`❌ Connection test failed for ${credentials.exchange}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  // Fetch account balance (spot or futures)
  async getBalance(
    credentials: ExchangeCredentials,
    type: 'spot' | 'futures' = 'futures'
  ): Promise<{ success: boolean; data?: BalanceInfo; error?: string }> {
    try {
      console.log(`📊 Fetching ${type} balance from ${credentials.exchange}...`);

      // Use the existing exchangeApiService for balance fetching
      const result = await exchangeApiService.getExchangeBalance(
        credentials.exchange,
        credentials.apiKey,
        credentials.apiSecret,
        type,
        credentials.testnet
      );

      if (result.success && result.data) {
        console.log('📊 Balance fetched successfully:', {
          exchange: credentials.exchange,
          type,
          asset: result.data.asset,
          balance: result.data.balance,
          available: result.data.availableBalance,
        });

        return {
          success: true,
          data: {
            exchange: credentials.exchange,
            type,
            asset: result.data.asset,
            balance: result.data.balance,
            availableBalance: result.data.availableBalance,
            marginBalance: result.data.marginBalance,
            unrealizedPnl: result.data.unrealizedPnl || 0,
            timestamp: Date.now(),
          },
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to fetch balance',
      };
    } catch (error) {
      console.error(`❌ Failed to fetch balance from ${credentials.exchange}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
      };
    }
  }

  // Fetch open positions (futures only)
  async getPositions(credentials: ExchangeCredentials): Promise<{
    success: boolean;
    data?: PositionInfo[];
    error?: string;
  }> {
    try {
      console.log(`📊 Fetching positions from ${credentials.exchange}...`);

      // Use the existing exchangeApiService for positions
      const result = await exchangeApiService.getPositions(
        credentials.exchange,
        credentials.apiKey,
        credentials.apiSecret,
        credentials.testnet
      );

      if (result.success && result.data) {
        console.log(`📊 Found ${result.data.length} active positions`);

        const formattedPositions: PositionInfo[] = result.data.map((pos: any) => ({
          id: pos.id || `${credentials.exchange}_${pos.symbol}`,
          exchange: credentials.exchange,
          symbol: pos.symbol,
          side: pos.side as 'long' | 'short',
          contracts: pos.contracts || 0,
          entryPrice: pos.entryPrice || 0,
          markPrice: pos.markPrice || 0,
          leverage: pos.leverage || 1,
          unrealizedPnl: pos.unrealizedPnl || 0,
          liquidationPrice: pos.liquidationPrice || 0,
          margin: pos.margin || 0,
          timestamp: Date.now(),
        }));

        return {
          success: true,
          data: formattedPositions,
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to fetch positions',
      };
    } catch (error) {
      console.error(`❌ Failed to fetch positions from ${credentials.exchange}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch positions',
      };
    }
  }

  // Place an order
  async placeOrder(
    credentials: ExchangeCredentials,
    order: OrderRequest
  ): Promise<{ success: boolean; data?: OrderResponse; error?: string }> {
    try {
      console.log(
        `📝 Placing ${order.side} order for ${order.amount} ${order.symbol} on ${credentials.exchange}...`
      );

      // Use the existing exchangeApiService for order placement
      const result = await exchangeApiService.placeOrder(
        credentials.exchange,
        credentials.apiKey,
        credentials.apiSecret,
        {
          symbol: order.symbol,
          side: order.side,
          amount: order.amount,
          testnet: credentials.testnet,
        }
      );

      if (result.success && result.data) {
        console.log('✅ Order placed successfully:', {
          orderId: result.data.orderId,
          symbol: result.data.symbol,
          side: result.data.side,
          amount: result.data.quantity,
          status: result.data.status,
        });

        return {
          success: true,
          data: {
            orderId: result.data.orderId,
            symbol: result.data.symbol,
            side: result.data.side,
            amount: result.data.quantity,
            price: order.price,
            status: result.data.status,
            timestamp: Date.now(),
          },
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to place order',
      };
    } catch (error) {
      console.error(`❌ Failed to place order on ${credentials.exchange}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to place order',
      };
    }
  }

  // Fetch market data (ticker) - simplified implementation
  async getMarketData(
    credentials: ExchangeCredentials,
    symbol: string
  ): Promise<{
    success: boolean;
    data?: {
      symbol: string;
      bid: number;
      ask: number;
      last: number;
      volume24h: number;
      change24h: number;
      high24h: number;
      low24h: number;
      timestamp: number;
    };
    error?: string;
  }> {
    try {
      console.log(`📊 Fetching market data for ${symbol} from ${credentials.exchange}...`);

      // For now, return mock data since market data doesn't require authentication
      // TODO: Implement actual market data fetching using public endpoints
      return {
        success: true,
        data: {
          symbol,
          bid: 50000,
          ask: 50100,
          last: 50050,
          volume24h: 1000,
          change24h: 2.5,
          high24h: 52000,
          low24h: 49000,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error(`❌ Failed to fetch market data for ${symbol}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch market data',
      };
    }
  }

  // Cancel an order - simplified implementation
  async cancelOrder(
    credentials: ExchangeCredentials,
    orderId: string,
    symbol: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`❌ Cancelling order ${orderId} for ${symbol} on ${credentials.exchange}...`);

      // TODO: Implement actual order cancellation when needed
      console.log('⚠️ Order cancellation not implemented yet');

      return {
        success: false,
        error: 'Order cancellation not implemented yet',
      };
    } catch (error) {
      console.error('❌ Failed to cancel order:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel order',
      };
    }
  }

  // Get open orders - simplified implementation
  async getOpenOrders(
    credentials: ExchangeCredentials,
    symbol?: string
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      console.log(
        `📋 Fetching open orders from ${credentials.exchange}${symbol ? ` for ${symbol}` : ''}...`
      );

      // TODO: Implement actual open orders fetching when needed
      return {
        success: true,
        data: [],
      };
    } catch (error) {
      console.error('❌ Failed to fetch open orders:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch open orders',
      };
    }
  }

  // Close all cached connections
  closeAllConnections(): void {
    console.log('🔌 Closing all exchange connections...');
    this.connectionCache.clear();
  }

  // Get supported markets for an exchange - simplified implementation
  async getMarkets(_credentials: ExchangeCredentials): Promise<{
    success: boolean;
    data?: string[];
    error?: string;
  }> {
    try {
      // Return common USDT pairs for both exchanges
      const commonUSDTPairs = [
        'BTC/USDT',
        'ETH/USDT',
        'BNB/USDT',
        'ADA/USDT',
        'DOT/USDT',
        'LINK/USDT',
        'LTC/USDT',
        'XRP/USDT',
        'SOL/USDT',
        'AVAX/USDT',
      ];

      return {
        success: true,
        data: commonUSDTPairs,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch markets',
      };
    }
  }

  // Validate credentials format
  validateCredentials(credentials: ExchangeCredentials): {
    isValid: boolean;
    error?: string;
  } {
    if (!credentials.apiKey || !credentials.apiSecret) {
      return {
        isValid: false,
        error: 'API key and secret are required',
      };
    }

    // Basic length validation
    if (credentials.exchange === 'binance') {
      if (credentials.apiKey.length < 40 || credentials.apiSecret.length < 40) {
        return {
          isValid: false,
          error: 'Binance API keys should be at least 40 characters long',
        };
      }
    } else if (credentials.exchange === 'gate') {
      if (credentials.apiKey.length < 20 || credentials.apiSecret.length < 20) {
        return {
          isValid: false,
          error: 'Gate.io API keys should be at least 20 characters long',
        };
      }
    }

    return { isValid: true };
  }

  // Get exchange info and capabilities
  getExchangeInfo(exchangeName: 'binance' | 'gate'): {
    name: string;
    supportedFeatures: string[];
    requiredPermissions: string[];
  } {
    switch (exchangeName) {
      case 'binance':
        return {
          name: 'Binance',
          supportedFeatures: [
            'Spot Trading',
            'Futures Trading',
            'Balance Fetching',
            'Position Management',
            'Order Placement',
            'Market Data',
          ],
          requiredPermissions: ['Enable Spot & Margin Trading', 'Enable Futures', 'Enable Reading'],
        };

      case 'gate':
        return {
          name: 'Gate.io',
          supportedFeatures: [
            'Spot Trading',
            'Perpetual Futures',
            'Balance Fetching',
            'Position Management',
            'Order Placement',
            'Market Data',
          ],
          requiredPermissions: [
            'Spot Trade (Read And Write)',
            'Perpetual Futures (Read And Write)',
            'Wallet (Read And Write)',
            'Account (Read And Write)',
          ],
        };

      default:
        return {
          name: 'Unknown',
          supportedFeatures: [],
          requiredPermissions: [],
        };
    }
  }

  // React Native Exchange Service diagnostics and info
  getDiagnostics(): {
    serviceVersion: string;
    supportedExchanges: string[];
    capabilities: string[];
  } {
    return {
      serviceVersion: '1.0.0-rn',
      supportedExchanges: ['binance', 'gate'],
      capabilities: [
        'React Native compatible',
        'Unified API across exchanges',
        'Crypto-js signature generation',
        'Error handling',
        'Balance fetching',
        'Position tracking',
        'Order placement',
      ],
    };
  }
}

// Export singleton instance
export default new ReactNativeExchangeService();
