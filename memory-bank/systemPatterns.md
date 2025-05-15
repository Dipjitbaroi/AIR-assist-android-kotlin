# AIR-assist System Patterns

## System Architecture

AIR-assist follows a layered architecture with clear separation of concerns, combining React Native for the UI layer with native Kotlin modules for device-specific functionality.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Native UI                      │
├─────────────────────────────────────────────────────────┤
│                    React Context API                     │
├───────────────┬─────────────────────┬───────────────────┤
│  UI Components│    Service Layer    │     Utilities     │
├───────────────┴─────────────────────┴───────────────────┤
│                  React Native Bridge                     │
├─────────────────────────────────────────────────────────┤
│                   Native Kotlin Modules                  │
└─────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
│   User   │───▶│React Native│───▶│  Native  │───▶│ Android  │
│ Interface│    │  Services  │    │  Modules │    │ Hardware │
└──────────┘    └───────────┘    └──────────┘    └──────────┘
      ▲               ▲               │               │
      │               │               │               │
      └───────────────┴───────────────┴───────────────┘
                      Callbacks/Events
```

### Data Flow Architecture

```
┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
│  Context │    │  Service  │    │WebSocket │    │    AI    │
│ Providers│◀──▶│   Layer   │◀──▶│  Client  │◀──▶│  Server  │
└──────────┘    └───────────┘    └──────────┘    └──────────┘
      ▲                ▲
      │                │
      ▼                ▼
┌──────────┐    ┌───────────┐
│   UI     │    │  Storage  │
│Components│    │  Service  │
└──────────┘    └───────────┘
```

## Design Patterns

### 1. Context Provider Pattern

The application uses React Context API for state management, with multiple context providers for different concerns:

- **AppContext**: Manages global application state, settings, and WebSocket communication
- **BluetoothContext**: Handles Bluetooth device discovery, connection, and communication
- **ThemeContext**: Provides theming capabilities throughout the application

This pattern allows for:
- Dependency injection of state and functionality
- Avoiding prop drilling through component hierarchies
- Clear separation of concerns between different types of state

Example implementation:
```javascript
// Context definition
export const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  // Methods that modify state
  const updateState = (newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };
  
  return (
    <AppContext.Provider value={{ state, updateState }}>
      {children}
    </AppContext.Provider>
  );
};

// Usage in components
const MyComponent = () => {
  const { state, updateState } = useContext(AppContext);
  // Use state and methods
};
```

### 2. Service Module Pattern

Services are implemented as static classes that encapsulate related functionality:

- **WebSocketService**: Manages WebSocket connection and communication
- **AudioService**: Handles audio recording and playback
- **PermissionsService**: Manages permission requests and checks
- **StorageService**: Handles data persistence

This pattern provides:
- Centralized implementation of complex functionality
- Stateless, reusable utility methods
- Clear API boundaries between different services

Example implementation:
```javascript
export class WebSocketService {
  static socket = null;
  
  static init(url) {
    this.socket = new WebSocket(url);
    // Setup event handlers
  }
  
  static send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    }
  }
  
  static disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
```

### 3. Bridge Pattern

The application uses the React Native bridge to communicate between JavaScript and native Kotlin code:

- JavaScript calls native methods through the bridge
- Native code sends events back to JavaScript
- Serializable data is passed between the two environments

This pattern enables:
- Access to native device capabilities from JavaScript
- High-performance implementation of critical features
- Platform-specific optimizations

Example implementation:
```kotlin
// Kotlin side
class AudioModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  @ReactMethod
  fun startRecording(options: ReadableMap, promise: Promise) {
    // Native implementation
    // ...
    promise.resolve(result);
  }
}

// JavaScript side
import { NativeModules } from 'react-native';
const { AudioModule } = NativeModules;

// Call native method
AudioModule.startRecording(options)
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### 4. Observer Pattern

The application uses event listeners to observe changes in various systems:

- WebSocket connection state changes
- Bluetooth device discovery and connection events
- Audio recording and playback events
- App lifecycle events

This pattern allows for:
- Loose coupling between components
- Reactive updates to state changes
- Event-driven architecture

