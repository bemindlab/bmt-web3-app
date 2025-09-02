import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiKeys } from '../types';

const STORAGE_KEYS = {
  API_KEYS: '@bmt_api_keys',
  USER_PREFERENCES: '@bmt_user_preferences',
  WATCHLIST: '@bmt_watchlist',
  SEARCH_HISTORY: '@bmt_search_history',
};

export class StorageService {
  static async saveApiKeys(apiKeys: ApiKeys): Promise<void> {
    try {
      // Create a clean object that only includes defined keys
      const cleanedApiKeys: ApiKeys = {};

      // Save exchange API keys (format: key:secret) - only if they exist
      if (apiKeys.binance && apiKeys.binance.trim()) {
        cleanedApiKeys.binance = apiKeys.binance.trim();
      }
      if (apiKeys.gateio && apiKeys.gateio.trim()) {
        cleanedApiKeys.gateio = apiKeys.gateio.trim();
      }

      // Always save the cleaned object (this replaces the entire stored keys)
      const jsonValue = JSON.stringify(cleanedApiKeys);
      await AsyncStorage.setItem(STORAGE_KEYS.API_KEYS, jsonValue);
    } catch (error) {
      console.error('Error saving API keys:', error);
      if (error instanceof Error) {
        if (error.message.includes('storage')) {
          throw new Error(
            'Storage error: Unable to save to device storage. Check available space.'
          );
        } else {
          throw new Error(`Save failed: ${error.message}`);
        }
      } else {
        throw new Error('Unknown error occurred while saving API keys');
      }
    }
  }

  static async getApiKeys(): Promise<ApiKeys | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.API_KEYS);
      if (!jsonValue) return null;

      const apiKeys: ApiKeys = JSON.parse(jsonValue);
      return apiKeys;
    } catch (_error) {
      console.error('Error loading API keys:', _error);
      return null;
    }
  }

  static async clearApiKeys(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.API_KEYS);
    } catch (_error) {
      console.error('Error clearing API keys:', _error);
      throw new Error('Failed to clear API keys');
    }
  }

  static async saveUserPreference(key: string, value: unknown): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      const preferences = existing ? JSON.parse(existing) : {};
      preferences[key] = value;
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (_error) {
      console.error('Error saving user preference:', _error);
      throw new Error('Failed to save user preference');
    }
  }

  static async getUserPreference(key: string): Promise<unknown> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      const preferences = jsonValue ? JSON.parse(jsonValue) : {};
      return preferences[key] || null;
    } catch (_error) {
      console.error('Error loading user preference:', _error);
      return null;
    }
  }

  // Watchlist methods
  static async saveWatchlist(watchlist: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    } catch (_error) {
      console.error('Error saving watchlist:', _error);
      throw new Error('Failed to save watchlist');
    }
  }

  static async getWatchlist(): Promise<string[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (_error) {
      console.error('Error loading watchlist:', _error);
      return [];
    }
  }

  // Search history methods
  static async saveSearchHistory(history: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
    } catch (_error) {
      console.error('Error saving search history:', _error);
      throw new Error('Failed to save search history');
    }
  }

  static async getSearchHistory(): Promise<string[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (_error) {
      console.error('Error loading search history:', _error);
      return [];
    }
  }

  static async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (_error) {
      console.error('Error clearing search history:', _error);
      throw new Error('Failed to clear search history');
    }
  }
}
