import React from 'react';
import {
  Image as RNImage,
  StyleProp,
  ImageStyle,
  View,
} from 'react-native';
import { Text } from './Text';

interface ImageProps {
  style?: StyleProp<ImageStyle>;
  source: { uri: string } | string;
  alt?: string;
}

const isEmoji = (value: string) =>
  value.length <= 4 && /\p{Emoji}/u.test(value);

export const Image = ({ style, source }: ImageProps) => {
  const src =
    typeof source === 'string'
      ? source
      : source.uri;

  // Emoji support (used heavily in your UI)
  if (typeof src === 'string' && isEmoji(src)) {
    return (
      <View
        style={[
          {
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <Text style={{ fontSize: 32 }}>
          {src}
        </Text>
      </View>
    );
  }

  return (
    <RNImage
      source={{ uri: src }}
      style={style}
      resizeMode="cover"
    />
  );
};
