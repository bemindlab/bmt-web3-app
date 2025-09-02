import { ActionZoneStrategy, ActionZoneResult, OHLCV } from '../lib/indicators/action-zone';
import { RSIDivergenceIndicator, RSIDivergenceResult, calculateOHLC4 } from '../lib/indicators/rsi';

// Configuration constants to avoid hardcoding
const CONFIG = {
  INDICATORS: {
    ACTION_ZONE: {
      FAST_EMA_PERIOD: 12,
      SLOW_EMA_PERIOD: 26,
      SMOOTHING_PERIOD: 9,
    },
    RSI: {
      PERIOD: 14,
      OVERBOUGHT: 70,
      OVERSOLD: 30,
      SHORT_LOOKBACK: 5,
      LONG_LOOKBACK: 25,
    },
  },
  UPDATE_INTERVALS: {
    FAST: 1000, // 1 second for real-time updates
    NORMAL: 5000, // 5 seconds for background updates
    SLOW: 30000, // 30 seconds for historical data
  },
  DATA_RETENTION: {
    MAX_CANDLES: 500, // Maximum number of candles to keep in memory
    MIN_CANDLES_FOR_ANALYSIS: 50, // Minimum required for reliable analysis
  },
} as const;

export interface IndicatorSignal {
  type: 'BUY' | 'SELL' | 'HOLD';
  strength: number; // 0-100 confidence score
  source: 'ACTION_ZONE' | 'RSI_DIVERGENCE' | 'COMBINED';
  message: string;
  timestamp: number;
  price: number;
  reasons: string[];
}

export interface IndicatorState {
  actionZone: ActionZoneResult | null;
  rsiDivergence: RSIDivergenceResult | null;
  combinedSignal: IndicatorSignal | null;
  lastUpdate: number;
  isAnalyzing: boolean;
  error: string | null;
  dataQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

export interface MarketCandle extends OHLCV {
  symbol: string;
}

export class IndicatorService {
  private static instance: IndicatorService;
  private actionZoneStrategy: ActionZoneStrategy;
  private rsiIndicator: RSIDivergenceIndicator;
  
  // Data storage for real-time analysis
  private candleData: Map<string, MarketCandle[]> = new Map();
  private indicators: Map<string, IndicatorState> = new Map();
  
  // Observer pattern for real-time updates
  private subscribers: Map<string, ((state: IndicatorState) => void)[]> = new Map();
  
  // Update timers
  private updateTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.actionZoneStrategy = new ActionZoneStrategy({
      fastEMAPeriod: CONFIG.INDICATORS.ACTION_ZONE.FAST_EMA_PERIOD,
      slowEMAPeriod: CONFIG.INDICATORS.ACTION_ZONE.SLOW_EMA_PERIOD,
      smoothingPeriod: CONFIG.INDICATORS.ACTION_ZONE.SMOOTHING_PERIOD,
    });

    this.rsiIndicator = new RSIDivergenceIndicator({
      period: CONFIG.INDICATORS.RSI.PERIOD,
      overbought: CONFIG.INDICATORS.RSI.OVERBOUGHT,
      oversold: CONFIG.INDICATORS.RSI.OVERSOLD,
      shortLookback: CONFIG.INDICATORS.RSI.SHORT_LOOKBACK,
      longLookback: CONFIG.INDICATORS.RSI.LONG_LOOKBACK,
    });
  }

  static getInstance(): IndicatorService {
    if (!IndicatorService.instance) {
      IndicatorService.instance = new IndicatorService();
    }
    return IndicatorService.instance;
  }

  /**
   * Subscribe to real-time indicator updates for a symbol
   */
  subscribe(symbol: string, callback: (state: IndicatorState) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }
    
    this.subscribers.get(symbol)!.push(callback);
    
    // Initialize indicator state if not exists
    if (!this.indicators.has(symbol)) {
      this.indicators.set(symbol, this.createInitialState());
    }
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(symbol);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Update market data and trigger indicator analysis
   */
  async updateMarketData(symbol: string, candles: MarketCandle[]): Promise<void> {
    try {
      // Validate input data
      if (!candles || candles.length === 0) {
        this.updateIndicatorState(symbol, { error: 'No market data available' });
        return;
      }

      // Store candle data with retention limit
      const processedCandles = this.processAndStoreCandles(symbol, candles);
      
      // Analyze indicators if we have sufficient data
      if (processedCandles.length >= CONFIG.DATA_RETENTION.MIN_CANDLES_FOR_ANALYSIS) {
        await this.analyzeIndicators(symbol, processedCandles);
      } else {
        this.updateIndicatorState(symbol, { 
          error: `Insufficient data: ${processedCandles.length}/${CONFIG.DATA_RETENTION.MIN_CANDLES_FOR_ANALYSIS} candles`,
          dataQuality: 'POOR'
        });
      }
    } catch (error) {
      console.error(`Error updating market data for ${symbol}:`, error);
      this.updateIndicatorState(symbol, {
        error: error instanceof Error ? error.message : 'Analysis failed',
        isAnalyzing: false,
      });
    }
  }

