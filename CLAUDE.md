# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BMT Web3 Mobile App is a React Native application built with Expo SDK 53 that provides a futures trading interface for Binance and Gate.io exchanges. The app focuses on secure API credential storage, real-time position monitoring, and cross-platform mobile trading capabilities.

## Technology Stack

- **React Native 0.79.6** - Cross-platform mobile framework
- **Expo SDK 53** - Development platform and tools
- **TypeScript 5.8** - Type-safe development
- **Zustand 5.0** - State management (no provider needed)
- **Expo SecureStore** - Encrypted credential storage
- **React Navigation 7** - Screen navigation

## Essential Commands

```bash
# Development
npm install          # Install dependencies
npm run web         # Start web preview on port 4004
npm run ios         # Start iOS simulator
npm run android     # Start Android emulator
npm start           # Start Expo development server
npm run clean       # Clear Expo cache

# Code Quality - ALWAYS run before committing
npm run lint        # ESLint checking (configured in .eslintrc.json)
npm run typecheck   # TypeScript validation (strict mode enabled)
npm run format      # Prettier formatting (.prettierrc.js)

# Testing
npm test            # Run Jest tests (currently no test files)
node test-integration.js  # Run integration verification script

# Building (requires eas.json configuration)
npm run build       # Export build using expo export
eas build --platform ios      # Build iOS app
eas build --platform android  # Build Android app
```

## Project Structure

```
bmt-web3-app/
├── App.tsx                         # Main app with tab navigation
├── src/
│   ├── screens/                   # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── FuturesTradingScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/                  # Business logic & API
│   │   ├── futuresTrading.service.ts  # Exchange API integration
│   │   ├── cryptoApi.ts              # Market data fetching
│   │   └── storage.ts                # Secure credential storage
│   ├── stores/                    # Zustand state management
│   │   ├── tradingStore.ts       # Trading state & actions
│   │   └── searchStore.ts        # Search functionality
│   ├── components/                # Reusable UI components
│   │   └── CryptoCard.tsx
│   └── types/                     # TypeScript definitions
│       └── index.ts
├── assets/                        # Images and static files
├── app.json                       # Expo configuration
├── tsconfig.json                  # TypeScript config (strict mode)
├── .eslintrc.json                 # ESLint rules
├── .prettierrc.js                 # Code formatting
├── babel.config.js                # Babel configuration
├── metro.config.js                # Metro bundler config
└── test-integration.js            # Integration test script
```

## Architecture Overview

### Navigation Pattern

The app uses a simple tab-based navigation implemented in App.tsx with manual state management (no React Navigation currently):

```typescript
// App.tsx - Tab navigation implementation
const [activeTab, setActiveTab] = useState('Home');

// Conditional rendering based on active tab
{activeTab === 'Home' ? <HomeScreen /> :
 activeTab === 'Trading' ? <FuturesTradingScreen /> :
 activeTab === 'Search' ? <SearchScreen /> : <SettingsScreen />}
```

### State Management with Zustand

```typescript
// src/stores/tradingStore.ts - Core trading state
interface TradingState {
  isConnected: { binance: boolean; gate: boolean };
  activeExchange: 'binance' | 'gate';
  positions: Position[];
  balances: { binance: AccountBalance | null; gate: AccountBalance | null };

  // Actions
  initializeExchange: (credentials: ExchangeCredentials) => Promise<boolean>;
  openPosition: (params: PositionParams) => Promise<boolean>;
  closePosition: (symbol: string) => Promise<boolean>;
}

// Usage in components - no provider needed
const { positions, openPosition } = useTradingStore();
```

### Service Layer Pattern

```typescript
// src/services/futuresTrading.service.ts
class FuturesTradingService {
  private exchanges: Map<string, ExchangeClient> = new Map();

  async initializeExchange(credentials: ExchangeCredentials) {
    // Store encrypted credentials
    await SecureStore.setItemAsync(key, JSON.stringify(credentials));
    // Initialize exchange client
  }

  async openPosition(params: OpenPositionParams) {
    const exchange = this.exchanges.get(params.exchange);
    // Execute trade through exchange API
  }
}
```

## Key Development Patterns

### TypeScript Path Aliases

Use `@/` prefix for absolute imports (configured in tsconfig.json):

