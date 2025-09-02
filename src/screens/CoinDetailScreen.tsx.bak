import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSearchStore } from '../stores/searchStore';
import { CryptoDataDetailed } from '../types';
import {
  trackCoinDetailView,
  trackWatchlistAdd,
  trackWatchlistRemove,
  analyticsService,
} from '../services/firebase/analytics';
import { formatCryptoPrice, formatPercentage, formatCompact } from '../utils/formatters';

type RouteParams = {
  CoinDetail: {
    coin: CryptoDataDetailed;
    source: 'search' | 'watchlist' | 'direct';
  };
};

// Screen width available for future layout calculations
// const { width: screenWidth } = Dimensions.get('window');

export const CoinDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'CoinDetail'>>();
  const navigation = useNavigation();
  const { coin, source = 'direct' } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const { watchlist, isInWatchlist, addToWatchlist, removeFromWatchlist } = useSearchStore();

  const isWatchlisted = isInWatchlist(coin.id);

  useEffect(() => {
    // Track coin detail view when screen loads
    trackCoinDetailView(coin, source);

    // Set favorite coin if viewed multiple times (you can implement your own logic)
    if (source === 'search') {
      // User is actively searching and viewing details
      analyticsService.setFavoriteCoin(coin.symbol);
    }
  }, [coin, source]);

  const handleToggleWatchlist = async () => {
    setIsLoading(true);
    try {
      if (isWatchlisted) {
        await removeFromWatchlist(coin.id);
        trackWatchlistRemove(coin, 'detail');
      } else {
        await addToWatchlist(coin.id);
        trackWatchlistAdd(coin, 'detail');
      }

      // Update watchlist count in analytics
      analyticsService.updateWatchlistCount(watchlist.length);
    } catch {
      // Error toggling watchlist
    } finally {
      setIsLoading(false);
    }
  };

  const priceChangeColor = coin.price_change_percentage_24h >= 0 ? '#10B981' : '#EF4444';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Coin Details</Text>
          <TouchableOpacity
            style={[styles.watchlistButton, isLoading && styles.disabledButton]}
            onPress={handleToggleWatchlist}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFC107" />
            ) : (
              <Text style={styles.watchlistIcon}>{isWatchlisted ? '⭐' : '☆'}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Coin Basic Info */}
        <View style={styles.coinInfo}>
          <Image source={{ uri: coin.image }} style={styles.coinImage} />
          <Text style={styles.coinName}>{coin.name}</Text>
          <Text style={styles.coinSymbol}>{coin.symbol.toUpperCase()}</Text>
          {coin.market_cap_rank && (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>Rank #{coin.market_cap_rank}</Text>
            </View>
          )}
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.currentPrice}>{formatCryptoPrice(coin.current_price)}</Text>
          <View style={styles.priceChangeContainer}>
            <Text style={[styles.priceChange, { color: priceChangeColor }]}>
              {formatPercentage(coin.price_change_percentage_24h)}
            </Text>
            <Text style={styles.priceChangeLabel}>24h Change</Text>
          </View>
        </View>

        {/* Trade Button */}
        <TouchableOpacity
          style={styles.tradeButton}
          onPress={() => {
            // Navigate to Trading tab and pass coin data
            // Use the tab navigator to switch to Trading tab
            const parent = navigation.getParent();
            if (parent) {
              parent.navigate('Trading', {
                screen: 'TradingMain',
                params: {
                  selectedCoin: {
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name,
                    price: coin.current_price,
                  },
                },
              });
            }
          }}
        >
          <Text style={styles.tradeButtonIcon}>📊</Text>
          <Text style={styles.tradeButtonText}>Trade {coin.symbol.toUpperCase()}/USDT</Text>
        </TouchableOpacity>

        {/* Market Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Market Statistics</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Market Cap</Text>
            <Text style={styles.statValue}>${formatCompact(coin.market_cap)}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>24h Volume</Text>
            <Text style={styles.statValue}>${formatCompact(coin.total_volume || coin.volume)}</Text>
          </View>

          {coin.high_24h && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>24h High</Text>
              <Text style={styles.statValue}>{formatCryptoPrice(coin.high_24h)}</Text>
            </View>
          )}

          {coin.low_24h && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>24h Low</Text>
              <Text style={styles.statValue}>{formatCryptoPrice(coin.low_24h)}</Text>
            </View>
          )}

          {coin.circulating_supply && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Circulating Supply</Text>
              <Text style={styles.statValue}>
                {coin.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}
              </Text>
            </View>
          )}

          {coin.total_supply && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Supply</Text>
              <Text style={styles.statValue}>
                {coin.total_supply.toLocaleString()} {coin.symbol.toUpperCase()}
              </Text>
            </View>
          )}

          {coin.max_supply && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Max Supply</Text>
              <Text style={styles.statValue}>
                {coin.max_supply.toLocaleString()} {coin.symbol.toUpperCase()}
              </Text>
            </View>
          )}

          {coin.ath && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>All-Time High</Text>
              <Text style={styles.statValue}>{formatCryptoPrice(coin.ath)}</Text>
            </View>
          )}

          {coin.atl && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>All-Time Low</Text>
              <Text style={styles.statValue}>{formatCryptoPrice(coin.atl)}</Text>
            </View>
          )}
        </View>

        {/* Source Information */}
        {source !== 'direct' && (
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceText}>
              Viewed from: {source === 'search' ? '🔍 Search' : '⭐ Watchlist'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  watchlistButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  watchlistIcon: {
    fontSize: 24,
    color: '#FFC107',
  },
  coinInfo: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
    marginTop: 1,
  },
  coinImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  coinName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  coinSymbol: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  rankBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rankText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  priceSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
    marginTop: 8,
  },
  currentPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  priceChangeContainer: {
    alignItems: 'center',
  },
  priceChange: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceChangeLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  tradeButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tradeButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  tradeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#FFF',
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  sourceInfo: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  sourceText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
