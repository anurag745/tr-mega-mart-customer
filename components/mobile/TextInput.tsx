import React from 'react';
import {
  TextInput as RNTextInput,
  StyleProp,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TextInputProps {
  style?: StyleProp<TextStyle>;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
}

export const TextInput = ({
  style,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
}: TextInputProps) => {
  const { theme } = useTheme();

  return (
    <RNTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={[
        {
          padding: theme.spacing.md,
          fontSize: theme.fontSize.md,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
        },
        style,
      ]}
    />
  );
};
