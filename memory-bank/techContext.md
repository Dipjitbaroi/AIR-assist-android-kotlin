# AIR-assist Technical Context

## Technology Stack Overview

AIR-assist is built using a modern technology stack that combines React Native for cross-platform UI development with native Kotlin modules for Android-specific functionality. This hybrid approach allows us to leverage the productivity benefits of JavaScript while maintaining high performance for critical features through native code.

## Frontend Technologies

### React Native (v0.79.2)

React Native serves as the primary framework for building the user interface and application logic. Key aspects include:

- **Component-Based Architecture**: UI is composed of reusable, declarative components
- **Virtual DOM**: Efficient rendering through reconciliation
- **JSX Syntax**: Combines JavaScript with HTML-like markup
- **Hot Reloading**: Faster development through immediate feedback
- **Cross-Platform Potential**: Code can be shared with iOS in future versions

React Native was chosen for:
- Faster development cycles compared to pure native development
- Large ecosystem of libraries and community support
- Ability to share code between platforms in the future
- Familiar React paradigms for web developers

### JavaScript/ECMAScript

The application uses modern JavaScript features:

- **ES6+ Syntax**: Arrow functions, destructuring, spread operators, etc.
- **Async/Await**: For handling asynchronous operations
- **Optional Chaining**: For safer property access
- **Nullish Coalescing**: For default values

### React Hooks

The application extensively uses React Hooks for state management and side effects:

- **useState**: For component-local state
- **useEffect**: For side effects and lifecycle management
- **useContext**: For accessing context values
- **useRef**: For persistent mutable values
- **useCallback**: For memoized callbacks
- **useMemo**: For memoized values
- **Custom Hooks**: For reusable stateful logic

## State Management

### React Context API

Instead of using a third-party state management library, the application uses React's built-in Context API:

- **AppContext**: Global application state
- **BluetoothContext**: Bluetooth connection state
- **ThemeContext**: Theme preferences

Context API was chosen over Redux or MobX for:
- Simpler implementation with fewer dependencies
- Sufficient for the application's complexity level
- Better integration with React's component model
- Reduced boilerplate code

## Native Technologies

### Kotlin (v1.9.0)

Kotlin is used for implementing native Android modules:

- **Type Safety**: Strong typing prevents common runtime errors
- **Null Safety**: Explicit handling of nullable types
- **Coroutines**: For asynchronous programming
- **Extension Functions**: For extending existing classes
- **Functional Programming**: Higher-order functions and lambdas

Kotlin was chosen over Java for:
- More concise and expressive syntax
- Better null safety features
- Modern language features
- First-class support from Google for Android development

### Android SDK (API Level 33+)

The application targets modern Android versions:

- **Minimum SDK**: API Level 26 (Android 8.0 Oreo)
- **Target SDK**: API Level 33 (Android 13)
- **Compile SDK**: API Level 33

This range provides:
- Coverage of approximately 95% of active Android devices
- Access to modern APIs while maintaining broad compatibility
- Better performance and security features

### Native Modules

The application implements three primary native modules:

1. **AudioModule**: Handles audio recording and playback
   - Uses Android's AudioRecord and AudioTrack APIs
   - Implements WAV encoding/decoding
   - Manages audio focus and routing

2. **BluetoothModule**: Manages Bluetooth connectivity
   - Uses Android's Bluetooth and BLE APIs
   - Handles device discovery and connection
   - Manages data transfer with connected devices

3. **PermissionsModule**: Handles permission requests
   - Manages runtime permissions for Android 6.0+
   - Provides permission status checking
   - Handles permission request callbacks

## Communication Technologies

### WebSockets

The application uses WebSockets for real-time communication with the AI backend:

- **Full-Duplex Communication**: Allows bidirectional data flow
- **Low Latency**: Minimizes delay in voice interactions
- **Persistent Connection**: Maintains a single connection for efficiency
- **Binary Data Support**: Efficiently transfers audio data

WebSockets were chosen over REST API for:
- Lower latency for real-time interactions
- Reduced overhead for frequent communications
- Server-initiated messages for immediate responses
- Better suited for streaming audio data