```typescript
import { TradingState } from '@/types'; // Resolves to ./types
import { useTradingStore } from '@/stores/tradingStore';
```

### Error Handling Pattern

All service methods return success/error objects:

```typescript
const result = await FuturesTradingService.openPosition(params);
if (result.success) {
  // Handle success
} else {
  console.error(result.error || result.message);
}
```

### Secure Storage for API Credentials

```typescript
// Storing encrypted credentials
await SecureStore.setItemAsync(`${exchange}_credentials`, JSON.stringify(credentials));

// Retrieving credentials
const stored = await SecureStore.getItemAsync(`${exchange}_credentials`);
```

## Environment Variables

Create `.env` file (copy from .env.example):

```bash
EXPO_PUBLIC_API_URL=http://localhost:4002/api  # BMT Web3 API endpoint
EXPO_PUBLIC_PUSH_SERVER_URL=                    # Optional push server
```

## Common Development Tasks

### Running the Futures Trading Feature

```bash
# 1. Start the API server (in separate terminal)
cd ../bmt-web3-api && npm run start:dev

# 2. Start the mobile app
npm run web  # For web preview on port 4004
# OR
npm run ios  # For iOS simulator
# OR
npm run android  # For Android emulator
```

### Troubleshooting

**Metro bundler issues:**

```bash
npm run clean  # Clears Expo cache
```

**TypeScript errors:**

```bash
npm run typecheck  # Check for type errors
# Ensure all imports use correct paths and types are defined
```

**Port 4004 already in use:**

```bash
lsof -i :4004 && kill -9 $(lsof -t -i :4004)
```

## Testing the Trading Integration

Run the integration test to verify all components are working:

```bash
node test-integration.js
```

This validates:

- Tab navigation with Trading tab
- FuturesTradingScreen component
- Trading store (Zustand)
- Futures trading service
- Required dependencies
- TypeScript compilation

## Key Implementation Details

### Trading Features

- **Exchanges**: Binance and Gate.io futures (with testnet support)
- **Leverage**: Adjustable from 1x to 125x
- **Order Types**: Market orders with optional stop-loss/take-profit
- **Security**: API credentials encrypted with Expo SecureStore
- **State**: Managed with Zustand (no provider needed)

### Code Standards

- TypeScript strict mode enabled
- ESLint configured for React Native
- Prettier for code formatting
- Path aliases using `@/` prefix

## Important Notes

- **Port 4004** is reserved for this app's web preview
- No test files created yet - use `test-integration.js` for verification
- The app requires BMT Web3 API running on port 4002
- All exchange credentials are encrypted before storage
- Manual tab navigation (no React Navigation library currently)

## Code Quality Standards & Anti-Hardcoding Rules

### MANDATORY: No Hardcoded Data Policy

Claude Code MUST follow these strict anti-hardcoding rules when working on this codebase:

#### ❌ NEVER Hardcode These Values

**1. Financial Data**

```typescript
// ❌ WRONG - Hardcoded prices/balances
const btcPrice = 42000;
const mockBalance = { total: 5000, available: 4500 };

// ✅ CORRECT - Dynamic from API
const btcPrice = await getMarketPrice('BTC/USDT');
const balance = await getAccountBalance(exchange);
```

**2. API URLs & Endpoints**

```typescript
// ❌ WRONG - Hardcoded URLs
const API_URL = 'http://localhost:4002';
fetch('https://api.binance.com/api/v3/ticker/24hr');

// ✅ CORRECT - Environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4002';
const BINANCE_URL = process.env.EXPO_PUBLIC_BINANCE_URL || DEFAULT_BINANCE_URL;
```

**3. Business Logic Constants**

```typescript
// ❌ WRONG - Hardcoded thresholds
if (riskPercent > 50) return 'Low';
const HIGH_RISK = 10;

// ✅ CORRECT - Configurable constants
const RISK_THRESHOLDS = {
  LOW: Number(process.env.EXPO_PUBLIC_LOW_RISK_THRESHOLD) || 50,
  MEDIUM: Number(process.env.EXPO_PUBLIC_MEDIUM_RISK_THRESHOLD) || 20,
  HIGH: Number(process.env.EXPO_PUBLIC_HIGH_RISK_THRESHOLD) || 10,
};
```

**4. Validation Rules**

