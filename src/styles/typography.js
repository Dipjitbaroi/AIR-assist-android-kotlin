/**
 * Typography Definitions
 *
 * This file contains text styles used throughout the application.
 * Centralizing typography helps maintain consistent text appearance.
 */

import { Platform } from 'react-native';
import { colors } from './colors';

// Define font families
const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'sans-serif',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'sans-serif-medium',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'sans-serif-bold',
  }),
  light: Platform.select({
    ios: 'System',
    android: 'Roboto-Light',
    default: 'sans-serif-light',
  }),
};

// Define font weights
const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

// Define text styles
export const typography = {
  // Headings
  headingLarge: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    fontSize: 32,
    lineHeight: 40,
    color: colors.textPrimary,
  },
  headingMedium: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.textPrimary,
  },
  headingSmall: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
  },

  // Body text
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 18,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },

  // Labels
  labelLarge: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  labelMedium: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textPrimary,
  },

  // Buttons
  buttonLarge: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 18,
    lineHeight: 26,
    color: colors.textLight,
  },
  buttonMedium: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textLight,
  },
  buttonSmall: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textLight,
  },

  // Captions
  caption: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textTertiary,
  },
};

export default typography;
