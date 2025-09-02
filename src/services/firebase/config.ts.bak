import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let analytics: Analytics | null = null;

// Initialize Firebase
export const initializeFirebase = async (): Promise<void> => {
  try {
    // Check if Firebase is already initialized
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    // Initialize Analytics only on web platform and if supported
    if (Platform.OS === 'web') {
      const analyticsSupported = await isSupported();
      if (analyticsSupported) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized successfully');
      } else {
        console.log('Firebase Analytics is not supported in this environment');
      }
    } else {
      // For native platforms, we would use @react-native-firebase/analytics
      // but for this implementation, we'll use web-based Firebase SDK
      console.log('Firebase Analytics not available on native platforms with web SDK');
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // TODO: [MEDIUM] - [2025-09-01] - Add proper error reporting service
    // Consider using Sentry or another error tracking service
    // to monitor Firebase initialization failures in production
  }
};

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    throw new Error('Firebase has not been initialized. Call initializeFirebase() first.');
  }
  return app;
};

export const getFirebaseAnalytics = (): Analytics | null => {
  if (!analytics && Platform.OS === 'web') {
    console.warn('Firebase Analytics is not initialized');
  }
  return analytics;
};

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
};
