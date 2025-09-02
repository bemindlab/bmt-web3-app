# Android Build Error Fix

## Problem

The Android build is failing because Java Development Kit (JDK) is not installed on your system.

## Solutions

### Option 1: Install Java (Required for Android Development)

#### On macOS:

```bash
# Install Java 17 (recommended for React Native/Expo)
brew install openjdk@17

# Set up Java environment
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
java -version
```

#### Alternative: Download from Oracle

Visit https://www.oracle.com/java/technologies/downloads/#java17 and download JDK 17 for macOS

### Option 2: Use Expo Go (No Java Required)

Instead of building a native Android app, use Expo Go for development:

```bash
# Start Expo development server
npx expo start

# Then either:
# 1. Scan QR code with Expo Go app on your Android device
# 2. Press 'a' to open in Android emulator (if configured)
# 3. Press 'w' to open in web browser
```

### Option 3: Use Web Development (Immediate Solution)

```bash
# Run the app in web browser (no Java required)
npm run web
```

## After Installing Java

If you choose Option 1 and install Java, then:

1. **Clean the build cache:**

```bash
cd android
./gradlew clean
cd ..
```

2. **Clear React Native cache:**

```bash
npx react-native clean
rm -rf node_modules
npm install
```

3. **Run Android build again:**

```bash
npx expo run:android
# or
npm run android
```

## Additional Troubleshooting

If the build still fails after installing Java:

1. **Check Android SDK:**

```bash
# Ensure Android SDK is installed
npx expo doctor
```

2. **Reset Metro bundler:**

```bash
npx expo start --clear
```

3. **Clean all caches:**

```bash
# Clean everything
cd android && ./gradlew clean && cd ..
rm -rf node_modules
rm -rf .expo
rm -rf android/.gradle
rm -rf android/app/build
npm install
npx expo prebuild --clean
```

4. **Check for specific errors:**

```bash
# Run with more verbose output
cd android
./gradlew app:assembleDebug --stacktrace --info
```

## Recommended Development Flow

For immediate development without Java:

1. **Use Web Preview:**

```bash
npm run web
```

2. **Use Expo Go on Physical Device:**

```bash
npx expo start
# Scan QR code with Expo Go app
```

3. **Install Java later for native builds when needed**

## Environment Setup Checklist

- [ ] Java JDK 17 installed
- [ ] JAVA_HOME environment variable set
- [ ] Android Studio installed (optional but recommended)
- [ ] Android SDK installed
- [ ] Android emulator configured (optional)

## Quick Commands

```bash
# Check all requirements
npx expo doctor

# Start development (Expo Go)
npx expo start

# Start web preview
npm run web

# Build Android (requires Java)
npx expo run:android
```
