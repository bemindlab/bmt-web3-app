import { IndicatorSignal } from './indicator.service';

// Risk management configuration constants
const RISK_CONFIG = {
  MAX_POSITION_SIZE_PERCENT: 5, // Maximum 5% of balance per position
  MAX_DAILY_LOSS_PERCENT: 2, // Stop trading if daily loss exceeds 2%
  MIN_SIGNAL_STRENGTH: 60, // Minimum signal strength to consider
  MAX_CONSECUTIVE_LOSSES: 3, // Stop after 3 consecutive losses
  MIN_RISK_REWARD_RATIO: 1.5, // Minimum 1.5:1 risk/reward ratio
  COOLDOWN_PERIOD_MS: 300000, // 5 minutes between trades on same symbol
  MAX_OPEN_POSITIONS: 3, // Maximum number of open positions
  LEVERAGE_LIMITS: {
    LOW_VOLATILITY: 20,
    MEDIUM_VOLATILITY: 10,
    HIGH_VOLATILITY: 5,
  },
} as const;

export interface RiskAssessment {
  approved: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  recommendedPositionSize: number;
  recommendedLeverage: number;
  stopLoss: number | null;
  takeProfit: number | null;
  warnings: string[];
  reasons: string[];
}

export interface TradeParameters {
  symbol: string;
  signal: IndicatorSignal;
  accountBalance: number;
  currentPositions: any[];
  dailyPnL: number;
  recentTrades: TradeHistory[];
}

export interface TradeHistory {
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  timestamp: number;
  isWin?: boolean;
}

export interface VolatilityData {
  symbol: string;
  atr: number; // Average True Range
  volatilityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  priceChange24h: number;
}

export class RiskManagementService {
  private static instance: RiskManagementService;
  private tradeHistory: Map<string, TradeHistory[]> = new Map();
  private lastTradeTime: Map<string, number> = new Map();
  private dailyStats: {
    trades: number;
    wins: number;
    losses: number;
    pnl: number;
    date: string;
  } = {
    trades: 0,
    wins: 0,
    losses: 0,
    pnl: 0,
    date: new Date().toDateString(),
  };

  private constructor() {}

  static getInstance(): RiskManagementService {
    if (!RiskManagementService.instance) {
      RiskManagementService.instance = new RiskManagementService();
    }
    return RiskManagementService.instance;
  }

  /**
   * Assess risk for a potential trade based on signal and account state
   */
  assessTrade(params: TradeParameters): RiskAssessment {
    const warnings: string[] = [];
    const reasons: string[] = [];
    let approved = true;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'MEDIUM';

    // Reset daily stats if new day
    this.resetDailyStatsIfNewDay();

    // 1. Check signal strength
    if (params.signal.strength < RISK_CONFIG.MIN_SIGNAL_STRENGTH) {
      approved = false;
      warnings.push(`Signal strength too low: ${params.signal.strength}% (min: ${RISK_CONFIG.MIN_SIGNAL_STRENGTH}%)`);
    } else {
      reasons.push(`Signal strength acceptable: ${params.signal.strength}%`);
    }

    // 2. Check daily loss limit
    if (this.dailyStats.pnl < -(params.accountBalance * RISK_CONFIG.MAX_DAILY_LOSS_PERCENT / 100)) {
      approved = false;
      riskLevel = 'EXTREME';
      warnings.push(`Daily loss limit exceeded: ${this.dailyStats.pnl.toFixed(2)} USDT`);
    }

    // 3. Check consecutive losses
    const recentLosses = this.getConsecutiveLosses(params.symbol);
    if (recentLosses >= RISK_CONFIG.MAX_CONSECUTIVE_LOSSES) {
      approved = false;
      riskLevel = 'HIGH';
      warnings.push(`Too many consecutive losses: ${recentLosses}`);
    }

    // 4. Check cooldown period
    const lastTradeTime = this.lastTradeTime.get(params.symbol);
    if (lastTradeTime && Date.now() - lastTradeTime < RISK_CONFIG.COOLDOWN_PERIOD_MS) {
      approved = false;
      warnings.push(`Cooldown period active for ${params.symbol}`);
    }

    // 5. Check maximum open positions
    if (params.currentPositions.length >= RISK_CONFIG.MAX_OPEN_POSITIONS) {
      approved = false;
      warnings.push(`Maximum open positions reached: ${params.currentPositions.length}`);
    }

    // 6. Calculate position sizing
    const maxPositionValue = params.accountBalance * RISK_CONFIG.MAX_POSITION_SIZE_PERCENT / 100;
    const basePositionSize = this.calculatePositionSize(params.signal.strength, maxPositionValue);
    
    // 7. Determine volatility-based leverage
    const volatilityLevel = this.estimateVolatility(params.symbol, params.signal.price);
    const recommendedLeverage = this.calculateLeverage(volatilityLevel, params.signal.strength);

    // 8. Calculate stop loss and take profit
    const { stopLoss, takeProfit } = this.calculateExitLevels(
      params.signal.price,
      params.signal.type,
      volatilityLevel
    );

    // 9. Assess overall risk level
    if (params.signal.strength >= 80 && recentLosses === 0 && this.dailyStats.pnl >= 0) {
      riskLevel = 'LOW';
    } else if (params.signal.strength >= 70 && recentLosses <= 1) {
      riskLevel = 'MEDIUM';
    } else if (params.signal.strength >= 60 && recentLosses <= 2) {
      riskLevel = 'HIGH';
    } else {
      riskLevel = 'EXTREME';
    }

    // Add reasoning for approval
    if (approved) {
      reasons.push('All risk checks passed');
      reasons.push(`Position size: ${basePositionSize.toFixed(2)} USDT`);
      reasons.push(`Recommended leverage: ${recommendedLeverage}x`);
    }

    return {
      approved,
      riskLevel,
      recommendedPositionSize: basePositionSize,
      recommendedLeverage,
      stopLoss,
      takeProfit,
      warnings,
      reasons,
    };
  }

