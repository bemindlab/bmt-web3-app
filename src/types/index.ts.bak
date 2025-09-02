export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume: number;
  image: string;
}

// Extended type for detailed coin data (used in CoinDetailScreen)
export interface CryptoDataDetailed extends CryptoData {
  market_cap_rank?: number;
  total_volume?: number;
  high_24h?: number;
  low_24h?: number;
  circulating_supply?: number;
  total_supply?: number;
  max_supply?: number;
  ath?: number; // All-time high
  atl?: number; // All-time low
}

export interface ApiKeys {
  binance?: string;
  gateio?: string;
}

export interface TrendingCrypto {
  coins: Array<{
    item: {
      id: string;
      coin_id: number;
      name: string;
      symbol: string;
      market_cap_rank: number;
      thumb: string;
      small: string;
      large: string;
      slug: string;
      price_btc: number;
      score: number;
    };
  }>;
}

// Trading Indicator Types
export interface IndicatorState {
  isLoading: boolean;
  hasData: boolean;
  lastUpdate?: Date;
  error?: string;
}

export interface TradingSignal {
  type: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number; // 0-100
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  source: string; // e.g., 'ACTION_ZONE', 'RSI_DIVERGENCE', 'COMBINED'
  timestamp: Date;
  details?: string;
}

export interface IndicatorDisplayProps {
  symbol: string;
  compact?: boolean;
  autoRefresh?: boolean;
  onSignalChange?: (signal: TradingSignal) => void;
}

export interface MarketCandle {
  symbol: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Strategy Types
export type TradingStrategy = 
  | 'MANUAL'
  | 'ACTION_ZONE'
  | 'RSI_DIVERGENCE' 
  | 'COMBINED_INDICATORS'
  | 'TREND_FOLLOWING'
  | 'SCALPING'
  | 'MEAN_REVERSION';

export interface StrategyConfig {
  name: TradingStrategy;
  displayName: string;
  description: string;
  enabled: boolean;
  parameters?: Record<string, any>;
}

// Signal Generation Types
export interface SignalGenerationResult {
  signal: TradingSignal;
  actionZone?: import('../lib/indicators/action-zone').ActionZoneResult;
  rsiDivergence?: import('../lib/indicators/rsi').RSIDivergenceResult;
  metadata?: {
    dataPoints: number;
    calculationTime: number;
    reliability: number;
  };
}
