import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// REMOVED: React Navigation dependency - using stack navigation from App.tsx
import { CryptoCard } from '../components/CryptoCard';
import { CryptoApiService } from '../services/cryptoApi';
import { CryptoData, TrendingCrypto } from '../types';
import { tradingColors, spacing, borderRadius, typography, shadows } from '../constants/theme';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoImage = require('../../assets/logo.png');

interface HomeScreenProps {
  navigation?: any; // Navigation prop from stack navigator
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [topCoins, setTopCoins] = useState<CryptoData[]>([]);
  const [trendingCoins, setTrendingCoins] = useState<TrendingCrypto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiService] = useState<CryptoApiService>(new CryptoApiService());

  useEffect(() => {
    initializeApiService();
    loadData();
  }, []);

  const initializeApiService = async () => {
    // CoinGecko API key is optional - app works without it
    // const apiKeys = await StorageService.getApiKeys();
    // Service works without API key
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [topCoinsData, trendingData] = await Promise.all([
        apiService.getTopCoins(10),
        apiService.getTrendingCoins(),
      ]);

      if (topCoinsData) {
        setTopCoins(topCoinsData);
      }

      if (trendingData) {
        setTrendingCoins(trendingData);
      }
    } catch (_error) {
      console.error('Error loading data:', _error);
      Alert.alert(
        'Error',
        'Failed to load cryptocurrency data. Please check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeApiService();
    await loadData();
    setRefreshing(false);
  };

  const handleCoinPress = (crypto: CryptoData) => {
    // Navigate to coin detail screen if navigation is available
    if (navigation) {
      navigation.navigate('CoinDetail', {
        coin: crypto,
        source: 'home',
      });
    }
  };

  const handleTrendingPress = (coin: any) => {
    // Convert trending coin to CryptoData format for CoinDetail screen
    const cryptoData = {
      id: coin.item.id,
      symbol: coin.item.symbol,
      name: coin.item.name,
      image: coin.item.large,
      current_price: 0, // Trending API doesn't provide price
      market_cap: 0,
      market_cap_rank: coin.item.market_cap_rank,
      price_change_percentage_24h: 0,
      total_volume: 0,
    };

    // Navigate to coin detail screen if navigation is available
    if (navigation) {
      navigation.navigate('CoinDetail', {
        coin: cryptoData,
        source: 'trending',
      });
    }
  };

  // Helper function to format trending coin data (currently unused but may be needed for future features)
  // const formatTrendingCoin = (trendingCoin: any): CryptoData => {
  //   return {
  //     id: trendingCoin.item.id,
  //     symbol: trendingCoin.item.symbol,
  //     name: trendingCoin.item.name,
  //     current_price: 0, // Trending API doesn't provide price
  //     price_change_percentage_24h: 0, // Will be updated in real implementation
  //     market_cap: 0,
  //     volume: 0,
  //     image: trendingCoin.item.large,
  //   };
  // };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tradingColors.primary} />
          <Text style={styles.loadingText}>Loading market data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={logoImage} style={styles.logo} />
          <Text style={styles.title}>BMT Trading</Text>
          <Text style={styles.subtitle}>Market Overview</Text>
        </View>

        {/* Trending Section */}
        {trendingCoins && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Trending</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {trendingCoins.coins.slice(0, 5).map((coin) => (
                <Pressable
                  key={coin.item.id}
                  onPress={() => handleTrendingPress(coin)}
                  style={({ pressed }) => [
                    styles.trendingCard,
                    pressed && styles.trendingCardPressed,
                  ]}
                >
                  <Text style={styles.trendingRank}>#{coin.item.market_cap_rank || '?'}</Text>
                  <Text style={styles.trendingSymbol}>{coin.item.symbol.toUpperCase()}</Text>
                  <Text style={styles.trendingName}>{coin.item.name}</Text>
                  <View style={styles.trendingScore}>
                    <Text style={styles.trendingScoreText}>Score: {coin.item.score}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Cryptocurrencies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Top Cryptocurrencies</Text>
          {topCoins.length > 0 ? (
            topCoins.map((crypto) => (
              <CryptoCard key={crypto.id} crypto={crypto} onPress={() => handleCoinPress(crypto)} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No data available. Check your API configuration in Settings.
              </Text>
            </View>
          )}
        </View>

        {/* Footer Space */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tradingColors.dark.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: tradingColors.dark.text.tertiary,
  },
  header: {
    backgroundColor: tradingColors.dark.background.secondary,
    padding: spacing.trading.headerPadding,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.trading.card,
    marginHorizontal: spacing.md,
    ...shadows.trading.card,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.sm,
    resizeMode: 'contain',
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: tradingColors.dark.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: tradingColors.dark.text.secondary,
  },
  section: {
    marginBottom: spacing.trading.sectionGap,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: tradingColors.dark.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  trendingCard: {
    backgroundColor: tradingColors.dark.background.secondary,
    padding: spacing.trading.cardPadding,
    marginLeft: spacing.md,
    borderRadius: borderRadius.trading.card,
    width: 140,
    borderWidth: 1,
    borderColor: tradingColors.dark.border.primary,
    ...shadows.trading.card,
  },
  trendingRank: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: tradingColors.primary,
    marginBottom: spacing.sm,
  },
  trendingSymbol: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: tradingColors.dark.text.primary,
    marginBottom: spacing.xs,
  },
  trendingName: {
    fontSize: typography.fontSize.xs,
    color: tradingColors.dark.text.tertiary,
    marginBottom: spacing.sm,
  },
  trendingScore: {
    backgroundColor: tradingColors.dark.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.trading.chip,
    borderWidth: 1,
    borderColor: tradingColors.dark.border.subtle,
  },
  trendingScoreText: {
    fontSize: typography.fontSize.xxs,
    color: tradingColors.dark.text.secondary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  trendingCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  emptyState: {
    backgroundColor: tradingColors.dark.background.secondary,
    padding: spacing.xxl,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.trading.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tradingColors.dark.border.primary,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: tradingColors.dark.text.tertiary,
    textAlign: 'center',
  },
  footer: {
    height: spacing.xl,
  },
});
