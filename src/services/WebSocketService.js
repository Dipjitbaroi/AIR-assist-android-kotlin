/**
 * WebSocket Service
 *
 * Manages WebSocket connections to the AIR-assist server.
 * Handles connection, message sending/receiving, reconnection,
 * and connection state management.
 */

import { WS_MESSAGE_TYPES, TIME, FEATURES } from '../utils/constants';
import { AppState } from 'react-native';

/**
 * Service for managing WebSocket communication
 */
export class WebSocketService {
  static instance = null;
  static socket = null;
  static url = null;
  static connected = false;
  static connecting = false;
  static reconnectTimeout = null;
  static pingInterval = null;
  static lastPingTime = null;

  // Callback functions
  static onConnectCallback = null;
  static onDisconnectCallback = null;
  static onMessageCallback = null;
  static onErrorCallback = null;

  /**
   * Initialize the WebSocket connection
   *
   * @param {string} url - WebSocket server URL
   */
  static init(url) {
    this.url = url;

    // Only create a new connection if one doesn't exist or URL has changed
    if (!this.socket || this.socket.url !== url) {
      this.connect();
    }

    // Set up app state change listener for reconnection
    AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        this.checkConnection();
      }
    });
  }

  /**
   * Check if WebSocket connection is active and reconnect if needed
   */
  static checkConnection() {
    // If we think we're connected, but the socket is closed, reconnect
    if (this.connected && (!this.socket || this.socket.readyState !== WebSocket.OPEN)) {
      this.connected = false;
      this.connect();
    }
  }

  /**
   * Establish WebSocket connection
   */
  static connect() {
    if (this.connecting || !this.url) {
      return;
    }

    // Clear any existing connection and timeouts
    this.disconnect();
    this.connecting = true;

    try {
      if (FEATURES.ENABLE_DEBUGGING) {
        console.log(`WebSocketService: Connecting to ${this.url}`);
      }

      // Create new WebSocket connection
      this.socket = new WebSocket(this.url);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
    } catch (error) {
      this.connecting = false;
      console.error('WebSocketService: Connection error', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect the WebSocket
   */
  static disconnect() {
    this.connected = false;
    this.connecting = false;

    // Clear timers
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Close existing socket
    if (this.socket) {
      // Remove event handlers to prevent duplicate events
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;

      // Close the connection if it's open
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }

      this.socket = null;
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  static scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, TIME.WEBSOCKET_RECONNECT_INTERVAL);
  }

  /**
   * Handle WebSocket open event
   */
  static handleOpen() {
    this.connected = true;
    this.connecting = false;

    if (FEATURES.ENABLE_DEBUGGING) {
      console.log('WebSocketService: Connected');
    }

    // Start the ping interval to keep the connection alive
    this.startPingInterval();

    // Call the connect callback if defined
    if (this.onConnectCallback) {
      this.onConnectCallback();
    }
  }

  /**
   * Handle WebSocket message event
   *
   * @param {MessageEvent} event - WebSocket message event
   */
  static handleMessage(event) {
    // Process the incoming message
    try {
      // Call the message callback if defined
      if (this.onMessageCallback) {
        this.onMessageCallback(event.data);
      }

      // Check for pong messages to confirm connection is responsive
      const data = JSON.parse(event.data);
      if (data && data.type === WS_MESSAGE_TYPES.PONG) {
        this.lastPingTime = Date.now();
      }
    } catch (error) {
      console.error('WebSocketService: Error processing message', error);
    }
  }

  /**
   * Handle WebSocket error event
   *
   * @param {Event} error - WebSocket error event
   */
  static handleError(error) {
    console.error('WebSocketService: Error', error);

    // Call the error callback if defined
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  /**
   * Handle WebSocket close event
   *
   * @param {CloseEvent} event - WebSocket close event
   */
  static handleClose(event) {
    this.connected = false;
    this.connecting = false;

    if (FEATURES.ENABLE_DEBUGGING) {
      console.log(`WebSocketService: Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
    }

    // Call the disconnect callback if defined
    if (this.onDisconnectCallback) {
      this.onDisconnectCallback();
    }

    // Schedule reconnection
    this.scheduleReconnect();
  }

  /**
   * Start the ping interval to keep the connection alive
   */
  static startPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.lastPingTime = Date.now();

    // Send a ping every 30 seconds to keep the connection alive
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // Send ping message
        this.socket.send(JSON.stringify({ type: WS_MESSAGE_TYPES.PING }));

        // If we haven't received a pong in 60 seconds, consider the connection dead
        const now = Date.now();
        if (this.lastPingTime && now - this.lastPingTime > 60000) {
          console.warn('WebSocketService: Connection seems unresponsive. Reconnecting...');
          this.disconnect();
          this.connect();
        }
      }
    }, 30000);
  }

  /**
   * Send a message through the WebSocket
   *
   * @param {string} message - Message to send
   * @returns {boolean} True if sent successfully
   */
  static send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocketService: Cannot send message, socket not open');
      return false;
    }

    try {
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('WebSocketService: Error sending message', error);
      return false;
    }
  }

  /**
   * Set callback for connection event
   *
   * @param {Function} callback - Function to call when connected
   */
  static onConnect(callback) {
    this.onConnectCallback = callback;

    // If already connected, call the callback immediately
    if (this.connected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      callback();
    }
  }

  /**
   * Set callback for disconnection event
   *
   * @param {Function} callback - Function to call when disconnected
   */
  static onDisconnect(callback) {
    this.onDisconnectCallback = callback;
  }

  /**
   * Set callback for message event
   *
   * @param {Function} callback - Function to call when message received
   */
  static onMessage(callback) {
    this.onMessageCallback = callback;
  }

  /**
   * Set callback for error event
   *
   * @param {Function} callback - Function to call when error occurs
   */
  static onError(callback) {
    this.onErrorCallback = callback;
  }

  /**
   * Check if WebSocket is currently connected
   *
   * @returns {boolean} True if connected
   */
  static isConnected() {
    return this.connected && this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

export default WebSocketService;
