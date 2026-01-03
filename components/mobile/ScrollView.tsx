import React from 'react';
import {
  ScrollView as RNScrollView,
  ScrollViewProps as RNScrollViewProps,
} from 'react-native';

interface ScrollViewProps extends RNScrollViewProps {
  children?: React.ReactNode;
}

export const ScrollView = ({
  children,
  ...props
}: ScrollViewProps) => {
  return (
    <RNScrollView {...props}>
      {children}
    </RNScrollView>
  );
};
