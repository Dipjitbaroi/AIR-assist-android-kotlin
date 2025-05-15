# AIR-assist Android App Setup Guide

This document provides detailed instructions for setting up, building, and testing the AIR-assist Android application.

## Development Environment Setup

### Prerequisites

1. **Node.js and npm**
   - Install Node.js v18.0.0 or higher
   - Verify installation: `node -v` and `npm -v`

2. **Java Development Kit (JDK)**
   - Install JDK 17 or higher
   - Set JAVA_HOME environment variable
   - Verify installation: `java -version`

3. **Android Studio**
   - Install the latest version of Android Studio
   - Install Android SDK Platform 33 (Android 13) or higher
   - Install Android SDK Build-Tools 33.0.0 or higher
   - Install Android SDK Command-line Tools
   - Install Android SDK Platform-Tools

4. **Android SDK Environment Variables**
   - Set ANDROID_HOME environment variable to your Android SDK location
   - Add platform-tools and tools to your PATH
   - Verify installation: `adb --version`

5. **React Native CLI**
   - Install React Native CLI globally: `npm install -g react-native-cli`
   - Verify installation: `react-native --version`

### Setting Up the Project

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/AIR-assist-android-kotlin.git
   cd AIR-assist-android-kotlin
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Android Project**
   - Open the android directory in Android Studio
   - Let Android Studio sync the project with Gradle files
   - Resolve any dependency issues if prompted

4. **Configure WebSocket Server URL**
   - Open `src/utils/constants.js`
   - Update the `wsServerUrl` in `DEFAULT_SETTINGS` to point to your AI backend server

## Building the Application

### Development Build

1. **Start Metro Bundler**
   ```bash
   npm start
   ```

2. **Run on Android Device/Emulator**
   - Connect an Android device via USB with USB debugging enabled, or start an emulator
   - Run the app: `npm run android`

### Production Build

1. **Generate a Signing Key**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Gradle for Release**
   - Copy the keystore file to `android/app/`
   - Configure signing in `android/app/build.gradle`
   - Add the following to `android/gradle.properties` (replace with your values):
     ```
     MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
     MYAPP_RELEASE_KEY_ALIAS=my-key-alias
     MYAPP_RELEASE_STORE_PASSWORD=*****
     MYAPP_RELEASE_KEY_PASSWORD=*****
     ```

3. **Build Release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   The APK will be generated at `android/app/build/outputs/apk/release/app-release.apk`

4. **Build App Bundle (for Google Play)**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   The AAB will be generated at `android/app/build/outputs/bundle/release/app-release.aab`

## Testing the Application

### Prerequisites for Testing

1. **Android Device or Emulator**
   - Physical device with Bluetooth capability (recommended for Bluetooth testing)
   - Or Android emulator (limited Bluetooth functionality)

2. **Bluetooth Headset**
   - A Bluetooth headset or earbuds for testing audio functionality

3. **AI Backend Server**
   - A running instance of the AI backend server
   - WebSocket endpoint configured in the app

### Testing Steps

1. **Installation Testing**
   - Install the app on your device
   - Verify the app launches without crashes
   - Check permissions are requested properly

2. **Bluetooth Connectivity Testing**
   - Enable Bluetooth on your device
   - Open the app and navigate to the home screen
   - Tap the Bluetooth icon to scan for devices
   - Connect to your Bluetooth headset
   - Verify the connection status is displayed correctly

3. **Voice Recognition Testing**
   - Connect to a Bluetooth headset
   - Tap the microphone button to start recording
   - Speak a test phrase
   - Verify the transcription appears correctly
   - Verify the recording stops automatically after silence

4. **AI Interaction Testing**
   - Ensure the WebSocket server is running
   - Connect to the server through the app
   - Record a voice message
   - Verify the message is sent to the server
   - Verify the AI response is received and played back

5. **Settings Testing**
   - Navigate to the Settings screen
   - Test each setting option:
     - Change the AI voice
     - Adjust microphone sensitivity
     - Toggle auto-listen mode
     - Change theme
   - Verify settings are saved and applied correctly

6. **Offline Mode Testing**
   - Disable network connectivity
   - Record a voice message
   - Verify the message is queued for later sending
   - Re-enable network connectivity
   - Verify queued messages are sent automatically

### Troubleshooting Common Issues

1. **Build Failures**
   - Check Gradle version compatibility
   - Ensure all dependencies are properly installed
   - Run `./gradlew clean` and try building again

2. **Permission Issues**
   - Ensure all required permissions are granted in app settings
   - For Android 10+, verify location permissions for Bluetooth scanning

3. **Bluetooth Connection Issues**
   - Ensure Bluetooth is enabled
   - Try forgetting and re-pairing the device
   - Check Bluetooth permissions are granted

4. **Audio Recording Issues**
   - Verify microphone permissions
   - Check microphone is not being used by another app
   - Adjust microphone sensitivity in settings

5. **WebSocket Connection Issues**
   - Verify server URL is correct
   - Check network connectivity
   - Ensure server is running and accessible

## Deployment

### Google Play Store

1. **Prepare Store Listing**
   - Create a developer account on Google Play Console
   - Create a new application
   - Prepare store listing assets (icons, screenshots, descriptions)

2. **Upload App Bundle**
   - Upload the AAB file generated in the production build step
   - Complete the store listing information
   - Set up pricing and distribution

3. **Release Management**
   - Choose release track (internal testing, closed testing, open testing, or production)
   - Review and roll out the release

### Direct APK Distribution

1. **Enable Unknown Sources**
   - On the target device, enable installation from unknown sources in settings

2. **Distribute APK**
   - Share the APK file via email, download link, or direct transfer
   - Install the APK on the target device

## Continuous Integration

For automated builds and testing, consider setting up:

1. **GitHub Actions**
   - Create a workflow file in `.github/workflows/`
   - Configure build and test steps

2. **Fastlane**
   - Install Fastlane: `gem install fastlane`
   - Initialize Fastlane in the project: `fastlane init`
   - Configure lanes for building, testing, and deployment

## Support and Feedback

For issues, questions, or feedback:
- Create an issue on the GitHub repository
- Contact the development team at [your-email@example.com]
