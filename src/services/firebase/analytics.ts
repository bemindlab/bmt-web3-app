import {
  logEvent,
  setUserId,
  setUserProperties,
  setAnalyticsCollectionEnabled,
  Analytics,
} from 'firebase/analytics';
import { getFirebaseAnalytics, isFirebaseConfigured } from './config';
import { CryptoData, CryptoDataDetailed } from '../../types';
import { Platform } from 'react-native';

// Analytics Event Names
export const AnalyticsEvents = {
  // Search Events
  SEARCH: 'search',
  SEARCH_RESULT_CLICK: 'search_result_click',
  SEARCH_NO_RESULTS: 'search_no_results',
  SEARCH_ERROR: 'search_error',
  SEARCH_HISTORY_CLICK: 'search_history_click',
  SEARCH_CLEAR_HISTORY: 'search_clear_history',

  // Watchlist Events
  WATCHLIST_ADD: 'watchlist_add',
  WATCHLIST_REMOVE: 'watchlist_remove',
  WATCHLIST_VIEW: 'watchlist_view',

  // Coin Detail Events
  COIN_DETAIL_VIEW: 'coin_detail_view',
  COIN_DETAIL_FROM_SEARCH: 'coin_detail_from_search',
  COIN_DETAIL_FROM_WATCHLIST: 'coin_detail_from_watchlist',

  // Conversion Events
  SEARCH_TO_WATCHLIST: 'search_to_watchlist',
  SEARCH_TO_DETAIL: 'search_to_detail',

  // User Engagement
  POPULAR_SEARCH_TERM: 'popular_search_term',
  SEARCH_SESSION_START: 'search_session_start',
  SEARCH_SESSION_END: 'search_session_end',
} as const;

// User Properties
export const UserProperties = {
  WATCHLIST_COUNT: 'watchlist_count',
  SEARCH_COUNT: 'search_count',
  FAVORITE_COIN: 'favorite_coin',
  USER_TYPE: 'user_type',
  LAST_SEARCH_DATE: 'last_search_date',
} as const;

class FirebaseAnalyticsService {
  private static instance: FirebaseAnalyticsService;
  private analytics: Analytics | null = null;
  private searchSessionStartTime: number | null = null;
  private searchCount: number = 0;
  private popularSearchTerms: Map<string, number> = new Map();

  private constructor() {
    this.initializeAnalytics();
  }

  static getInstance(): FirebaseAnalyticsService {
    if (!FirebaseAnalyticsService.instance) {
      FirebaseAnalyticsService.instance = new FirebaseAnalyticsService();
    }
    return FirebaseAnalyticsService.instance;
  }

  private async initializeAnalytics() {
    if (Platform.OS === 'web' && isFirebaseConfigured()) {
      this.analytics = getFirebaseAnalytics();
      if (this.analytics) {
        // Enable analytics collection
        await setAnalyticsCollectionEnabled(this.analytics, true);
      }
    }
  }

  // Search Events
  trackSearch(query: string, resultCount: number = 0) {
    if (!this.analytics) return;

    // Track the search event
    logEvent(this.analytics, AnalyticsEvents.SEARCH, {
      search_term: query.toLowerCase(),
      result_count: resultCount,
      timestamp: new Date().toISOString(),
    });

    // Update search count
    this.searchCount++;
    this.updateUserSearchCount();

    // Track popular search terms
    this.trackPopularSearchTerm(query);

    // Start search session if not already started
    if (!this.searchSessionStartTime) {
      this.startSearchSession();
    }
  }

  trackSearchResultClick(
    coin: CryptoData | CryptoDataDetailed,
    position: number,
    searchQuery: string
  ) {
    if (!this.analytics) return;

    logEvent(this.analytics, AnalyticsEvents.SEARCH_RESULT_CLICK, {
      coin_id: coin.id,
      coin_name: coin.name,
      coin_symbol: coin.symbol,
      position_in_results: position,
      search_query: searchQuery.toLowerCase(),
      market_cap_rank: 'market_cap_rank' in coin ? coin.market_cap_rank : undefined,
      timestamp: new Date().toISOString(),
    });
  }

