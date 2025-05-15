# AIR-assist Android Application

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-blue.svg)](https://reactnative.dev/)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9.0-purple.svg)](https://kotlinlang.org/)
[![Platform](https://img.shields.io/badge/Platform-Android-green.svg)](https://www.android.com/)

A voice-controlled AI assistant application optimized for hands-free use with Bluetooth headsets, built with React Native and Kotlin.

## Overview

AIR-assist provides a seamless voice interface to interact with an AI assistant through Bluetooth audio devices. The application is designed for portable, hands-free operation, allowing users to communicate with the AI assistant while on the go, driving, or in situations where hands-free operation is preferred.

## Features

- **Voice-Controlled AI Interactions**: Send voice commands and receive audio responses
- **Bluetooth Headset Integration**: Optimized for wireless headsets and earbuds
- **Conversation History**: View and manage your conversation with the AI assistant
- **Auto-Listening Mode**: Automatically start listening after AI responses
- **Offline Message Queuing**: Save messages when disconnected for later processing
- **Customizable Settings**: Adjust audio sensitivity, voice types, and behavior
- **Visual Conversation Display**: Text transcription of both user input and AI responses

## Architecture

The application follows a modern architecture with the following key components:

### Core Technologies

- **React Native 0.79.2**: Framework for building the mobile application
- **Kotlin 1.9.0**: Modern language for Android native modules
- **Context API**: State management for application-wide data
- **WebSockets**: Real-time communication with the AI backend server
- **BLE (Bluetooth Low Energy)**: Communication with Bluetooth audio devices
- **Native Audio Services**: Recording and playback of audio

### Directory Structure

```
├── android/                    # Android-specific code
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── kotlin/         # Kotlin implementation
│   │   │   ├── res/            # Android resources
│   │   │   └── AndroidManifest.xml
├── src/                        # React Native code
│   ├── components/             # UI components
│   ├── screens/                # App screens
│   ├── services/               # Core services
│   ├── hooks/                  # Custom React hooks
│   ├── context/                # State management
│   ├── navigation/             # Navigation configuration
│   ├── utils/                  # Utility functions
│   └── assets/                 # Static assets
├── App.js                      # Main app component
├── index.js                    # Entry point
└── package.json                # Dependencies
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- JDK 17+
- Android Studio (latest version)
- Android SDK (API level 33+)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/AIR-assist-android-kotlin.git
   cd AIR-assist-android-kotlin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Android SDK:
   - Ensure ANDROID_HOME environment variable is set correctly
   - Install required SDK platforms and build tools

4. Start the Metro bundler:
   ```bash
   npm start
   ```

5. Run the application:
   ```bash
   npm run android
   ```

### Common Setup Issues

#### Android project not found
If you encounter an error like "Android project not found", ensure that:
- The android directory exists in your project
- You have properly configured the project.android.sourceDir option in package.json

#### Gradle wrapper issues
If you encounter Gradle wrapper errors, run:
```bash
cd android
./gradlew wrapper --gradle-version 8.0.0
cd ..
```

## Development Guide

### Key Files

- **App.js**: Application entry point and navigation setup
- **src/context/AppContext.js**: Main state management for the app
- **src/context/BluetoothContext.js**: Bluetooth device management
- **src/screens/HomeScreen.js**: Main interface for the assistant
- **src/screens/SettingsScreen.js**: Configuration options
- **src/services/WebSocketService.js**: Communication with AI backend
- **src/services/AudioService.js**: Audio recording and playback
- **android/app/src/main/kotlin/com/airassist/modules/**: Native Kotlin modules

### State Management

The application uses React Context API for state management, with two main contexts:

1. **AppContext**: Manages app-wide state including:
   - WebSocket connection state
   - Messages and conversation history
   - Settings and preferences
   - Audio processing state

2. **BluetoothContext**: Handles Bluetooth-related functionality:
   - Device discovery and connection
   - Connection state management
   - Data transfer with connected devices

### Native Modules

The application uses three main native modules implemented in Kotlin:

1. **AudioModule**: Handles audio recording and playback
2. **BluetoothModule**: Manages Bluetooth device discovery and connection
3. **PermissionsModule**: Handles permission requests and checks

## Customization

### Theming

The application uses a centralized theming system in `src/styles/colors.js`. Modify this file to change the application's color scheme.

### Configuration

Default settings are defined in `src/utils/constants.js`. Adjust these values to change the default behavior of the application.

## Troubleshooting

### Connection Issues

If the application fails to connect to the AI backend:
1. Check the WebSocket server URL in settings
2. Ensure your device has internet connectivity
3. Verify that the server is running and accessible

### Bluetooth Problems

If Bluetooth devices aren't connecting properly:
1. Ensure Bluetooth is enabled on your device
2. Check that necessary permissions are granted
3. Try restarting the Bluetooth service on your device
4. Make sure the device is in pairing mode

### Audio Recording Issues

If voice recording isn't working:
1. Check microphone permissions
2. Verify that the microphone isn't being used by another application
3. Adjust the microphone sensitivity in settings
4. Ensure that the device has a working microphone

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React Native community for the excellent framework
- Kotlin team for the modern Android development language
- Contributors and maintainers of the dependencies used in this project
