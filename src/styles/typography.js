import { Platform } from 'react-native';

// Typography based on design system
export const Typography = {
  // Font Families
  fontFamily: {
    primary: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
    display: Platform.select({
      ios: 'Playfair Display',
      android: 'serif',
      default: 'Georgia',
    }),
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'monospace',
      default: 'Courier',
    }),
  },
  
  // Headings
  h1: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 48 * 1.2,
  },
  h2: {
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 32 * 1.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 24 * 1.4,
  },
  h4: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 20 * 1.4,
  },
  
  // Body
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 18 * 1.6,
  },
  bodyRegular: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 16 * 1.5,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 14 * 1.5,
  },
  
  // Special
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 12 * 1.4,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 10,
    letterSpacing: 0.5,
  },
};