  trackSearchNoResults(query: string) {
    if (!this.analytics) return;

    logEvent(this.analytics, AnalyticsEvents.SEARCH_NO_RESULTS, {
      search_term: query.toLowerCase(),
      timestamp: new Date().toISOString(),
    });
  }

  trackSearchError(query: string, error: string) {
    if (!this.analytics) return;

    logEvent(this.analytics, AnalyticsEvents.SEARCH_ERROR, {
      search_term: query.toLowerCase(),
      error_message: error,
      timestamp: new Date().toISOString(),
    });
  }

  trackSearchHistoryClick(query: string) {
    if (!this.analytics) return;

    logEvent(this.analytics, AnalyticsEvents.SEARCH_HISTORY_CLICK, {
      search_term: query.toLowerCase(),
      timestamp: new Date().toISOString(),
    });
  }

  trackClearSearchHistory() {
    if (!this.analytics) return;

    logEvent(this.analytics, AnalyticsEvents.SEARCH_CLEAR_HISTORY, {
      timestamp: new Date().toISOString(),
    });
  }

  // Watchlist Events
  trackWatchlistAdd(
    coin: CryptoData | CryptoDataDetailed,
    source: 'search' | 'detail' | 'watchlist' = 'search'
  ) {
    if (!this.analytics) return;

    logEvent(this.analytics, AnalyticsEvents.WATCHLIST_ADD, {
      coin_id: coin.id,
      coin_name: coin.name,
      coin_symbol: coin.symbol,
      market_cap_rank: 'market_cap_rank' in coin ? coin.market_cap_rank : undefined,
      current_price: coin.current_price,
      source,
      timestamp: new Date().toISOString(),
    });

    // Track conversion if from search
    if (source === 'search') {
      this.trackSearchToWatchlistConversion(coin);
    }
  }

  trackWatchlistRemove(
    coin: CryptoData | CryptoDataDetailed,
    source: 'search' | 'detail' | 'watchlist' = 'search'
  ) {
    if (!this.analytics) return;

    logEvent(this.analytics, AnalyticsEvents.WATCHLIST_REMOVE, {
      coin_id: coin.id,
      coin_name: coin.name,
      coin_symbol: coin.symbol,
      source,
      timestamp: new Date().toISOString(),
    });
  }

  trackWatchlistView() {
    if (!this.analytics) return;

    logEvent(this.analytics, AnalyticsEvents.WATCHLIST_VIEW, {
      timestamp: new Date().toISOString(),
    });
  }

  updateWatchlistCount(count: number) {
    if (!this.analytics) return;

    setUserProperties(this.analytics, {
      [UserProperties.WATCHLIST_COUNT]: count.toString(),
    });
  }