```typescript
// ❌ WRONG - Magic numbers
if (apiKey.length < 10) throw new Error('Invalid key');

// ✅ CORRECT - Named constants
const API_KEY_MIN_LENGTH = {
  binance: 40,
  gate: 20,
};
if (apiKey.length < API_KEY_MIN_LENGTH[exchange]) throw new Error('Invalid key');
```

**5. UI Colors & Styling**

```typescript
// ❌ WRONG - Hardcoded hex values scattered everywhere
color: '#4ADE80';

// ✅ CORRECT - Theme system
import { colors } from '@/constants/theme';
color: colors.success;
```

#### ✅ Approved Patterns

**1. Configuration Constants**

```typescript
// constants/config.ts
export const CONFIG = {
  API: {
    DEFAULT_TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
  },
  TRADING: {
    MAX_LEVERAGE: 125,
    MIN_ORDER_SIZE: 0.001,
  },
  VALIDATION: {
    API_KEY_LENGTH: {
      binance: 40,
      gate: 20,
    },
  },
} as const;
```

**2. Theme System**

```typescript
// constants/theme.ts
export const colors = {
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#EF4444',
  info: '#3B82F6',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
} as const;
```

**3. Environment Configuration**

```typescript
// config/environment.ts
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4002',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  IS_DEV: __DEV__,
} as const;
```

#### 🔍 Claude Code Pre-Flight Checklist

Before making ANY changes, Claude Code must verify:

**1. No New Hardcoded Values**

- [ ] No numeric constants without named variables
- [ ] No string literals for URLs, endpoints, or business logic
- [ ] No color hex codes outside theme system
- [ ] No API responses with hardcoded mock data

**2. Configuration Pattern Used**

- [ ] Constants moved to appropriate config files
- [ ] Environment variables used for environment-specific values
- [ ] Theme system used for all UI styling values
- [ ] Business logic thresholds are configurable

**3. TODO Comments for Temporary Code**

```typescript
// TODO: [PRIORITY] - [DATE] - Claude Code
// Description: Replace hardcoded value with configuration
// Current: Using temporary mock data for development
// Required: Implement proper API integration
// File: /path/to/config.ts
// Reference: Issue #123
```

### Development Workflow for Claude Code

#### When Adding New Features

1. **Check for existing constants** - Use `constants/` directory first
2. **Create configuration objects** - Don't scatter values throughout code
3. **Use environment variables** - For deployment-specific values
4. **Document with TODO** - If temporary hardcoding is absolutely necessary
5. **Update .env.example** - When adding new environment variables

#### When Fixing Bugs

1. **Identify hardcoded causes** - Look for magic numbers/strings
2. **Extract to constants** - Create proper configuration
3. **Add validation** - Ensure configuration is valid
4. **Test with different values** - Verify flexibility

#### When Refactoring

1. **Audit for hardcoded data** - Use grep/search for patterns
2. **Consolidate constants** - Remove duplicate values
3. **Create theme system** - For UI-related constants
4. **Document configuration** - Update CLAUDE.md with new patterns

### Error Handling for Configuration

**Always validate configuration:**

```typescript
const validateConfig = () => {
  if (!ENV.API_URL) throw new Error('API_URL not configured');
  if (CONFIG.TRADING.MAX_LEVERAGE < 1) throw new Error('Invalid leverage config');
};

// Run validation on app start
validateConfig();
```

### Monitoring & Alerts

**Add logging for configuration usage:**

```typescript
console.log(`Using API URL: ${ENV.API_URL}`);
console.log(`Risk thresholds: ${JSON.stringify(RISK_THRESHOLDS)}`);
```

## Critical Implementation Rules

### Rule 1: Zero Tolerance for Financial Hardcoding

Any hardcoded financial data (prices, balances, rates) is considered a CRITICAL bug and must be fixed immediately.

### Rule 2: Configuration-First Development

Before writing ANY business logic, create the configuration structure first.

### Rule 3: Environment Variable Documentation

Every new environment variable MUST be:

- Added to `.env.example`
- Documented in this CLAUDE.md
- Validated on app startup

### Rule 4: Theme System Enforcement

All colors, spacing, typography MUST use the theme system. No exceptions.

### Rule 5: API Integration Standards

All external API calls MUST use configurable endpoints with proper fallbacks and error handling.
