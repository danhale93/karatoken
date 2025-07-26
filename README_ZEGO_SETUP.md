# ZegoCloud Setup Guide

This document explains how to configure ZegoCloud in the Karatoken app.

## Current Configuration

The app is configured with ZegoCloud App ID: **1073526291**

## Environment Variables

The following environment variables have been configured in `.env`:

```
EXPO_PUBLIC_ZEGO_APP_ID=1073526291
EXPO_PUBLIC_ZEGO_APP_SIGN=952bf2fdc875692e336751aacaaeae13926141824613e39970e50aad709368e7
```

## Setup Steps

### 1. Get Your App Sign from ZegoCloud Console

1. Go to [ZegoCloud Console](https://console.zegocloud.com/)
2. Select your project with App ID `1073526291`
3. Navigate to "Basic Configurations"
4. Copy your App Sign (a long string starting with something like "0x...")

### 2. Environment Variables Configuration

The App Sign has been configured in `.env`:

```
EXPO_PUBLIC_ZEGO_APP_SIGN=952bf2fdc875692e336751aacaaeae13926141824613e39970e50aad709368e7
```

This enables the app to use real ZegoCloud services instead of the mock implementation.

### 3. Install ZegoCloud SDK (Optional for Production)

To use the real ZegoCloud SDK instead of the mock service, install:

```bash
npm install zego-express-engine-reactnative
```

Then uncomment the SDK implementation code in `services/realZegoService.ts`.

## Service Selection

The app automatically determines which service to use:

- **Mock Service**: Used when `EXPO_PUBLIC_ZEGO_APP_SIGN` is not set or equals `your_app_sign_here`
- **Real Service**: Used when proper ZegoCloud credentials are configured

## Features Supported

- **Real-time Audio**: Multi-participant voice communication
- **Battle Rooms**: Competitive karaoke battles
- **Duet Rooms**: Two-person collaborative singing
- **Audio Mixing**: Background track integration
- **Sound Level Monitoring**: Real-time audio level detection for pitch scoring

## Testing

1. **Mock Mode**: Works immediately for testing UI and basic functionality
2. **Real Mode**: Requires valid ZegoCloud credentials and SDK installation

## Configuration Files

- `app/config.ts`: Contains ZegoCloud configuration and service selection logic
- `services/zegoService.ts`: Main service export with conditional loading
- `services/mockZegoService.ts`: Mock implementation for testing
- `services/realZegoService.ts`: Real ZegoCloud SDK implementation structure

## Troubleshooting

1. **"Using Mock ZegoCloud Service" message**: Update your App Sign in `.env`
2. **Authentication errors**: Verify App ID and App Sign are correct
3. **Audio permission issues**: Ensure microphone permissions are granted

## Security Notes

- App Sign should be kept secure and not committed to version control
- Use different App IDs/Signs for development and production environments
- Consider using a token server for enhanced security in production