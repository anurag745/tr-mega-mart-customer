import React from 'react';
import {
  View as RNView,
  StyleProp,
  ViewStyle,
  Pressable,
} from 'react-native';

interface ViewProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const View = ({
  style,
  children,
  onClick,
}: ViewProps) => {
  if (onClick) {
    return (
      <Pressable onPress={onClick}>
        <RNView style={style}>
          {children}
        </RNView>
      </Pressable>
    );
  }

  return (
    <RNView style={style}>
      {children}
    </RNView>
  );
};