  /**
   * Get current indicator state for a symbol
   */
  getIndicatorState(symbol: string): IndicatorState | null {
    return this.indicators.get(symbol) || null;
  }

  /**
   * Get trading signal for a symbol based on all indicators
   */
  getTradingSignal(symbol: string): IndicatorSignal | null {
    const state = this.indicators.get(symbol);
    return state?.combinedSignal || null;
  }

  /**
   * Start real-time updates for a symbol
   */
  startRealTimeUpdates(symbol: string, updateInterval: number = CONFIG.UPDATE_INTERVALS.NORMAL): void {
    // Clear existing timer
    this.stopRealTimeUpdates(symbol);

    const timer = setInterval(async () => {
      const candles = this.candleData.get(symbol);
      if (candles && candles.length > 0) {
        // Simulate new candle data (in real implementation, this would come from WebSocket)
        await this.simulateNewCandle(symbol);
      }
    }, updateInterval);

    this.updateTimers.set(symbol, timer);
  }

  /**
   * Stop real-time updates for a symbol
   */
  stopRealTimeUpdates(symbol: string): void {
    const timer = this.updateTimers.get(symbol);
    if (timer) {
      clearInterval(timer);
      this.updateTimers.delete(symbol);
    }
  }

  /**
   * Clean up resources for a symbol
   */
  cleanup(symbol: string): void {
    this.stopRealTimeUpdates(symbol);
    this.candleData.delete(symbol);
    this.indicators.delete(symbol);
    this.subscribers.delete(symbol);
  }

  /**
   * Reset all indicators for a symbol
   */
  resetIndicators(symbol: string): void {
    this.actionZoneStrategy.reset();
    this.indicators.set(symbol, this.createInitialState());
    this.notifySubscribers(symbol);
  }

  // Private helper methods

  private createInitialState(): IndicatorState {
    return {
      actionZone: null,
      rsiDivergence: null,
      combinedSignal: null,
      lastUpdate: Date.now(),
      isAnalyzing: false,
      error: null,
      dataQuality: 'POOR',
    };
  }

  private processAndStoreCandles(symbol: string, newCandles: MarketCandle[]): MarketCandle[] {
    const existingCandles = this.candleData.get(symbol) || [];
    
    // Merge new candles with existing ones, avoiding duplicates
    const mergedCandles = [...existingCandles];
    
    newCandles.forEach(newCandle => {
      const existingIndex = mergedCandles.findIndex(c => c.timestamp === newCandle.timestamp);
      if (existingIndex >= 0) {
        // Update existing candle
        mergedCandles[existingIndex] = { ...newCandle, symbol };
      } else {
        // Add new candle
        mergedCandles.push({ ...newCandle, symbol });
      }
    });

    // Sort by timestamp and limit to maximum retention
    mergedCandles.sort((a, b) => a.timestamp - b.timestamp);
    const limitedCandles = mergedCandles.slice(-CONFIG.DATA_RETENTION.MAX_CANDLES);
    
    this.candleData.set(symbol, limitedCandles);
    return limitedCandles;
  }

  private async analyzeIndicators(symbol: string, candles: MarketCandle[]): Promise<void> {
    this.updateIndicatorState(symbol, { isAnalyzing: true, error: null });

    try {
      // Analyze Action Zone
      const actionZoneResult = this.actionZoneStrategy.analyze(candles);

      // Prepare data for RSI analysis
      const ohlc4Prices = candles.map(c => calculateOHLC4(c.open, c.high, c.low, c.close));
      const highs = candles.map(c => c.high);
      const lows = candles.map(c => c.low);
      const closes = candles.map(c => c.close);

      // Analyze RSI Divergence (get latest result)
      const rsiResults = this.rsiIndicator.calculate(ohlc4Prices, highs, lows, closes);
      const rsiResult = rsiResults[rsiResults.length - 1] || null;

      // Generate combined signal
      const combinedSignal = this.generateCombinedSignal(symbol, actionZoneResult, rsiResult, candles);

      // Determine data quality
      const dataQuality = this.assessDataQuality(candles);

      // Update state
      this.updateIndicatorState(symbol, {
        actionZone: actionZoneResult,
        rsiDivergence: rsiResult,
        combinedSignal,
        dataQuality,
        isAnalyzing: false,
        lastUpdate: Date.now(),
      });

    } catch (error) {
      console.error(`Error analyzing indicators for ${symbol}:`, error);
      this.updateIndicatorState(symbol, {
        error: error instanceof Error ? error.message : 'Analysis failed',
        isAnalyzing: false,
      });
    }
  }

