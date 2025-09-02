# Search Feature Documentation

## Overview

The Search feature allows users to search for any cryptocurrency, view real-time market data, and manage their watchlist.

## Features Implemented

### 1. **Real-time Search**

- Search for any cryptocurrency by name or symbol
- Debounced search with 500ms delay to reduce API calls
- Results cached for 5 minutes to improve performance

### 2. **Watchlist Management**

- Add/remove coins from watchlist with star icon
- Persistent storage using AsyncStorage
- Watchlist displayed when search is empty
- Real-time price updates for watchlisted coins

### 3. **Search History**

- Automatically saves successful searches
- Recent searches displayed when search input is empty
- Clear history option available
- Maximum 10 recent searches stored

### 4. **UI Components**

- **SearchBar**: Reusable search input component
- **CoinListItem**: Displays coin information with price, 24h change, and watchlist toggle
- **Loading states**: Visual feedback during search
- **Error handling**: User-friendly error messages with retry option
- **Empty states**: Helpful messages when no results found

## File Structure

```
src/
├── screens/
│   └── SearchScreen.tsx        # Main search screen
├── components/
│   ├── SearchBar.tsx          # Reusable search bar
│   ├── CoinListItem.tsx       # Coin list item component
│   └── index.ts              # Component exports
├── stores/
│   ├── searchStore.ts         # Zustand store for search state
│   └── index.ts              # Store exports
├── hooks/
│   ├── useSearch.ts          # Custom hook for search logic
│   └── index.ts              # Hook exports
└── services/
    ├── cryptoApi.ts          # Extended with search methods
    └── storage.ts            # Extended with watchlist/history storage
```

## API Methods Added

### CryptoApiService

- `searchCoins(query: string)`: Search for coins by query
- `getCoinDetails(coinId: string)`: Get detailed coin information
- `getCoinsByIds(coinIds: string[])`: Get multiple coins by IDs

### StorageService

- `saveWatchlist(watchlist: string[])`: Save watchlist to storage
- `getWatchlist()`: Retrieve saved watchlist
- `saveSearchHistory(history: string[])`: Save search history
- `getSearchHistory()`: Retrieve search history
- `clearSearchHistory()`: Clear all search history

## State Management

### SearchStore (Zustand)

```typescript
interface SearchState {
  searchQuery: string;
  searchResults: CryptoData[];
  isSearching: boolean;
  searchError: string | null;
  watchlist: string[];
  watchlistData: CryptoData[];
  searchHistory: string[];
  searchCache: SearchCache;
}
```

## Usage Example

```typescript
// In a component
import { useSearchStore } from '@/stores';
import { useSearch } from '@/hooks';

const MyComponent = () => {
  const { performSearch, toggleWatchlist } = useSearch();

  // Perform search
  await performSearch('bitcoin');

  // Toggle watchlist
  await toggleWatchlist('bitcoin');
};
```

## Performance Optimizations

1. **Debouncing**: 500ms delay before API call
2. **Caching**: 5-minute cache for search results
3. **Memoization**: React.memo for expensive components
4. **FlatList**: Efficient rendering of large lists
5. **Lazy Loading**: Components loaded on demand

## Error Handling

- Network errors show retry button
- API rate limits handled gracefully
- Invalid searches prevented (min 2 characters)
- Fallback UI for all error states

## Testing Checklist

- [ ] Search for popular coins (Bitcoin, Ethereum)
- [ ] Search with partial names
- [ ] Add/remove from watchlist
- [ ] View recent searches
- [ ] Clear search history
- [ ] Test with no network connection
- [ ] Test cache functionality
- [ ] Verify persistence after app restart
