# BMT Web3 Mobile App - React Native Futures Trading

A React Native mobile application for futures trading on Binance and Gate.io exchanges.

## Features

- 📱 **Cross-Platform**: iOS and Android support
- 🔐 **Secure API Storage**: Encrypted credential storage using Expo SecureStore
- 📊 **Real-time Trading**: Live position monitoring and management
- 💹 **Multi-Exchange**: Support for Binance and Gate.io futures
- 🔔 **Push Notifications**: Alerts for positions, PnL, and price movements
- 📈 **Risk Management**: Stop-loss and take-profit orders
- 🎚️ **Leverage Control**: Adjustable leverage up to 125x
- 🌐 **Testnet Support**: Safe testing environment

## Installation

```bash
# Navigate to the app directory
cd apps/bmt-web3-app

# Install dependencies
npm install

# For iOS, install pods
cd ios && pod install && cd ..
```

## Running the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web (port 4004)
npm run web
```

## Project Structure

```
bmt-web3-app/
├── screens/
│   └── FuturesTradingScreen.tsx    # Main trading interface
├── services/
│   ├── futuresTrading.service.ts   # Trading API service
│   └── notifications.service.ts     # Push notifications
├── stores/
│   └── tradingStore.ts              # Zustand state management
├── components/                      # Reusable components
├── constants/                       # App constants
├── utils/                          # Utility functions
├── App.tsx                         # Main app component
└── package.json
```

## Configuration

### Environment Variables

Create a `.env` file in the root:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:4002/api

# Optional: Push Notifications
EXPO_PUBLIC_PUSH_SERVER_URL=
```

### API Connection

The app connects to the BMT Web3 API running on port 4002. Ensure the API is running before using the app:

```bash
cd ../bmt-web3-api
npm run start:dev
```

## Features Guide

### 1. Exchange Connection

- Tap "Connect Exchange" button
- Enter API credentials
- Toggle testnet mode for safe testing
- Credentials are encrypted and stored securely

### 2. Opening Positions

- Select trading pair (BTC, ETH, BNB, SOL)
- Choose direction (LONG/SHORT)
- Enter amount in USDT
- Adjust leverage (1x-125x)
- Optional: Set stop-loss and take-profit

### 3. Managing Positions

- View real-time PnL
- Monitor entry/mark prices
- Close positions with one tap
- Pull to refresh data

### 4. Notifications

- Position opened/closed alerts
- Stop-loss/take-profit triggers
- Liquidation warnings
- Low balance notifications

## Security

- **Encrypted Storage**: API credentials are encrypted using Expo SecureStore
- **No Plain Text**: Credentials never stored in plain text
- **Secure Communication**: All API calls use HTTPS in production
- **Token Authentication**: JWT tokens for API authentication

## Testing

### Testnet Setup

1. **Binance Testnet**

   - Visit: https://testnet.binancefuture.com/
   - Create account and get API keys
   - Fund with test USDT

2. **Gate.io Testnet**
   - Visit: https://www.gate.io/testnet
   - Create account and get API keys
   - Request test funds

### Running Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage
```

## Building for Production

### iOS Build

```bash
# Build for iOS
expo build:ios

# Or with EAS Build
eas build --platform ios
```

### Android Build

```bash
# Build APK
expo build:android

# Or with EAS Build
eas build --platform android
```

## Performance Optimization

- **Lazy Loading**: Screens loaded on demand
- **Memoization**: Heavy computations cached
- **Batch Updates**: State updates batched for performance
- **Image Optimization**: Optimized asset loading

## Troubleshooting

### Common Issues

**Connection Failed**

- Verify API server is running
- Check network connectivity
- Ensure correct API URL in .env

**Push Notifications Not Working**

- Check notification permissions
- Verify push token registration
- Ensure notification service initialized

**Performance Issues**

- Clear app cache
- Reduce position refresh frequency
- Check network latency

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:

- GitHub Issues: https://github.com/bemindlab/bmt-web3-app/issues
- Documentation: See main platform docs
