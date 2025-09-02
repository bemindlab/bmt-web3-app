/**
 * Professional Trading Hooks Index
 * 
 * Centralized export of all trading-related custom hooks.
 * Provides clean imports throughout the application.
 */

export { useTradingConnection } from './useTradingConnection';
export { useTradingBalance } from './useTradingBalance';
export { useTradingOrders } from './useTradingOrders';

// Re-export hook types for convenience
export type {
  OrderType,
  OrderSide,
  TimeInForce,
  OrderParameters,
  OrderPreview,
} from './useTradingOrders';