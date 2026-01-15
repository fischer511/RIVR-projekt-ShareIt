import { Dimensions } from 'react-native';

export const Colors = {
  // Primary
  primary: '#F3D527',
  primaryLight: '#F6E065',
  primaryDark: '#E9C80C',
  primaryDeep: '#887407',
  // Secondary
  teal: '#A7CECB',
  danger: '#FF5C5C',
  // Neutral
  black: '#161615',
  grayDark: '#5A5A59',
  gray: '#AEAEAD',
  grayLight: '#EDEDED',
  white: '#FFFFFF',
} as const;

export const Spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  screenWidth: Dimensions.get('window').width,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const Typography = {
  title: { fontSize: 18, fontWeight: '700' as const },
  subtitle: { fontSize: 14, fontWeight: '600' as const },
  body: { fontSize: 13 },
  small: { fontSize: 12 },
};
// Placeholder color tokens
export const colors = {
  primary: '#000000',
  secondary: '#FFFFFF',
};
