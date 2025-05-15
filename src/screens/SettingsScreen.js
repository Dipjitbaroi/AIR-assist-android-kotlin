/**
 * Settings Screen
 *
 * Allows users to configure application settings and preferences.
 */

import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Contexts
import { AppContext } from '../context/AppContext';
import { BluetoothContext } from '../context/BluetoothContext';

// Styles and utilities
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { DEFAULT_SETTINGS } from '../utils/constants';

/**
 * Settings Screen Component
 *
 * @param {Object} props - Component properties
 * @param {Object} props.navigation - Navigation object
 * @returns {React.ReactElement} Rendered component
 */
const SettingsScreen = ({ navigation }) => {
  // App context
  const { settings, updateSettings, clearConversation } = useContext(AppContext);
  const { connectedDevice, disconnectFromDevice } = useContext(BluetoothContext);

  // Local state for form values
  const [localSettings, setLocalSettings] = useState({ ...settings });

  /**
   * Update a setting value
   *
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    updateSettings({ [key]: value });
  };

  /**
   * Reset settings to defaults
   */
  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {
            setLocalSettings(DEFAULT_SETTINGS);
            updateSettings(DEFAULT_SETTINGS);
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Clear all data (settings and conversation)
   */
  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all data including settings and conversation history?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: () => {
            clearConversation();
            setLocalSettings(DEFAULT_SETTINGS);
            updateSettings(DEFAULT_SETTINGS);
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Disconnect from Bluetooth device
   */
  const handleDisconnectDevice = () => {
    if (connectedDevice) {
      disconnectFromDevice(connectedDevice.id)
        .then(() => {
          Alert.alert('Success', 'Disconnected from device');
        })
        .catch(error => {
          Alert.alert('Error', `Failed to disconnect: ${error.message}`);
        });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Connection Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>WebSocket Server URL</Text>
          <TextInput
            style={styles.textInput}
            value={localSettings.wsServerUrl}
            onChangeText={(text) => updateSetting('wsServerUrl', text)}
            placeholder="wss://example.com/ws"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Auto-Connect</Text>
          <Switch
            value={localSettings.autoConnect}
            onValueChange={(value) => updateSetting('autoConnect', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : colors.white}
          />
        </View>

        {connectedDevice && (
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Connected Device</Text>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{connectedDevice.name}</Text>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={handleDisconnectDevice}
              >
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Audio Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>AI Voice</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={localSettings.aiVoice}
              onValueChange={(value) => updateSetting('aiVoice', value)}
              style={styles.picker}
              dropdownIconColor={colors.textPrimary}
            >
              <Picker.Item label="Default" value="default" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Microphone Sensitivity</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              value={localSettings.micSensitivity}
              onValueChange={(value) => updateSetting('micSensitivity', value)}
              minimumValue={0}
              maximumValue={100}
              step={1}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={styles.sliderValue}>{localSettings.micSensitivity}%</Text>
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Silence Threshold</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              value={localSettings.silenceThreshold}
              onValueChange={(value) => updateSetting('silenceThreshold', value)}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={styles.sliderValue}>{localSettings.silenceThreshold.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Speaker Volume</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              value={localSettings.speakerVolume}
              onValueChange={(value) => updateSetting('speakerVolume', value)}
              minimumValue={0}
              maximumValue={100}
              step={1}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={styles.sliderValue}>{localSettings.speakerVolume}%</Text>
          </View>
        </View>
      </View>

      {/* Behavior Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Behavior</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Auto-Listen Mode</Text>
          <Switch
            value={localSettings.autoListen}
            onValueChange={(value) => updateSetting('autoListen', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Save Conversation History</Text>
          <Switch
            value={localSettings.saveHistory}
            onValueChange={(value) => updateSetting('saveHistory', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Read AI Responses</Text>
          <Switch
            value={localSettings.readResponses}
            onValueChange={(value) => updateSetting('readResponses', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Response Speed</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              value={localSettings.responseSpeed}
              onValueChange={(value) => updateSetting('responseSpeed', value)}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.1}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={styles.sliderValue}>{localSettings.responseSpeed.toFixed(1)}x</Text>
          </View>
        </View>
      </View>

      {/* User Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Display Name</Text>
          <TextInput
            style={styles.textInput}
            value={localSettings.userName}
            onChangeText={(text) => updateSetting('userName', text)}
            placeholder="Your Name"
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Theme</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={localSettings.theme}
              onValueChange={(value) => updateSetting('theme', value)}
              style={styles.picker}
              dropdownIconColor={colors.textPrimary}
            >
              <Picker.Item label="Light" value="light" />
              <Picker.Item label="Dark" value="dark" />
              <Picker.Item label="System" value="system" />
            </Picker>
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Vibration Feedback</Text>
          <Switch
            value={localSettings.enableVibration}
            onValueChange={(value) => updateSetting('enableVibration', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : colors.white}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.resetButton]}
          onPress={resetSettings}
        >
          <Icon name="refresh" size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>Reset Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={clearAllData}
        >
          <Icon name="delete" size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>AIRAssist v1.0.0</Text>
        <Text style={styles.appCopyright}>© 2025 AIRAssist</Text>
      </View>
    </ScrollView>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  section: {
    marginBottom: layout.spacing.large,
    paddingHorizontal: layout.spacing.medium,
  },

  sectionTitle: {
    ...typography.headingSmall,
    color: colors.primary,
    marginVertical: layout.spacing.medium,
  },

  settingItem: {
    marginBottom: layout.spacing.medium,
  },

  settingLabel: {
    ...typography.labelMedium,
    marginBottom: layout.spacing.small,
  },

  textInput: {
    height: layout.dimensions.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.medium,
    paddingHorizontal: layout.spacing.medium,
    backgroundColor: colors.backgroundLight,
    color: colors.textPrimary,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.backgroundLight,
    overflow: 'hidden',
  },

  picker: {
    height: layout.dimensions.inputHeight,
    color: colors.textPrimary,
  },

  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  slider: {
    flex: 1,
    height: 40,
  },

  sliderValue: {
    ...typography.bodySmall,
    width: 50,
    textAlign: 'right',
  },

  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: layout.spacing.small,
    backgroundColor: colors.backgroundLight,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },

  deviceName: {
    ...typography.bodyMedium,
  },

  disconnectButton: {
    backgroundColor: colors.error,
    paddingHorizontal: layout.spacing.medium,
    paddingVertical: layout.spacing.small,
    borderRadius: layout.borderRadius.small,
  },

  disconnectText: {
    ...typography.labelSmall,
    color: colors.white,
  },

  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.spacing.medium,
    marginBottom: layout.spacing.large,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: layout.spacing.medium,
    paddingHorizontal: layout.spacing.large,
    borderRadius: layout.borderRadius.medium,
    ...layout.shadows.small,
  },

  resetButton: {
    backgroundColor: colors.secondary,
    flex: 1,
    marginRight: layout.spacing.small,
  },

  clearButton: {
    backgroundColor: colors.error,
    flex: 1,
    marginLeft: layout.spacing.small,
  },

  actionButtonText: {
    ...typography.labelMedium,
    color: colors.white,
    marginLeft: layout.spacing.small,
  },

  appInfo: {
    alignItems: 'center',
    marginBottom: layout.spacing.xlarge,
  },

  appVersion: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },

  appCopyright: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: layout.spacing.tiny,
  },
});

export default SettingsScreen;
