import React from 'react';
import {
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';

interface ButtonProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
}

export const Button = ({
  style,
  children,
  onPress,
  variant = 'primary',
  disabled,
}: ButtonProps) => {
  const { theme } = useTheme();

  const baseStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    opacity: disabled ? 0.5 : 1,
  };

  const variants: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const textVariants: Record<string, TextStyle> = {
    primary: { color: '#FFFFFF' },
    secondary: { color: '#FFFFFF' },
    outline: { color: theme.colors.primary },
    ghost: { color: theme.colors.text },
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[baseStyle, variants[variant], style]}
    >
      <Text
        style={{
          fontSize: theme.fontSize.md,
          fontWeight: theme.fontWeight.semibold,
          ...textVariants[variant],
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
};