  /**
   * Record a completed trade for risk tracking
   */
  recordTrade(trade: TradeHistory): void {
    // Add to symbol-specific history
    if (!this.tradeHistory.has(trade.symbol)) {
      this.tradeHistory.set(trade.symbol, []);
    }
    this.tradeHistory.get(trade.symbol)!.push(trade);

    // Update daily stats
    this.dailyStats.trades++;
    if (trade.pnl !== undefined) {
      this.dailyStats.pnl += trade.pnl;
      if (trade.pnl > 0) {
        this.dailyStats.wins++;
        trade.isWin = true;
      } else {
        this.dailyStats.losses++;
        trade.isWin = false;
      }
    }

    // Update last trade time
    this.lastTradeTime.set(trade.symbol, trade.timestamp);

    // Limit history size (keep last 100 trades per symbol)
    const history = this.tradeHistory.get(trade.symbol)!;
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Get current risk statistics
   */
  getRiskStatistics(): {
    dailyPnL: number;
    dailyTrades: number;
    winRate: number;
    consecutiveLosses: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  } {
    const winRate = this.dailyStats.trades > 0 
      ? (this.dailyStats.wins / this.dailyStats.trades) * 100 
      : 0;

    const maxConsecutiveLosses = Math.max(...Array.from(this.tradeHistory.values()).map(history => 
      this.getConsecutiveLossesFromHistory(history)
    ), 0);

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'LOW';
    if (this.dailyStats.pnl < 0 && Math.abs(this.dailyStats.pnl) > 1000) {
      riskLevel = 'EXTREME';
    } else if (maxConsecutiveLosses >= 3 || winRate < 30) {
      riskLevel = 'HIGH';
    } else if (maxConsecutiveLosses >= 2 || winRate < 50) {
      riskLevel = 'MEDIUM';
    }

    return {
      dailyPnL: this.dailyStats.pnl,
      dailyTrades: this.dailyStats.trades,
      winRate,
      consecutiveLosses: maxConsecutiveLosses,
      riskLevel,
    };
  }

  // Private helper methods

  private resetDailyStatsIfNewDay(): void {
    const currentDate = new Date().toDateString();
    if (this.dailyStats.date !== currentDate) {
      this.dailyStats = {
        trades: 0,
        wins: 0,
        losses: 0,
        pnl: 0,
        date: currentDate,
      };
    }
  }

  private calculatePositionSize(signalStrength: number, maxPositionValue: number): number {
    // Scale position size based on signal strength
    const strengthMultiplier = signalStrength / 100;
    return maxPositionValue * strengthMultiplier * 0.8; // 80% of max for safety
  }

  private estimateVolatility(symbol: string, currentPrice: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    // Simple volatility estimation based on symbol and price action
    // In production, this would use real market data (ATR, etc.)
    if (symbol.includes('BTC') || symbol.includes('ETH')) {
      return 'MEDIUM'; // Major coins are generally medium volatility
    } else if (symbol.includes('USDT') && currentPrice > 1000) {
      return 'MEDIUM'; // Large cap pairs
    } else {
      return 'HIGH'; // Assume higher volatility for other pairs
    }
  }

  private calculateLeverage(volatility: 'LOW' | 'MEDIUM' | 'HIGH', signalStrength: number): number {
    const baseLeverage = RISK_CONFIG.LEVERAGE_LIMITS[`${volatility}_VOLATILITY`];
    
    // Adjust leverage based on signal strength
    if (signalStrength >= 80) {
      return baseLeverage;
    } else if (signalStrength >= 70) {
      return Math.max(baseLeverage * 0.8, 2);
    } else {
      return Math.max(baseLeverage * 0.6, 2);
    }
  }

  private calculateExitLevels(price: number, side: 'BUY' | 'SELL', volatility: 'LOW' | 'MEDIUM' | 'HIGH'): {
    stopLoss: number;
    takeProfit: number;
  } {
    // Calculate percentage-based stops based on volatility
    const stopLossPercent = volatility === 'LOW' ? 0.02 : volatility === 'MEDIUM' ? 0.03 : 0.05;
    const takeProfitPercent = stopLossPercent * RISK_CONFIG.MIN_RISK_REWARD_RATIO;

    if (side === 'BUY') {
      return {
        stopLoss: price * (1 - stopLossPercent),
        takeProfit: price * (1 + takeProfitPercent),
      };
    } else {
      return {
        stopLoss: price * (1 + stopLossPercent),
        takeProfit: price * (1 - takeProfitPercent),
      };
    }
  }

  private getConsecutiveLosses(symbol: string): number {
    const history = this.tradeHistory.get(symbol) || [];
    return this.getConsecutiveLossesFromHistory(history);
  }

  private getConsecutiveLossesFromHistory(history: TradeHistory[]): number {
    let consecutiveLosses = 0;
    
    // Count from the most recent trades backwards
    for (let i = history.length - 1; i >= 0; i--) {
      const trade = history[i];
      if (trade.isWin === false) {
        consecutiveLosses++;
      } else if (trade.isWin === true) {
        break; // Stop counting at first win
      }
    }
    
    return consecutiveLosses;
  }

  /**
   * Reset all risk tracking data (for testing or manual reset)
   */
  reset(): void {
    this.tradeHistory.clear();
    this.lastTradeTime.clear();
    this.dailyStats = {
      trades: 0,
      wins: 0,
      losses: 0,
      pnl: 0,
      date: new Date().toDateString(),
    };
  }
}

export default RiskManagementService;