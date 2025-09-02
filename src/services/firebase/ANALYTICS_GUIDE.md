# Firebase Analytics Implementation Guide

## Overview

This guide documents the Firebase Analytics implementation for the BMT Web3 Mobile App's coin search feature. The implementation tracks user search behavior, watchlist interactions, and conversion metrics.

## Configuration

### Environment Variables

Ensure the following Firebase configuration variables are set in your `.env` file:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Initialization

Firebase Analytics is automatically initialized when the app starts through the `initializeFirebase()` function called in `App.tsx`.

## Tracked Events

### Search Events

#### 1. Search Query (`search`)

Tracks every search query made by users.

```typescript
trackSearch(query: string, resultCount: number)
```

**Parameters:**

- `search_term`: The search query (normalized to lowercase)
- `result_count`: Number of results returned
- `timestamp`: When the search was performed

#### 2. Search Result Click (`search_result_click`)

Tracks when users click on a search result.

```typescript
trackSearchResultClick(coin: CryptoData, position: number, searchQuery: string)
```

**Parameters:**

- `coin_id`: Unique identifier of the coin
- `coin_name`: Name of the cryptocurrency
- `coin_symbol`: Trading symbol
- `position_in_results`: Position in search results (0-indexed)
- `search_query`: The original search query
- `market_cap_rank`: Market capitalization ranking

#### 3. Search No Results (`search_no_results`)

Tracks searches that return no results.
**Parameters:**

- `search_term`: The search query that returned no results

#### 4. Search Error (`search_error`)

Tracks when search encounters an error.
**Parameters:**

- `search_term`: The search query that failed
- `error_message`: Description of the error

#### 5. Search History Click (`search_history_click`)

Tracks when users click on a previous search from history.
**Parameters:**

- `search_term`: The historical search term clicked

#### 6. Clear Search History (`search_clear_history`)

Tracks when users clear their search history.

### Watchlist Events

#### 1. Watchlist Add (`watchlist_add`)

Tracks when users add a coin to their watchlist.

```typescript
trackWatchlistAdd(coin: CryptoData, source: 'search' | 'detail' | 'watchlist')
```

**Parameters:**

- `coin_id`, `coin_name`, `coin_symbol`: Coin information
- `market_cap_rank`: Market ranking
- `current_price`: Price at time of addition
- `source`: Where the action originated

#### 2. Watchlist Remove (`watchlist_remove`)

Tracks when users remove a coin from their watchlist.
**Parameters:** Same as watchlist_add

#### 3. Watchlist View (`watchlist_view`)

Tracks when users view their watchlist.

### Coin Detail Events

#### 1. Coin Detail View (`coin_detail_view`)

Tracks when users view detailed information about a coin.

```typescript
trackCoinDetailView(coin: CryptoData, source: 'search' | 'watchlist' | 'direct')
```

**Parameters:**

- All coin information
- `source`: How the user navigated to the detail view

#### 2. Coin Detail from Search (`coin_detail_from_search`)

Specific tracking for detail views originating from search.

#### 3. Coin Detail from Watchlist (`coin_detail_from_watchlist`)

Specific tracking for detail views originating from watchlist.

### Conversion Events

#### 1. Search to Watchlist (`search_to_watchlist`)

Tracks conversion when a search leads to adding a coin to watchlist.

#### 2. Search to Detail (`search_to_detail`)

Tracks conversion when a search leads to viewing coin details.

### Session Events

#### 1. Search Session Start (`search_session_start`)

Marks the beginning of a search session.

#### 2. Search Session End (`search_session_end`)

Marks the end of a search session with metrics.
**Parameters:**

- `session_duration_ms`: Total session duration
- `search_count`: Number of searches in session

### Popular Search Terms (`popular_search_term`)

Automatically tracked when a term is searched 3+ times.
**Parameters:**

- `search_term`: The popular search term
- `search_count`: Number of times searched

## User Properties

