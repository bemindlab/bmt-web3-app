// IMPORTANT: Basic React Native setup - no polyfills needed for our exchange service
// import './src/polyfills';

import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import FuturesTradingScreen from './src/screens/FuturesTradingScreen';
import { CoinDetailScreen } from './src/screens/CoinDetailScreen';
import { initializeFirebase } from './src/services/firebase/config';
// React Native compatible exchange service - no CCXT dependencies
import exchangeService from './src/services/ccxtExchange.service';
// Professional trading theme
import { tradingColors, spacing } from './src/constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Search Stack Navigator
function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="CoinDetail" component={CoinDetailScreen} />
    </Stack.Navigator>
  );
}

// Home Stack Navigator (in case you want to navigate to CoinDetail from Home too)
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CoinDetail" component={CoinDetailScreen} />
    </Stack.Navigator>
  );
}

// Trading Stack Navigator
function TradingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TradingMain" component={FuturesTradingScreen} />
      <Stack.Screen name="CoinDetail" component={CoinDetailScreen} />
    </Stack.Navigator>
  );
}

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tradingColors.dark.background.header,
          borderTopWidth: 1,
          borderTopColor: tradingColors.dark.border.primary,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          height: 70, // Increased height for professional look
        },
        tabBarActiveTintColor: tradingColors.primary,
        tabBarInactiveTintColor: tradingColors.dark.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ 
              fontSize: 20, 
              color,
              transform: [{ scale: focused ? 1.1 : 1 }],
              fontWeight: focused ? '600' : '400'
            }}>⌂</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ 
              fontSize: 20, 
              color,
              transform: [{ scale: focused ? 1.1 : 1 }],
              fontWeight: focused ? '600' : '400'
            }}>⌕</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Trading"
        component={TradingStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ 
              fontSize: 20, 
              color,
              transform: [{ scale: focused ? 1.1 : 1 }],
              fontWeight: focused ? '600' : '400'
            }}>⟐</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ 
              fontSize: 20, 
              color,
              transform: [{ scale: focused ? 1.1 : 1 }],
              fontWeight: focused ? '600' : '400'
            }}>⚙</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize services when app starts
    const initializeServices = async () => {
      try {
        // Initialize React Native Exchange Service
        // ADDED: [HIGH] - [2025-09-01] - Claude Code
        // Initialize exchange service early - React Native compatible (no CCXT)
        const diagnostics = exchangeService.getDiagnostics();
        console.log('✅ Exchange service initialized successfully:', diagnostics);

        // Initialize Firebase
        await initializeFirebase();
        console.log('✅ Firebase initialized successfully');
      } catch (error) {
        console.error('❌ Service initialization failed:', error);
        // Continue app startup even if services fail to initialize
        // Individual services will handle their own error recovery
      }
    };

    initializeServices();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <TabNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Removed unused styles
