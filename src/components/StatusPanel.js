/**
 * Status Panel Component
 *
 * Displays connection status information and Bluetooth device list.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useContext } from 'react';

// Context
import { BluetoothContext } from '../context/BluetoothContext';

// Styles
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';

// Constants
import { BT_CONNECTION_STATES } from '../utils/constants';

/**
 * Status Panel Component
 *
 * @param {Object} props - Component properties
 * @param {boolean} props.wsConnected - WebSocket connection status
 * @param {boolean} props.bluetoothConnected - Bluetooth connection status
 * @param {boolean} props.isListening - Listening mode status
 * @param {string} props.bluetoothStatus - Bluetooth connection state
 * @param {boolean} props.showDevices - Whether to show device list
 * @param {Function} props.onClose - Close button press handler
 * @returns {React.ReactElement} Rendered component
 */
const StatusPanel = ({
  wsConnected,
  bluetoothConnected,
  isListening,
  bluetoothStatus,
  showDevices,
  onClose,
}) => {
  // Bluetooth context
  const {
    discoveredDevices,
    previousDevices,
    connectToDevice,
    isScanning,
  } = useContext(BluetoothContext);

  /**
   * Get status icon and color based on connection state
   *
   * @param {boolean} isConnected - Connection status
   * @param {string} iconConnected - Icon name when connected
   * @param {string} iconDisconnected - Icon name when disconnected
   * @returns {Object} Icon name and color
   */
  const getStatusIcon = (isConnected, iconConnected, iconDisconnected) => {
    return {
      name: isConnected ? iconConnected : iconDisconnected,
      color: isConnected ? colors.success : colors.error,
    };
  };

  /**
   * Get Bluetooth status text based on connection state
   *
   * @returns {string} Status text
   */
  const getBluetoothStatusText = () => {
    switch (bluetoothStatus) {
      case BT_CONNECTION_STATES.CONNECTED:
        return 'Connected';
      case BT_CONNECTION_STATES.CONNECTING:
        return 'Connecting...';
      case BT_CONNECTION_STATES.SCANNING:
        return 'Scanning...';
      case BT_CONNECTION_STATES.ERROR:
        return 'Error';
      case BT_CONNECTION_STATES.DISCONNECTED:
      default:
        return 'Disconnected';
    }
  };

  /**
   * Handle device selection
   *
   * @param {Object} device - Selected device
   */
  const handleDeviceSelect = (device) => {
    connectToDevice(device.id)
      .then(() => {
        onClose();
      })
      .catch((error) => {
        console.error('Error connecting to device:', error);
      });
  };

  /**
   * Render a device item
   *
   * @param {Object} item - Device item
   * @returns {React.ReactElement} Rendered device item
   */
  const renderDeviceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleDeviceSelect(item)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
      </View>
      <Icon name="bluetooth" size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Status indicators */}
      <View style={styles.statusRow}>
        {/* WebSocket status */}
        <View style={styles.statusItem}>
          <Icon
            name={getStatusIcon(wsConnected, 'cloud-done', 'cloud-off').name}
            size={20}
            color={getStatusIcon(wsConnected, 'cloud-done', 'cloud-off').color}
          />
          <Text style={styles.statusText}>
            Server: {wsConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        {/* Bluetooth status */}
        <View style={styles.statusItem}>
          <Icon
            name={getStatusIcon(bluetoothConnected, 'bluetooth-connected', 'bluetooth-disabled').name}
            size={20}
            color={getStatusIcon(bluetoothConnected, 'bluetooth-connected', 'bluetooth-disabled').color}
          />
          <Text style={styles.statusText}>
            Bluetooth: {getBluetoothStatusText()}
          </Text>
        </View>

        {/* Listening status */}
        <View style={styles.statusItem}>
          <Icon
            name={getStatusIcon(isListening, 'hearing', 'hearing-disabled').name}
            size={20}
            color={getStatusIcon(isListening, 'hearing', 'hearing-disabled').color}
          />
          <Text style={styles.statusText}>
            Listening: {isListening ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Bluetooth devices list */}
      {showDevices && (
        <View style={styles.devicesContainer}>
          <View style={styles.devicesHeader}>
            <Text style={styles.devicesTitle}>Bluetooth Devices</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {isScanning ? (
            <View style={styles.scanningContainer}>
              <Text style={styles.scanningText}>Scanning for devices...</Text>
            </View>
          ) : (
            <>
              {/* Discovered devices */}
              {discoveredDevices.length > 0 && (
                <>
                  <Text style={styles.deviceListTitle}>Available Devices</Text>
                  <FlatList
                    data={discoveredDevices}
                    renderItem={renderDeviceItem}
                    keyExtractor={(item) => item.id}
                    style={styles.deviceList}
                  />
                </>
              )}

              {/* Previously connected devices */}
              {previousDevices.length > 0 && (
                <>
                  <Text style={styles.deviceListTitle}>Previously Connected</Text>
                  <FlatList
                    data={previousDevices}
                    renderItem={renderDeviceItem}
                    keyExtractor={(item) => item.id}
                    style={styles.deviceList}
                  />
                </>
              )}

              {/* No devices found */}
              {discoveredDevices.length === 0 && previousDevices.length === 0 && (
                <View style={styles.noDevicesContainer}>
                  <Text style={styles.noDevicesText}>No devices found</Text>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...layout.shadows.small,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.spacing.medium,
    paddingVertical: layout.spacing.small,
  },

  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusText: {
    ...typography.bodySmall,
    marginLeft: layout.spacing.tiny,
  },

  devicesContainer: {
    padding: layout.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  devicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.spacing.medium,
  },

  devicesTitle: {
    ...typography.headingSmall,
  },

  deviceListTitle: {
    ...typography.labelMedium,
    marginBottom: layout.spacing.small,
  },

  deviceList: {
    maxHeight: 150,
  },

  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: layout.spacing.small,
    paddingHorizontal: layout.spacing.medium,
    backgroundColor: colors.backgroundLight,
    borderRadius: layout.borderRadius.medium,
    marginBottom: layout.spacing.small,
    borderWidth: 1,
    borderColor: colors.border,
  },

  deviceInfo: {
    flex: 1,
  },

  deviceName: {
    ...typography.bodyMedium,
  },

  deviceId: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  scanningContainer: {
    padding: layout.spacing.medium,
    alignItems: 'center',
  },

  scanningText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },

  noDevicesContainer: {
    padding: layout.spacing.medium,
    alignItems: 'center',
  },

  noDevicesText: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
  },
});

export default StatusPanel;
