import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchStore } from '../stores/searchStore';
import { CryptoApiService } from '../services/cryptoApi';
import { CryptoData } from '../types';
import { SearchBar } from '../components/SearchBar';
import { CoinListItem } from '../components/CoinListItem';
import { useNavigation } from '@react-navigation/native';
import { initializeFirebase } from '../services/firebase/config';
import {
  analyticsService,
  trackSearch,
  trackSearchResultClick,
  trackWatchlistAdd,
  trackWatchlistRemove,
  trackCoinDetailView,
} from '../services/firebase/analytics';

const cryptoApi = new CryptoApiService();

export const SearchScreen: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const navigation = useNavigation<any>();

  const {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    watchlist,
    watchlistData,
    searchHistory,
    setSearchQuery,
    setSearchResults,
    setIsSearching,
    setSearchError,
    addToWatchlist,
    removeFromWatchlist,
    loadWatchlist,
    setWatchlistData,
    isInWatchlist,
    addToSearchHistory,
    clearSearchHistory,
    loadSearchHistory,
    getCachedResults,
    setCachedResults,
  } = useSearchStore();

  // Load initial data and initialize Firebase
  useEffect(() => {
    // Initialize Firebase Analytics
    initializeFirebase().catch(console.error);

    loadApiKeys();
    loadWatchlist();
    loadSearchHistory();
    loadWatchlistData();

    // Cleanup: End search session when component unmounts
    return () => {
      analyticsService.endSearchSession();
    };
  }, []);

  // Load API keys
  const loadApiKeys = async () => {
    // CoinGecko API key is optional - app works without it
    // const keys = await StorageService.getApiKeys();
  };

  // Load watchlist data
  const loadWatchlistData = useCallback(async () => {
    if (watchlist.length > 0) {
      const data = await cryptoApi.getCoinsByIds(watchlist);
      if (data && Array.isArray(data)) {
        // Filter out any null/undefined values
        const validData = data.filter((item) => item != null);
        setWatchlistData(validData);
      }
    } else {
      // Clear watchlist data if no items in watchlist
      setWatchlistData([]);
    }
  }, [watchlist, setWatchlistData]);

  // Reload watchlist data when watchlist changes
  useEffect(() => {
    loadWatchlistData();
  }, [watchlist, loadWatchlistData]);

  // Debounced search
  useEffect(() => {
    if (inputValue.trim().length < 2) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      performSearch(inputValue);
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [inputValue]);

  const performSearch = async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) return;

    // Check cache first
    const cachedResults = getCachedResults(trimmedQuery);
    if (cachedResults) {
      setSearchResults(cachedResults);
      setSearchQuery(trimmedQuery);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchQuery(trimmedQuery);

    try {
      const results = await cryptoApi.searchCoins(trimmedQuery);

      if (results) {
        setSearchResults(results);
        setCachedResults(trimmedQuery, results);

        // Track search analytics
        trackSearch(trimmedQuery, results.length);

        // Add to search history
        if (results.length > 0) {
          await addToSearchHistory(trimmedQuery);
        } else {
          // Track no results
          analyticsService.trackSearchNoResults(trimmedQuery);
        }
      } else {
        setSearchError('Failed to fetch search results');
        setSearchResults([]);
        // Track search error
        analyticsService.trackSearchError(trimmedQuery, 'Failed to fetch search results');
      }
    } catch {
      const errorMessage = 'An error occurred while searching';
      setSearchError(errorMessage);
      setSearchResults([]);
      // Track search error
      analyticsService.trackSearchError(trimmedQuery, errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleWatchlist = async (coin: CryptoData) => {
    if (isInWatchlist(coin.id)) {
      await removeFromWatchlist(coin.id);
      // Track watchlist removal
      trackWatchlistRemove(coin, 'search');
    } else {
      await addToWatchlist(coin.id);
      // Track watchlist addition
      trackWatchlistAdd(coin, 'search');
    }

    // Update watchlist count in analytics
    analyticsService.updateWatchlistCount(watchlist.length);
  };

  const handleSearchHistoryPress = (query: string) => {
    setInputValue(query);
    // Track search history click
    analyticsService.trackSearchHistoryClick(query);
  };

  const handleClearHistory = () => {
    Alert.alert('Clear Search History', 'Are you sure you want to clear your search history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        onPress: () => {
          clearSearchHistory();
          // Track clear search history
          analyticsService.trackClearSearchHistory();
        },
        style: 'destructive',
      },
    ]);
  };

  const renderCoinItem = ({ item, index }: { item: CryptoData; index: number }) => {
    const handleCoinPress = () => {
      // Track search result click
      trackSearchResultClick(item, index, searchQuery);

      // Navigate to coin detail screen
      navigation.navigate('CoinDetail', {
        coin: item,
        source: 'search',
      });
    };

    return (
      <CoinListItem
        coin={item}
        isWatchlisted={isInWatchlist(item.id)}
        onPress={handleCoinPress}
        onToggleWatchlist={() => handleToggleWatchlist(item)}
      />
    );
  };

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => handleSearchHistoryPress(item)}>
      <Text style={styles.historyIcon}>🕐</Text>
      <Text style={styles.historyText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isSearching) return null;

    if (searchQuery && searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateTitle}>No results found</Text>
          <Text style={styles.emptyStateText}>Try searching for a different cryptocurrency</Text>
        </View>
      );
    }

    if (inputValue.length === 0 && watchlistData.length > 0) {
      // Track watchlist view
      analyticsService.trackWatchlistView();

      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Watchlist</Text>
          <FlatList
            data={watchlistData}
            renderItem={({ item }) => {
              const handleCoinPress = () => {
                // Track coin detail view from watchlist
                trackCoinDetailView(item, 'watchlist');

                // Navigate to coin detail screen
                navigation.navigate('CoinDetail', {
                  coin: item,
                  source: 'watchlist',
                });
              };

              return (
                <CoinListItem
                  coin={item}
                  isWatchlisted={isInWatchlist(item.id)}
                  onPress={handleCoinPress}
                  onToggleWatchlist={() => handleToggleWatchlist(item)}
                />
              );
            }}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      );
    }

    return null;
  };

  const renderContent = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (searchError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{searchError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => performSearch(inputValue)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchResults.length > 0) {
      return (
        <FlatList
          data={searchResults}
          renderItem={renderCoinItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (inputValue.length === 0 && searchHistory.length > 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `history-${index}`}
            scrollEnabled={false}
          />
          {renderEmptyState()}
        </View>
      );
    }

    return renderEmptyState();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search Cryptocurrencies</Text>
        </View>

        <SearchBar value={inputValue} onChangeText={setInputValue} placeholder="Search coins..." />

        {renderContent()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  clearButton: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  historyText: {
    fontSize: 16,
    color: '#1F2937',
  },
});
