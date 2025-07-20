#!/bin/bash

# OnSpace Karaoke App - Quick Demo Start
# Powered by OnSpace.AI

echo "🎤 OnSpace Karaoke App - Starting Demo..."
echo "============================================="

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing via npm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check for any critical errors
echo "🔍 Running quick lint check..."
pnpm run lint | head -10

echo ""
echo "✅ Setup complete! Your OnSpace Karaoke App is ready."
echo ""
echo "🚀 Starting Expo development server..."
echo ""
echo "Demo Credentials:"
echo "  Email: demo@karatoken.com"
echo "  Password: demo123"
echo ""
echo "Platform options:"
echo "  • Press 'w' for web browser"
echo "  • Press 'i' for iOS simulator"
echo "  • Press 'a' for Android emulator"
echo "  • Scan QR code with Expo Go for mobile"
echo ""
echo "============================================="

# Start the development server
pnpm start