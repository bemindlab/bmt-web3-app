// Jest test setup for React Native/Expo with CCXT

// Define React Native globals before importing anything
global.__DEV__ = true;
global.__METRO__ = false;

import 'react-native-get-random-values';

// Mock React Native modules that aren't available in Jest environment
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock fetch for network requests
global.fetch = jest.fn();

// Mock crypto for CCXT
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn().mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    onLine: true,
    product: 'ReactNative',
  },
});

// Mock console methods in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for async tests
jest.setTimeout(10000);
