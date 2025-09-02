import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CryptoData } from '../types';
import { formatCryptoPrice, formatPercentage, formatCompact } from '../utils/formatters';

interface CoinListItemProps {
  coin: CryptoData;
  isWatchlisted: boolean;
  onPress?: () => void;
  onToggleWatchlist: () => void;
}

export const CoinListItem: React.FC<CoinListItemProps> = ({
  coin,
  isWatchlisted,
  onPress,
  onToggleWatchlist,
}) => {
  // Guard against undefined coin
  if (!coin) {
    return null;
  }

  const priceChangeColor = coin.price_change_percentage_24h >= 0 ? '#10B981' : '#EF4444';

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.leftSection}>
        <Image source={{ uri: coin.image }} style={styles.coinImage} />
        <View style={styles.coinInfo}>
          <Text style={styles.coinName} numberOfLines={1}>
            {coin.name}
          </Text>
          <View style={styles.symbolRow}>
            <Text style={styles.coinSymbol}>{coin.symbol.toUpperCase()}</Text>
            <Text style={styles.marketCap}>${formatCompact(coin.market_cap)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.priceInfo}>
          <Text style={styles.price}>{formatCryptoPrice(coin.current_price)}</Text>
          <Text style={[styles.priceChange, { color: priceChangeColor }]}>
            {formatPercentage(coin.price_change_percentage_24h)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.watchlistButton}
          onPress={onToggleWatchlist}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.watchlistIcon}>{isWatchlisted ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinSymbol: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  marketCap: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInfo: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  watchlistButton: {
    padding: 4,
  },
  watchlistIcon: {
    fontSize: 20,
    color: '#FFC107',
  },
});
