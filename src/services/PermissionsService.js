/**
 * Permissions Service
 *
 * Handles requesting and checking permissions required by the app.
 * Centralizes permission logic to simplify permission management.
 */

import { Platform } from 'react-native';
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';
import { PERMISSIONS as APP_PERMISSIONS } from '../utils/constants';

/**
 * Service for managing application permissions
 */
export class PermissionsService {
  /**
   * Request all permissions needed for Android devices
   *
   * @returns {Promise<Object>} Object containing permission results
   */
  static async requestAndroidPermissions() {
    // Check Android version to determine which permissions to request
    const results = {};

    try {
      // Request Bluetooth permissions
      for (const permission of APP_PERMISSIONS.ANDROID.BLUETOOTH) {
        results[permission] = await this.requestPermission(permission);
      }

      // Request microphone permissions
      for (const permission of APP_PERMISSIONS.ANDROID.MICROPHONE) {
        results[permission] = await this.requestPermission(permission);
      }

      // Request storage permissions
      for (const permission of APP_PERMISSIONS.ANDROID.STORAGE) {
        results[permission] = await this.requestPermission(permission);
      }

      return results;
    } catch (error) {
      console.error('Error requesting Android permissions:', error);
      throw error;
    }
  }

  /**
   * Request all permissions needed for iOS devices
   *
   * @returns {Promise<Object>} Object containing permission results
   */
  static async requestIOSPermissions() {
    const results = {};

    try {
      // Request Bluetooth permissions
      for (const permission of APP_PERMISSIONS.IOS.BLUETOOTH) {
        results[permission] = await this.requestPermission(permission);
      }

      // Request microphone permissions
      for (const permission of APP_PERMISSIONS.IOS.MICROPHONE) {
        results[permission] = await this.requestPermission(permission);
      }

      return results;
    } catch (error) {
      console.error('Error requesting iOS permissions:', error);
      throw error;
    }
  }

  /**
   * Check if a specific permission is granted
   *
   * @param {string} permission - The permission to check
   * @returns {Promise<boolean>} True if permission is granted
   */
  static async checkPermission(permission) {
    try {
      const result = await check(permission);

      return (
        result === RESULTS.GRANTED ||
        result === RESULTS.LIMITED
      );
    } catch (error) {
      console.error(`Error checking permission ${permission}:`, error);
      return false;
    }
  }

  /**
   * Request a specific permission
   *
   * @param {string} permission - The permission to request
   * @returns {Promise<string>} Permission result
   */
  static async requestPermission(permission) {
    try {
      return await request(permission);
    } catch (error) {
      console.error(`Error requesting permission ${permission}:`, error);
      throw error;
    }
  }

  /**
   * Check if microphone permission is granted
   *
   * @returns {Promise<boolean>} True if microphone permission is granted
   */
  static async hasMicrophonePermission() {
    if (Platform.OS === 'android') {
      return await this.checkPermission(PERMISSIONS.ANDROID.RECORD_AUDIO);
    } else if (Platform.OS === 'ios') {
      return await this.checkPermission(PERMISSIONS.IOS.MICROPHONE);
    }
    return false;
  }

  /**
   * Check if Bluetooth permissions are granted
   *
   * @returns {Promise<boolean>} True if all Bluetooth permissions are granted
   */
  static async hasBluetoothPermissions() {
    if (Platform.OS === 'android') {
      // On newer Android versions, need multiple permissions
      const results = await Promise.all([
        this.checkPermission(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT),
        this.checkPermission(PERMISSIONS.ANDROID.BLUETOOTH_SCAN),
      ]);

      // All permissions must be granted
      return results.every(result => result === true);
    } else if (Platform.OS === 'ios') {
      return await this.checkPermission(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
    }

    return false;
  }

  /**
   * Check if location permission is granted (needed for BLE on Android)
   *
   * @returns {Promise<boolean>} True if location permission is granted
   */
  static async hasLocationPermission() {
    if (Platform.OS === 'android') {
      return await this.checkPermission(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    }
    // iOS doesn't need location permission for BLE after iOS 13
    return true;
  }
}

export default PermissionsService;
