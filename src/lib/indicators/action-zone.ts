// Action Zone Indicator - Mobile Implementation
// Simplified version for React Native environment

export interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export enum ActionZone {
  GREEN = 'GREEN', // Strong buy zone
  BLUE = 'BLUE', // Buy zone
  LIGHT_BLUE = 'LIGHT_BLUE', // Pre-buy zone
  GRAY = 'GRAY', // Neutral zone
  YELLOW = 'YELLOW', // Pre-sell zone
  ORANGE = 'ORANGE', // Sell zone
  RED = 'RED', // Strong sell zone
}

export enum TrendDirection {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL',
}

export interface ActionZoneParams {
  fastEMAPeriod: number;
  slowEMAPeriod: number;
  smoothingPeriod: number;
}

export interface ActionZoneResult {
  zone: ActionZone;
  trend: TrendDirection;
  isBuySignal: boolean;
  isSellSignal: boolean;
  strength: number; // 0-100
}

/**
 * Calculate Exponential Moving Average
 */
function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];

  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // Start with first price
  ema[0] = prices[0];

  // Calculate EMA for remaining prices
  for (let i = 1; i < prices.length; i++) {
    ema[i] = prices[i] * multiplier + ema[i - 1] * (1 - multiplier);
  }

  return ema;
}

/**
 * Determine trend direction based on EMAs
 */
function determineTrend(
  fastEMA: number,
  slowEMA: number,
  prevFastEMA: number,
  prevSlowEMA: number
): TrendDirection {
  const currentSpread = fastEMA - slowEMA;
  const prevSpread = prevFastEMA - prevSlowEMA;

  if (fastEMA > slowEMA && currentSpread > prevSpread) {
    return TrendDirection.BULLISH;
  } else if (fastEMA < slowEMA && currentSpread < prevSpread) {
    return TrendDirection.BEARISH;
  }

  return TrendDirection.NEUTRAL;
}

/**
 * Map EMA relationship to action zone
 */
function mapToActionZone(
  fastEMA: number,
  slowEMA: number,
  price: number,
  trend: TrendDirection
): ActionZone {
  const spread = fastEMA - slowEMA;
  const spreadPercent = (Math.abs(spread) / slowEMA) * 100;
  const pricePosition = ((price - slowEMA) / slowEMA) * 100;

  if (trend === TrendDirection.BULLISH) {
    if (spreadPercent > 2 && pricePosition > 3) {
      return ActionZone.GREEN;
    } else if (spreadPercent > 1 && pricePosition > 1.5) {
      return ActionZone.BLUE;
    } else if (spreadPercent > 0.5 && pricePosition > 0.5) {
      return ActionZone.LIGHT_BLUE;
    }
  } else if (trend === TrendDirection.BEARISH) {
    if (spreadPercent > 2 && pricePosition < -3) {
      return ActionZone.RED;
    } else if (spreadPercent > 1 && pricePosition < -1.5) {
      return ActionZone.ORANGE;
    } else if (spreadPercent > 0.5 && pricePosition < -0.5) {
      return ActionZone.YELLOW;
    }
  }

  return ActionZone.GRAY;
}

export class ActionZoneStrategy {
  private params: ActionZoneParams;
  private previousResult: ActionZoneResult | null = null;

  constructor(params: ActionZoneParams) {
    this.params = params;
  }

  analyze(candles: OHLCV[]): ActionZoneResult {
    if (candles.length < Math.max(this.params.fastEMAPeriod, this.params.slowEMAPeriod)) {
      return {
        zone: ActionZone.GRAY,
        trend: TrendDirection.NEUTRAL,
        isBuySignal: false,
        isSellSignal: false,
        strength: 0,
      };
    }

    const closes = candles.map((c) => c.close);
    const currentPrice = closes[closes.length - 1];

    // Calculate EMAs
    const fastEMA = calculateEMA(closes, this.params.fastEMAPeriod);
    const slowEMA = calculateEMA(closes, this.params.slowEMAPeriod);

    const currentIndex = closes.length - 1;
    const currentFastEMA = fastEMA[currentIndex];
    const currentSlowEMA = slowEMA[currentIndex];
    const prevFastEMA = currentIndex > 0 ? fastEMA[currentIndex - 1] : currentFastEMA;
    const prevSlowEMA = currentIndex > 0 ? slowEMA[currentIndex - 1] : currentSlowEMA;

    // Determine trend
    const trend = determineTrend(currentFastEMA, currentSlowEMA, prevFastEMA, prevSlowEMA);

    // Map to action zone
    const zone = mapToActionZone(currentFastEMA, currentSlowEMA, currentPrice, trend);

    // Determine signals (simplified)
    let isBuySignal = false;
    let isSellSignal = false;

    // Buy signal: transition into green/blue zone from lower zones
    if (this.previousResult) {
      const prevZone = this.previousResult.zone;

      if (
        (zone === ActionZone.GREEN || zone === ActionZone.BLUE) &&
        (prevZone === ActionZone.LIGHT_BLUE || prevZone === ActionZone.GRAY)
      ) {
        isBuySignal = true;
      }

      if (
        (zone === ActionZone.RED || zone === ActionZone.ORANGE) &&
        (prevZone === ActionZone.YELLOW || prevZone === ActionZone.GRAY)
      ) {
        isSellSignal = true;
      }
    }

    // Calculate strength based on zone and trend consistency
    let strength = 0;
    switch (zone) {
      case ActionZone.GREEN:
        strength = 90;
        break;
      case ActionZone.BLUE:
        strength = 75;
        break;
      case ActionZone.LIGHT_BLUE:
        strength = 60;
        break;
      case ActionZone.YELLOW:
        strength = 40;
        break;
      case ActionZone.ORANGE:
        strength = 25;
        break;
      case ActionZone.RED:
        strength = 10;
        break;
      default:
        strength = 50;
    }

    // Adjust strength based on trend
    if (
      trend === TrendDirection.BULLISH &&
      [ActionZone.GREEN, ActionZone.BLUE, ActionZone.LIGHT_BLUE].includes(zone)
    ) {
      strength = Math.min(100, strength + 10);
    } else if (
      trend === TrendDirection.BEARISH &&
      [ActionZone.RED, ActionZone.ORANGE, ActionZone.YELLOW].includes(zone)
    ) {
      strength = Math.max(0, strength - 10);
    }

    const result: ActionZoneResult = {
      zone,
      trend,
      isBuySignal,
      isSellSignal,
      strength,
    };

    // TODO: [HIGH] - [2025-01-15] - Claude Code
    // Enhance action zone calculation with:
    // - Volume confirmation
    // - Multiple timeframe analysis
    // - Support/resistance levels
    // - Market volatility adjustments
    // - More sophisticated signal detection

    this.previousResult = result;
    return result;
  }

  reset(): void {
    this.previousResult = null;
  }
}
