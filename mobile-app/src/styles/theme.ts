// STADIUMRESERVE Color Theme
export const colors = {
  // Primary Colors (from STADIUMRESERVE logo)
  primary: '#2F7A7D',        // Dark teal-green (arc, checkmark, text banner)
  secondary: '#5F9EA0',      // Muted teal-green (background)
  accent: '#4CAF50',         // Medium green (stadium field)
  light: '#8FBC8F',          // Light green (trees)
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
    900: '#000000',
  },
  
  // Status Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Background Colors
  background: '#5F9EA0',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#E8F4F8',
    dark: '#2F7A7D',
    muted: '#7A9B9C',
  },
  
  // Button Colors
  button: {
    primary: '#2F7A7D',
    secondary: '#5F9EA0',
    disabled: '#7A9B9C',
    text: '#FFFFFF',
  },
  
  // Border Colors
  border: {
    light: '#E8F4F8',
    medium: '#7A9B9C',
    dark: '#2F7A7D',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