  private generateCombinedSignal(
    symbol: string,
    actionZone: ActionZoneResult,
    rsi: RSIDivergenceResult | null,
    candles: MarketCandle[]
  ): IndicatorSignal {
    const currentPrice = candles[candles.length - 1].close;
    const reasons: string[] = [];
    let signalType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let strength = 50; // Neutral strength
    const source: 'ACTION_ZONE' | 'RSI_DIVERGENCE' | 'COMBINED' = 'COMBINED';

    // Action Zone analysis
    if (actionZone.isBuySignal) {
      signalType = 'BUY';
      strength = Math.max(strength, actionZone.strength);
      reasons.push(`Action Zone: ${actionZone.zone} (${actionZone.trend})`);
    } else if (actionZone.isSellSignal) {
      signalType = 'SELL';
      strength = Math.min(strength, 100 - actionZone.strength);
      reasons.push(`Action Zone: ${actionZone.zone} (${actionZone.trend})`);
    }

    // RSI Divergence analysis
    if (rsi) {
      if (rsi.bullishDivergence) {
        if (signalType !== 'SELL') signalType = 'BUY';
        strength = Math.max(strength, rsi.bullishDivergenceAlert);
        reasons.push(`RSI Bullish Divergence (RSI: ${rsi.rsi.toFixed(1)})`);
      } else if (rsi.bearishDivergence) {
        if (signalType !== 'BUY') signalType = 'SELL';
        strength = Math.min(strength, 100 - rsi.bearishDivergenceAlert);
        reasons.push(`RSI Bearish Divergence (RSI: ${rsi.rsi.toFixed(1)})`);
      }

      // Additional RSI context
      if (rsi.rsi >= CONFIG.INDICATORS.RSI.OVERBOUGHT) {
        reasons.push(`RSI Overbought (${rsi.rsi.toFixed(1)})`);
      } else if (rsi.rsi <= CONFIG.INDICATORS.RSI.OVERSOLD) {
        reasons.push(`RSI Oversold (${rsi.rsi.toFixed(1)})`);
      }
    }

    // Generate message
    let message = '';
    switch (signalType) {
      case 'BUY':
        message = `BUY signal for ${symbol}`;
        break;
      case 'SELL':
        message = `SELL signal for ${symbol}`;
        break;
      default:
        message = `HOLD - No clear signal for ${symbol}`;
    }

    return {
      type: signalType,
      strength: Math.round(strength),
      source,
      message,
      timestamp: Date.now(),
      price: currentPrice,
      reasons,
    };
  }

  private assessDataQuality(candles: MarketCandle[]): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
    if (candles.length >= CONFIG.DATA_RETENTION.MAX_CANDLES * 0.8) {
      return 'EXCELLENT';
    } else if (candles.length >= CONFIG.DATA_RETENTION.MIN_CANDLES_FOR_ANALYSIS * 2) {
      return 'GOOD';
    } else if (candles.length >= CONFIG.DATA_RETENTION.MIN_CANDLES_FOR_ANALYSIS) {
      return 'FAIR';
    }
    return 'POOR';
  }

  private updateIndicatorState(symbol: string, updates: Partial<IndicatorState>): void {
    const currentState = this.indicators.get(symbol) || this.createInitialState();
    const newState = { ...currentState, ...updates };
    this.indicators.set(symbol, newState);
    this.notifySubscribers(symbol);
  }

  private notifySubscribers(symbol: string): void {
    const callbacks = this.subscribers.get(symbol);
    const state = this.indicators.get(symbol);
    
    if (callbacks && state) {
      callbacks.forEach(callback => {
        try {
          callback(state);
        } catch (error) {
          console.error('Error notifying subscriber:', error);
        }
      });
    }
  }

  private async simulateNewCandle(symbol: string): Promise<void> {
    // This is a simulation - in production, this would be replaced with real WebSocket data
    const candles = this.candleData.get(symbol);
    if (!candles || candles.length === 0) return;

    const lastCandle = candles[candles.length - 1];
    const priceChange = (Math.random() - 0.5) * 0.02; // ±1% random change
    const newPrice = lastCandle.close * (1 + priceChange);

    const newCandle: MarketCandle = {
      symbol,
      open: lastCandle.close,
      high: Math.max(lastCandle.close, newPrice),
      low: Math.min(lastCandle.close, newPrice),
      close: newPrice,
      volume: lastCandle.volume * (0.5 + Math.random()),
      timestamp: Date.now(),
    };

    await this.updateMarketData(symbol, [newCandle]);
  }
}

export default IndicatorService;