### Bluetooth Low Energy (BLE)

The application uses BLE for communicating with Bluetooth headsets:

- **Device Discovery**: Scanning for available devices
- **Connection Management**: Establishing and maintaining connections
- **GATT Profile**: Interacting with device services and characteristics
- **Notifications**: Receiving updates from connected devices

## Data Storage

### AsyncStorage

The application uses AsyncStorage for persistent local storage:

- **Key-Value Storage**: Simple API for storing serialized data
- **Asynchronous API**: Non-blocking operations
- **Global Access**: Available throughout the application

AsyncStorage is used to store:
- User settings and preferences
- Conversation history
- Cached data for offline use
- Connection history for Bluetooth devices

## Development Tools

### Build Tools

- **Gradle**: Android build system
- **Metro**: JavaScript bundler for React Native
- **Babel**: JavaScript transpiler
- **ESLint**: JavaScript linting
- **Kotlin Compiler**: For native code compilation

### Testing Tools

- **Jest**: JavaScript unit testing
- **React Native Testing Library**: Component testing
- **Detox**: End-to-end testing
- **JUnit**: Kotlin unit testing
- **Espresso**: Android UI testing

### Development Environment

- **Android Studio**: Primary IDE for native code
- **Visual Studio Code**: IDE for JavaScript/React development
- **React Native CLI**: Command-line tools for React Native
- **Android Debug Bridge (ADB)**: For device communication
- **Flipper**: For debugging React Native applications

## Third-Party Libraries

### Core Dependencies

- **@react-native-async-storage/async-storage**: Persistent storage
- **@react-native-community/voice**: Speech recognition
- **@react-navigation/native**: Navigation framework
- **@react-navigation/stack**: Stack-based navigation
- **react-native-ble-manager**: Bluetooth Low Energy management
- **react-native-permissions**: Permission handling
- **react-native-sound**: Audio playback
- **react-native-vector-icons**: Icon library

### Development Dependencies

- **@babel/core**: JavaScript transpilation
- **@react-native/babel-preset**: React Native specific Babel preset
- **@react-native/eslint-config**: ESLint configuration
- **@react-native/metro-config**: Metro bundler configuration
- **jest**: Testing framework
- **metro-react-native-babel-preset**: Metro specific Babel preset

## Deployment and Distribution

### Google Play Store

The application is packaged for distribution through the Google Play Store:

- **App Bundle**: Android App Bundle (AAB) format
- **Play Console**: For managing app releases
- **In-App Updates**: For delivering updates to users

### CI/CD Pipeline

The development workflow includes continuous integration and deployment:

- **GitHub Actions**: For automated builds and tests
- **Fastlane**: For automated deployment
- **Gradle Tasks**: For build automation

## Technical Constraints

### Platform Limitations

- **Android Only**: Currently no iOS support
- **Bluetooth Compatibility**: Varies across Android versions
- **Background Execution**: Limited by Android battery optimization
- **Permissions**: Requires explicit user approval

### Performance Considerations

- **Battery Usage**: Bluetooth and audio processing can drain battery
- **Memory Management**: Audio buffers require careful management
- **UI Responsiveness**: Must remain responsive during audio processing
- **Network Reliability**: Must handle intermittent connectivity

### Security Considerations

- **Audio Privacy**: Handling sensitive voice data
- **Permission Model**: Managing access to sensitive hardware
- **Data Storage**: Securing locally stored conversations
- **Network Communication**: Securing WebSocket connections

## Technical Debt and Roadmap

### Current Technical Debt

- **Error Handling**: Some edge cases may not be fully handled
- **Test Coverage**: Not comprehensive across all components
- **Documentation**: Some complex native interactions need better documentation
- **Accessibility**: Not fully implemented for all UI components

### Future Technical Improvements

- **iOS Support**: Extend to Apple devices
- **Offline AI Processing**: More local intelligence
- **Background Service**: Improved background operation
- **Voice Biometrics**: User identification through voice
- **End-to-End Encryption**: For enhanced privacy
- **Battery Optimization**: Further reduce power consumption
- **Accessibility Enhancements**: Better support for users with disabilities
