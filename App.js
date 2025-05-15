/**
 * AIR-assist Main Application Component
 *
 * This is the root component of the AIR-assist application. It orchestrates the main
 * navigation and context providers for the app.
 *
 * @format
 */

import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, LogBox, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Context Providers
import { AppProvider } from './src/context/AppContext';
import { BluetoothProvider } from './src/context/BluetoothContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Styles and Utilities
import { colors } from './src/styles/colors';
import { PermissionsService } from './src/services/PermissionsService';

/**
 * Ignore specific warnings that are known issues but don't affect functionality
 */
LogBox.ignoreLogs([
  'Possible Unhandled Promise Rejection',
  'Non-serializable values were found in the navigation state',
  'Require cycle:'
]);

// Create the navigation stack
const Stack = createStackNavigator();

/**
 * Main App Component
 *
 * This is the root component of the application that sets up:
 * - Context providers for global state management
 * - Navigation container and stack
 * - Initial permission requests
 * - Basic UI elements (StatusBar, SafeAreaView)
 *
 * @returns {React.ReactElement} The rendered application
 */
const App = () => {
  /**
   * Request necessary permissions when the app first loads
   * Different permissions are required based on platform (iOS vs Android)
   */
  useEffect(() => {
    const requestInitialPermissions = async () => {
      try {
        // Request platform-specific permissions
        if (Platform.OS === 'android') {
          await PermissionsService.requestAndroidPermissions();
        } else if (Platform.OS === 'ios') {
          await PermissionsService.requestIOSPermissions();
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
        // We don't halt app execution for permission failures,
        // but features requiring those permissions won't work
      }
    };

    // Execute the permission request
    requestInitialPermissions();
  }, []);

  return (
    <AppProvider>
      <BluetoothProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Configure status bar appearance */}
          <StatusBar
            barStyle="light-content"
            backgroundColor={colors.primary}
          />

          {/* Main navigation container */}
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              {/* Home screen - main interface */}
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'AIRAssist' }}
              />

              {/* Settings screen */}
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </BluetoothProvider>
    </AppProvider>
  );
};

export default App;
