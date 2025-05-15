# AIR-assist Active Context

## Current Work Focus

We are currently in the initial development phase of the AIR-assist Android application. The focus is on establishing the core architecture and implementing the fundamental components that will enable voice-controlled AI assistant functionality through Bluetooth headsets.

### Active Development Areas

1. **Project Structure and Setup**
   - Basic React Native project configuration
   - Directory structure organization
   - Native module integration with Kotlin

2. **Core Native Modules**
   - Audio recording and playback functionality
   - Bluetooth device discovery and connection
   - Permission management for Android

3. **UI Components**
   - Main conversation interface
   - Settings screen
   - Status indicators and controls

4. **State Management**
   - Context providers for global state
   - WebSocket communication service
   - Local storage for settings and history

## Recent Changes

### Project Initialization
- Created React Native project with Kotlin support
- Set up directory structure for organized code management
- Configured package.json with required dependencies
- Added documentation files (README.md, SETUP.md)

### Native Module Implementation
- Implemented AudioModule for native audio recording/playback
- Implemented BluetoothModule for device connectivity
- Implemented PermissionsModule for Android permission handling
- Created MainActivity and MainApplication in Kotlin

### UI Development
- Created HomeScreen with conversation display and controls
- Created SettingsScreen for user preferences
- Implemented reusable components (Header, StatusPanel, Conversation)
- Set up styling system with colors, typography, and layout utilities

### State Management
- Implemented AppContext for global application state
- Implemented BluetoothContext for device management
- Created WebSocketService for AI backend communication
- Set up AsyncStorage for persistent data

### Documentation
- Created comprehensive README with project overview
- Added detailed setup instructions in SETUP.md
- Documented architecture and patterns in memory bank files
- Added code comments throughout the codebase

## Next Steps

1. **Complete Core Functionality**
   - Finalize WebSocket communication with AI backend
   - Implement offline message queuing
   - Complete audio processing pipeline

2. **Enhance User Experience**
   - Implement auto-listening mode
   - Add visual feedback for voice recognition
   - Improve error handling and recovery

3. **Testing and Optimization**
   - Test with various Bluetooth devices
   - Optimize battery usage
   - Improve performance on different Android versions

4. **Prepare for Release**
   - Complete app icon and splash screen
   - Finalize app signing configuration
   - Prepare Google Play Store listing

## Active Decisions and Considerations

### Architecture Decisions

1. **React Native + Kotlin Hybrid Approach**
   - **Decision**: Use React Native for UI with native Kotlin modules for performance-critical features
   - **Rationale**: Balances development speed with performance requirements
   - **Implications**: Requires careful bridge design between JS and native code

2. **Context API for State Management**
   - **Decision**: Use React Context API instead of Redux or MobX
   - **Rationale**: Simpler implementation with fewer dependencies
   - **Implications**: May need to optimize for performance with larger state objects

3. **WebSockets for Real-time Communication**
   - **Decision**: Use WebSockets instead of REST API for AI communication
   - **Rationale**: Better suited for real-time, bidirectional communication
   - **Implications**: Requires handling connection management and reconnection logic

### Technical Challenges

1. **Audio Processing Efficiency**
   - **Challenge**: Processing audio efficiently without draining battery
   - **Approach**: Implement native audio processing in Kotlin
   - **Status**: Basic implementation complete, optimization needed

2. **Bluetooth Connectivity Reliability**
   - **Challenge**: Maintaining stable Bluetooth connections across devices
   - **Approach**: Implement robust error handling and reconnection logic
   - **Status**: Basic connectivity working, reliability improvements needed

3. **Offline Functionality**
   - **Challenge**: Providing useful functionality without server connection
   - **Approach**: Implement message queuing and local processing
   - **Status**: Basic structure in place, implementation in progress

4. **Permission Management**
   - **Challenge**: Handling Android's runtime permission model
   - **Approach**: Create dedicated PermissionsModule with clear user guidance
   - **Status**: Core implementation complete, testing needed

### User Experience Considerations

1. **Minimal Visual Attention**
   - **Consideration**: Users need to interact with minimal looking at screen
   - **Approach**: Prioritize audio feedback and simple visual indicators
   - **Status**: Basic UI implemented, needs usability testing

2. **Error Recovery**
   - **Consideration**: Users need clear path to recover from errors
   - **Approach**: Implement clear error messages and recovery suggestions
   - **Status**: Basic error handling in place, needs enhancement

3. **Battery Impact**
   - **Consideration**: Bluetooth and audio processing impact battery life
   - **Approach**: Optimize code and implement intelligent power management
   - **Status**: Initial implementation complete, optimization needed

## Learnings and Insights

### Technical Insights

1. **React Native Bridge Performance**
   - Large audio data transfers benefit from chunking to avoid bridge bottlenecks
   - Using binary formats reduces overhead compared to JSON for audio data
   - Minimizing bridge crossings improves overall performance

2. **Bluetooth Implementation**
   - Android's Bluetooth APIs vary significantly between versions
   - BLE provides more consistent behavior than classic Bluetooth
   - Permission requirements have increased in recent Android versions

3. **Audio Processing**
   - Native audio processing is significantly more efficient than JavaScript
   - WAV format provides good balance of quality and processing simplicity
   - Silence detection algorithms need tuning for different environments

### Process Insights

1. **Development Workflow**
   - Testing on real devices is essential for Bluetooth functionality
   - Modular development with clear interfaces simplifies integration
   - Documentation-first approach helps maintain architectural integrity

2. **Testing Challenges**
   - Bluetooth testing requires physical devices
   - Audio quality assessment needs subjective evaluation
   - Automated testing needs supplementing with manual verification

## Important Patterns and Preferences

### Code Style Preferences

1. **JavaScript/React**
   - Functional components with hooks
   - Destructured props and state
   - Named exports for better import statements
   - JSDoc comments for functions and components

2. **Kotlin**
   - Kotlin idioms and language features
   - Extension functions for cleaner code
   - Coroutines for asynchronous operations
   - Clear nullability annotations

### Architectural Patterns

1. **Component Structure**
   - Small, focused components with single responsibilities
   - Container/presentational component separation
   - Custom hooks for reusable logic
   - Context providers for dependency injection

2. **Native Module Design**
   - Promise-based API for asynchronous operations
   - Event-based communication for continuous updates
   - Clear error codes and messages
   - Comprehensive documentation of native interfaces

### Testing Approach

1. **Unit Testing**
   - Jest for JavaScript logic
   - JUnit for Kotlin code
   - Mock external dependencies

2. **Integration Testing**
   - Test component interactions
   - Verify context provider behavior
   - Test native module integration

3. **Manual Testing**
   - Bluetooth device connectivity
   - Audio quality assessment
   - End-to-end user flows
