/**
 * Header Component
 *
 * Displays the app header with title and action buttons.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Styles
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';

/**
 * Header Component
 *
 * @param {Object} props - Component properties
 * @param {string} props.title - Header title
 * @param {Function} props.onSettingsPress - Settings button press handler
 * @param {Object} props.connectedDevice - Connected Bluetooth device
 * @param {Function} props.onBluetoothPress - Bluetooth button press handler
 * @returns {React.ReactElement} Rendered component
 */
const Header = ({ title, onSettingsPress, connectedDevice, onBluetoothPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.actions}>
        {/* Bluetooth button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onBluetoothPress}
        >
          <Icon
            name={connectedDevice ? 'bluetooth-connected' : 'bluetooth'}
            size={24}
            color={connectedDevice ? colors.success : colors.white}
          />
        </TouchableOpacity>

        {/* Settings button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onSettingsPress}
        >
          <Icon name="settings" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    height: layout.dimensions.headerHeight,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.spacing.medium,
    ...layout.shadows.medium,
  },
  
  title: {
    ...typography.headingSmall,
    color: colors.white,
  },
  
  actions: {
    flexDirection: 'row',
  },
  
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: layout.spacing.small,
  },
});

export default Header;
