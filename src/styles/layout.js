/**
 * Layout Definitions
 *
 * This file contains layout-related styles and measurements used throughout the application.
 * Centralizing layout values helps maintain consistent spacing and dimensions.
 */

import { Dimensions, Platform } from 'react-native';

// Get device dimensions
const { width, height } = Dimensions.get('window');

// Define standard spacing values
const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
};

// Define standard border radius values
const borderRadius = {
  small: 4,
  medium: 8,
  large: 16,
  round: 999, // For circular elements
};

// Define standard shadow styles
const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    android: {
      elevation: 2,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
    android: {
      elevation: 4,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
    android: {
      elevation: 8,
    },
  }),
};

// Define standard dimensions
const dimensions = {
  buttonHeight: 48,
  inputHeight: 48,
  headerHeight: 56,
  tabBarHeight: 56,
  iconSize: {
    small: 16,
    medium: 24,
    large: 32,
  },
};

// Helper for responsive sizing
const responsive = {
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 768,
  isLargeDevice: width >= 768,
  width,
  height,
  // Calculate size based on screen width
  size: (size) => (width / 375) * size,
};

export const layout = {
  spacing,
  borderRadius,
  shadows,
  dimensions,
  responsive,
};

export default layout;
