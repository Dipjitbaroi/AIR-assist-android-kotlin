/**
 * Application Constants
 *
 * This file contains all constant values used throughout the application.
 * Centralizing constants helps maintain consistency and makes updates easier.
 */

/**
 * Storage keys for AsyncStorage
 * Using a structured object helps prevent key collisions and makes
 * it easier to track what's being stored.
 */
export const STORAGE_KEYS = {
  SETTINGS: '@AIRAssist:settings',
  CONVERSATION_HISTORY: '@AIRAssist:conversation',
  PENDING_MESSAGES: '@AIRAssist:pendingMessages',
  USER_ID: '@AIRAssist:userId',
  BLUETOOTH_DEVICES: '@AIRAssist:btDevices',
};

/**
 * Default application settings
 * These values are used when the app is first installed or if settings are reset.
 */
export const DEFAULT_SETTINGS = {
  // WebSocket server settings
  wsServerUrl: 'wss://airassist-server.example.com/ws',

  // User settings
  userId: null, // Will be generated on first run
  userName: 'User',

  // Audio settings
  aiVoice: 'default',
  micSensitivity: 75, // 0-100 scale
  silenceThreshold: 0.2, // 0.0-1.0 scale
  speakerVolume: 80, // 0-100 scale

  // Behavior settings
  autoListen: true,
  autoConnect: true,
  saveHistory: true,
  readResponses: true,

  // Customization
  theme: 'dark',
  enableVibration: true,
  responseSpeed: 1.0, // 0.5-2.0 scale
};

/**
 * WebSocket message types
 * These define the protocol for communication with the server
 */
export const WS_MESSAGE_TYPES = {
  AUDIO: 'audioMessage',
  TEXT: 'textMessage',
  AI_RESPONSE: 'aiResponse',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
};

/**
 * Bluetooth connection states
 * These match the states from the BLE libraries
 */
export const BT_CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  SCANNING: 'scanning',
  ERROR: 'error',
};

/**
 * Permissions required by the application
 * These are the permission strings needed for different platforms
 */
export const PERMISSIONS = {
  ANDROID: {
    BLUETOOTH: [
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_ADMIN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
    MICROPHONE: [
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
    ],
    STORAGE: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
  },
  IOS: {
    BLUETOOTH: ['bluetooth-peripheral'],
    MICROPHONE: ['microphone'],
  },
};

/**
 * Time constants in milliseconds
 * Used for various timeouts and intervals
 */
export const TIME = {
  WEBSOCKET_RECONNECT_INTERVAL: 5000,
  BLE_SCAN_TIMEOUT: 10000,
  DEBOUNCE_DELAY: 300,
  LONG_PRESS_DURATION: 500,
  SILENCE_DETECTION_TIMEOUT: 2000,
  AUTO_LISTEN_DELAY: 1000,
};

/**
 * Feature flags
 * Used to enable/disable features that are in development or testing
 */
export const FEATURES = {
  ENABLE_DEBUGGING: __DEV__,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: true,
};

/**
 * Application metadata
 */
export const APP_INFO = {
  NAME: 'AIRAssist',
  VERSION: '1.0.0',
};
