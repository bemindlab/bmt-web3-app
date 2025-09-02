/**
 * Application Configuration Constants
 *
 * This file contains all hardcoded values that were previously scattered
 * throughout the codebase. All business logic constants should be defined here.
 *
 * DO NOT hardcode these values in components or services directly.
 * Import from this file instead.
 */

export const CONFIG = {
  API: {
    DEFAULT_TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4002/api',
  },

  EXCHANGES: {
    ENDPOINTS: {
      BINANCE: {
        SPOT: process.env.EXPO_PUBLIC_BINANCE_SPOT_URL || 'https://api.binance.com',
        FUTURES: process.env.EXPO_PUBLIC_BINANCE_FUTURES_URL || 'https://fapi.binance.com',
        TESTNET_SPOT:
          process.env.EXPO_PUBLIC_BINANCE_TESTNET_SPOT_URL || 'https://testnet.binance.vision',
        TESTNET_FUTURES:
          process.env.EXPO_PUBLIC_BINANCE_TESTNET_FUTURES_URL ||
          'https://testnet.binancefuture.com',
      },
      GATE: {
        SPOT: process.env.EXPO_PUBLIC_GATE_SPOT_URL || 'https://api.gateio.ws/api/v4',
        FUTURES: process.env.EXPO_PUBLIC_GATE_FUTURES_URL || 'https://fx-api.gateio.ws/api/v4',
      },
    },
  },

  TRADING: {
    MAX_LEVERAGE: Number(process.env.EXPO_PUBLIC_MAX_LEVERAGE) || 125,
    MIN_ORDER_SIZE: Number(process.env.EXPO_PUBLIC_MIN_ORDER_SIZE) || 0.001,
    DEFAULT_LEVERAGE: Number(process.env.EXPO_PUBLIC_DEFAULT_LEVERAGE) || 10,
    DEFAULT_SYMBOLS: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'],
  },

  VALIDATION: {
    API_KEY_LENGTH: {
      binance: Number(process.env.EXPO_PUBLIC_BINANCE_API_KEY_MIN_LENGTH) || 40,
      gate: Number(process.env.EXPO_PUBLIC_GATE_API_KEY_MIN_LENGTH) || 20,
    },
    API_SECRET_LENGTH: {
      binance: Number(process.env.EXPO_PUBLIC_BINANCE_API_SECRET_MIN_LENGTH) || 40,
      gate: Number(process.env.EXPO_PUBLIC_GATE_API_SECRET_MIN_LENGTH) || 20,
    },
  },

  RISK_MANAGEMENT: {
    THRESHOLDS: {
      LOW_RISK: Number(process.env.EXPO_PUBLIC_LOW_RISK_THRESHOLD) || 50,
      MEDIUM_RISK: Number(process.env.EXPO_PUBLIC_MEDIUM_RISK_THRESHOLD) || 20,
      HIGH_RISK: Number(process.env.EXPO_PUBLIC_HIGH_RISK_THRESHOLD) || 10,
      CRITICAL_RISK: Number(process.env.EXPO_PUBLIC_CRITICAL_RISK_THRESHOLD) || 5,
    },
    DEFAULT_STOP_LOSS_PERCENT: Number(process.env.EXPO_PUBLIC_DEFAULT_STOP_LOSS) || 5,
    DEFAULT_TAKE_PROFIT_PERCENT: Number(process.env.EXPO_PUBLIC_DEFAULT_TAKE_PROFIT) || 10,
  },

  UI: {
    CHART: {
      DEFAULT_HEIGHT: Number(process.env.EXPO_PUBLIC_CHART_HEIGHT) || 400,
      COMPACT_HEIGHT: Number(process.env.EXPO_PUBLIC_CHART_COMPACT_HEIGHT) || 220,
      DEFAULT_INTERVAL: process.env.EXPO_PUBLIC_CHART_INTERVAL || '15',
    },
    REFRESH: {
      BALANCE_INTERVAL: Number(process.env.EXPO_PUBLIC_BALANCE_REFRESH_INTERVAL) || 30000, // 30 seconds
      POSITIONS_INTERVAL: Number(process.env.EXPO_PUBLIC_POSITIONS_REFRESH_INTERVAL) || 15000, // 15 seconds
      MARKET_DATA_INTERVAL: Number(process.env.EXPO_PUBLIC_MARKET_DATA_REFRESH_INTERVAL) || 5000, // 5 seconds
    },
  },

  SECURITY: {
    ENCRYPTION_KEY: process.env.EXPO_PUBLIC_ENCRYPTION_KEY || 'bmt_encryption_key',
    ENCRYPTION_ALGORITHM: process.env.EXPO_PUBLIC_ENCRYPTION_ALGORITHM || 'aes-256-gcm',
  },

  DEFAULTS: {
    EXCHANGE: (process.env.EXPO_PUBLIC_DEFAULT_EXCHANGE as 'binance' | 'gate') || 'gate',
    SYMBOL: process.env.EXPO_PUBLIC_DEFAULT_SYMBOL || 'BTC/USDT',
    THEME: (process.env.EXPO_PUBLIC_DEFAULT_THEME as 'light' | 'dark') || 'light',
  },
} as const;

/**
 * Validate configuration on app start
 * This ensures all required configuration is present and valid
 */
export const validateConfig = (): void => {
  // Validate required API URL
  if (!CONFIG.API.BASE_URL) {
    throw new Error('API_BASE_URL not configured');
  }

  // Validate trading configuration
  if (CONFIG.TRADING.MAX_LEVERAGE < 1) {
    throw new Error('Invalid MAX_LEVERAGE configuration');
  }

  if (CONFIG.TRADING.MIN_ORDER_SIZE <= 0) {
    throw new Error('Invalid MIN_ORDER_SIZE configuration');
  }

  // Validate risk thresholds are in logical order
  const { THRESHOLDS } = CONFIG.RISK_MANAGEMENT;
  if (
    THRESHOLDS.LOW_RISK <= THRESHOLDS.MEDIUM_RISK ||
    THRESHOLDS.MEDIUM_RISK <= THRESHOLDS.HIGH_RISK ||
    THRESHOLDS.HIGH_RISK <= THRESHOLDS.CRITICAL_RISK
  ) {
    throw new Error('Risk thresholds must be in descending order: LOW > MEDIUM > HIGH > CRITICAL');
  }

  // Validate API key length requirements
  Object.entries(CONFIG.VALIDATION.API_KEY_LENGTH).forEach(([exchange, length]) => {
    if (length < 10) {
      throw new Error(`API key minimum length for ${exchange} is too low: ${length}`);
    }
  });

  console.log('✅ Configuration validation passed');
};

/**
 * Log current configuration (for debugging)
 * Only logs in development mode
 */
export const logConfig = (): void => {
  if (__DEV__) {
    console.log('📋 Application Configuration:');
    console.log(`API URL: ${CONFIG.API.BASE_URL}`);
    console.log(`Default Exchange: ${CONFIG.DEFAULTS.EXCHANGE}`);
    console.log(`Max Leverage: ${CONFIG.TRADING.MAX_LEVERAGE}`);
    console.log(`Risk Thresholds: ${JSON.stringify(CONFIG.RISK_MANAGEMENT.THRESHOLDS)}`);
    console.log(
      `Chart Heights: Default=${CONFIG.UI.CHART.DEFAULT_HEIGHT}, Compact=${CONFIG.UI.CHART.COMPACT_HEIGHT}`
    );
  }
};
