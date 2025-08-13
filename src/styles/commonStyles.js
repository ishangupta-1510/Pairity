import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from './colors';
import { Typography } from './typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CommonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBlack,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryBlack,
  },
  
  scrollContainer: {
    flexGrow: 1,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  
  // Cards
  card: {
    backgroundColor: Colors.richCharcoal,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  premiumCard: {
    backgroundColor: Colors.richCharcoal,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.royalGold + '30',
  },
  
  // Shadows
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  
  deepShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // Buttons
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    backgroundColor: Colors.softGraphite,
  },
  
  outlineButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderWidth: 1,
    borderColor: Colors.royalGold,
    backgroundColor: 'transparent',
  },
  
  buttonText: {
    ...Typography.button,
    color: Colors.textPrimary,
  },
  
  // Inputs
  input: {
    backgroundColor: Colors.softGraphite,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 56,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  inputFocused: {
    borderColor: Colors.royalGold,
    backgroundColor: Colors.softGraphite,
  },
  
  inputError: {
    borderColor: Colors.error,
  },
  
  inputLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  
  inputContainer: {
    marginBottom: 20,
  },
  
  // Text
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  
  subtitle: {
    ...Typography.h4,
    color: Colors.textSecondary,
  },
  
  bodyText: {
    ...Typography.bodyRegular,
    color: Colors.textPrimary,
  },
  
  caption: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  
  // Spacing
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mt32: { marginTop: 32 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  mb32: { marginBottom: 32 },
  
  // Dividers
  divider: {
    height: 1,
    backgroundColor: Colors.mutedSilver,
    marginVertical: 16,
  },
  
  // Loading
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.blackOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const SCREEN_WIDTH = SCREEN_WIDTH;
export const SCREEN_HEIGHT = SCREEN_HEIGHT;