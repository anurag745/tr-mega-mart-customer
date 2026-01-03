// Theme system for React Native compatibility
export const lightTheme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#E9ECEF',
    primary: '#2D6A4F',
    primaryLight: '#40916C',
    secondary: '#FF6B35',
    text: '#212529',
    textSecondary: '#6C757D',
    textMuted: '#ADB5BD',
    border: '#DEE2E6',
    success: '#28A745',
    error: '#DC3545',
    warning: '#FFC107',
    icon: '#495057',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const darkTheme = {
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2D2D2D',
    primary: '#40916C',
    primaryLight: '#52B788',
    secondary: '#FF8C5A',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#6C6C6C',
    border: '#3D3D3D',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFB300',
    icon: '#E6E6E6',
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  fontSize: lightTheme.fontSize,
  fontWeight: lightTheme.fontWeight,
};

export const Colors = {
  light: lightTheme.colors,
  dark: darkTheme.colors,
};



export type Theme = typeof lightTheme;

