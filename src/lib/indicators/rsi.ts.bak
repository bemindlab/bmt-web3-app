// RSI Divergence Indicator - Mobile Implementation
// Simplified version for React Native environment

export interface RSIDivergenceParams {
  period?: number;
  overbought?: number;
  oversold?: number;
  shortLookback?: number;
  longLookback?: number;
}

export interface RSIDivergenceResult {
  rsi: number;
  bullishDivergence: boolean;
  bearishDivergence: boolean;
  bullishDivergenceAlert: number; // 0-100 scale
  bearishDivergenceAlert: number; // 0-100 scale
}

export function calculateOHLC4(open: number, high: number, low: number, close: number): number {
  return (open + high + low + close) / 4;
}

/**
 * Calculate RSI (Relative Strength Index)
 */
function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) {
    return prices.map(() => 50); // Return neutral RSI
  }

  const rsiValues: number[] = [];

  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      avgGain += change;
    } else {
      avgLoss += Math.abs(change);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Fill initial values
  for (let i = 0; i < period; i++) {
    rsiValues.push(50);
  }

  // Calculate RSI for remaining values
  for (let i = period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    // Smoothed moving average
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    rsiValues.push(Math.min(100, Math.max(0, rsi)));
  }

  return rsiValues;
}

/**
 * Detect divergences between price and RSI
 */
function detectDivergences(
  prices: number[],
  rsiValues: number[],
  lookback: number = 5
): { bullish: boolean; bearish: boolean } {
  if (prices.length < lookback * 2) {
    return { bullish: false, bearish: false };
  }

  const currentIndex = prices.length - 1;
  const lookbackIndex = currentIndex - lookback;

  if (lookbackIndex < 0) {
    return { bullish: false, bearish: false };
  }

  const currentPrice = prices[currentIndex];
  const lookbackPrice = prices[lookbackIndex];
  const currentRSI = rsiValues[currentIndex];
  const lookbackRSI = rsiValues[lookbackIndex];

  // Bullish divergence: price makes lower low, RSI makes higher low
  const bullishDivergence =
    currentPrice < lookbackPrice && currentRSI > lookbackRSI && currentRSI < 50;

  // Bearish divergence: price makes higher high, RSI makes lower high
  const bearishDivergence =
    currentPrice > lookbackPrice && currentRSI < lookbackRSI && currentRSI > 50;

  return {
    bullish: bullishDivergence,
    bearish: bearishDivergence,
  };
}

export class RSIDivergenceIndicator {
  private params: Required<RSIDivergenceParams>;

  constructor(params: RSIDivergenceParams = {}) {
    this.params = {
      period: params.period || 14,
      overbought: params.overbought || 70,
      oversold: params.oversold || 30,
      shortLookback: params.shortLookback || 5,
      longLookback: params.longLookback || 25,
    };
  }

  calculate(
    ohlc4Prices: number[],
    highs: number[],
    lows: number[],
    closes: number[]
  ): RSIDivergenceResult[] {
    const rsiValues = calculateRSI(ohlc4Prices, this.params.period);
    const results: RSIDivergenceResult[] = [];

    for (let i = 0; i < closes.length; i++) {
      const rsi = rsiValues[i] || 50;

      // Use a subset of data for divergence detection
      const priceSubset = closes.slice(0, i + 1);
      const rsiSubset = rsiValues.slice(0, i + 1);

      // Detect short-term divergences
      const shortDivergence = detectDivergences(priceSubset, rsiSubset, this.params.shortLookback);

      // Detect long-term divergences
      const longDivergence = detectDivergences(priceSubset, rsiSubset, this.params.longLookback);

      // Create alert scores (simplified version)
      let bullishAlert = 50;
      let bearishAlert = 50;

      if (rsi <= this.params.oversold) {
        bullishAlert = Math.max(60, 100 - rsi);
      }
      if (rsi >= this.params.overbought) {
        bearishAlert = Math.min(40, rsi - 50);
      }

      // TODO: [MEDIUM] - [2025-01-15] - Claude Code
      // Implement more sophisticated divergence detection
      // Current implementation is simplified for mobile use
      // Consider adding:
      // - Multiple timeframe analysis
      // - Volume confirmation
      // - More accurate peak/trough detection
      // - Divergence strength scoring

      results.push({
        rsi,
        bullishDivergence: shortDivergence.bullish || longDivergence.bullish,
        bearishDivergence: shortDivergence.bearish || longDivergence.bearish,
        bullishDivergenceAlert: bullishAlert,
        bearishDivergenceAlert: bearishAlert,
      });
    }

    return results;
  }
}
