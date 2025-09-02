#!/bin/bash

# Set Java environment
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"

# Set Android SDK
export ANDROID_HOME="/Users/lps/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"

echo "🤖 Starting Android build..."
echo "☕ Java version: $(java -version 2>&1 | head -1)"
echo "📱 Android SDK: $ANDROID_HOME"

# Run Android build
yarn android
