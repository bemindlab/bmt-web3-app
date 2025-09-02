import { CryptoData, TrendingCrypto } from '../types';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export class CryptoApiService {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['x-cg-demo-api-key'] = this.apiKey;
    }

    return headers;
  }

  async getTrendingCoins(): Promise<TrendingCrypto | null> {
    try {
      const response = await fetch(`${COINGECKO_BASE_URL}/search/trending`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TrendingCrypto = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      return null;
    }
  }

  async getTopCoins(limit: number = 10): Promise<CryptoData[] | null> {
    try {
      const response = await fetch(
        `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CryptoData[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching top coins:', error);
      return null;
    }
  }

  async getCoinPrice(coinId: string): Promise<number | null> {
    try {
      const response = await fetch(
        `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data[coinId]?.usd || null;
    } catch (error) {
      console.error('Error fetching coin price:', error);
      return null;
    }
  }

  async searchCoins(query: string): Promise<CryptoData[] | null> {
    try {
      // First, search for coins matching the query
      const searchResponse = await fetch(
        `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!searchResponse.ok) {
        throw new Error(`HTTP error! status: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();

      // Get the first 20 coin IDs from search results
      const coinIds = searchData.coins
        .slice(0, 20)
        .map((coin: any) => coin.id)
        .join(',');

      if (!coinIds) {
        return [];
      }

      // Get detailed market data for these coins
      const marketResponse = await fetch(
        `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!marketResponse.ok) {
        throw new Error(`HTTP error! status: ${marketResponse.status}`);
      }

      const marketData: CryptoData[] = await marketResponse.json();
      return marketData;
    } catch (error) {
      console.error('Error searching coins:', error);
      return null;
    }
  }

  async getCoinDetails(coinId: string): Promise<any | null> {
    try {
      const response = await fetch(
        `${COINGECKO_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching coin details:', error);
      return null;
    }
  }

  async getCoinsByIds(coinIds: string[]): Promise<CryptoData[] | null> {
    if (coinIds.length === 0) return [];

    try {
      const idsString = coinIds.join(',');
      const response = await fetch(
        `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${idsString}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CryptoData[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching coins by IDs:', error);
      return null;
    }
  }
}