Example implementation:
```javascript
// Adding event listener
useEffect(() => {
  const subscription = DeviceEventEmitter.addListener(
    'onBluetoothDeviceFound',
    handleDeviceFound
  );
  
  return () => subscription.remove();
}, []);

// Emitting events (native side)
private void sendEvent(String eventName, WritableMap params) {
  reactContext
    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
    .emit(eventName, params);
}
```

### 5. Repository Pattern

Data access is abstracted through repository-like services:

- **StorageRepository**: Handles AsyncStorage operations
- **SettingsRepository**: Manages user settings
- **MessageRepository**: Handles conversation history

This pattern provides:
- Centralized data access logic
- Abstraction of storage mechanisms
- Consistent error handling

Example implementation:
```javascript
export class StorageRepository {
  static async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      throw error;
    }
  }
  
  static async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }
}
```

### 6. Factory Pattern

The application uses factory methods to create complex objects:

- Message object creation
- Bluetooth device object creation
- Configuration object creation

This pattern enables:
- Consistent object creation
- Encapsulation of creation logic
- Simplified client code

Example implementation:
```javascript
export class MessageFactory {
  static createUserMessage(text) {
    return {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: Date.now(),
    };
  }
  
  static createAIMessage(text) {
    return {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: Date.now(),
    };
  }
}
```

## Component Structure

### UI Component Hierarchy

```
App
├── AppProvider
│   ├── BluetoothProvider
│   │   └── SafeAreaView
│   │       ├── Header
│   │       ├── StatusPanel
│   │       ├── Conversation
│   │       └── Footer
└── Navigation
    ├── HomeScreen
    └── SettingsScreen
```

### Key Components

1. **Header**: App title and action buttons
2. **StatusPanel**: Connection status indicators
3. **Conversation**: Message history display
4. **Footer**: Recording controls and status

## Data Models

### Message

```javascript
{
  id: string,
  text: string,
  isUser: boolean,
  type: 'normal' | 'system',
  timestamp: number
}
```

### Settings

```javascript
{
  wsServerUrl: string,
  userId: string,
  userName: string,
  aiVoice: string,
  micSensitivity: number,
  silenceThreshold: number,
  speakerVolume: number,
  autoListen: boolean,
  autoConnect: boolean,
  saveHistory: boolean,
  readResponses: boolean,
  theme: 'light' | 'dark' | 'system',
  enableVibration: boolean,
  responseSpeed: number
}
```

### Bluetooth Device

```javascript
{
  id: string,
  name: string,
  rssi: number
}
```

## Communication Protocols

### WebSocket Messages

1. **Audio Message**
```javascript
{
  type: 'audioMessage',
  audio: string, // base64
  transcription: string,
  userId: string,
  userName: string,
  voice: string,
  timestamp: number,
  messageId: string
}
```

2. **Text Message**
```javascript
{
  type: 'textMessage',
  text: string,
  userId: string,
  userName: string,
  voice: string,
  timestamp: number,
  messageId: string
}
```

3. **AI Response**
```javascript
{
  type: 'aiResponse',
  text: string,
  audioBase64: string,
  transcription: string,
  messageId: string
}
```

## Error Handling Strategy

1. **UI Layer**: Try-catch blocks with user-friendly error messages
2. **Service Layer**: Error propagation with logging
3. **Native Modules**: Promise rejection with error codes
4. **Global Error Boundary**: Fallback UI for unexpected errors

## Performance Considerations

1. **Audio Processing**: Performed in native code for efficiency
2. **Bluetooth Operations**: Managed through native modules
3. **UI Rendering**: Optimized with memo and useMemo
4. **WebSocket Communication**: Binary data for audio to reduce bandwidth
5. **Background Processing**: Minimized to conserve battery

## Security Patterns

1. **Permission Management**: Just-in-time permission requests with clear explanations
2. **Data Storage**: Sensitive data encrypted in AsyncStorage
3. **Network Communication**: HTTPS/WSS for all connections
4. **Input Validation**: Sanitization of all user inputs
5. **Error Messages**: Non-revealing of implementation details
