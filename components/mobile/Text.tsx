import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
  Pressable,
} from 'react-native';

interface TextProps {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  numberOfLines?: number;
  onClick?: () => void;
}

export const Text = ({
  style,
  children,
  numberOfLines,
  onClick,
}: TextProps) => {
  if (onClick) {
    return (
      <Pressable onPress={onClick}>
        <RNText
          style={style}
          numberOfLines={numberOfLines}
        >
          {children}
        </RNText>
      </Pressable>
    );
  }

  return (
    <RNText
      style={style}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
};
