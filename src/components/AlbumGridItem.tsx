import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { type } from '../theme/typography';
import { ArtworkImage } from './ArtworkImage';

interface Props {
  title: string;
  subtitle: string;
  artworkPath: string | null;
  onPress: () => void;
}

export function AlbumGridItem({ title, subtitle, artworkPath, onPress }: Props) {
  const { width } = useWindowDimensions();
  const size = (width - 20 * 2 - 16) / 2;
  return (
    <Pressable style={[styles.item, { width: size }]} onPress={onPress}>
      <ArtworkImage path={artworkPath} size={size} radius={8} />
      <Text numberOfLines={1} style={[type.callout, styles.title]}>{title}</Text>
      <Text numberOfLines={1} style={type.footnote}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { marginBottom: 20 },
  title: { marginTop: 6 },
});
