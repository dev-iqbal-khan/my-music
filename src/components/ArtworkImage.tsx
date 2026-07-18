import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  path: string | null | undefined;
  size: number;
  radius?: number;
  style?: ViewStyle;
}

/** Album artwork with the Apple-Music grey music-note placeholder. */
export function ArtworkImage({ path, size, radius = 6, style }: Props) {
  if (path) {
    return (
      <Image
        source={{ uri: 'file://' + path }}
        style={[{ width: size, height: size, borderRadius: radius, backgroundColor: colors.artworkPlaceholder }, style as StyleProp<ImageStyle>]}
      />
    );
  }
  return (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: radius }, style]}>
      <Text style={{ fontSize: size * 0.42, color: '#B8B8BE' }}>♪</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.artworkPlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
