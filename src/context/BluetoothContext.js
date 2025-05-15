/**
 * Bluetooth Context
 *
 * Provides Bluetooth functionality and state management for the application.
 * Handles device scanning, connection, communication, and error handling.
 */

import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import BleManager from 'react-native-ble-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { PermissionsService } from '../services/PermissionsService';
import { STORAGE_KEYS, BT_CONNECTION_STATES, TIME, FEATURES } from '../utils/constants';

// Create the context
export const BluetoothContext = createContext();

/**
 * Bluetooth Provider Component
 * Provides Bluetooth state and functions to the application
 *
 * @param {Object} props - Component properties
 * @param {ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 */
export const BluetoothProvider = ({ children }) => {
  // State for Bluetooth connection status
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [connectionState, setConnectionState] = useState(BT_CONNECTION_STATES.DISCONNECTED);
  const [error, setError] = useState(null);

  // Devices state
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [previousDevices, setPreviousDevices] = useState([]);

  // Initialize Bluetooth on component mount
  useEffect(() => {
    initializeBluetooth();

    // Load previously connected devices
    loadPreviousDevices();

    // Clean up on unmount
    return () => {
      // Stop scanning if active
      if (isScanning) {
        stopScan();
      }

      // Disconnect from device if connected
      if (connectedDevice) {
        disconnectFromDevice(connectedDevice.id)
          .catch(error => console.error('Error disconnecting on unmount:', error));
      }
    };
  }, []);

  /**
   * Initialize Bluetooth functionality
   */
  const initializeBluetooth = async () => {
    try {
      // Check permissions first
      const hasPermissions = await PermissionsService.hasBluetoothPermissions();

      if (!hasPermissions) {
        setError('Bluetooth permissions not granted');
        setConnectionState(BT_CONNECTION_STATES.ERROR);
        return;
      }

      // Initialize BLE Manager
      await BleManager.start({ showAlert: false });

      // Check if Bluetooth is enabled
      const enabled = await BleManager.checkState();
      setIsBluetoothEnabled(enabled === 'on');

      // Set up event listeners for connection state changes
      // This would typically use NativeEventEmitter for better implementation

      setIsInitialized(true);

      if (FEATURES.ENABLE_DEBUGGING) {
        console.log('BluetoothContext: Initialized successfully');
      }
    } catch (error) {
      console.error('BluetoothContext: Initialization error', error);
      setError('Failed to initialize Bluetooth');
      setConnectionState(BT_CONNECTION_STATES.ERROR);
    }
  };

  /**
   * Load previously connected devices from storage
   */
  const loadPreviousDevices = async () => {
    try {
      const storedDevices = await AsyncStorage.getItem(STORAGE_KEYS.BLUETOOTH_DEVICES);

      if (storedDevices) {
        const parsedDevices = JSON.parse(storedDevices);
        setPreviousDevices(parsedDevices);

        // If auto-connect is enabled, connect to the last device
        const lastDevice = parsedDevices[0];
        if (lastDevice && isBluetoothEnabled && isInitialized) {
          connectToDevice(lastDevice.id)
            .catch(error => console.warn('Auto-connect failed:', error));
        }
      }
    } catch (error) {
      console.error('BluetoothContext: Error loading previous devices', error);
    }
  };

  /**
   * Save device to previous devices list
   *
   * @param {Object} device - The device to save
   */
  const saveDeviceToHistory = async (device) => {
    try {
      // Filter out this device if it already exists
      const updatedDevices = previousDevices.filter(d => d.id !== device.id);

      // Add device to the beginning of the list
      const newDevicesList = [device, ...updatedDevices].slice(0, 10); // Keep only 10 most recent

      setPreviousDevices(newDevicesList);

      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.BLUETOOTH_DEVICES, JSON.stringify(newDevicesList));

    } catch (error) {
      console.error('BluetoothContext: Error saving device to history', error);
    }
  };

  /**
   * Start scanning for Bluetooth devices
   *
   * @returns {Promise<void>} Promise that resolves when scanning starts
   */
  const startScan = async () => {
    if (!isBluetoothEnabled || !isInitialized) {
      setError('Bluetooth is not available');
      return;
    }

    if (isScanning) {
      return; // Already scanning
    }

    try {
      // Clear previous scan results
      setDiscoveredDevices([]);
      setError(null);

      // Start scanning
      setIsScanning(true);
      setConnectionState(BT_CONNECTION_STATES.SCANNING);

      await BleManager.scan([], TIME.BLE_SCAN_TIMEOUT, true);

      // In a real implementation, we would register for scan results
      // here using NativeEventEmitter, and process devices as they are found

      // For this example, we'll simulate finding some devices
      setTimeout(() => {
        const exampleDevices = [
          {
            id: 'DE:AD:BE:EF:12:34',
            name: 'AIR-Headset',
            rssi: -65,
          },
          {
            id: 'C0:FF:EE:00:00:01',
            name: 'BT Earbuds',
            rssi: -72,
          }
        ];

        setDiscoveredDevices(exampleDevices);
        stopScan();
      }, 3000);

      // Automatically stop scan after timeout
      setTimeout(() => {
        if (isScanning) {
          stopScan();
        }
      }, TIME.BLE_SCAN_TIMEOUT);

    } catch (error) {
      console.error('BluetoothContext: Scan error', error);
      setError('Failed to scan for devices');
      setIsScanning(false);
      setConnectionState(BT_CONNECTION_STATES.ERROR);
    }
  };

  /**
   * Stop scanning for Bluetooth devices
   */
  const stopScan = async () => {
    if (!isScanning) {
      return;
    }

    try {
      await BleManager.stopScan();
      setIsScanning(false);

      if (connectedDevice) {
        setConnectionState(BT_CONNECTION_STATES.CONNECTED);
      } else {
        setConnectionState(BT_CONNECTION_STATES.DISCONNECTED);
      }

    } catch (error) {
      console.error('BluetoothContext: Stop scan error', error);
      setIsScanning(false);
      setError('Failed to stop scanning');
    }
  };

  /**
   * Connect to a Bluetooth device
   *
   * @param {string} deviceId - The ID of the device to connect to
   * @returns {Promise<Object>} Promise that resolves with the connected device
   */
  const connectToDevice = async (deviceId) => {
    if (!isBluetoothEnabled || !isInitialized) {
      throw new Error('Bluetooth is not available');
    }

    try {
      setConnectionState(BT_CONNECTION_STATES.CONNECTING);
      setError(null);

      // Stop scanning if currently scanning
      if (isScanning) {
        await stopScan();
      }

      // Find the device in our lists
      const device =
        [...discoveredDevices, ...previousDevices].find(d => d.id === deviceId);

      if (!device) {
        throw new Error('Device not found');
      }

      // Connect to the device
      await BleManager.connect(deviceId);

      // Discover services and characteristics
      await BleManager.retrieveServices(deviceId);

      // Update state
      setConnectedDevice(device);
      setConnectionState(BT_CONNECTION_STATES.CONNECTED);

      // Save to history
      await saveDeviceToHistory(device);

      return device;
    } catch (error) {
      console.error(`BluetoothContext: Connection error to ${deviceId}`, error);
      setError(`Failed to connect to device: ${error.message}`);
      setConnectionState(BT_CONNECTION_STATES.ERROR);
      throw error;
    }
  };

  /**
   * Disconnect from a Bluetooth device
   *
   * @param {string} deviceId - The ID of the device to disconnect from
   * @returns {Promise<void>} Promise that resolves when disconnected
   */
  const disconnectFromDevice = async (deviceId) => {
    if (!deviceId || !connectedDevice || connectedDevice.id !== deviceId) {
      return;
    }

    try {
      await BleManager.disconnect(deviceId);

      setConnectedDevice(null);
      setConnectionState(BT_CONNECTION_STATES.DISCONNECTED);

      if (FEATURES.ENABLE_DEBUGGING) {
        console.log(`BluetoothContext: Disconnected from ${deviceId}`);
      }
    } catch (error) {
      console.error(`BluetoothContext: Disconnection error from ${deviceId}`, error);
      setError('Failed to disconnect from device');

      // Still clear the connected device from state
      setConnectedDevice(null);
      setConnectionState(BT_CONNECTION_STATES.DISCONNECTED);
    }
  };

  /**
   * Send data to a connected Bluetooth device
   *
   * @param {string} serviceUUID - The service UUID
   * @param {string} characteristicUUID - The characteristic UUID
   * @param {Uint8Array} data - The data to send
   * @returns {Promise<void>} Promise that resolves when data is sent
   */
  const sendDataToDevice = async (serviceUUID, characteristicUUID, data) => {
    if (!connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      await BleManager.writeWithoutResponse(
        connectedDevice.id,
        serviceUUID,
        characteristicUUID,
        Array.from(data)
      );

      if (FEATURES.ENABLE_DEBUGGING) {
        console.log(`BluetoothContext: Data sent to ${connectedDevice.id}`);
      }
    } catch (error) {
      console.error('BluetoothContext: Error sending data', error);
      setError('Failed to send data to device');
      throw error;
    }
  };

  /**
   * Read data from a connected Bluetooth device
   *
   * @param {string} serviceUUID - The service UUID
   * @param {string} characteristicUUID - The characteristic UUID
   * @returns {Promise<Uint8Array>} Promise that resolves with the read data
   */
  const readDataFromDevice = async (serviceUUID, characteristicUUID) => {
    if (!connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const data = await BleManager.read(
        connectedDevice.id,
        serviceUUID,
        characteristicUUID
      );

      return new Uint8Array(data);
    } catch (error) {
      console.error('BluetoothContext: Error reading data', error);
      setError('Failed to read data from device');
      throw error;
    }
  };

  /**
   * Get the Bluetooth state for the context provider value
   */
  const bluetoothState = {
    isBluetoothEnabled,
    isInitialized,
    isScanning,
    connectionState,
    error,
    discoveredDevices,
    connectedDevice,
    previousDevices,
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    sendDataToDevice,
    readDataFromDevice,
  };

  return (
    <BluetoothContext.Provider value={bluetoothState}>
      {children}
    </BluetoothContext.Provider>
  );
};

export default BluetoothContext;