  // Coin Detail Events
  trackCoinDetailView(
    coin: CryptoData | CryptoDataDetailed,
    source: 'search' | 'watchlist' | 'direct' = 'direct'
  ) {
    if (!this.analytics) return;

    logEvent(this.analytics, AnalyticsEvents.COIN_DETAIL_VIEW, {
      coin_id: coin.id,
      coin_name: coin.name,
      coin_symbol: coin.symbol,
      market_cap_rank: 'market_cap_rank' in coin ? coin.market_cap_rank : undefined,
      current_price: coin.current_price,
      price_change_24h: coin.price_change_percentage_24h,
      source,
      timestamp: new Date().toISOString(),
    });

    // Track specific source events
    if (source === 'search') {
      logEvent(this.analytics, AnalyticsEvents.COIN_DETAIL_FROM_SEARCH, {
        coin_id: coin.id,
        coin_name: coin.name,
        timestamp: new Date().toISOString(),
      });
      this.trackSearchToDetailConversion(coin);
    } else if (source === 'watchlist') {
      logEvent(this.analytics, AnalyticsEvents.COIN_DETAIL_FROM_WATCHLIST, {
        coin_id: coin.id,
        coin_name: coin.name,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Conversion Tracking
  private trackSearchToWatchlistConversion(coin: CryptoData | CryptoDataDetailed) {
    if (!this.analytics) return;

    logEvent(this.analytics, AnalyticsEvents.SEARCH_TO_WATCHLIST, {
      coin_id: coin.id,
      coin_name: coin.name,
      coin_symbol: coin.symbol,
      timestamp: new Date().toISOString(),
    });
  }

  private trackSearchToDetailConversion(coin: CryptoData | CryptoDataDetailed) {
    if (!this.analytics) return;

    logEvent(this.analytics, AnalyticsEvents.SEARCH_TO_DETAIL, {
      coin_id: coin.id,
      coin_name: coin.name,
      coin_symbol: coin.symbol,
      timestamp: new Date().toISOString(),
    });
  }

  // Popular Search Terms
  private trackPopularSearchTerm(query: string) {
    const normalizedQuery = query.toLowerCase().trim();
    const count = (this.popularSearchTerms.get(normalizedQuery) || 0) + 1;
    this.popularSearchTerms.set(normalizedQuery, count);

    // Log as popular if searched more than 3 times
    if (count === 3 && this.analytics) {
      logEvent(this.analytics, AnalyticsEvents.POPULAR_SEARCH_TERM, {
        search_term: normalizedQuery,
        search_count: count,
        timestamp: new Date().toISOString(),
      });
    }
  }

  getPopularSearchTerms(): Array<{ term: string; count: number }> {
    return Array.from(this.popularSearchTerms.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 popular searches
  }

  // Session Management
  private startSearchSession() {
    if (!this.analytics) return;

    this.searchSessionStartTime = Date.now();
    logEvent(this.analytics, AnalyticsEvents.SEARCH_SESSION_START, {
      timestamp: new Date().toISOString(),
    });
  }

  endSearchSession() {
    if (!this.analytics || !this.searchSessionStartTime) return;

    const sessionDuration = Date.now() - this.searchSessionStartTime;
    logEvent(this.analytics, AnalyticsEvents.SEARCH_SESSION_END, {
      session_duration_ms: sessionDuration,
      search_count: this.searchCount,
      timestamp: new Date().toISOString(),
    });

    // Reset session
    this.searchSessionStartTime = null;
    this.searchCount = 0;
  }

  // User Properties
  setUserId(userId: string) {
    if (!this.analytics) return;
    setUserId(this.analytics, userId);
  }

  setUserType(userType: 'free' | 'premium' | 'trial') {
    if (!this.analytics) return;

    setUserProperties(this.analytics, {
      [UserProperties.USER_TYPE]: userType,
    });
  }

  setFavoriteCoin(coinSymbol: string) {
    if (!this.analytics) return;

    setUserProperties(this.analytics, {
      [UserProperties.FAVORITE_COIN]: coinSymbol.toUpperCase(),
    });
  }

  private updateUserSearchCount() {
    if (!this.analytics) return;

    setUserProperties(this.analytics, {
      [UserProperties.SEARCH_COUNT]: this.searchCount.toString(),
      [UserProperties.LAST_SEARCH_DATE]: new Date().toISOString(),
    });
  }

  // Debug and Testing
  logCustomEvent(eventName: string, parameters?: Record<string, any>) {
    if (!this.analytics) return;

    logEvent(this.analytics, eventName, {
      ...parameters,
      timestamp: new Date().toISOString(),
    });
  }

  // Get analytics instance (for advanced usage)
  getAnalyticsInstance(): Analytics | null {
    return this.analytics;
  }
}

// Export singleton instance
export const analyticsService = FirebaseAnalyticsService.getInstance();

// Export convenience functions
export const trackSearch = (query: string, resultCount?: number) =>
  analyticsService.trackSearch(query, resultCount);

export const trackSearchResultClick = (
  coin: CryptoData | CryptoDataDetailed,
  position: number,
  searchQuery: string
) => analyticsService.trackSearchResultClick(coin, position, searchQuery);

export const trackWatchlistAdd = (
  coin: CryptoData | CryptoDataDetailed,
  source?: 'search' | 'detail' | 'watchlist'
) => analyticsService.trackWatchlistAdd(coin, source);

export const trackWatchlistRemove = (
  coin: CryptoData | CryptoDataDetailed,
  source?: 'search' | 'detail' | 'watchlist'
) => analyticsService.trackWatchlistRemove(coin, source);

export const trackCoinDetailView = (
  coin: CryptoData | CryptoDataDetailed,
  source?: 'search' | 'watchlist' | 'direct'
) => analyticsService.trackCoinDetailView(coin, source);