The following user properties are set for segmentation:

1. **watchlist_count**: Number of coins in watchlist
2. **search_count**: Total number of searches performed
3. **favorite_coin**: Most viewed/interacted coin symbol
4. **user_type**: User classification (free/premium/trial)
5. **last_search_date**: Timestamp of last search

## Usage Examples

### Basic Search Tracking

```typescript
import { trackSearch, trackSearchResultClick } from '@/services/firebase/analytics';

// Track a search
const results = await searchCoins(query);
trackSearch(query, results.length);

// Track clicking on a result
const handleCoinClick = (coin: CryptoData, index: number) => {
  trackSearchResultClick(coin, index, currentSearchQuery);
  navigation.navigate('CoinDetail', { coin, source: 'search' });
};
```

### Watchlist Tracking

```typescript
import { trackWatchlistAdd, trackWatchlistRemove } from '@/services/firebase/analytics';

const toggleWatchlist = async (coin: CryptoData) => {
  if (isInWatchlist(coin.id)) {
    await removeFromWatchlist(coin.id);
    trackWatchlistRemove(coin, 'search');
  } else {
    await addToWatchlist(coin.id);
    trackWatchlistAdd(coin, 'search');
  }
};
```

### Session Management

```typescript
import { analyticsService } from '@/services/firebase/analytics';

// Component lifecycle
useEffect(() => {
  // Component mount - session starts automatically on first search

  return () => {
    // Component unmount - end session
    analyticsService.endSearchSession();
  };
}, []);
```

### Custom Events

```typescript
import { analyticsService } from '@/services/firebase/analytics';

// Track custom events
analyticsService.logCustomEvent('special_feature_used', {
  feature_name: 'advanced_search',
  filters_applied: ['price_range', 'market_cap'],
});
```

## Firebase Console Reports

After implementation, you can view the following reports in Firebase Console:

### Real-time Analytics

- Active users currently searching
- Search queries in real-time
- Conversion funnel visualization

### User Engagement

- Average session duration
- Search frequency per user
- Retention rates

### Popular Searches Dashboard

- Most searched coins
- Trending search terms
- Search patterns by time of day

### Conversion Reports

- Search to watchlist conversion rate
- Search to detail view conversion rate
- User journey analysis

## Best Practices

1. **Privacy Compliance**: Ensure user consent for analytics tracking
2. **Data Minimization**: Only track necessary data points
3. **Error Handling**: Always wrap tracking calls in try-catch blocks
4. **Performance**: Analytics calls are async and non-blocking
5. **Testing**: Use Firebase DebugView for testing events

## Debugging

### Enable Debug Mode

```bash
# For Expo/React Native Web
npx expo start --web
# Open browser console and check for Firebase Analytics logs
```

### View Events in Firebase Console

1. Go to Firebase Console > Analytics > DebugView
2. Enable debug mode in your app
3. Perform actions and watch events appear in real-time

### Common Issues

1. **Events not appearing**: Check Firebase configuration and network connection
2. **Missing parameters**: Ensure all required parameters are provided
3. **Web-only limitation**: Analytics only works on web platform with current setup

## Platform Limitations

Currently, Firebase Analytics is only available on the web platform due to using the web SDK. For native platforms (iOS/Android), consider:

1. Installing `@react-native-firebase/analytics` for native support
2. Using Expo's analytics solutions
3. Implementing a hybrid approach with conditional imports

## Future Enhancements

- [ ] Native platform support with @react-native-firebase
- [ ] A/B testing integration
- [ ] Predictive analytics
- [ ] Custom audiences for targeting
- [ ] Integration with Firebase Remote Config
- [ ] Enhanced error tracking with Crashlytics

## Support

For issues or questions about the analytics implementation:

1. Check Firebase documentation: https://firebase.google.com/docs/analytics
2. Review the implementation in `/src/services/firebase/`
3. Check browser console for error messages
4. Verify Firebase project configuration
