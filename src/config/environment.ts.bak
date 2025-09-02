/**
 * Environment Configuration
 *
 * This file centralizes all environment-specific configuration.
 * Use this instead of directly accessing process.env throughout the app.
 */

export const ENV = {
  // Environment info
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEV: __DEV__,
  IS_PROD: process.env.NODE_ENV === 'production',

  // API Configuration
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4002',
  API_TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000,

  // Firebase Configuration (passed through from constants if needed)
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,

  // WalletConnect
  WALLET_CONNECT_PROJECT_ID: process.env.EXPO_PUBLIC_WALLET_CONNECT_PROJECT_ID,

  // Exchange API URLs (for dynamic configuration)
  BINANCE_SPOT_URL: process.env.EXPO_PUBLIC_BINANCE_SPOT_URL,
  BINANCE_FUTURES_URL: process.env.EXPO_PUBLIC_BINANCE_FUTURES_URL,
  BINANCE_TESTNET_SPOT_URL: process.env.EXPO_PUBLIC_BINANCE_TESTNET_SPOT_URL,
  BINANCE_TESTNET_FUTURES_URL: process.env.EXPO_PUBLIC_BINANCE_TESTNET_FUTURES_URL,
  GATE_SPOT_URL: process.env.EXPO_PUBLIC_GATE_SPOT_URL,
  GATE_FUTURES_URL: process.env.EXPO_PUBLIC_GATE_FUTURES_URL,

  // App Configuration
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'BMT Web3 App',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',

  // Feature Flags
  ENABLE_DEBUG_MODE: process.env.EXPO_PUBLIC_ENABLE_DEBUG === 'true' || __DEV__,
  ENABLE_TESTNET: process.env.EXPO_PUBLIC_ENABLE_TESTNET === 'true',
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',

  // Security
  ENCRYPTION_KEY: process.env.EXPO_PUBLIC_ENCRYPTION_KEY,

  // Trading Configuration
  DEFAULT_EXCHANGE: process.env.EXPO_PUBLIC_DEFAULT_EXCHANGE || 'gate',
  DEFAULT_LEVERAGE: Number(process.env.EXPO_PUBLIC_DEFAULT_LEVERAGE) || 10,
  MAX_LEVERAGE: Number(process.env.EXPO_PUBLIC_MAX_LEVERAGE) || 125,

  // UI Configuration
  DEFAULT_THEME: process.env.EXPO_PUBLIC_DEFAULT_THEME || 'light',
  CHART_HEIGHT: Number(process.env.EXPO_PUBLIC_CHART_HEIGHT) || 400,
  CHART_COMPACT_HEIGHT: Number(process.env.EXPO_PUBLIC_CHART_COMPACT_HEIGHT) || 220,
} as const;

/**
 * Validate environment configuration
 */
export const validateEnvironment = (): void => {
  const requiredVars = [
    'EXPO_PUBLIC_API_URL',
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  const missingVars = requiredVars.filter((varName) => {
    const key = varName.replace('EXPO_PUBLIC_', '') as keyof typeof ENV;
    return !ENV[key];
  });

  if (missingVars.length > 0) {
    const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error('❌ Environment validation failed:', errorMsg);

    if (ENV.IS_PROD) {
      throw new Error(errorMsg);
    } else {
      console.warn('⚠️ Continuing in development mode with missing environment variables');
    }
  } else {
    console.log('✅ Environment validation passed');
  }
};

/**
 * Get environment-specific configuration
 */
export const getEnvironmentConfig = () => {
  return {
    isDevelopment: ENV.NODE_ENV === 'development',
    isProduction: ENV.NODE_ENV === 'production',
    isTest: ENV.NODE_ENV === 'test',
    apiBaseUrl: ENV.API_URL,
    enableDebug: ENV.ENABLE_DEBUG_MODE,
    enableTestnet: ENV.ENABLE_TESTNET,
  };
};

/**
 * Log environment configuration (development only)
 */
export const logEnvironment = (): void => {
  if (ENV.IS_DEV && ENV.ENABLE_DEBUG_MODE) {
    console.log('🌍 Environment Configuration:');
    console.log(`Node Environment: ${ENV.NODE_ENV}`);
    console.log(`API URL: ${ENV.API_URL}`);
    console.log(`Default Exchange: ${ENV.DEFAULT_EXCHANGE}`);
    console.log(`Debug Mode: ${ENV.ENABLE_DEBUG_MODE}`);
    console.log(`Testnet Enabled: ${ENV.ENABLE_TESTNET}`);
    console.log(`Default Theme: ${ENV.DEFAULT_THEME}`);
  }
};
