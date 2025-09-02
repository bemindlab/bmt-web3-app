import { create } from 'zustand';
import { CryptoData } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from '../services/firebase/analytics';

const STORAGE_KEYS = {
  WATCHLIST: '@bmt_watchlist',
  SEARCH_HISTORY: '@bmt_search_history',
  SEARCH_CACHE: '@bmt_search_cache',
};

interface SearchCache {
  [query: string]: {
    results: CryptoData[];
    timestamp: number;
  };
}

interface SearchState {
  // Search state
  searchQuery: string;
  searchResults: CryptoData[];
  isSearching: boolean;
  searchError: string | null;

  // Watchlist
  watchlist: string[]; // Array of coin IDs
  watchlistData: CryptoData[]; // Full data of watchlist coins

  // Search history
  searchHistory: string[];

  // Cache
  searchCache: SearchCache;

  // Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: CryptoData[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSearchError: (error: string | null) => void;

  // Watchlist actions
  addToWatchlist: (coinId: string) => Promise<void>;
  removeFromWatchlist: (coinId: string) => Promise<void>;
  loadWatchlist: () => Promise<void>;
  setWatchlistData: (data: CryptoData[]) => void;
  isInWatchlist: (coinId: string) => boolean;

  // Search history actions
  addToSearchHistory: (query: string) => Promise<void>;
  clearSearchHistory: () => Promise<void>;
  loadSearchHistory: () => Promise<void>;

  // Cache actions
  getCachedResults: (query: string) => CryptoData[] | null;
  setCachedResults: (query: string, results: CryptoData[]) => void;
  clearCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_SEARCH_HISTORY = 10;

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  searchError: null,
  watchlist: [],
  watchlistData: [],
  searchHistory: [],
  searchCache: {},

  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setSearchError: (error) => set({ searchError: error }),

  // Watchlist actions
  addToWatchlist: async (coinId) => {
    const { watchlist } = get();
    if (!watchlist.includes(coinId)) {
      const newWatchlist = [...watchlist, coinId];
      set({ watchlist: newWatchlist });
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(newWatchlist));
        // Update analytics with new watchlist count
        analyticsService.updateWatchlistCount(newWatchlist.length);
      } catch (error) {
        console.error('Error saving watchlist:', error);
        // TODO: [MEDIUM] - [2025-09-01] - Add error tracking
        // Consider implementing error reporting to Firebase Crashlytics
        // to monitor and fix persistent storage issues
      }
    }
  },

  removeFromWatchlist: async (coinId) => {
    const { watchlist } = get();
    const newWatchlist = watchlist.filter((id) => id !== coinId);
    set({ watchlist: newWatchlist });
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(newWatchlist));
      // Update analytics with new watchlist count
      analyticsService.updateWatchlistCount(newWatchlist.length);
    } catch (error) {
      console.error('Error saving watchlist:', error);
      // TODO: [MEDIUM] - [2025-09-01] - Add error tracking
      // Consider implementing error reporting to Firebase Crashlytics
      // to monitor and fix persistent storage issues
    }
  },

  loadWatchlist: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLIST);
      if (stored) {
        const watchlist = JSON.parse(stored);
        set({ watchlist });
        // Update analytics with loaded watchlist count
        analyticsService.updateWatchlistCount(watchlist.length);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  },

  setWatchlistData: (data) => {
    // Filter out any null/undefined values to prevent rendering errors
    const validData = data.filter((item) => item != null);
    set({ watchlistData: validData });
  },

  isInWatchlist: (coinId) => {
    const { watchlist } = get();
    return watchlist.includes(coinId);
  },

  // Search history actions
  addToSearchHistory: async (query) => {
    const { searchHistory } = get();
    const trimmedQuery = query.trim().toLowerCase();

    if (!trimmedQuery || trimmedQuery.length < 2) return;

    // Remove duplicate if exists and add to beginning
    const filtered = searchHistory.filter((q) => q !== trimmedQuery);
    const newHistory = [trimmedQuery, ...filtered].slice(0, MAX_SEARCH_HISTORY);

    set({ searchHistory: newHistory });
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  },

  clearSearchHistory: async () => {
    set({ searchHistory: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  },

  loadSearchHistory: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      if (stored) {
        const history = JSON.parse(stored);
        set({ searchHistory: history });
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  },

  // Cache actions
  getCachedResults: (query) => {
    const { searchCache } = get();
    const cached = searchCache[query.toLowerCase()];

    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < CACHE_DURATION) {
        return cached.results;
      }
    }
    return null;
  },

  setCachedResults: (query, results) => {
    const { searchCache } = get();
    const newCache = {
      ...searchCache,
      [query.toLowerCase()]: {
        results,
        timestamp: Date.now(),
      },
    };
    set({ searchCache: newCache });
  },

  clearCache: () => {
    set({ searchCache: {} });
  },
}));
