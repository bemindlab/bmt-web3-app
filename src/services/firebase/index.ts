/**
 * Firebase Services Export
 *
 * This file exports all Firebase-related services and utilities
 * for easy import throughout the application.
 */

// Configuration and initialization
export {
  initializeFirebase,
  getFirebaseApp,
  getFirebaseAnalytics,
  isFirebaseConfigured,
} from './config';

// Analytics service and tracking functions
export {
  analyticsService,
  AnalyticsEvents,
  UserProperties,
  trackSearch,
  trackSearchResultClick,
  trackWatchlistAdd,
  trackWatchlistRemove,
  trackCoinDetailView,
} from './analytics';

// Re-export types for convenience
export type { Analytics } from 'firebase/analytics';
